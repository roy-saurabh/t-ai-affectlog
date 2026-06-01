"""Audit endpoints: run pipeline, get status, retrieve artifacts."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import PlainTextResponse

from affectlog.config import get_settings
from affectlog.core.ids import new_run_id
from affectlog.core.paths import resolve_safe_path, validate_run_id
from affectlog.schemas.api import AuditMetricsResponse, AuditRunRequest, AuditRunResponse

router = APIRouter(prefix="/v1/audits", tags=["Audits"])

_run_status: dict[str, dict[str, Any]] = {}


def _run_audit_bg(run_id: str, req: AuditRunRequest) -> None:
    settings = get_settings()
    try:
        from affectlog.recipes.loader import load_recipe
        from affectlog.recipes.runner import run_audit

        try:
            safe_recipe = resolve_safe_path(Path.cwd(), req.recipe)
            safe_input = resolve_safe_path(Path.cwd(), req.input_path)
        except ValueError as exc:
            _run_status[run_id] = {"run_id": run_id, "status": "failed", "error": str(exc)}
            return

        recipe = load_recipe(safe_recipe)
        if req.output_dir:
            out_dir = resolve_safe_path(Path(settings.runs_dir).resolve(), req.output_dir)
        else:
            out_dir = Path(settings.runs_dir) / run_id
        ctx = run_audit(
            safe_input,
            recipe,
            out_dir,
            hash_secret=settings.hash_secret,
            chunk_size=req.chunk_size,
        )
        _run_status[run_id] = {
            "run_id": run_id,
            "status": "completed",
            "recipe": recipe.name,
            "artifacts": ctx.artifacts,
        }
    except Exception as exc:
        _run_status[run_id] = {"run_id": run_id, "status": "failed", "error": str(exc)}


@router.post("/run", response_model=AuditRunResponse, summary="Start an audit pipeline run")
async def run_audit_endpoint(
    req: AuditRunRequest, background_tasks: BackgroundTasks
) -> AuditRunResponse:
    run_id = new_run_id()
    _run_status[run_id] = {
        "run_id": run_id,
        "status": "running",
        "recipe": req.recipe,
        "artifacts": {},
    }
    background_tasks.add_task(_run_audit_bg, run_id, req)
    return AuditRunResponse(run_id=run_id, status="running", recipe=req.recipe)


@router.get("/{run_id}", response_model=AuditRunResponse, summary="Get audit run status")
async def get_audit(run_id: str) -> AuditRunResponse:
    if run_id not in _run_status:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")
    r = _run_status[run_id]
    return AuditRunResponse(
        run_id=r["run_id"],
        status=r.get("status", "unknown"),
        recipe=r.get("recipe", ""),
        artifacts=r.get("artifacts", {}),
    )


@router.get("/{run_id}/artifacts", summary="List run artifacts")
async def get_artifacts(run_id: str) -> dict[str, Any]:
    try:
        validate_run_id(run_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    settings = get_settings()
    try:
        run_dir = resolve_safe_path(Path(settings.runs_dir), run_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not run_dir.exists():  # lgtm[py/path-injection]
        raise HTTPException(status_code=404, detail=f"Run directory '{run_id}' not found.")
    return {"run_id": run_id, "artifacts": [f.name for f in run_dir.iterdir() if f.is_file()]}


@router.get("/{run_id}/metrics", response_model=AuditMetricsResponse, summary="Get run metrics")
async def get_metrics(run_id: str) -> AuditMetricsResponse:
    try:
        validate_run_id(run_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    settings = get_settings()
    try:
        run_dir = resolve_safe_path(Path(settings.runs_dir), run_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    metrics_path = run_dir / "metrics.json"
    if not metrics_path.exists():  # lgtm[py/path-injection]
        raise HTTPException(status_code=404, detail="metrics.json not found for this run.")
    return AuditMetricsResponse(
        run_id=run_id, metrics=json.loads(metrics_path.read_text())
    )  # lgtm[py/path-injection]


@router.get("/{run_id}/sop", response_class=PlainTextResponse, summary="Get SOP markdown")
async def get_sop(run_id: str) -> str:
    try:
        validate_run_id(run_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    settings = get_settings()
    try:
        run_dir = resolve_safe_path(Path(settings.runs_dir), run_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    sop_path = run_dir / "SOP.md"
    if not sop_path.exists():  # lgtm[py/path-injection]
        raise HTTPException(status_code=404, detail="SOP.md not found for this run.")
    return sop_path.read_text()  # lgtm[py/path-injection]


@router.get("/{run_id}/compliance-graph", summary="Get compliance JSON-LD graph")
async def get_compliance_graph(run_id: str) -> dict[str, Any]:
    try:
        validate_run_id(run_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    settings = get_settings()
    try:
        run_dir = resolve_safe_path(Path(settings.runs_dir), run_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    jld_path = run_dir / "compliance_graph.jsonld"
    if not jld_path.exists():  # lgtm[py/path-injection]
        raise HTTPException(status_code=404, detail="compliance_graph.jsonld not found.")
    return json.loads(jld_path.read_text())  # type: ignore[no-any-return]  # lgtm[py/path-injection]


@router.get("/{run_id}/dashboard", summary="Get dashboard payload for this run")
async def get_dashboard(run_id: str) -> dict[str, Any]:
    try:
        validate_run_id(run_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    settings = get_settings()
    try:
        run_dir = resolve_safe_path(Path(settings.runs_dir), run_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    dash_path = run_dir / "dashboard_payload.json"
    if not dash_path.exists():  # lgtm[py/path-injection]
        raise HTTPException(
            status_code=404, detail="dashboard_payload.json not found for this run."
        )
    return json.loads(dash_path.read_text())  # type: ignore[no-any-return]  # lgtm[py/path-injection]


@router.get("", summary="List all audit runs")
async def list_runs() -> dict[str, Any]:
    settings = get_settings()
    runs_dir = Path(settings.runs_dir)
    if not runs_dir.exists():
        return {"runs": []}
    runs = []
    for run_dir in sorted(runs_dir.iterdir(), reverse=True):
        if not run_dir.is_dir():
            continue
        manifest = run_dir / "manifest.json"
        entry: dict[str, Any] = {"run_id": run_dir.name}
        if manifest.exists():
            try:
                m = json.loads(manifest.read_text())
                entry.update(
                    {
                        "recipe": m.get("recipe_name", ""),
                        "status": "completed",
                        "artifacts": list(m.get("artifacts", {}).keys()),
                    }
                )
            except Exception:
                entry["status"] = "unknown"
        else:
            # Check in-memory state
            if run_dir.name in _run_status:
                entry.update(_run_status[run_dir.name])
            else:
                entry["status"] = "completed"
        runs.append(entry)
    return {"runs": runs}
