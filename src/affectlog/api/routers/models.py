"""Model management endpoints."""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING, Any

from fastapi import APIRouter, HTTPException

if TYPE_CHECKING:
    from affectlog.models.base import BaseModelAdapter

from affectlog.config import get_settings
from affectlog.core.ids import new_model_id
from affectlog.core.paths import resolve_safe_path
from affectlog.models.registry import get_registry
from affectlog.schemas.api import (
    CompareResponse,
    ExplainResponse,
    ModelRegisterRequest,
    ModelRegisterResponse,
    PredictRequest,
    PredictResponse,
)

router = APIRouter(prefix="/v1/models", tags=["Models"])


@router.post("/register", response_model=ModelRegisterResponse, summary="Register a model")
async def register_model(req: ModelRegisterRequest) -> ModelRegisterResponse:
    settings = get_settings()
    trusted_dir = Path(settings.models_dir).resolve()
    registry = get_registry()
    model_id = req.model_id or new_model_id()
    try:
        safe_path = resolve_safe_path(trusted_dir, req.model_path)
        adapter: BaseModelAdapter
        if req.adapter_type == "sklearn":
            from affectlog.models.sklearn_adapter import SklearnAdapter

            adapter = SklearnAdapter.from_file(
                safe_path, req.feature_names or None, trusted_dir=trusted_dir
            )
        elif req.adapter_type == "onnx":
            from affectlog.models.onnx_adapter import OnnxAdapter

            adapter = OnnxAdapter.from_file(safe_path, trusted_dir=trusted_dir)
        elif req.adapter_type == "torch":
            from affectlog.models.torch_adapter import TorchAdapter

            adapter = TorchAdapter.from_file(safe_path, trusted_dir=trusted_dir)
        elif req.adapter_type == "tensorflow":
            from affectlog.models.tensorflow_adapter import TensorFlowAdapter

            adapter = TensorFlowAdapter.from_file(safe_path, trusted_dir=trusted_dir)
        elif req.adapter_type == "dummy":
            from affectlog.models.dummy_adapter import DummyAdapter

            adapter = DummyAdapter(feature_names=req.feature_names or None)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown adapter type: {req.adapter_type}")
        registry.register(model_id, adapter)
        return ModelRegisterResponse(
            model_id=model_id, adapter_type=req.adapter_type, status="registered"
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/{model_id}", summary="Get model metadata")
async def get_model(model_id: str) -> dict[str, Any]:
    registry = get_registry()
    try:
        adapter = registry.get(model_id)
        return {"model_id": model_id, **adapter.metadata()}
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{model_id}/predict", response_model=PredictResponse, summary="Run model prediction")
async def predict(model_id: str, req: PredictRequest) -> PredictResponse:
    import numpy as np

    registry = get_registry()
    try:
        adapter = registry.get(model_id)
        X = np.array(req.instances)
        preds = adapter.predict(X)
        return PredictResponse(model_id=model_id, predictions=preds)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post(
    "/{model_id}/explain", response_model=ExplainResponse, summary="Generate model explanations"
)
async def explain(model_id: str, req: PredictRequest) -> ExplainResponse:
    import numpy as np

    registry = get_registry()
    try:
        adapter = registry.get(model_id)
        X = np.array(req.instances)
        from affectlog.explanations.generator import ExplanationGenerator

        gen = ExplanationGenerator(adapter)
        exp = gen.generate_explanations(X)
        return ExplainResponse(model_id=model_id, explanations=exp)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/compare", response_model=CompareResponse, summary="Compare registered models")
async def compare_models_endpoint(model_ids: list[str], req: PredictRequest) -> CompareResponse:
    import numpy as np

    registry = get_registry()
    adapters = [registry.get(mid) for mid in model_ids]
    X = np.array(req.instances)
    from affectlog.explanations.comparison import compare_models

    y_dummy = np.zeros(len(X))
    results = compare_models(adapters, X, y_dummy)
    return CompareResponse(comparison=results)
