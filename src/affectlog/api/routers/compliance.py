"""Compliance endpoints: JSON-LD, Data Card, Model Card."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse

from affectlog.config import get_settings
from affectlog.schemas.api import ComplianceJSONLDRequest, DataCardRequest, SOPResponse

router = APIRouter(prefix="/v1/compliance", tags=["Compliance"])


@router.post("/jsonld", summary="Build and return compliance JSON-LD graph")
async def build_jsonld(req: ComplianceJSONLDRequest) -> dict[str, Any]:
    from affectlog.compliance.jsonld import build_compliance_graph
    graph = build_compliance_graph(
        run_id=req.run_id,
        dataset_name=req.dataset_name,
        fields=[],
    )
    return graph


@router.post("/data-card", summary="Build Data Card for a run")
async def build_data_card_endpoint(req: DataCardRequest) -> dict[str, Any]:
    settings = get_settings()
    run_dir = Path(settings.runs_dir) / req.run_id
    dc_path = run_dir / "data_card.json"
    if dc_path.exists():
        return json.loads(dc_path.read_text())
    from affectlog.compliance.data_card import build_data_card
    return build_data_card(req.dataset_name, [], 0, run_id=req.run_id)


@router.post("/model-card", summary="Build Model Card for a registered model")
async def build_model_card_endpoint(model_id: str, run_id: str) -> dict[str, Any]:
    from affectlog.compliance.model_card import build_model_card
    from affectlog.models.registry import get_registry
    registry = get_registry()
    try:
        adapter = registry.get(model_id)
        return build_model_card(model_id, adapter.metadata(), run_id=run_id)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
