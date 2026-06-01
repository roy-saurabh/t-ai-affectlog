"""Pydantic v2 request/response schemas for API endpoints."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


# ── Health ───────────────────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str = Field(examples=["ok"])
    version: str = Field(examples=["0.1.0"])
    timestamp: str


# ── Datasets ─────────────────────────────────────────────────────────
class DatasetValidateRequest(BaseModel):
    file_path: str = Field(description="Absolute or relative path to the input file")
    schema_name: str = Field(default="maskott_csv_v1", description="Named schema to validate against")

    model_config = {"json_schema_extra": {"example": {"file_path": "data/samples/maskott_csv_sample.csv", "schema_name": "maskott_csv_v1"}}}


class DatasetValidateResponse(BaseModel):
    valid: bool
    schema_name: str
    actual_columns: list[str] = []
    missing_columns: list[str] = []
    extra_columns: list[str] = []
    error: Optional[str] = None


class DatasetIngestRequest(BaseModel):
    file_path: str
    schema_name: str = "maskott_csv_v1"
    recipe: str = "maskott_tactileo"


class DatasetIngestResponse(BaseModel):
    dataset_id: str
    file_path: str
    status: str


class DatasetTransformRequest(BaseModel):
    recipe: str = "configs/recipes/maskott_tactileo.yaml"
    output_path: Optional[str] = None
    chunk_size: int = 100_000
    template_path: Optional[str] = None


class DatasetTransformResponse(BaseModel):
    dataset_id: str
    output_path: str
    total_rows_in: int
    total_rows_out: int
    error_count: int


# ── Audits ────────────────────────────────────────────────────────────
class AuditRunRequest(BaseModel):
    input_path: str
    recipe: str = "configs/recipes/maskott_tactileo.yaml"
    output_dir: Optional[str] = None
    chunk_size: int = 100_000

    model_config = {"json_schema_extra": {"example": {"input_path": "data/processed/maskott_1m.normalized.jsonl", "recipe": "configs/recipes/maskott_tactileo.yaml"}}}


class AuditRunResponse(BaseModel):
    run_id: str
    status: str
    recipe: str
    artifacts: dict[str, str] = {}


class AuditMetricsResponse(BaseModel):
    run_id: str
    metrics: dict[str, Any] = {}


# ── Models ────────────────────────────────────────────────────────────
class ModelRegisterRequest(BaseModel):
    model_path: str
    adapter_type: str = Field(description="sklearn | onnx | torch | tensorflow | http | dummy")
    model_id: Optional[str] = None
    feature_names: list[str] = []


class ModelRegisterResponse(BaseModel):
    model_id: str
    adapter_type: str
    status: str


class PredictRequest(BaseModel):
    instances: list[list[Any]]

    model_config = {"json_schema_extra": {"example": {"instances": [[1.0, 2.0, 3.0]]}}}


class PredictResponse(BaseModel):
    model_id: str
    predictions: list[Any]


class ExplainResponse(BaseModel):
    model_id: str
    explanations: dict[str, Any]


class CompareResponse(BaseModel):
    comparison: list[dict[str, Any]]


# ── Compliance ────────────────────────────────────────────────────────
class ComplianceJSONLDRequest(BaseModel):
    run_id: str
    dataset_name: str = "unknown"


class DataCardRequest(BaseModel):
    run_id: str
    dataset_name: str


class SOPResponse(BaseModel):
    run_id: str
    sop_markdown: str


# ── PDC ───────────────────────────────────────────────────────────────
class PDCPolicyRequest(BaseModel):
    policy_id: str
    asset_id: str
    consent_token: str = ""


class PDCPolicyResponse(BaseModel):
    allowed: bool
    policy_id: str
    reason: str = ""


# ── Errors ────────────────────────────────────────────────────────────
class ErrorResponse(BaseModel):
    detail: str
    request_id: Optional[str] = None
