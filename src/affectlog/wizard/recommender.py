"""Wizard recommender — produces a scoped analysis plan from inspection result and purpose."""

from __future__ import annotations

from affectlog.capabilities.analyses import ANALYSES, ANALYSIS_BY_ID, AnalysisDefinition
from affectlog.capabilities.plots import PLOTS, PlotDefinition
from affectlog.wizard.schemas import (
    RecommendRequest,
    RecommendResponse,
    ScopeItem,
    ScopeStatus,
    WizardPurpose,
)

LIMITATIONS = [
    "AffectLog does not issue legal compliance certifications.",
    "AffectLog does not guarantee the absence of bias — it measures and documents it.",
    "Raw personal data is not exported by default.",
    "Outputs depend on data quality and the accuracy of field mappings.",
    "Interpretation of results requires qualified human review.",
    "Model explanations are approximations — SHAP values are not causal.",
    "Statistical samples are used for large datasets; exact counts may differ.",
]

ASSUMPTIONS = [
    "The uploaded dataset is representative of the production data distribution.",
    "Field mappings confirmed in Step 3 are accurate.",
    "Group fields used in fairness analyses are ethically appropriate and lawfully collected.",
    "Model artifacts are the same versions used in the production system being assessed.",
]

_PURPOSE_ANALYSES: dict[WizardPurpose, list[str]] = {
    WizardPurpose.DATASET_READINESS: [
        "schema_validation",
        "xapi_compatibility_check",
        "missingness_profile",
        "completeness_profile",
        "type_profile",
        "pii_scan",
        "data_card_export",
        "sop_export",
        "audit_manifest_export",
    ],
    WizardPurpose.PRIVACY_AUDIT: [
        "schema_validation",
        "pii_scan",
        "pseudonymisation_benchmark",
        "privacy_risk_profile",
        "data_card_export",
        "sop_export",
        "audit_manifest_export",
        "jsonld_compliance_graph",
    ],
    WizardPurpose.XAPI_HARMONISATION: [
        "schema_validation",
        "xapi_compatibility_check",
        "becomino_template_inference",
        "maskott_csv_to_xapi_transform",
        "pii_scan",
        "sop_export",
        "audit_manifest_export",
        "jsonld_compliance_graph",
    ],
    WizardPurpose.FAIRNESS_OR_REPRESENTATION: [
        "schema_validation",
        "pii_scan",
        "missingness_profile",
        "gini_concentration",
        "coverage_at_k",
        "representation_index",
        "long_tail_profile",
        "sparsity_analysis",
        "fairness_by_group",
        "data_card_export",
        "sop_export",
        "audit_manifest_export",
    ],
    WizardPurpose.RECOMMENDER_EVALUATION: [
        "schema_validation",
        "pii_scan",
        "gini_concentration",
        "coverage_at_k",
        "long_tail_profile",
        "sparsity_analysis",
        "representation_index",
        "recommender_precision_at_k",
        "recommender_recall_at_k",
        "recommender_hit_rate_at_k",
        "recommender_ndcg_at_k",
        "recommender_diversity",
        "recommender_novelty",
        "data_card_export",
        "sop_export",
        "audit_manifest_export",
    ],
    WizardPurpose.MODEL_EXPLANATION: [
        "schema_validation",
        "pii_scan",
        "dataset_model_schema_check",
        "model_feature_importance",
        "model_prediction_explanation",
        "model_partial_dependence",
        "model_card_export",
        "sop_export",
        "audit_manifest_export",
        "jsonld_compliance_graph",
    ],
    WizardPurpose.MODEL_COMPARISON: [
        "schema_validation",
        "pii_scan",
        "dataset_model_schema_check",
        "model_feature_importance",
        "model_comparison",
        "classification_performance",
        "regression_performance",
        "model_card_export",
        "sop_export",
        "audit_manifest_export",
    ],
    WizardPurpose.COMPLIANCE_EXPORT: [
        "schema_validation",
        "pii_scan",
        "data_card_export",
        "jsonld_compliance_graph",
        "sop_export",
        "audit_manifest_export",
        "carisma_metadata_export",
        "lola_metadata_export",
        "pdc_metadata_export",
    ],
    WizardPurpose.FULL_AUDIT: [a.id for a in ANALYSES],
}


# (requirement flag, request flag, default reason, analysis message may override the reason)
_INPUT_REQUIREMENTS: tuple[tuple[str, str, str, bool], ...] = (
    ("requires_model", "has_model", "Requires a registered model artifact or endpoint.", True),
    ("requires_predictions", "has_predictions", "Requires prediction output file.", True),
    ("requires_ground_truth", "has_ground_truth", "Requires ground-truth file.", True),
    ("requires_group_field", "has_group_field", "Requires a group/segment field.", True),
    (
        "requires_probability_output",
        "has_probability_output",
        "Requires probability outputs from the model.",
        False,
    ),
)


