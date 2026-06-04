"""Pydantic schemas for all wizard API requests and responses."""

from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field

# ── Enums ──────────────────────────────────────────────────────────────────


class WizardPurpose(StrEnum):
    DATASET_READINESS = "dataset_readiness"
    PRIVACY_AUDIT = "privacy_audit"
    XAPI_HARMONISATION = "xapi_harmonisation"
    FAIRNESS_OR_REPRESENTATION = "fairness_or_representation"
    RECOMMENDER_EVALUATION = "recommender_evaluation"
    MODEL_EXPLANATION = "model_explanation"
    MODEL_COMPARISON = "model_comparison"
    COMPLIANCE_EXPORT = "compliance_export"
    FULL_AUDIT = "full_audit"


class FieldRole(StrEnum):
    ENTITY = "entity_field"
    ITEM = "item_field"
    TIMESTAMP = "timestamp_field"
    SESSION = "session_field"
    VERB = "verb_field"
    TARGET = "target_field"
    PREDICTION = "prediction_field"
    GROUP = "group_field"
    SENSITIVE = "sensitive_field"
    PROXY = "proxy_field"
    IDENTIFIER = "identifier_field"


class ModelTaskType(StrEnum):
    CLASSIFICATION = "classification"
    REGRESSION = "regression"
    RANKING = "ranking"
    UNKNOWN = "unknown"


class ScopeStatus(StrEnum):
    AVAILABLE = "available"
    CONDITIONAL = "conditional"
    OUT_OF_SCOPE = "out_of_scope"


class ValidationStatus(StrEnum):
    PASS = "pass"
    WARN = "warn"
    FAIL = "fail"


# ── Input Source ───────────────────────────────────────────────────────────


class UserHints(BaseModel):
    dataset_type: str | None = None
    platform: str | None = None
    task_type: ModelTaskType | None = None
    target_field: str | None = None
    prediction_field: str | None = None
    group_fields: list[str] = Field(default_factory=list)
    timestamp_field: str | None = None
    entity_field: str | None = None
    item_field: str | None = None
    session_field: str | None = None
    xapi_mode: bool = False
    recommender_mode: bool = False


class InspectInputRequest(BaseModel):
    dataset_path: str | None = Field(None, description="Path to the uploaded dataset file")
    dataset_reference: str | None = Field(None, description="Reference ID of an existing dataset")
    model_path: str | None = None
    model_reference: str | None = None
    prediction_path: str | None = None
    prediction_reference: str | None = None
    ground_truth_path: str | None = None
    ground_truth_reference: str | None = None
    user_hints: UserHints = Field(default_factory=UserHints)

    model_config = {
        "json_schema_extra": {
            "example": {
                "dataset_path": "uploads/maskott_sample.csv",
                "user_hints": {"dataset_type": "maskott_csv_v1"},
            }
        }
    }


class FieldInventoryEntry(BaseModel):
    name: str
    inferred_type: str
    cardinality: int | None = None
    missing_rate: float | None = None
    sample_values: list[str] = Field(default_factory=list)
    pii_flag: bool = False
    likely_roles: list[FieldRole] = Field(default_factory=list)


class InspectInputResponse(BaseModel):
    detected_format: str | None = None
    detected_format_label: str | None = None
    format_confidence: float = 0.0
    row_count_estimate: int | None = None
    file_size_bytes: int | None = None
    field_inventory: list[FieldInventoryEntry] = Field(default_factory=list)
    xapi_compatibility_score: float | None = None
    becomino_template_match_score: float | None = None
    maskott_schema_match_score: float | None = None
    missing_required_fields: list[str] = Field(default_factory=list)
    detected_model_type: str | None = None
    model_adapter_compatibility: str | None = None
    risk_warnings: list[str] = Field(default_factory=list)
    recommended_next_step: str = "confirm_format"
    is_supported: bool = True
    unsupported_reason: str | None = None
    pre_mapped_fields: dict[str, str] = Field(default_factory=dict)


# ── Recommend ──────────────────────────────────────────────────────────────


class ScopeItem(BaseModel):
    id: str
    label: str
    status: ScopeStatus
    description: str
    why: str
    required_inputs: list[str] = Field(default_factory=list)
    expected_outputs: list[str] = Field(default_factory=list)
    backend_route: str = ""
    runtime_category: str = "fast"
    sensitivity_level: str = "low"


