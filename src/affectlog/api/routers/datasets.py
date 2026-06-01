"""Dataset endpoints: validate, ingest, transform, profile."""

from __future__ import annotations

import uuid
from pathlib import Path
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from affectlog.api.dependencies import get_request_id
from affectlog.config import get_settings
from affectlog.schemas.api import (
    DatasetIngestRequest,
    DatasetIngestResponse,
    DatasetTransformRequest,
    DatasetTransformResponse,
    DatasetValidateRequest,
    DatasetValidateResponse,
)

router = APIRouter(prefix="/v1/datasets", tags=["Datasets"])

# In-memory dataset registry (production would use a DB)
_dataset_registry: dict[str, dict[str, Any]] = {}


@router.post("/validate", response_model=DatasetValidateResponse, summary="Validate CSV schema")
async def validate_dataset(
    req: DatasetValidateRequest,
    request_id: Annotated[str, Depends(get_request_id)],
) -> DatasetValidateResponse:
    from affectlog.ingest.validators import validate_schema
    from affectlog.exceptions import IngestError
    try:
        result = validate_schema(req.file_path, req.schema_name)
    except (IngestError, FileNotFoundError, Exception) as exc:
        result = {"valid": False, "error": str(exc), "actual_columns": [], "missing_columns": [], "extra_columns": []}
    return DatasetValidateResponse(
        valid=result.get("valid", False),
        schema_name=req.schema_name,
        actual_columns=result.get("actual_columns", []),
        missing_columns=result.get("missing_columns", []),
        extra_columns=result.get("extra_columns", []),
        error=result.get("error"),
    )


@router.post("/ingest", response_model=DatasetIngestResponse, summary="Register a dataset for processing")
async def ingest_dataset(req: DatasetIngestRequest) -> DatasetIngestResponse:
    dataset_id = f"ds_{uuid.uuid4().hex[:8]}"
    _dataset_registry[dataset_id] = {
        "dataset_id": dataset_id,
        "file_path": req.file_path,
        "schema_name": req.schema_name,
        "recipe": req.recipe,
        "status": "registered",
    }
    return DatasetIngestResponse(
        dataset_id=dataset_id,
        file_path=req.file_path,
        status="registered",
    )


@router.get("/{dataset_id}", summary="Get dataset info")
async def get_dataset(dataset_id: str) -> dict[str, Any]:
    if dataset_id not in _dataset_registry:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
    return _dataset_registry[dataset_id]


@router.post("/{dataset_id}/transform", response_model=DatasetTransformResponse)
async def transform_dataset(dataset_id: str, req: DatasetTransformRequest) -> DatasetTransformResponse:
    if dataset_id not in _dataset_registry:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
    ds = _dataset_registry[dataset_id]
    settings = get_settings()

    output_path = req.output_path or str(settings.processed_dir / f"{dataset_id}.jsonl")

    from affectlog.privacy.pseudonymizer import Pseudonymizer
    from affectlog.recipes.loader import load_recipe
    from affectlog.transform.maskott_csv_to_xapi import convert_maskott_csv_to_xapi

    try:
        recipe = load_recipe(req.recipe)
        pseudo = Pseudonymizer.from_recipe(
            {"hash_fields": recipe.privacy.hash_fields, "method": recipe.privacy.method},
            secret=settings.hash_secret,
        )
        summary = convert_maskott_csv_to_xapi(
            ds["file_path"],
            output_path,
            chunk_size=req.chunk_size,
            pseudonymizer=pseudo,
        )
        _dataset_registry[dataset_id]["status"] = "transformed"
        _dataset_registry[dataset_id]["output_path"] = output_path
        return DatasetTransformResponse(
            dataset_id=dataset_id,
            output_path=output_path,
            total_rows_in=summary["total_rows_in"],
            total_rows_out=summary["total_rows_out"],
            error_count=summary["error_count"],
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/{dataset_id}/profile", summary="Profile a dataset")
async def profile_dataset(dataset_id: str) -> dict[str, Any]:
    if dataset_id not in _dataset_registry:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
    ds = _dataset_registry[dataset_id]
    from affectlog.profiling.schema_profiler import profile_schema
    try:
        return profile_schema(ds["file_path"])
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
