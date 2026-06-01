"""Compute a simple residual privacy risk score."""

from __future__ import annotations

from typing import Any


def compute_risk_score(
    field_findings: list[dict[str, Any]],
    value_findings: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Compute a 0–10 risk score based on detected PII types.
    Higher score = more re-identification risk.
    """
    score = 0
    direct = [f for f in field_findings if f.get("type") == "direct_identifier"]
    quasi = [f for f in field_findings if f.get("type") == "quasi_identifier"]

    score += len(direct) * 2
    score += len(quasi) * 1
    score += len(value_findings) * 1.5

    score = min(score, 10)

    if score <= 2:
        level = "low"
    elif score <= 5:
        level = "medium"
    elif score <= 7:
        level = "high"
    else:
        level = "critical"

    return {
        "score": round(score, 1),
        "level": level,
        "direct_identifier_count": len(direct),
        "quasi_identifier_count": len(quasi),
        "value_level_finding_count": len(value_findings),
        "utility_impact": "low" if score <= 5 else "medium",
        "recommended_action": (
            "Apply HMAC pseudonymisation and k-anonymity check before sharing."
            if score > 5
            else "Standard pseudonymisation sufficient."
        ),
    }