_PLOT_REQUIREMENTS: tuple[tuple[str, str, str, bool], ...] = (
    ("requires_model", "has_model", "Requires model.", True),
    ("requires_predictions", "has_predictions", "Requires predictions.", True),
    ("requires_ground_truth", "has_ground_truth", "Requires ground truth.", False),
    ("requires_group_field", "has_group_field", "Requires group field.", True),
    (
        "requires_probability_output",
        "has_probability_output",
        "Requires probability outputs.",
        False,
    ),
)


def _missing_input_reason(
    capability: AnalysisDefinition | PlotDefinition,
    req: RecommendRequest,
    requirements: tuple[tuple[str, str, str, bool], ...] = _INPUT_REQUIREMENTS,
) -> str | None:
    for requirement, provided, reason, overridable in requirements:
        if getattr(capability, requirement) and not getattr(req, provided):
            custom = capability.unavailable_message if overridable else None
            return custom or reason
    return None


def _is_analysis_available(
    analysis_id: str,
    detected_format: str,
    req: RecommendRequest,
) -> tuple[ScopeStatus, str]:
    a = ANALYSIS_BY_ID.get(analysis_id)
    if not a:
        return ScopeStatus.OUT_OF_SCOPE, "Analysis not found in capability registry."

    if a.compatible_formats and detected_format not in a.compatible_formats:
        return (
            ScopeStatus.OUT_OF_SCOPE,
            a.unavailable_message or f"Not compatible with {detected_format} format.",
        )
    reason = _missing_input_reason(a, req)
    if reason:
        return ScopeStatus.CONDITIONAL, reason
    missing = [f for f in a.required_fields if f not in req.field_mappings]
    if missing:
        return (
            ScopeStatus.CONDITIONAL,
            f"Requires field mapping for: {', '.join(missing)}.",
        )
    return ScopeStatus.AVAILABLE, "Ready to run."


def _scope_item_from_analysis(analysis_id: str, status: ScopeStatus, why: str) -> ScopeItem:
    a = ANALYSIS_BY_ID.get(analysis_id)
    if not a:
        return ScopeItem(id=analysis_id, label=analysis_id, status=status, description="", why=why)
    return ScopeItem(
        id=a.id,
        label=a.label,
        status=status,
        description=a.description,
        why=why,
        required_inputs=a.required_fields,
        expected_outputs=a.produced_artifacts,
        backend_route=a.backend_route,
        runtime_category=a.runtime.value,
        sensitivity_level=a.sensitivity.value,
    )


def _classify_analyses(
    purpose_analyses: list[str], detected_format: str, req: RecommendRequest
) -> tuple[list[ScopeItem], list[ScopeItem], list[ScopeItem]]:
    valid: list[ScopeItem] = []
    conditional: list[ScopeItem] = []
    invalid: list[ScopeItem] = []
    for analysis_id in purpose_analyses:
        status, why = _is_analysis_available(analysis_id, detected_format, req)
        item = _scope_item_from_analysis(analysis_id, status, why)
        if status == ScopeStatus.AVAILABLE:
            valid.append(item)
        elif status == ScopeStatus.CONDITIONAL:
            conditional.append(item)
        else:
            invalid.append(item)
    return valid, conditional, invalid


def _incompatible_outside_purpose(
    purpose_analyses: list[str], detected_format: str, req: RecommendRequest
) -> list[ScopeItem]:
    """Analyses outside the purpose list that also cannot run on the detected format."""
    purpose_set = set(purpose_analyses)
    return [
        _scope_item_from_analysis(
            a.id,
            ScopeStatus.OUT_OF_SCOPE,
            a.unavailable_message
            or f"Not in scope for {req.purpose.value} purpose and not compatible with {detected_format}.",
        )
        for a in ANALYSES
        if a.id not in purpose_set
        and a.compatible_formats
        and detected_format not in a.compatible_formats
    ]


def _plot_block_reason(
    plot: PlotDefinition, req: RecommendRequest, detected_format: str, valid_analysis_ids: set[str]
) -> tuple[ScopeStatus, str] | None:
    """Return why a plot cannot be produced for this plan, or None when it is available."""
    if plot.compatible_formats and detected_format not in plot.compatible_formats:
        return (
            ScopeStatus.OUT_OF_SCOPE,
            plot.unavailable_message or f"Not compatible with {detected_format}.",
        )
    reason = _missing_input_reason(plot, req, _PLOT_REQUIREMENTS)
    if reason:
        return ScopeStatus.CONDITIONAL, reason
    if plot.required_analyses and not valid_analysis_ids.intersection(plot.required_analyses):
        return (
            ScopeStatus.CONDITIONAL,
            f"Requires analysis: {', '.join(plot.required_analyses)}.",
        )
    return None


