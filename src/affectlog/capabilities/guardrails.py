"""Guardrail rules evaluated during wizard plan validation."""

from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import BaseModel


class GuardrailSeverity(StrEnum):
    BLOCK = "block"
    WARN = "warn"
    INFO = "info"


class GuardrailResult(BaseModel):
    rule_id: str
    severity: GuardrailSeverity
    analysis_id: str | None = None
    plot_id: str | None = None
    title: str
    message: str
    remediation: str
    affected_step: int | None = None


def check_fairness_requires_group(
    analyses: list[str], field_mappings: dict[str, Any]
) -> GuardrailResult | None:
    if "fairness_by_group" not in analyses:
        return None
    if not field_mappings.get("group_field") and not field_mappings.get("group_fields"):
        return GuardrailResult(
            rule_id="fairness_requires_group",
            severity=GuardrailSeverity.BLOCK,
            analysis_id="fairness_by_group",
            title="Group field required for Fairness-by-Group",
            message="Fairness-by-group cannot run without at least one group/segment field.",
            remediation="Return to Step 3 and map an ethically appropriate group field. Confirm its lawful use.",
            affected_step=3,
        )
    return None


def check_classification_requires_labels(
    analyses: list[str], field_mappings: dict[str, Any]
) -> GuardrailResult | None:
    needs = {"classification_performance", "segment_performance", "fairness_by_group"}
    if not needs.intersection(analyses):
        return None
    if not field_mappings.get("target_field") or not field_mappings.get("prediction_field"):
        return GuardrailResult(
            rule_id="classification_requires_labels",
            severity=GuardrailSeverity.BLOCK,
            analysis_id="classification_performance",
            title="Target and prediction fields required",
            message="Classification metrics require both a target (ground-truth) field and a prediction field.",
            remediation="Return to Step 3 and map both target_field and prediction_field.",
            affected_step=3,
        )
    return None


def check_regression_requires_numeric(
    analyses: list[str], field_mappings: dict[str, Any], field_types: dict[str, str]
) -> GuardrailResult | None:
    if "regression_performance" not in analyses and "model_residual_diagnostics" not in analyses:
        return None
    target = field_mappings.get("target_field")
    if target and field_types.get(target) not in ("float", "int", "numeric", None):
        return GuardrailResult(
            rule_id="regression_requires_numeric_target",
            severity=GuardrailSeverity.BLOCK,
            analysis_id="regression_performance",
            title="Numeric target field required for regression",
            message=f"The mapped target field '{target}' is not numeric. Regression metrics require numeric targets.",
            remediation="Map a numeric field as target_field or switch to a classification analysis.",
            affected_step=3,
        )
    return None


def check_recommender_requires_predictions(
    analyses: list[str], inputs: dict[str, Any]
) -> GuardrailResult | None:
    rec_analyses = {
        "recommender_precision_at_k",
        "recommender_recall_at_k",
        "recommender_hit_rate_at_k",
        "recommender_ndcg_at_k",
        "recommender_diversity",
        "recommender_novelty",
    }
    active_rec = rec_analyses.intersection(analyses)
    if not active_rec:
        return None
    needs_gt = {
        "recommender_precision_at_k",
        "recommender_recall_at_k",
        "recommender_hit_rate_at_k",
        "recommender_ndcg_at_k",
    }
    if not inputs.get("predictions_reference") and not inputs.get("prediction_file"):
        return GuardrailResult(
            rule_id="recommender_requires_predictions",
            severity=GuardrailSeverity.BLOCK,
            title="Ranked recommendation list required",
            message="Recommender metrics require a ranked prediction/recommendation output.",
            remediation="Return to Step 1 and upload a prediction CSV containing ranked recommendation lists.",
            affected_step=1,
        )
    if needs_gt.intersection(active_rec) and not inputs.get("ground_truth_reference"):
        return GuardrailResult(
            rule_id="recommender_requires_ground_truth",
            severity=GuardrailSeverity.BLOCK,
            title="Ground-truth interactions required",
            message="Precision, Recall, Hit Rate, and nDCG@K require ground-truth interaction data.",
            remediation="Return to Step 1 and upload a ground-truth CSV.",
            affected_step=1,
        )
    return None


def check_model_explanation_requires_model(
    analyses: list[str], inputs: dict[str, Any]
) -> GuardrailResult | None:
    explanation_analyses = {
        "model_feature_importance",
        "model_prediction_explanation",
        "model_partial_dependence",
        "model_comparison",
        "dataset_model_schema_check",
        "model_card_export",
    }
    if not explanation_analyses.intersection(analyses):
        return None
    if not inputs.get("model_reference") and not inputs.get("model_file"):
        return GuardrailResult(
            rule_id="explanation_requires_model",
            severity=GuardrailSeverity.BLOCK,
            title="Model artifact required for explanation analyses",
            message="Model explanations are unavailable because no compatible model artifact or endpoint was supplied.",
            remediation="Return to Step 1 and upload a model artifact or register an HTTP model endpoint.",
            affected_step=1,
        )
    return None


