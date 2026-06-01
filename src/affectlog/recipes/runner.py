"""
Recipe-driven audit pipeline runner.

Stages:
  ingest → validate → pii_scan → pseudonymise → normalize_xapi →
  profile_schema → profile_statistics → profile_temporal →
  compute_concentration → compute_coverage → compute_fairness →
  compliance_map → export_artifacts
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Optional

from affectlog.compliance.ai_act_annex_iv import build_annex_iv, export_annex_iv
from affectlog.compliance.data_card import build_data_card, export_data_card
from affectlog.compliance.gdpr import export_field_inventory
from affectlog.compliance.jsonld import build_compliance_graph, export_jsonld
from affectlog.compliance.sop import build_sop, export_sop
from affectlog.core.artifact_store import ArtifactStore
from affectlog.core.hashing import config_hash as compute_config_hash
from affectlog.core.run_context import RunContext
from affectlog.core.time import now_iso
from affectlog.ingest.large_file import MASKOTT_REQUIRED_COLUMNS, validate_csv_headers
from affectlog.metrics.concentration import compute_concentration
from affectlog.metrics.coverage import compute_coverage
from affectlog.metrics.fairness import compute_fairness
from affectlog.metrics.quality import compute_quality
from affectlog.privacy.pseudonymizer import Pseudonymizer
from affectlog.privacy.security_layer import SecurityLayer
from affectlog.profiling.descriptive import compute_descriptive_stats
from affectlog.profiling.schema_profiler import profile_schema
from affectlog.profiling.sparsity import compute_sparsity
from affectlog.profiling.temporal import compute_temporal_stats
from affectlog.recipes.base import Recipe
from affectlog.transform.maskott_csv_to_xapi import convert_maskott_csv_to_xapi
from affectlog.transform.verb_mapper import VerbMapper

logger = logging.getLogger(__name__)


def run_audit(
    input_path: Path | str,
    recipe: Recipe,
    run_dir: Path | str,
    *,
    hash_secret: str = "",
    chunk_size: int = 100_000,
    template_path: Optional[Path] = None,
) -> RunContext:
    """Run the full audit pipeline for a given input and recipe."""
    input_path = Path(input_path)
    run_dir = Path(run_dir)
    run_dir.mkdir(parents=True, exist_ok=True)

    ctx = RunContext(
        run_dir=run_dir,
        recipe_name=recipe.name,
        input_path=str(input_path),
        config=recipe.raw,
    )
    # Override run_dir (RunContext appends run_id by default — we use provided dir)
    ctx.run_dir = run_dir
    store = ArtifactStore(run_dir)
    cfg_hash = compute_config_hash(recipe.raw)

    # ── Stage: validate ──────────────────────────────────────────────
    s = ctx.new_stage("validate")
    ext = input_path.suffix.lower()
    if ext == ".csv":
        report = validate_csv_headers(input_path, MASKOTT_REQUIRED_COLUMNS)
        s.record_count_in = 0
        s.meta["validation_report"] = report
        s.finish("ok" if report["valid"] else "warning")
    else:
        s.meta["note"] = f"Validation skipped for {ext}"
        s.finish("skipped")

    # ── Stage: pii_scan ──────────────────────────────────────────────
    s = ctx.new_stage("pii_scan")
    pseudo = Pseudonymizer.from_recipe(
        {
            "method": recipe.privacy.method,
            "hash_fields": recipe.privacy.hash_fields,
            "suppress_fields": recipe.privacy.suppress_fields,
            "redact_fields": recipe.privacy.redact_fields,
            "allow_raw_identifiers": recipe.privacy.allow_raw_identifiers,
        },
        secret=hash_secret,
    )
    sec = SecurityLayer(pseudonymizer=pseudo, allow_raw=recipe.privacy.allow_raw_identifiers)
    privacy_report = sec.generate_privacy_report(
        MASKOTT_REQUIRED_COLUMNS,
        hash_fields=recipe.privacy.hash_fields,
        suppress_fields=recipe.privacy.suppress_fields,
    )
    privacy_path = store.write_json("privacy_report.json", privacy_report)
    ctx.add_artifact("privacy_report", privacy_path)
    s.output_artifact = str(privacy_path)
    s.finish("ok")

    # ── Stage: normalize_xapi ────────────────────────────────────────
    s = ctx.new_stage("normalize_xapi")
    vm = VerbMapper(recipe.xapi.verb_mapping)
    normalized_path = run_dir / "normalized.jsonl"

    if ext == ".csv":
        summary = convert_maskott_csv_to_xapi(
            input_path,
            normalized_path,
            chunk_size=chunk_size,
            template_path=template_path,
            pseudonymizer=pseudo,
            verb_mapper=vm,
            allow_raw=recipe.privacy.allow_raw_identifiers,
            invalid_output=run_dir / "invalid_rows.jsonl",
        )
        s.record_count_in = summary["total_rows_in"]
        s.record_count_out = summary["total_rows_out"]
        s.meta["conversion_summary"] = summary
    else:
        normalized_path = input_path  # Already normalized
        s.meta["note"] = "Input already normalized; skipping CSV conversion."
    ctx.add_artifact("normalized_jsonl", normalized_path)
    s.output_artifact = str(normalized_path)
    s.finish("ok")
    total_rows = s.record_count_out or 0

    # ── Stage: profile_schema ────────────────────────────────────────
    s = ctx.new_stage("profile_schema")
    schema_prof = profile_schema(input_path if ext == ".csv" else normalized_path)
    schema_path = store.write_json("schema_profile.json", schema_prof)
    ctx.add_artifact("schema_profile", schema_path)
    s.finish("ok")

    # ── Stage: profile_statistics ────────────────────────────────────
    s = ctx.new_stage("profile_statistics")
    desc_stats = compute_descriptive_stats(normalized_path)
    desc_path = store.write_json("descriptive_stats.json", desc_stats)
    ctx.add_artifact("descriptive_stats", desc_path)
    s.record_count_in = desc_stats.get("total_events", 0)
    s.finish("ok")

    # ── Stage: profile_temporal ──────────────────────────────────────
    s = ctx.new_stage("profile_temporal")
    temp_stats = compute_temporal_stats(normalized_path)
    temp_path = store.write_json("temporal_stats.json", temp_stats)
    ctx.add_artifact("temporal_stats", temp_path)
    s.finish("ok")

    # ── Stage: compute_concentration ────────────────────────────────
    s = ctx.new_stage("compute_concentration")
    conc = compute_concentration(normalized_path)
    conc_path = store.write_json("concentration_metrics.json", conc)
    ctx.add_artifact("concentration_metrics", conc_path)
    s.finish("ok")

    # ── Stage: compute_coverage ──────────────────────────────────────
    s = ctx.new_stage("compute_coverage")
    cov = compute_coverage(normalized_path, k_values=recipe.metrics.coverage_k)
    cov_path = store.write_json("coverage_metrics.json", cov)
    ctx.add_artifact("coverage_metrics", cov_path)
    s.finish("ok")

    # ── Stage: compute_fairness ──────────────────────────────────────
    s = ctx.new_stage("compute_fairness")
    fair = compute_fairness(normalized_path)
    fair_path = store.write_json("fairness_metrics.json", fair)
    ctx.add_artifact("fairness_metrics", fair_path)
    s.finish("ok")

    # ── Stage: quality ───────────────────────────────────────────────
    s = ctx.new_stage("quality")
    qual = compute_quality(normalized_path)
    spars = compute_sparsity(normalized_path)
    metrics_combined: dict[str, Any] = {
        **conc,
        **{"coverage_at_k": cov.get("coverage_at_k", {})},
        "sparsity_ratio": spars.get("sparsity_ratio"),
        "density": spars.get("density"),
        "overall_completeness": qual.get("overall_completeness"),
        "unique_actors": conc.get("unique_actors"),
        "unique_resources": conc.get("unique_resources"),
        "total_events": desc_stats.get("total_events"),
        "unique_resource_types": desc_stats.get("unique_resource_types"),
        "avg_duration_seconds": desc_stats.get("avg_duration_seconds"),
    }
    metrics_path = store.write_json("metrics.json", metrics_combined)
    ctx.add_artifact("metrics", metrics_path)
    s.finish("ok")

    # ── Stage: compliance_map / export_artifacts ─────────────────────
    s = ctx.new_stage("compliance_map")

    if recipe.compliance.export_field_inventory:
        fi_path = run_dir / "field_inventory.csv"
        export_field_inventory(fi_path)
        ctx.add_artifact("field_inventory", fi_path)

    if recipe.compliance.export_data_card:
        card = build_data_card(
            dataset_name=recipe.source_platform,
            schema_fields=MASKOTT_REQUIRED_COLUMNS,
            row_count=total_rows,
            privacy_report=privacy_report,
            descriptive_stats={"min_timestamp": temp_stats.get("min_timestamp", ""), "max_timestamp": temp_stats.get("max_timestamp", "")},
            recipe_name=recipe.name,
            run_id=ctx.run_id,
        )
        dc_path = store.write_json("data_card.json", card)
        ctx.add_artifact("data_card", dc_path)

    if recipe.compliance.export_jsonld:
        graph = build_compliance_graph(
            run_id=ctx.run_id,
            dataset_name=recipe.source_platform,
            fields=MASKOTT_REQUIRED_COLUMNS,
            privacy_report=privacy_report,
            metrics=metrics_combined,
            stages=[st.to_dict() for st in ctx.stages],
            config_hash=cfg_hash,
        )
        jld_path = run_dir / "compliance_graph.jsonld"
        export_jsonld(graph, jld_path)
        ctx.add_artifact("compliance_graph", jld_path)

    if recipe.compliance.export_sop:
        sop_text = build_sop(
            run_id=ctx.run_id,
            recipe_name=recipe.name,
            input_path=str(input_path),
            config_hash=cfg_hash,
            schema_fields=MASKOTT_REQUIRED_COLUMNS,
            row_count=total_rows,
            privacy_report=privacy_report,
            metrics=metrics_combined,
            stages=[st.to_dict() for st in ctx.stages],
            artifacts=ctx.artifacts,
            source_platform=recipe.source_platform,
        )
        sop_path = run_dir / "SOP.md"
        export_sop(sop_text, sop_path)
        ctx.add_artifact("sop", sop_path)

    annex = build_annex_iv(ctx.run_id)
    ann_path = run_dir / "eu_ai_act_annex_iv.json"
    export_annex_iv(annex, ann_path)
    ctx.add_artifact("eu_ai_act_annex_iv", ann_path)

    s.finish("ok")

    # Dashboard payload
    dashboard = {
        "run_id": ctx.run_id,
        "recipe": recipe.name,
        "total_events": metrics_combined.get("total_events"),
        "unique_actors": metrics_combined.get("unique_actors"),
        "unique_resources": metrics_combined.get("unique_resources"),
        "actor_gini": metrics_combined.get("actor_gini"),
        "resource_gini": metrics_combined.get("resource_gini"),
        "sparsity_ratio": metrics_combined.get("sparsity_ratio"),
        "overall_completeness": metrics_combined.get("overall_completeness"),
        "top_10_resources": desc_stats.get("top_10_resources", []),
        "resource_type_distribution": desc_stats.get("resource_type_distribution", {}),
        "verb_distribution": desc_stats.get("verb_distribution", {}),
        "view_context_distribution": desc_stats.get("view_context_distribution", {}),
        "coverage_at_k": cov.get("coverage_at_k", {}),
        "risk_level": privacy_report.get("risk_summary", {}).get("level", "unknown"),
        "temporal": {
            "min_timestamp": temp_stats.get("min_timestamp"),
            "max_timestamp": temp_stats.get("max_timestamp"),
            "span_days": temp_stats.get("span_days"),
            "unique_days": temp_stats.get("unique_days"),
        },
        "artifacts": ctx.artifacts,
    }
    dash_path = store.write_json("dashboard_payload.json", dashboard)
    ctx.add_artifact("dashboard_payload", dash_path)

    # Final manifest
    ctx.save_manifest()
    logger.info("Audit complete. Run: %s Artifacts: %d", ctx.run_id, len(ctx.artifacts))
    return ctx
