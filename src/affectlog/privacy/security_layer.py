"""
SecurityLayer: orchestrates PII detection + pseudonymisation + risk scoring.
Produces a privacy_report.json for audit outputs.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from affectlog.core.time import now_iso
from affectlog.privacy.pii_detector import (
    MASKOTT_DIRECT_IDENTIFIERS,
    MASKOTT_QUASI_IDENTIFIERS,
    scan_field_names,
    scan_sample_values,
)
from affectlog.privacy.pseudonymizer import Pseudonymizer
from affectlog.privacy.risk_scoring import compute_risk_score

logger = logging.getLogger(__name__)


class SecurityLayer:
    def __init__(
        self,
        pseudonymizer: Optional[Pseudonymizer] = None,
        allow_raw: bool = False,
    ) -> None:
        self._pseudo = pseudonymizer or Pseudonymizer()
        self._allow_raw = allow_raw

    def inspect_schema(self, fields: list[str]) -> dict[str, Any]:
        """Inspect field names and return PII findings."""
        findings = scan_field_names(fields)
        return {
            "fields_inspected": fields,
            "pii_findings": findings,
            "direct_identifiers": [f["field"] for f in findings if f["type"] == "direct_identifier"],
        }

    def inspect_sample(self, record: dict[str, Any]) -> list[dict[str, Any]]:
        return scan_sample_values(record)

    def apply(self, record: dict[str, Any]) -> dict[str, Any]:
        """Apply pseudonymisation to a record."""
        if self._allow_raw:
            return record
        return self._pseudo.process_dict(record)

    def generate_privacy_report(
        self,
        schema_fields: list[str],
        sample_record: Optional[dict[str, Any]] = None,
        hash_fields: Optional[list[str]] = None,
        suppress_fields: Optional[list[str]] = None,
    ) -> dict[str, Any]:
        schema_findings = scan_field_names(schema_fields)
        value_findings = scan_sample_values(sample_record) if sample_record else []
        risk = compute_risk_score(schema_findings, value_findings)

        return {
            "generated_at": now_iso(),
            "schema_fields_inspected": schema_fields,
            "pii_field_findings": schema_findings,
            "value_level_findings": value_findings,
            "fields_pseudonymised": hash_fields or [],
            "fields_suppressed": suppress_fields or [],
            "allow_raw_identifiers": self._allow_raw,
            "risk_summary": risk,
            "maskott_direct_identifiers": MASKOTT_DIRECT_IDENTIFIERS,
            "maskott_quasi_identifiers": MASKOTT_QUASI_IDENTIFIERS,
            "notes": [
                "Raw personal identifiers are never exported in default mode.",
                "SHA-256 / HMAC-SHA256 pseudonymisation applied to entity and session IDs.",
                "Residual re-identification risk remains for small cohorts — apply k-anonymity checks before sharing.",
            ],
        }