def check_roc_pr_requires_probabilities(
    plots: list[str], inputs: dict[str, Any]
) -> GuardrailResult | None:
    prob_plots = {"roc_curve", "pr_curve", "calibration_curve"}
    active = prob_plots.intersection(plots)
    if not active:
        return None
    if not inputs.get("has_probability_output"):
        return GuardrailResult(
            rule_id="roc_pr_requires_probabilities",
            severity=GuardrailSeverity.BLOCK,
            title="Probability outputs required for ROC/PR/Calibration",
            message="ROC, PR, and Calibration curves require probability score outputs from the classifier.",
            remediation="Confirm in Step 5 that the model produces probability outputs, or deselect these plots.",
            affected_step=5,
        )
    return None


def check_temporal_requires_timestamp(
    analyses: list[str], plots: list[str], field_mappings: dict[str, Any]
) -> GuardrailResult | None:
    temporal_analyses = {
        "temporal_density_profile",
        "session_density_profile",
        "event_frequency_profile",
    }
    temporal_plots = {
        "event_frequency_timeline",
        "temporal_density_histogram",
        "session_density_histogram",
    }
    needs_ts = temporal_analyses.intersection(analyses) or temporal_plots.intersection(plots)
    if not needs_ts:
        return None
    if not field_mappings.get("timestamp_field"):
        return GuardrailResult(
            rule_id="temporal_requires_timestamp",
            severity=GuardrailSeverity.WARN,
            title="Timestamp field not mapped",
            message="Temporal analyses and timeline plots require a timestamp field.",
            remediation="Return to Step 3 and map a timestamp column, or deselect temporal analyses and plots.",
            affected_step=3,
        )
    return None


def check_xapi_transform_requires_maskott(
    analyses: list[str], detected_format: str
) -> GuardrailResult | None:
    if "maskott_csv_to_xapi_transform" not in analyses:
        return None
    if detected_format != "maskott_csv_v1":
        return GuardrailResult(
            rule_id="xapi_transform_requires_maskott",
            severity=GuardrailSeverity.BLOCK,
            analysis_id="maskott_csv_to_xapi_transform",
            title="xAPI Transform requires Maskott CSV format",
            message="The Maskott CSV → xAPI transform only applies to maskott_csv_v1 format datasets.",
            remediation="Deselect xAPI transform, or upload a Maskott/Tactileo CSV dataset.",
            affected_step=2,
        )
    return None


def check_raw_identifier_export(
    exports: list[str], privacy_settings: dict[str, Any]
) -> GuardrailResult | None:
    sensitive_exports = {"field_inventory_csv", "privacy_report_json", "pdc_metadata_json"}
    if not sensitive_exports.intersection(exports):
        return None
    if not privacy_settings.get("privacy_acknowledged"):
        return GuardrailResult(
            rule_id="privacy_acknowledgement_required",
            severity=GuardrailSeverity.BLOCK,
            title="Privacy acknowledgement required",
            message="Sensitive exports require explicit privacy acknowledgement from the tenant administrator.",
            remediation="Return to Step 4 and confirm the privacy acknowledgement before proceeding.",
            affected_step=4,
        )
    return None


def check_quota(file_size_bytes: int, quota_bytes: int) -> GuardrailResult | None:
    if file_size_bytes > quota_bytes:
        return GuardrailResult(
            rule_id="quota_exceeded",
            severity=GuardrailSeverity.BLOCK,
            title="File exceeds tenant quota",
            message=f"The uploaded file ({file_size_bytes / 1e6:.1f} MB) exceeds the tenant quota ({quota_bytes / 1e6:.1f} MB).",
            remediation="Contact your administrator to increase quota, or split the dataset into smaller chunks.",
            affected_step=1,
        )
    return None


def check_unsupported_extension(filename: str) -> GuardrailResult | None:
    BLOCKED = {".exe", ".bat", ".sh", ".ps1", ".py", ".js", ".php", ".rb", ".zip", ".tar", ".gz"}
    suffix = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if f".{suffix}" in BLOCKED:
        return GuardrailResult(
            rule_id="unsupported_extension",
            severity=GuardrailSeverity.BLOCK,
            title="Unsupported file extension",
            message=f"Files with .{suffix} extension are not accepted for security reasons.",
            remediation="Upload a CSV, JSON, JSONL, Parquet, or supported model artifact file.",
            affected_step=1,
        )
    return None


def run_all_guardrails(
    analyses: list[str],
    plots: list[str],
    exports: list[str],
    field_mappings: dict[str, Any],
    field_types: dict[str, str],
    inputs: dict[str, Any],
    privacy_settings: dict[str, Any],
    detected_format: str,
) -> list[GuardrailResult]:
    results: list[GuardrailResult] = []
    checks = [
        check_fairness_requires_group(analyses, field_mappings),
        check_classification_requires_labels(analyses, field_mappings),
        check_regression_requires_numeric(analyses, field_mappings, field_types),
        check_recommender_requires_predictions(analyses, inputs),
        check_model_explanation_requires_model(analyses, inputs),
        check_roc_pr_requires_probabilities(plots, inputs),
        check_temporal_requires_timestamp(analyses, plots, field_mappings),
        check_xapi_transform_requires_maskott(analyses, detected_format),
        check_raw_identifier_export(exports, privacy_settings),
    ]
    for r in checks:
        if r is not None:
            results.append(r)
    return results
