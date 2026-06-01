"""
PII detection: identifies personal identifiers and quasi-identifiers in field names and values.
"""

from __future__ import annotations

import re
from typing import Any

# Field-name patterns that are likely PII
# Note: use case-insensitive search without strict \b to match compound field names like user_email, EntityUaiCode
PII_FIELD_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"(email|e[-_]mail)", re.I),
    re.compile(r"(^name$|fullname|firstname|lastname|surname)", re.I),
    re.compile(r"(phone|mobile|^tel$)", re.I),
    re.compile(r"(address|postcode|zipcode|^city$|^country$)", re.I),
    re.compile(r"(ip[-_]?address|ipv4|ipv6)", re.I),
    re.compile(r"(user[-_]?id|userid|entity[-_]?id|learner[-_]?id|student[-_]?id)", re.I),
    re.compile(r"(session[-_]?id|activity[-_]?session)", re.I),
    re.compile(r"(uai[-_]?code|institution[-_]?code|school[-_]?code)", re.I),
    re.compile(r"(^token$|^secret$|password|passwd|credential)", re.I),
    re.compile(r"\b(dob|birth.?date|age)\b", re.I),
]

# Value-level patterns for residual PII scanning
PII_VALUE_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("email", re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")),
    ("ip_address", re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")),
    ("url_with_id", re.compile(r"https?://[^\s]+/(?:user|entity|student|learner)/[^\s/]+")),
]


def is_pii_field(field_name: str) -> bool:
    return any(p.search(field_name) for p in PII_FIELD_PATTERNS)


def scan_field_names(fields: list[str]) -> list[dict[str, Any]]:
    """Return list of findings for field names that appear to be PII."""
    findings = []
    for f in fields:
        if is_pii_field(f):
            findings.append({"field": f, "type": "direct_identifier", "source": "field_name"})
    return findings


def scan_sample_values(record: dict[str, Any]) -> list[dict[str, Any]]:
    """Scan a sample record's string values for PII patterns."""
    findings = []
    for field, value in record.items():
        if not isinstance(value, str):
            continue
        for pii_type, pattern in PII_VALUE_PATTERNS:
            if pattern.search(value):
                findings.append({
                    "field": field,
                    "type": pii_type,
                    "source": "value_pattern",
                    "sample_value": value[:20] + "…" if len(value) > 20 else value,
                })
    return findings


# Known quasi-identifiers in Maskott schema
MASKOTT_QUASI_IDENTIFIERS: list[str] = [
    "EntityUaiCode",
    "ActivitySessionId",
    "AccessDate",  # timestamp can be quasi-ID
    "CollectionId",
]

MASKOTT_DIRECT_IDENTIFIERS: list[str] = [
    "_id",
    "EntityId",
    "ActivitySessionId",
]
