"""Wizard executor — converts a validated plan into an audit run via the production recipe runner."""

from __future__ import annotations

import datetime
import json
import logging
from pathlib import Path
from typing import Any

from affectlog.config import get_settings
from affectlog.core.ids import new_run_id
from affectlog.core.paths import resolve_safe_path, validate_run_id
from affectlog.wizard.schemas import (
    OutputContractArtifact,
    WizardPlan,
    WizardRunRequest,
    WizardRunResponse,
    WizardRunResultsResponse,
    WizardRunStatusResponse,
)
from affectlog.wizard.validator import validate_plan

log = logging.getLogger(__name__)

# In-memory run store (replace with DB in production)
_WIZARD_RUNS: dict[str, dict[str, Any]] = {}


def _resolve_dataset_path(dataset_path: str, run_dir: Path) -> Path:
    """Return a local Path for dataset_path, downloading first if it is a URL."""
    from urllib.parse import urlparse

    parsed = urlparse(dataset_path)
    if parsed.scheme in ("http", "https"):
        import urllib.request

        suffix = Path(parsed.path).suffix or ".csv"
        dest = run_dir / f"input{suffix}"
        req = urllib.request.Request(dataset_path, headers={"User-Agent": "AffectLog-Executor/1.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:  # noqa: S310
            dest.write_bytes(resp.read())
        return dest

    from affectlog.core.paths import resolve_safe_path

    return resolve_safe_path(Path.cwd(), dataset_path)


_XAPI_FORMATS = {"generic_xapi_jsonl", "generic_xapi_json", "maskott_csv_v1", "becomino_json"}


def _run_tabular(wizard_run_id: str, plan: WizardPlan, input_path: Path, run_dir: Path) -> None:
    """Lightweight audit pipeline for generic tabular (non-xAPI) datasets."""
    from affectlog.core.artifact_store import ArtifactStore
    from affectlog.core.hashing import config_hash as compute_config_hash
    from affectlog.profiling.schema_profiler import profile_schema

    _WIZARD_RUNS[wizard_run_id]["current_stage"] = "schema_profiling"
    store = ArtifactStore(run_dir)

    schema_prof = profile_schema(input_path)
    schema_path = store.write_json("schema_profile.json", schema_prof)

    _WIZARD_RUNS[wizard_run_id]["current_stage"] = "statistics"
    try:
        from affectlog.ingest.large_file import scan_csv_lazy

        lf = scan_csv_lazy(input_path)
        df = lf.collect()
        row_count = len(df)
        col_stats: list[dict[str, Any]] = []
        for col in df.columns:
            s = df[col]
            col_stats.append(
                {
                    "name": col,
                    "dtype": str(s.dtype),
                    "null_count": int(s.null_count()),
                    "n_unique": int(s.n_unique()),
                }
            )
        metrics: dict[str, Any] = {
            "row_count": row_count,
            "column_count": len(df.columns),
            "columns": col_stats,
            "overall_completeness": round(
                1.0 - sum(c["null_count"] for c in col_stats) / max(1, row_count * len(col_stats)),
                4,
            ),
        }
    except Exception as exc:
        log.warning("Polars stats failed, falling back to row count only: %s", exc)
        metrics = {"row_count": schema_prof.get("row_count_sampled", 0)}
        row_count = metrics["row_count"]

    metrics_path = store.write_json("metrics.json", metrics)

    _WIZARD_RUNS[wizard_run_id]["current_stage"] = "compliance_export"
    privacy_report: dict[str, Any] = {
        "pii_fields": [c["name"] for c in schema_prof.get("columns", []) if c.get("is_pii_field")],
        "risk_summary": {"level": "low"},
    }
    privacy_path = store.write_json("privacy_report.json", privacy_report)

    from affectlog.compliance.data_card import build_data_card
    from affectlog.compliance.jsonld import build_compliance_graph, export_jsonld
    from affectlog.compliance.sop import build_sop, export_sop

    run_id = wizard_run_id
    field_names = [c["name"] for c in schema_prof.get("columns", [])]

    card = build_data_card(
        dataset_name="Generic Tabular Dataset",
        schema_fields=field_names,
        row_count=row_count,
        privacy_report=privacy_report,
        descriptive_stats={},
        recipe_name="generic_tabular",
        run_id=run_id,
    )
    dc_path = store.write_json("data_card.json", card)

    graph = build_compliance_graph(
        run_id=run_id,
        dataset_name="Generic Tabular Dataset",
        fields=field_names,
        privacy_report=privacy_report,
        metrics=metrics,
        stages=[
            {"name": "schema_profiling"},
            {"name": "statistics"},
            {"name": "compliance_export"},
        ],
        config_hash=compute_config_hash({"format": plan.detected_format}),
    )
    jld_path = run_dir / "compliance_graph.jsonld"
    export_jsonld(graph, jld_path)

    sop_text = build_sop(
        run_id=run_id,
        recipe_name="generic_tabular",
        input_path=str(input_path),
        config_hash=compute_config_hash({"format": plan.detected_format}),
        schema_fields=field_names,
        row_count=row_count,
        privacy_report=privacy_report,
        metrics=metrics,
        stages=[
            {"name": "schema_profiling"},
            {"name": "statistics"},
            {"name": "compliance_export"},
        ],
        artifacts={"schema_profile": str(schema_path), "metrics": str(metrics_path)},
        source_platform="Generic Tabular",
    )
    sop_path = run_dir / "SOP.md"
    export_sop(sop_text, sop_path)

    completed_state: dict[str, Any] = {
        "status": "completed",
        "current_stage": None,
        "artifacts": {
            "schema_profile": str(schema_path),
            "metrics": str(metrics_path),
            "privacy_report": str(privacy_path),
            "data_card": str(dc_path),
            "compliance_graph": str(jld_path),
            "sop": str(sop_path),
        },
        "stages_completed": ["schema_profiling", "statistics", "compliance_export"],
        "rows_processed": row_count,
        "progress_pct": 100.0,
    }
    _WIZARD_RUNS[wizard_run_id].update(completed_state)

    # Persist to disk so results survive a process restart
    wizard_meta = {
        "wizard_run_id": wizard_run_id,
        "plan": plan.model_dump(),
        "status": "completed",
        "completed_at": datetime.datetime.utcnow().isoformat(),
    }
    (run_dir / "wizard_meta.json").write_text(json.dumps(wizard_meta, indent=2))


def _run_background(wizard_run_id: str, plan: WizardPlan) -> None:
    settings = get_settings()
    run_dir = Path(settings.runs_dir) / wizard_run_id
    run_dir.mkdir(parents=True, exist_ok=True)

    try:
        from affectlog.recipes.loader import load_recipe
        from affectlog.recipes.runner import run_audit

        _WIZARD_RUNS[wizard_run_id]["status"] = "running"
        _WIZARD_RUNS[wizard_run_id]["current_stage"] = "initialising"

        dataset_path = plan.inputs.get("dataset_path") or plan.inputs.get("dataset_reference")
        if not dataset_path:
            _WIZARD_RUNS[wizard_run_id]["status"] = "failed"
            _WIZARD_RUNS[wizard_run_id]["errors"] = ["No dataset path in plan."]
            return

        safe_input = _resolve_dataset_path(str(dataset_path), run_dir)

        # Route generic tabular formats to the lightweight tabular pipeline;
        # xAPI/Maskott/Becomino go through the full recipe runner.
        if plan.detected_format not in _XAPI_FORMATS:
            _run_tabular(wizard_run_id, plan, safe_input, run_dir)
            return

        _FORMAT_TO_RECIPE = {
            "maskott_csv_v1": "maskott_tactileo.yaml",
            "generic_xapi_jsonl": "generic_xapi.yaml",
            "generic_xapi_json": "generic_xapi.yaml",
            "becomino_json": "inokufu_becomino.yaml",
        }
        recipes_dir = Path(settings.data_dir).parent / "configs" / "recipes"
        recipe_config_path = recipes_dir / _FORMAT_TO_RECIPE[plan.detected_format]

        _WIZARD_RUNS[wizard_run_id]["current_stage"] = "loading_recipe"
        recipe = load_recipe(str(recipe_config_path))

        _WIZARD_RUNS[wizard_run_id]["current_stage"] = "running_pipeline"
        ctx = run_audit(
            safe_input,
            recipe,
            run_dir,
            hash_secret=settings.hash_secret,
        )

        # Write wizard metadata
        wizard_meta = {
            "wizard_run_id": wizard_run_id,
            "plan": plan.model_dump(),
            "artifacts": ctx.artifacts,
            "completed_at": datetime.datetime.utcnow().isoformat(),
        }
        (run_dir / "wizard_meta.json").write_text(json.dumps(wizard_meta, indent=2))

        _WIZARD_RUNS[wizard_run_id].update(
            {
                "status": "completed",
                "current_stage": None,
                "artifacts": ctx.artifacts,
                "stages_completed": ["schema_validation", "profiling", "privacy", "compliance"],
            }
        )

    except Exception as exc:
        log.exception("Wizard run %s failed: %s", wizard_run_id, exc)
        _WIZARD_RUNS[wizard_run_id].update(
            {
                "status": "failed",
                "errors": [str(exc)],
                "current_stage": None,
            }
        )


def create_run(req: WizardRunRequest) -> WizardRunResponse:
    if not req.output_contract_confirmed:
        raise ValueError("Output contract must be confirmed before execution.")

    validation = validate_plan(req.plan)
    if validation.status.value == "fail":
        raise ValueError(
            f"Plan validation failed with {validation.blocking_count} blocking issue(s). "
            "Resolve all blocking issues before running."
        )

    wizard_run_id = new_run_id()
    _WIZARD_RUNS[wizard_run_id] = {
        "wizard_run_id": wizard_run_id,
        "status": "queued",
        "plan": req.plan.model_dump(),
        "current_stage": None,
        "stages_completed": [],
        "rows_processed": None,
        "warnings": [],
        "errors": [],
        "progress_pct": 0.0,
        "created_at": datetime.datetime.utcnow().isoformat(),
    }

    return WizardRunResponse(
        wizard_run_id=wizard_run_id,
        status="queued",
        plan_summary={
            "format": req.plan.detected_format,
            "analyses": len(req.plan.selected_analyses),
            "plots": len(req.plan.selected_plots),
            "purpose": req.plan.purpose.value,
        },
        created_at=_WIZARD_RUNS[wizard_run_id]["created_at"],
    )


def start_run_background(wizard_run_id: str, plan: WizardPlan) -> None:
    import threading

    t = threading.Thread(target=_run_background, args=(wizard_run_id, plan), daemon=True)
    t.start()


def _load_run_from_disk(wizard_run_id: str) -> dict[str, Any] | None:
    """Reconstruct a completed run from wizard_meta.json when not in memory (e.g. after restart)."""
    try:
        validate_run_id(wizard_run_id)
    except ValueError:
        return None
    run_dir = resolve_safe_path(Path(get_settings().runs_dir), wizard_run_id)
    meta_path = run_dir / "wizard_meta.json"
    if not meta_path.exists():
        return None
    try:
        meta = json.loads(meta_path.read_text())
        return {
            "wizard_run_id": wizard_run_id,
            "status": meta.get("status", "completed"),
            "plan": meta.get("plan", {}),
            "current_stage": None,
            "stages_completed": meta.get("stages_completed", []),
            "rows_processed": None,
            "warnings": [],
            "errors": [],
            "progress_pct": 100.0,
        }
    except Exception as exc:
        log.warning("Could not reconstruct run %s from disk: %s", wizard_run_id, exc)
        return None


def get_run_status(wizard_run_id: str) -> WizardRunStatusResponse | None:
    run = _WIZARD_RUNS.get(wizard_run_id) or _load_run_from_disk(wizard_run_id)
    if not run:
        return None
    return WizardRunStatusResponse(
        wizard_run_id=wizard_run_id,
        status=run.get("status", "unknown"),
        current_stage=run.get("current_stage"),
        stages_completed=run.get("stages_completed", []),
        rows_processed=run.get("rows_processed"),
        warnings=run.get("warnings", []),
        errors=run.get("errors", []),
        progress_pct=run.get("progress_pct"),
    )


# Descriptions/format/privacy for known artifact filenames produced by the pipeline.
_ARTIFACT_META: dict[str, tuple[str, str, str]] = {
    "metrics.json": ("All computed metrics in structured JSON.", "json", "public"),
    "metrics.csv": ("Flat CSV of key metric values.", "csv", "public"),
    "dashboard_payload.json": ("Structured payload for dashboard visualisation.", "json", "public"),
    "audit_manifest.json": (
        "Signed manifest of all inputs, parameters, and artifact hashes.",
        "json",
        "public",
    ),
    "SOP.md": ("Standard Operating Procedure document.", "markdown", "public"),
    "SOP.html": ("SOP rendered as HTML.", "html", "public"),
    "privacy_report.json": ("PII scan and privacy risk assessment.", "json", "restricted"),
    "validation_report.json": ("Schema validation report.", "json", "public"),
    "xapi_compatibility_report.json": ("xAPI compatibility check report.", "json", "public"),
    "transform_report.json": ("Maskott CSV → xAPI transform summary.", "json", "public"),
    "schema_profile.json": ("Full schema profile with column statistics.", "json", "public"),
    "descriptive_stats.json": ("Descriptive statistics for all fields.", "json", "public"),
    "temporal_stats.json": (
        "Temporal analysis: event density and session patterns.",
        "json",
        "public",
    ),
    "concentration_metrics.json": (
        "Concentration analysis: Gini, entity and resource dominance.",
        "json",
        "public",
    ),
    "coverage_metrics.json": ("Coverage@K metrics across recommendation depths.", "json", "public"),
    "fairness_metrics.json": ("Fairness analysis results.", "json", "medium"),
    "data_card.json": ("Dataset Data Card export.", "json", "public"),
    "compliance_graph.jsonld": ("JSON-LD compliance and provenance graph.", "jsonld", "public"),
    "eu_ai_act_annex_iv.json": ("EU AI Act Annex IV documentation.", "json", "public"),
    "field_inventory.csv": ("GDPR field inventory export.", "csv", "restricted"),
    "normalized.jsonl": ("Normalised xAPI-format event log.", "jsonl", "public"),
    "carisma_metadata.json": ("CARiSMA metadata export.", "json", "public"),
    "lola_metadata.json": ("LOLA metadata export.", "json", "public"),
    "pdc_metadata.json": ("PDC metadata export.", "json", "public"),
    "pii_report.json": ("PII field scan results.", "json", "restricted"),
    "pseudonymisation_report.json": ("Pseudonymisation benchmark report.", "json", "public"),
}

_HIDDEN_ARTIFACTS = {"wizard_meta.json", "invalid_rows.jsonl"}


def get_run_results(wizard_run_id: str) -> WizardRunResultsResponse | None:
    try:
        validate_run_id(wizard_run_id)
    except ValueError:
        return None
    run = _WIZARD_RUNS.get(wizard_run_id) or _load_run_from_disk(wizard_run_id)
    if not run:
        return None
    if run.get("status") != "completed":
        return WizardRunResultsResponse(
            wizard_run_id=wizard_run_id,
            status=run.get("status", "unknown"),
        )

    plan = WizardPlan(**run["plan"])

    analyzed = list(plan.selected_analyses)
    not_analyzed: list[str] = []

    from affectlog.capabilities.analyses import ANALYSES

    developer_suggestions: list[str] = []
    for a in ANALYSES:
        if a.id not in plan.selected_analyses:
            if a.requires_model and not plan.inputs.get("model_reference"):
                not_analyzed.append(a.label)
                developer_suggestions.append(
                    f"To enable {a.label}: add a compatible pre-trained model artifact or HTTP endpoint."
                )
            elif a.requires_group_field and not plan.field_mappings.get("group_field"):
                not_analyzed.append(a.label)
                developer_suggestions.append(
                    f"To enable {a.label}: provide an ethically appropriate group/segment field and confirm lawful use."
                )
            elif a.requires_predictions and not plan.inputs.get("predictions_reference"):
                not_analyzed.append(a.label)
                developer_suggestions.append(
                    f"To enable {a.label}: upload ranked predictions and ground-truth interactions."
                )

    # Build artifact list from what actually exists on disk
    run_dir = resolve_safe_path(Path(get_settings().runs_dir), wizard_run_id)
    artifacts: list[OutputContractArtifact] = []
    if run_dir.exists():
        for f in sorted(run_dir.iterdir()):
            if not f.is_file() or f.name in _HIDDEN_ARTIFACTS:
                continue
            meta = _ARTIFACT_META.get(f.name)
            if meta:
                desc, fmt, privacy = meta
            else:
                ext = f.suffix.lstrip(".")
                desc = f"Pipeline artifact ({f.name})."
                fmt = ext or "bin"
                privacy = "public"
            artifacts.append(
                OutputContractArtifact(
                    filename=f.name,
                    format=fmt,
                    description=desc,
                    privacy_level=privacy,
                )
            )

    key_findings = [
        f"Assessment completed for {len(analyzed)} selected analyses.",
        f"{len(artifacts)} artifacts produced.",
    ]
    if run.get("warnings"):
        key_findings.append(
            f"{len(run['warnings'])} pipeline warnings recorded — review audit_manifest.json."
        )

    next_actions = [
        "Download metrics.json and review key findings.",
        "Share SOP.md with stakeholders for transparency.",
        "Register compliance_graph.jsonld with your data space connector.",
    ]
    if not_analyzed:
        next_actions.append("Review developer extension suggestions to unlock additional analyses.")

    return WizardRunResultsResponse(
        wizard_run_id=wizard_run_id,
        status="completed",
        what_was_analyzed=analyzed,
        what_was_not_analyzed=not_analyzed[:10],
        key_findings=key_findings,
        recommended_next_actions=next_actions,
        artifacts=artifacts,
        selected_plots=plan.selected_plots,
        developer_extension_suggestions=list(set(developer_suggestions))[:5],
    )
