"""Schema validators for known dataset formats."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from affectlog.ingest.large_file import MASKOTT_REQUIRED_COLUMNS, validate_csv_headers


KNOWN_SCHEMAS: dict[str, list[str]] = {
    "maskott_csv_v1": MASKOTT_REQUIRED_COLUMNS,
}


def validate_schema(path: Path | str, schema_name: str) -> dict[str, Any]:
    """Validate a file against a named schema. Returns report dict."""
    if schema_name not in KNOWN_SCHEMAS:
        return {"valid": False, "error": f"Unknown schema '{schema_name}'. Known: {list(KNOWN_SCHEMAS)}"}
    required = KNOWN_SCHEMAS[schema_name]
    suffix = Path(path).suffix.lower()
    if suffix == ".csv":
        return validate_csv_headers(path, required)
    return {"valid": False, "error": f"Schema validation for {suffix} not yet implemented."}
