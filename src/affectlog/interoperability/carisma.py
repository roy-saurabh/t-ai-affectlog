"""
CARiSMA interoperability stub.

CARiSMA (University of Koblenz) supports model-based risk, compliance,
and security analysis at design time. AffectLog exports operation-time
dataset and model audit metadata in a format that can be ingested by
or cross-referenced with CARiSMA risk analysis workflows.

This module:
  - Exports AffectLog audit findings as structured JSON for CARiSMA import.
  - Provides a schema for the metadata exchange format.
  - Does NOT execute CARiSMA directly; it produces import-ready artifacts.
"""

from __future__ import annotations

from datetime import UTC
from typing import Any

CARISMA_SCHEMA_VERSION = "1.0"

CARISMA_EXCHANGE_SCHEMA: dict[str, Any] = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://github.com/Prometheus-X-association/t-ai-affectlog/schemas/carisma-exchange-v1.json",
    "title": "AffectLog → CARiSMA Metadata Exchange",
    "description": (
        "Schema for exporting AffectLog operation-time dataset and model audit findings "
        "to CARiSMA design-time risk analysis workflows. "
        "Part of the Prometheus-X Trustworthy AI Assessment (BB04) ecosystem."
    ),
    "type": "object",
    "required": ["schemaVersion", "exportType", "auditSummary"],
    "properties": {
        "schemaVersion": {"type": "string", "const": CARISMA_SCHEMA_VERSION},
        "exportType": {"type": "string", "enum": ["dataset_audit", "model_audit", "combined"]},
        "generatedAt": {"type": "string", "format": "date-time"},
        "sourceSystem": {"type": "string", "description": "Originating AffectLog instance"},
        "auditRunId": {"type": "string"},
        "datasetId": {"type": "string"},
        "modelId": {"type": "string"},
        "auditSummary": {
            "type": "object",
            "properties": {
                "privacyRiskLevel": {
                    "type": "string",
                    "enum": ["low", "medium", "high", "critical"],
                },
                "piiFieldsDetected": {"type": "integer"},
                "pseudonymisationApplied": {"type": "boolean"},
                "rowCount": {"type": "integer"},
                "completenessScore": {"type": "number"},
                "qualityScore": {"type": "number"},
                "fairnessFlags": {
                    "type": "array",
                    "items": {"type": "string"},
                },
            },
        },
        "concentrationMetrics": {
            "type": "object",
            "properties": {
                "giniCoefficient": {"type": "number"},
                "dominanceRatio": {"type": "number"},
                "coverageAtK": {"type": "number"},
            },
        },
        "modelRiskIndicators": {
            "type": "object",
            "properties": {
                "adapterType": {"type": "string"},
                "featureCount": {"type": "integer"},
                "topFeatureImportances": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "feature": {"type": "string"},
                            "importance": {"type": "number"},
                        },
                    },
                },
            },
        },
        "complianceMappings": {
            "type": "object",
            "properties": {
                "gdprArticlesTriggered": {"type": "array", "items": {"type": "string"}},
                "aiActAnnexIVRelevant": {"type": "boolean"},
                "dataGovernancePolicyRef": {"type": "string"},
            },
        },
        "carismaAnnotations": {
            "type": "object",
            "description": "Optional annotations for CARiSMA import — filled by CARiSMA tooling",
            "additionalProperties": True,
        },
    },
}


def build_carisma_export(audit_artifacts: dict[str, Any]) -> dict[str, Any]:
    """
    Build a CARiSMA-compatible export payload from an AffectLog audit run.

    `audit_artifacts` is the dashboard_payload.json dict from a completed run.
    """
    from datetime import datetime

    privacy = audit_artifacts.get("privacy_report", {})
    metrics = audit_artifacts.get("metrics", {})
    schema = audit_artifacts.get("schema_profile", {})

    return {
        "schemaVersion": CARISMA_SCHEMA_VERSION,
        "exportType": "dataset_audit",
        "generatedAt": datetime.now(UTC).isoformat(),
        "sourceSystem": "AffectLog Trustworthy AI Assessment v1.0",
        "auditRunId": audit_artifacts.get("run_id", ""),
        "auditSummary": {
            "privacyRiskLevel": privacy.get("overall_risk", "unknown"),
            "piiFieldsDetected": privacy.get("pii_field_count", 0),
            "pseudonymisationApplied": privacy.get("pseudonymization_applied", False),
            "rowCount": schema.get("row_count", 0),
            "completenessScore": metrics.get("completeness_score", 0.0),
            "qualityScore": metrics.get("quality_score", 0.0),
            "fairnessFlags": metrics.get("fairness_flags", []),
        },
        "concentrationMetrics": {
            "giniCoefficient": metrics.get("gini_coefficient", 0.0),
            "dominanceRatio": metrics.get("dominance_ratio", 0.0),
            "coverageAtK": metrics.get("coverage_at_k", 0.0),
        },
        "complianceMappings": {
            "gdprArticlesTriggered": audit_artifacts.get("gdpr_articles", []),
            "aiActAnnexIVRelevant": audit_artifacts.get("ai_act_relevant", False),
            "dataGovernancePolicyRef": "https://github.com/Prometheus-X-association/t-ai-affectlog/docs/data-governance.md",
        },
        "carismaAnnotations": {},
    }


def parse_carisma_report(report: dict[str, Any]) -> dict[str, Any]:
    """
    Parse an inbound CARiSMA report for cross-referencing with AffectLog findings.

    Returns a normalised dict of design-time risk findings.
    """
    return {
        "source": "carisma",
        "riskCategories": report.get("riskCategories", []),
        "complianceFindings": report.get("complianceFindings", []),
        "securityFindings": report.get("securityFindings", []),
        "rawReport": report,
    }
