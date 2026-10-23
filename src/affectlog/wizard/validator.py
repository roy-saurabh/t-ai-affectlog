"""Wizard plan validator — returns strict pass/warning/fail before execution."""

from __future__ import annotations

from affectlog.capabilities.analyses import ANALYSIS_BY_ID
from affectlog.capabilities.guardrails import run_all_guardrails
from affectlog.capabilities.plots import PLOT_BY_ID
from affectlog.wizard.schemas import (
    ValidatePlanResponse,
    ValidationIssue,
    ValidationStatus,
    WizardPlan,
)


def _guardrail_issues(plan: WizardPlan) -> list[ValidationIssue]:
    guardrail_results = run_all_guardrails(
        analyses=plan.selected_analyses,
        plots=plan.selected_plots,
        exports=plan.selected_exports,
        field_mappings=plan.field_mappings,
        field_types=plan.field_types,
        inputs=plan.inputs,
        privacy_settings=plan.privacy_settings,
        detected_format=plan.detected_format,
    )
    return [
        ValidationIssue(
            severity=gr.severity.value,
            rule_id=gr.rule_id,
            title=gr.title,
            message=gr.message,
            remediation=gr.remediation,
            affected_step=gr.affected_step,
        )
        for gr in guardrail_results
    ]


def _unknown_analysis_issues(plan: WizardPlan) -> list[ValidationIssue]:
    return [
        ValidationIssue(
            severity="block",
            rule_id="unknown_analysis",
            title=f"Unknown analysis: {analysis_id}",
            message=f"'{analysis_id}' is not in the capability registry.",
            remediation="Remove this analysis from the plan — it does not exist.",
            affected_step=6,
        )
        for analysis_id in plan.selected_analyses
        if analysis_id not in ANALYSIS_BY_ID
    ]


def _unknown_plot_issues(plan: WizardPlan) -> list[ValidationIssue]:
    return [
        ValidationIssue(
            severity="block",
            rule_id="unknown_plot",
            title=f"Unknown plot: {plot_id}",
            message=f"'{plot_id}' is not in the plot catalog.",
            remediation="Remove this plot from the plan — it does not exist.",
            affected_step=7,
        )
        for plot_id in plan.selected_plots
        if plot_id not in PLOT_BY_ID
    ]


def _format_issues(plan: WizardPlan) -> list[ValidationIssue]:
    from affectlog.capabilities.formats import FORMAT_BY_ID, UNSUPPORTED_FORMAT_IDS

    if plan.detected_format in UNSUPPORTED_FORMAT_IDS:
        return [
            ValidationIssue(
                severity="block",
                rule_id="unsupported_format",
                title="Unsupported dataset format",
                message=f"Format '{plan.detected_format}' is not supported by AffectLog.",
                remediation="Convert the input to a supported format or implement a compatible adapter.",
                affected_step=2,
            )
        ]
    if plan.detected_format not in FORMAT_BY_ID:
        return [
            ValidationIssue(
                severity="warn",
                rule_id="unrecognised_format",
                title="Unrecognised format identifier",
                message=f"'{plan.detected_format}' is not in the format registry. Analysis may be limited.",
                remediation="Return to Step 2 and confirm the correct format.",
                affected_step=2,
            )
        ]
    return []


def _privacy_ack_issues(plan: WizardPlan) -> list[ValidationIssue]:
    from affectlog.capabilities.exports import EXPORT_BY_ID

    if plan.privacy_settings.get("privacy_acknowledged"):
        return []
    issues: list[ValidationIssue] = []
    for export_id in plan.selected_exports:
        export_def = EXPORT_BY_ID.get(export_id)
        if export_def and export_def.blocked_without_privacy_ack:
            issues.append(
                ValidationIssue(
                    severity="block",
                    rule_id=f"privacy_ack_required_{export_id}",
                    title=f"Privacy acknowledgement required for {export_def.label}",
                    message="This export requires explicit privacy acknowledgement.",
                    remediation="Return to Step 4 and confirm the privacy acknowledgement.",
                    affected_step=4,
                )
            )
    return issues


def _minimum_analysis_issues(plan: WizardPlan) -> list[ValidationIssue]:
    if plan.selected_analyses:
        return []
    return [
        ValidationIssue(
            severity="block",
            rule_id="no_analyses_selected",
            title="No analyses selected",
            message="At least one analysis must be selected to run an assessment.",
            remediation="Return to Step 6 and select at least one analysis.",
            affected_step=6,
        )
    ]


def _overall_status(blocking: int, warnings: int) -> ValidationStatus:
    if blocking > 0:
        return ValidationStatus.FAIL
    if warnings > 0:
        return ValidationStatus.WARN
    return ValidationStatus.PASS


def validate_plan(plan: WizardPlan) -> ValidatePlanResponse:
    issues = [
        *_guardrail_issues(plan),
        *_unknown_analysis_issues(plan),
        *_unknown_plot_issues(plan),
        *_format_issues(plan),
        *_privacy_ack_issues(plan),
        *_minimum_analysis_issues(plan),
    ]

    blocking = sum(1 for i in issues if i.severity == "block")
    warnings = sum(1 for i in issues if i.severity == "warn")
    infos = sum(1 for i in issues if i.severity == "info")

    return ValidatePlanResponse(
        status=_overall_status(blocking, warnings),
        issues=issues,
        blocking_count=blocking,
        warning_count=warnings,
        info_count=infos,
    )
