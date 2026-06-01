"""Explanation endpoints."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException

from affectlog.schemas.api import ExplainResponse, PredictRequest

router = APIRouter(prefix="/v1/explanations", tags=["Explanations"])


@router.post("/{model_id}/feature-importance", summary="Get feature importance for a model")
async def feature_importance(model_id: str, req: PredictRequest) -> dict[str, Any]:
    import numpy as np
    from affectlog.explanations.generator import ExplanationGenerator
    from affectlog.models.registry import get_registry
    registry = get_registry()
    try:
        adapter = registry.get(model_id)
        X = np.array(req.instances)
        gen = ExplanationGenerator(adapter)
        return gen.generate_feature_importance(X)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
