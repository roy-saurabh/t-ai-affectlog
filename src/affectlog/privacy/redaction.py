"""Field redaction helpers."""

from __future__ import annotations

from typing import Any


def redact_field(record: dict[str, Any], field: str, placeholder: str = "[REDACTED]") -> dict[str, Any]:
    out = dict(record)
    if field in out:
        out[field] = placeholder
    return out


def redact_fields(record: dict[str, Any], fields: list[str], placeholder: str = "[REDACTED]") -> dict[str, Any]:
    out = dict(record)
    for f in fields:
        if f in out:
            out[f] = placeholder
    return out