def _classify_plots(
    req: RecommendRequest, detected_format: str, valid_analysis_ids: set[str]
) -> tuple[list[ScopeItem], list[ScopeItem]]:
    valid_plots: list[ScopeItem] = []
    invalid_plots: list[ScopeItem] = []
    for p in PLOTS:
        blocked = _plot_block_reason(p, req, detected_format, valid_analysis_ids)
        if blocked:
            status, why = blocked
            invalid_plots.append(
                ScopeItem(id=p.id, label=p.label, status=status, description=p.purpose, why=why)
            )
        else:
            valid_plots.append(
                ScopeItem(
                    id=p.id,
                    label=p.label,
                    status=ScopeStatus.AVAILABLE,
                    description=p.purpose,
                    why="Available for current analysis plan.",
                )
            )
    return valid_plots, invalid_plots


def _expected_artifacts(req: RecommendRequest) -> list[str]:
    artifacts = [
        "metrics.json",
        "metrics.csv",
        "dashboard_payload.json",
        "field_inventory.csv",
        "SOP.md",
        "audit_manifest.json",
    ]
    if req.has_model:
        artifacts.append("model_card.json")
    artifacts.extend(["data_card.json", "compliance_graph.jsonld"])
    return artifacts


def _runtime_estimate_seconds(req: RecommendRequest, row_count: int) -> int:
    base_time = max(30, row_count // 10_000)
    if req.has_model:
        base_time += 120
    if req.purpose == WizardPurpose.FULL_AUDIT:
        base_time *= 2
    return base_time


_OPTIONAL_INPUT_HINTS = (
    ("model", "Model artifact (.pkl, .onnx, .pt, .h5) or HTTP endpoint URL"),
    ("prediction", "Prediction output CSV"),
    ("ground", "Ground-truth CSV"),
    ("group", "Group/segment field mapping"),
)


def _optional_inputs(conditional: list[ScopeItem]) -> list[str]:
    reasons = [i.why.lower() for i in conditional if i.status == ScopeStatus.CONDITIONAL]
    return [hint for keyword, hint in _OPTIONAL_INPUT_HINTS if any(keyword in r for r in reasons)]


def recommend(req: RecommendRequest) -> RecommendResponse:
    detected_format = req.inspection_result.detected_format or "generic_csv_tabular"
    purpose_analyses = _PURPOSE_ANALYSES.get(req.purpose, [a.id for a in ANALYSES])

    valid, conditional, invalid = _classify_analyses(purpose_analyses, detected_format, req)
    invalid.extend(_incompatible_outside_purpose(purpose_analyses, detected_format, req))

    valid_plots, invalid_plots = _classify_plots(req, detected_format, {i.id for i in valid})

    artifacts = _expected_artifacts(req)
    row_count = req.inspection_result.row_count_estimate or 100_000
    base_time = _runtime_estimate_seconds(req, row_count)

    missing_inputs: list[str] = []
    optional_inputs = _optional_inputs(conditional)

    # ── Scope summary ──────────────────────────────────────────────────
    scope_summary = (
        f"For a {req.purpose.value.replace('_', ' ')} of a {detected_format} dataset: "
        f"{len(valid)} analyses available immediately, "
        f"{len(conditional)} available with additional input, "
        f"{len(invalid)} out of scope."
    )

    # ── Privacy controls ───────────────────────────────────────────────
    privacy_controls = [
        "Entity/user identifiers are HMAC-pseudonymised by default.",
        "Raw personal data is not exported by default.",
        "PII field detection runs before all other analyses.",
        "Privacy acknowledgement is required before sensitive exports.",
    ]

    return RecommendResponse(
        recommended_recipe=f"{detected_format}_{req.purpose.value}",
        valid_analyses=valid,
        invalid_analyses=invalid,
        conditional_analyses=conditional,
        valid_plots=valid_plots,
        invalid_plots=invalid_plots,
        required_missing_inputs=missing_inputs,
        optional_recommended_inputs=optional_inputs,
        privacy_controls=privacy_controls,
        expected_artifacts=artifacts,
        runtime_estimate_seconds=base_time,
        memory_estimate_mb=max(256, row_count // 1000),
        limitations=LIMITATIONS,
        assumptions=ASSUMPTIONS,
        scope_summary=scope_summary,
    )
