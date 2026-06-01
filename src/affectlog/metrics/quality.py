"""Data quality metrics: completeness, missingness."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def compute_quality(path: Path | str, fields: list[str] | None = None, limit: int = 0) -> dict[str, Any]:
    """Compute missingness/completeness per field."""
    path = Path(path)
    from collections import defaultdict
    field_null: dict[str, int] = defaultdict(int)
    field_total: dict[str, int] = defaultdict(int)
    total = 0

    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                evt = json.loads(line)
            except json.JSONDecodeError:
                continue
            total += 1
            if limit and total > limit:
                break

            check_fields = fields or list(evt.keys())
            for fld in check_fields:
                field_total[fld] += 1
                val = evt.get(fld)
                if val is None or val == "" or val == []:
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
        sum(v["completeness"] for v in per_field.values()) / len(per_field)
        if per_field else 0
    )

    return {
        "total_events": total,
        "per_field": per_field,
        "overall_completeness": round(overall_completeness, 4),
    }
