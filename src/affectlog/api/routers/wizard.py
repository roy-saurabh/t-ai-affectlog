"""Wizard API endpoints — backed by production inspection, recommendation, validation, and execution."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException

from affectlog.capabilities.help_text import get_analysis_help, get_step_help
from affectlog.core.paths import resolve_safe_path, validate_run_id
from affectlog.wizard.executor import (
    _WIZARD_RUNS,
    create_run,
    get_run_results,
    get_run_status,
    start_run_background,
)
from affectlog.wizard.inspector import inspect
from affectlog.wizard.output_contract import build_output_contract
from affectlog.wizard.recommender import recommend
from affectlog.wizard.schemas import (
    InspectInputRequest,
    InspectInputResponse,
    OutputContract,
    RecommendRequest,
    RecommendResponse,
    ValidatePlanResponse,
    WizardPlan,
    WizardRunRequest,
    WizardRunResponse,
    WizardRunResultsResponse,
    WizardRunStatusResponse,
)
from affectlog.wizard.validator import validate_plan

log = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/wizard", tags=["Guided Assessment Wizard"])

# Shared response documentation constants (avoid duplicate-literal SonarQube issues).
_RESP_400 = {400: {"description": "Bad request."}}
_RESP_404 = {404: {"description": "Wizard run not found."}}
_RESP_500 = {500: {"description": "Internal error."}}
_RESP_422 = {422: {"description": "Invalid plan input."}}


@router.post(
    "/inspect-inputs",
    response_model=InspectInputResponse,
    summary="Inspect uploaded inputs and detect format/schema",
    responses=_RESP_500,
)
async def inspect_inputs(req: InspectInputRequest) -> InspectInputResponse:
    try:
        return inspect(req)
    except Exception as exc:
        log.exception("Inspection failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post(
    "/recommend",
    response_model=RecommendResponse,
    summary="Recommend a scoped analysis plan based on inputs and purpose",
    responses=_RESP_500,
)
async def recommend_plan(req: RecommendRequest) -> RecommendResponse:
    try:
        return recommend(req)
    except Exception as exc:
        log.exception("Recommendation failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post(
    "/validate-plan",
    response_model=ValidatePlanResponse,
    summary="Validate the wizard plan — returns pass/warn/fail with blocking issues",
    responses=_RESP_500,
)
async def validate_wizard_plan(plan: WizardPlan) -> ValidatePlanResponse:
    try:
        return validate_plan(plan)
    except Exception as exc:
        log.exception("Validation failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post(
    "/output-contract",
    response_model=OutputContract,
    summary="Build the pre-run output contract from a validated plan",
    responses=_RESP_500,
)
async def get_output_contract(plan: WizardPlan) -> OutputContract:
    try:
        return build_output_contract(plan)
    except Exception as exc:
        log.exception("Output contract build failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post(
    "/run",
    response_model=WizardRunResponse,
    summary="Execute the wizard plan via the production audit pipeline",
    responses={**_RESP_400, **_RESP_422, **_RESP_500},
)
async def run_wizard(req: WizardRunRequest, background_tasks: BackgroundTasks) -> WizardRunResponse:
    if not req.output_contract_confirmed:
        raise HTTPException(
            status_code=400,
            detail="Output contract must be confirmed (output_contract_confirmed=true) before execution.",
        )
    try:
        response = create_run(req)
        background_tasks.add_task(start_run_background, response.wizard_run_id, req.plan)
        return response
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        log.exception("Run creation failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get(
    "/runs/{wizard_run_id}",
    response_model=WizardRunStatusResponse,
    summary="Get wizard run status",
    responses=_RESP_404,
)
async def get_wizard_run(wizard_run_id: str) -> WizardRunStatusResponse:
    result = get_run_status(wizard_run_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Wizard run '{wizard_run_id}' not found.")
    return result


@router.get(
    "/runs/{wizard_run_id}/plan",
    summary="Get the plan for a wizard run",
    responses=_RESP_404,
)
async def get_wizard_run_plan(wizard_run_id: str) -> dict[str, Any]:
    run = _WIZARD_RUNS.get(wizard_run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Wizard run '{wizard_run_id}' not found.")
    return {"wizard_run_id": wizard_run_id, "plan": run.get("plan", {})}


@router.get(
    "/runs/{wizard_run_id}/scope",
    summary="Get the analysis scope for a wizard run",
    responses=_RESP_404,
)
async def get_wizard_run_scope(wizard_run_id: str) -> dict[str, Any]:
    run = _WIZARD_RUNS.get(wizard_run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Wizard run '{wizard_run_id}' not found.")
    plan_data = run.get("plan", {})
    return {
        "wizard_run_id": wizard_run_id,
        "selected_analyses": plan_data.get("selected_analyses", []),
        "selected_plots": plan_data.get("selected_plots", []),
        "selected_exports": plan_data.get("selected_exports", []),
        "detected_format": plan_data.get("detected_format"),
    }


@router.get(
    "/runs/{wizard_run_id}/progress",
    response_model=WizardRunStatusResponse,
    summary="Get real-time progress of a wizard run",
    responses=_RESP_404,
)
async def get_wizard_run_progress(wizard_run_id: str) -> WizardRunStatusResponse:
    result = get_run_status(wizard_run_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Wizard run '{wizard_run_id}' not found.")
    return result


@router.get(
    "/runs/{wizard_run_id}/results",
    response_model=WizardRunResultsResponse,
    summary="Get results and guidance for a completed wizard run",
    responses=_RESP_404,
)
async def get_wizard_run_results(wizard_run_id: str) -> WizardRunResultsResponse:
    result = get_run_results(wizard_run_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Wizard run '{wizard_run_id}' not found.")
    return result


@router.get(
    "/runs/{wizard_run_id}/artifacts/{filename}",
    summary="Download a single artifact from a completed wizard run",
    responses={**_RESP_400, **_RESP_404},
)
async def download_wizard_run_artifact(wizard_run_id: str, filename: str) -> Any:
    import re

    from fastapi.responses import FileResponse

    from affectlog.config import get_settings

    if not re.fullmatch(r"[\w\-]{1,200}\.[\w]{1,10}", filename):
        raise HTTPException(status_code=400, detail="Invalid filename.")
    try:
        validate_run_id(wizard_run_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid run ID.") from exc
    settings = get_settings()
    run_dir = resolve_safe_path(Path(settings.runs_dir), wizard_run_id)
    artifact_path = resolve_safe_path(run_dir, filename)
    if not artifact_path.exists():
        raise HTTPException(
            status_code=404, detail=f"Artifact '{filename}' not found for run '{wizard_run_id}'."
        )
    return FileResponse(path=str(artifact_path), filename=filename)


@router.get(
    "/runs/{wizard_run_id}/artifacts",
    summary="List artifacts for a completed wizard run",
    responses={**_RESP_400, **_RESP_404},
)
async def get_wizard_run_artifacts(wizard_run_id: str) -> dict[str, Any]:
    from pathlib import Path

    from affectlog.config import get_settings

    try:
        validate_run_id(wizard_run_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid run ID.") from exc
    settings = get_settings()
    run_dir = resolve_safe_path(Path(settings.runs_dir), wizard_run_id)
    if not run_dir.exists():
        raise HTTPException(
            status_code=404, detail=f"Run directory for '{wizard_run_id}' not found."
        )
    files = [
        {"name": f.name, "size_bytes": f.stat().st_size}
        for f in sorted(run_dir.iterdir())
        if f.is_file()
    ]
    return {"wizard_run_id": wizard_run_id, "artifacts": files}


@router.get(
    "/runs",
    summary="List all wizard runs",
)
async def list_wizard_runs() -> dict[str, Any]:
    runs = [
        {
            "wizard_run_id": run_id,
            "status": run_data.get("status"),
            "created_at": run_data.get("created_at"),
        }
        for run_id, run_data in _WIZARD_RUNS.items()
    ]
    return {"runs": sorted(runs, key=lambda r: r.get("created_at", ""), reverse=True)}


@router.get(
    "/help/step/{step}",
    summary="Contextual help for wizard step",
    responses=_RESP_404,
)
async def get_step_help_endpoint(step: int) -> dict[str, Any]:
    h = get_step_help(step)
    if h is None:
        raise HTTPException(status_code=404, detail=f"No help defined for step {step}.")
    return h.model_dump()


@router.get(
    "/help/analysis/{analysis_id}",
    summary="Contextual help for an analysis",
    responses=_RESP_404,
)
async def get_analysis_help_endpoint(analysis_id: str) -> dict[str, Any]:
    h = get_analysis_help(analysis_id)
    if h is None:
        raise HTTPException(
            status_code=404, detail=f"No help defined for analysis '{analysis_id}'."
        )
    return h.model_dump()
