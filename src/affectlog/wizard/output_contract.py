"""Output contract builder — produces the pre-run scope contract from a validated plan."""

from __future__ import annotations

from affectlog.capabilities.analyses import ANALYSIS_BY_ID
from affectlog.capabilities.exports import EXPORT_BY_ID
from affectlog.wizard.schemas import (
    OutputContract,
    OutputContractArtifact,
    WizardPlan,
)

_LIMITATIONS = [
    "AffectLog does not issue legal compliance certifications.",
    "AffectLog does not guarantee the absence of bias — it measures and documents it.",
    "Raw personal data is not exported by default.",
    "Outputs depend on data quality and the accuracy of field mappings supplied in Step 3.",
    "Interpretation of results requires qualified human review.",
    "Model explanations are approximations (SHAP/permutation) — they are not causal.",
    "Statistical samples are used for large datasets; exact row counts may differ from estimates.",
    "Recommender metrics assume the supplied predictions represent the operational system output.",
]

_ASSUMPTIONS = [
    "The uploaded dataset is representative of the production data distribution.",
    "Field mappings confirmed in Step 3 are accurate.",
    "Group fields used in fairness analyses are ethically appropriate and lawfully collected.",
    "Model artifacts are the same versions used in the production system being assessed.",
    "Privacy settings confirmed in Step 4 have been reviewed by an authorised person.",
]


def _add_analysis_artifacts(plan: WizardPlan, artifacts: list[OutputContractArtifact]) -> None:
    for analysis_id in plan.selected_analyses:
        a = ANALYSIS_BY_ID.get(analysis_id)
        if not a:
            continue
        for artifact_filename in a.produced_artifacts:
            if artifact_filename in {art.filename for art in artifacts}:
                continue
            artifacts.append(
                OutputContractArtifact(
                    filename=artifact_filename,
                    format=artifact_filename.rsplit(".", 1)[-1],
                    description=f"Produced by {a.label}.",
                    privacy_level=a.sensitivity.value,
                    required_analysis=a.id,
                )
            )


def _add_export_artifacts(plan: WizardPlan, artifacts: list[OutputContractArtifact]) -> None:
    for export_id in plan.selected_exports:
        e = EXPORT_BY_ID.get(export_id)
        if not e or e.filename_template in {art.filename for art in artifacts}:
            continue
        artifacts.append(
            OutputContractArtifact(
                filename=e.filename_template,
                format=e.format.value,
                description=e.description,
                privacy_level="restricted" if e.privacy_sensitive else "public",
            )
        )


def build_output_contract(plan: WizardPlan) -> OutputContract:
    # Dataset summary
    dataset_summary = (
        f"Format: {plan.detected_format}. "
        f"Field mappings: {len(plan.field_mappings)} fields confirmed. "
        f"Privacy: {'acknowledged' if plan.privacy_settings.get('privacy_acknowledged') else 'standard controls'}."
    )

    # Model summary
    model_ref = plan.inputs.get("model_reference") or plan.inputs.get("model_file")
    model_summary = f"Model: {model_ref}" if model_ref else None

    # Artifacts — always-on
    artifacts: list[OutputContractArtifact] = [
        OutputContractArtifact(
            filename="metrics.json",
            format="json",
            description="All computed metrics in structured JSON.",
            privacy_level="public",
        ),
        OutputContractArtifact(
            filename="metrics.csv",
            format="csv",
            description="Flat CSV of key metric values.",
            privacy_level="public",
        ),
        OutputContractArtifact(
            filename="dashboard_payload.json",
            format="json",
            description="Structured payload for dashboard visualisation.",
            privacy_level="public",
        ),
        OutputContractArtifact(
            filename="audit_manifest.json",
            format="json",
            description="Signed manifest of all inputs, parameters, and artifact hashes.",
            privacy_level="public",
        ),
        OutputContractArtifact(
            filename="SOP.md",
            format="markdown",
            description="Standard Operating Procedure document.",
            privacy_level="public",
        ),
    ]

    _add_analysis_artifacts(plan, artifacts)
    _add_export_artifacts(plan, artifacts)

    scope_summary = (
        f"{len(plan.selected_analyses)} analyses selected, "
        f"{len(plan.selected_plots)} plots, "
        f"{len(plan.selected_exports)} additional exports. "
        f"Purpose: {plan.purpose.value.replace('_', ' ')}."
    )

    return OutputContract(
        dataset_summary=dataset_summary,
        model_summary=model_summary,
        selected_recipe=f"{plan.detected_format}_{plan.purpose.value}",
        field_mappings=plan.field_mappings,
        privacy_settings=plan.privacy_settings,
        selected_analyses=plan.selected_analyses,
        selected_plots=plan.selected_plots,
        expected_artifacts=artifacts,
        limitations=_LIMITATIONS,
        assumptions=_ASSUMPTIONS,
        scope_summary=scope_summary,
    )
