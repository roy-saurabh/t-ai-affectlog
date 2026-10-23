"""Data quality metrics: completeness, missingness."""

from __future__ import annotations

from collections import defaultdict
from pathlib import Path
from typing import Any

from affectlog.ingest.json_reader import iter_jsonl_records


def _is_missing(value: Any) -> bool:
    return value is None or value == "" or value == []


def compute_quality(
    path: Path | str, fields: list[str] | None = None, limit: int = 0
) -> dict[str, Any]:
    """Compute missingness/completeness per field."""
    field_null: dict[str, int] = defaultdict(int)
    field_total: dict[str, int] = defaultdict(int)
    total = 0

    for evt in iter_jsonl_records(Path(path), limit):
        total += 1
        for fld in fields or list(evt.keys()):
            field_total[fld] += 1
            if _is_missing(evt.get(fld)):
                field_null[fld] += 1

    per_field = {}
    for fld in field_total:
        n = field_total[fld]
        null = field_null.get(fld, 0)
        per_field[fld] = {
            "completeness": round((n - null) / n, 4) if n else 0,
            "missingness": round(null / n, 4) if n else 0,
            "null_count": null,
            "total": n,
        }

    overall_completeness = (
        sum(v["completeness"] for v in per_field.values()) / len(per_field) if per_field else 0
    )

    return {
        "total_events": total,
        "per_field": per_field,
        "overall_completeness": round(overall_completeness, 4),
    }
