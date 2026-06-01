"""Data Card generation following Gebru et al. 2018."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional

from affectlog.core.time import now_iso


def build_data_card(
    dataset_name: str,
    schema_fields: list[str],
    row_count: int,
    privacy_report: Optional[dict[str, Any]] = None,
    descriptive_stats: Optional[dict[str, Any]] = None,
    recipe_name: str = "unknown",
    run_id: str = "unknown",
) -> dict[str, Any]:
    return {
        "data_card_version": "1.0",
        "generated_at": now_iso(),
        "run_id": run_id,
        "dataset": {
            "name": dataset_name,
            "schema": "maskott_csv_v1",
            "source_platform": "Maskott/Tactileo",
            "row_count": row_count,
            "columns": schema_fields,
            "recipe_applied": recipe_name,
        },
        "collection": {
            "method": "Platform event log export",
            "time_period": (
                descriptive_stats.get("min_timestamp", "unknown")
                + " to "
                + descriptive_stats.get("max_timestamp", "unknown")
            ) if descriptive_stats else "unknown",
            "annotation": "xAPI-normalized educational interaction traces",
        },
        "provenance": {
            "original_source": "Maskott/Tactileo teacher recommendation platform",
            "transformation": "Pseudonymised and normalized by AffectLog ALT-AI",
            "license": "Restricted to EDGE-Skills consortium use",
        },
        "privacy": {
            "contains_pii": True,
            "pseudonymised": True,
            "allow_raw_identifiers": privacy_report.get("allow_raw_identifiers", False) if privacy_report else False,
            "pseudonymisation_method": "HMAC-SHA256",
            "fields_pseudonymised": privacy_report.get("fields_pseudonymised", []) if privacy_report else [],
            "residual_risk": privacy_report.get("risk_summary", {}).get("level", "unknown") if privacy_report else "unknown",
        },
        "known_biases": [
            "Long-tail resource distribution — a few resources dominate activity.",
            "Entity concentration — a few users account for a disproportionate share of events.",
            "Representational bias possible for minority institutions (EntityUaiCode).",
            "Teacher-student role not distinguished in IsViewerAuthor flag alone.",
        ],
        "intended_uses": [
            "Trustworthy AI assessment of recommendation systems",
            "xAPI normalization and audit",
            "Fairness and concentration analysis",
        ],
        "out_of_scope_uses": [
            "Direct identification of individuals",
            "Any processing beyond GDPR lawful basis",
        ],
        "statistics": descriptive_stats or {},
    }


def export_data_card(card: dict[str, Any], output_path: Path | str) -> None:
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(card, indent=2, ensure_ascii=False))
