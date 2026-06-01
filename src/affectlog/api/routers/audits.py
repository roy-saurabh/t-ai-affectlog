"""Audit endpoints: run pipeline, get status, retrieve artifacts."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import PlainTextResponse

from affectlog.config import get_settings
from affectlog.core.ids import new_run_id
from affectlog.schemas.api import AuditMetricsResponse, AuditRunRequest, AuditRunResponse

router = APIRouter(prefix="/v1/audits", tags=["Audits"])

_run_status: dict[str, dict[str, Any]] = {}


def _run_audit_bg(run_id: str, req: AuditRunRequest) -> None:
    settings = get_settings()
    try:
        from affectlog.recipes.loader import load_recipe
        from affectlog.recipes.runner import run_audit
        recipe = load_recipe(req.recipe)
        out_dir = Path(req.output_dir or (settings.runs_dir / run_id))
        ctx = run_audit(
            req.input_path, recipe, out_dir,
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
async def run_audit_endpoint(req: AuditRunRequest, background_tasks: BackgroundTasks) -> AuditRunResponse:
    run_id = new_run_id()
    _run_status[run_id] = {"run_id": run_id, "status": "running", "recipe": req.recipe, "artifacts": {}}
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
    settings = get_settings()
    run_dir = Path(settings.runs_dir / run_id)
    if not run_dir.exists():
        raise HTTPException(status_code=404, detail=f"Run directory '{run_id}' not found.")
    return {"run_id": run_id, "artifacts": [f.name for f in run_dir.iterdir() if f.is_file()]}


@router.get("/{run_id}/metrics", response_model=AuditMetricsResponse, summary="Get run metrics")
async def get_metrics(run_id: str) -> AuditMetricsResponse:
    settings = get_settings()
    metrics_path = Path(settings.runs_dir) / run_id / "metrics.json"
    if not metrics_path.exists():
        raise HTTPException(status_code=404, detail="metrics.json not found for this run.")
    return AuditMetricsResponse(run_id=run_id, metrics=json.loads(metrics_path.read_text()))


@router.get("/{run_id}/sop", response_class=PlainTextResponse, summary="Get SOP markdown")
async def get_sop(run_id: str) -> str:
    settings = get_settings()
    sop_path = Path(settings.runs_dir) / run_id / "SOP.md"
    if not sop_path.exists():
        raise HTTPException(status_code=404, detail="SOP.md not found for this run.")
    return sop_path.read_text()


@router.get("/{run_id}/compliance-graph", summary="Get compliance JSON-LD graph")
async def get_compliance_graph(run_id: str) -> dict[str, Any]:
    settings = get_settings()
    jld_path = Path(settings.runs_dir) / run_id / "compliance_graph.jsonld"
    if not jld_path.exists():
        raise HTTPException(status_code=404, detail="compliance_graph.jsonld not found.")
    return json.loads(jld_path.read_text())