class RecommendRequest(BaseModel):
    inspection_result: InspectInputResponse
    purpose: WizardPurpose = WizardPurpose.FULL_AUDIT
    field_mappings: dict[str, str] = Field(default_factory=dict)
    has_model: bool = False
    has_predictions: bool = False
    has_ground_truth: bool = False
    has_group_field: bool = False
    has_probability_output: bool = False
    user_hints: UserHints = Field(default_factory=UserHints)


class RecommendResponse(BaseModel):
    recommended_recipe: str
    valid_analyses: list[ScopeItem] = Field(default_factory=list)
    invalid_analyses: list[ScopeItem] = Field(default_factory=list)
    conditional_analyses: list[ScopeItem] = Field(default_factory=list)
    valid_plots: list[ScopeItem] = Field(default_factory=list)
    invalid_plots: list[ScopeItem] = Field(default_factory=list)
    required_missing_inputs: list[str] = Field(default_factory=list)
    optional_recommended_inputs: list[str] = Field(default_factory=list)
    privacy_controls: list[str] = Field(default_factory=list)
    expected_artifacts: list[str] = Field(default_factory=list)
    runtime_estimate_seconds: int | None = None
    memory_estimate_mb: int | None = None
    limitations: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)
    scope_summary: str = ""


# ── Validate Plan ──────────────────────────────────────────────────────────


class WizardPlan(BaseModel):
    detected_format: str
    field_mappings: dict[str, str] = Field(default_factory=dict)
    field_types: dict[str, str] = Field(default_factory=dict)
    selected_analyses: list[str] = Field(default_factory=list)
    selected_plots: list[str] = Field(default_factory=list)
    selected_exports: list[str] = Field(default_factory=list)
    privacy_settings: dict[str, Any] = Field(default_factory=dict)
    inputs: dict[str, Any] = Field(default_factory=dict)
    purpose: WizardPurpose = WizardPurpose.FULL_AUDIT
    model_context: dict[str, Any] = Field(default_factory=dict)


class ValidationIssue(BaseModel):
    severity: str
    rule_id: str
    title: str
    message: str
    remediation: str
    affected_step: int | None = None


class ValidatePlanResponse(BaseModel):
    status: ValidationStatus
    issues: list[ValidationIssue] = Field(default_factory=list)
    blocking_count: int = 0
    warning_count: int = 0
    info_count: int = 0


# ── Output Contract ────────────────────────────────────────────────────────


class OutputContractArtifact(BaseModel):
    filename: str
    format: str
    description: str
    privacy_level: str
    required_analysis: str | None = None


class OutputContract(BaseModel):
    dataset_summary: str
    model_summary: str | None = None
    selected_recipe: str
    field_mappings: dict[str, str]
    privacy_settings: dict[str, Any]
    selected_analyses: list[str]
    selected_plots: list[str]
    expected_artifacts: list[OutputContractArtifact]
    limitations: list[str]
    assumptions: list[str]
    scope_summary: str
    requires_confirmation: bool = True
    confirmation_text: str = "I understand the scope, limitations, privacy controls, and expected outputs of this assessment."


# ── Run ───────────────────────────────────────────────────────────────────


class WizardRunRequest(BaseModel):
    plan: WizardPlan
    output_contract_confirmed: bool = Field(
        ..., description="Must be True — user has confirmed the output contract."
    )
    run_label: str | None = None


class WizardRunResponse(BaseModel):
    wizard_run_id: str
    status: str
    plan_summary: dict[str, Any]
    created_at: str


class WizardRunStatusResponse(BaseModel):
    wizard_run_id: str
    status: str
    current_stage: str | None = None
    stages_completed: list[str] = Field(default_factory=list)
    rows_processed: int | None = None
    warnings: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    progress_pct: float | None = None


class WizardRunResultsResponse(BaseModel):
    wizard_run_id: str
    status: str
    what_was_analyzed: list[str] = Field(default_factory=list)
    what_was_not_analyzed: list[str] = Field(default_factory=list)
    key_findings: list[str] = Field(default_factory=list)
    recommended_next_actions: list[str] = Field(default_factory=list)
    artifacts: list[OutputContractArtifact] = Field(default_factory=list)
    selected_plots: list[str] = Field(default_factory=list)
    developer_extension_suggestions: list[str] = Field(default_factory=list)
