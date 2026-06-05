"""
LOLA interoperability stub.

LOLA (LORIA / Université de Lorraine) supports algorithm evaluation
scenarios using real-world data under secure execution conditions.
AffectLog exports dataset-level profiling and algorithm evaluation
metrics in a format compatible with LOLA's scenario framework.

This module:
  - Exports AffectLog metrics in a LOLA-compatible vocabulary.
  - Provides schemas for exchange.
  - Does NOT claim direct operational integration unless a LOLA service
    endpoint is explicitly configured.
"""

from __future__ import annotations

from datetime import UTC
from typing import Any

LOLA_SCHEMA_VERSION = "1.0"

SHARED_METRICS_VOCABULARY: dict[str, str] = {
    "coverage_at_k": "The fraction of items (users, resources) with at least K interactions.",
    "gini_coefficient": "Gini concentration coefficient over item interaction distribution.",
    "ndcg": "Normalised Discounted Cumulative Gain — ranking quality metric.",
    "precision_at_k": "Precision@K for recommendation evaluation.",
    "recall_at_k": "Recall@K for recommendation evaluation.",
    "hit_rate": "Hit rate (whether a relevant item appears in top-K).",
    "diversity": "Intra-list diversity of recommended items.",
    "novelty": "Popularity-adjusted novelty of recommended items.",
    "personalization": "Degree of personalisation across user recommendation lists.",
    "entropy": "Shannon entropy of activity distribution.",
    "sparsity": "Fraction of missing user-item interactions in the full matrix.",
    "long_tail_coverage": "Fraction of long-tail (low-frequency) items represented.",
}

LOLA_EXCHANGE_SCHEMA: dict[str, Any] = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://github.com/Prometheus-X-association/t-ai-affectlog/schemas/lola-exchange-v1.json",
    "title": "AffectLog → LOLA Metadata Exchange",
    "description": (
        "Schema for exporting AffectLog dataset evaluation metrics to LOLA "
        "algorithm evaluation scenario workflows. "
        "Part of the Prometheus-X Trustworthy AI Assessment (BB04) ecosystem."
    ),
    "type": "object",
    "required": ["schemaVersion", "exportType", "metrics"],
    "properties": {
        "schemaVersion": {"type": "string", "const": LOLA_SCHEMA_VERSION},
        "exportType": {"type": "string", "enum": ["dataset_metrics", "recommendation_metrics"]},
        "generatedAt": {"type": "string", "format": "date-time"},
        "sourceSystem": {"type": "string"},
        "auditRunId": {"type": "string"},
        "datasetId": {"type": "string"},
        "scenarioId": {"type": "string", "description": "Optional LOLA scenario identifier"},
        "metrics": {
            "type": "object",
            "properties": {
                "coverage_at_k": {"type": "number"},
                "gini_coefficient": {"type": "number"},
                "ndcg": {"type": "number"},
                "precision_at_k": {"type": "number"},
                "recall_at_k": {"type": "number"},
                "hit_rate": {"type": "number"},
                "diversity": {"type": "number"},
                "novelty": {"type": "number"},
                "personalization": {"type": "number"},
                "entropy": {"type": "number"},
                "sparsity": {"type": "number"},
                "long_tail_coverage": {"type": "number"},
            },
            "additionalProperties": {"type": "number"},
        },
        "datasetProfile": {
            "type": "object",
            "properties": {
                "rowCount": {"type": "integer"},
                "entityCount": {"type": "integer"},
                "resourceCount": {"type": "integer"},
                "temporalSpanDays": {"type": "number"},
            },
        },
        "lolaAnnotations": {
            "type": "object",
            "description": "Optional annotations for LOLA import — filled by LOLA tooling",
            "additionalProperties": True,
        },
    },
}


def build_lola_export(
    audit_artifacts: dict[str, Any],
    lola_scenario_id: str = "",
) -> dict[str, Any]:
    """
    Build a LOLA-compatible export from AffectLog audit metrics.
    """
    from datetime import datetime

    metrics_raw = audit_artifacts.get("metrics", {})
    coverage = audit_artifacts.get("coverage_metrics", {})
    concentration = audit_artifacts.get("concentration_metrics", {})
    schema_profile = audit_artifacts.get("schema_profile", {})

    lola_metrics: dict[str, Any] = {}

    if "coverage_at_k" in coverage:
        lola_metrics["coverage_at_k"] = coverage["coverage_at_k"]
    if "gini" in concentration:
        lola_metrics["gini_coefficient"] = concentration["gini"]
    if "entropy" in metrics_raw:
        lola_metrics["entropy"] = metrics_raw["entropy"]
    if "sparsity" in metrics_raw:
        lola_metrics["sparsity"] = metrics_raw["sparsity"]
    if "long_tail_coverage" in metrics_raw:
        lola_metrics["long_tail_coverage"] = metrics_raw["long_tail_coverage"]

    for key in [
        "ndcg",
        "precision_at_k",
        "recall_at_k",
        "hit_rate",
        "diversity",
        "novelty",
        "personalization",
    ]:
        if key in metrics_raw:
            lola_metrics[key] = metrics_raw[key]

    return {
        "schemaVersion": LOLA_SCHEMA_VERSION,
        "exportType": "dataset_metrics",
        "generatedAt": datetime.now(UTC).isoformat(),
        "sourceSystem": "AffectLog Trustworthy AI Assessment v1.0",
        "auditRunId": audit_artifacts.get("run_id", ""),
        "datasetId": audit_artifacts.get("dataset_id", ""),
        "scenarioId": lola_scenario_id,
        "metrics": lola_metrics,
        "datasetProfile": {
            "rowCount": schema_profile.get("row_count", 0),
            "entityCount": schema_profile.get("entity_count", 0),
            "resourceCount": schema_profile.get("resource_count", 0),
            "temporalSpanDays": audit_artifacts.get("temporal_span_days", 0),
        },
        "lolaAnnotations": {},
    }


def parse_lola_results(results: dict[str, Any]) -> dict[str, Any]:
    """
    Parse LOLA scenario evaluation results for cross-referencing.

    Returns normalised dict of LOLA algorithm evaluation metrics.
    """
    return {
        "source": "lola",
        "scenarioId": results.get("scenarioId", ""),
        "algorithmId": results.get("algorithmId", ""),
        "metrics": {
            k: v for k, v in results.get("metrics", {}).items() if k in SHARED_METRICS_VOCABULARY
        },
        "rawResults": results,
    }
