"""Schema profiling: dtypes, nullability, uniqueness, PII flags."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import polars as pl

from affectlog.ingest.large_file import scan_csv_lazy
from affectlog.privacy.pii_detector import is_pii_field


def profile_schema(path: Path | str, sample_rows: int = 10_000) -> dict[str, Any]:
    """Profile schema of a CSV or JSONL file from the first *sample_rows* rows."""
    path = Path(path)
    ext = path.suffix.lower()

    if ext == ".csv":
        lf = scan_csv_lazy(path)
        sample = lf.limit(sample_rows).collect()
    elif ext in (".jsonl", ".json"):
        import json as _json
        rows = []
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line and len(rows) < sample_rows:
                    try:
                        rows.append(_json.loads(line))
                    except Exception:
                        pass
        sample = pl.from_dicts(rows) if rows else pl.DataFrame()
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    fields = []
    for col in sample.columns:
        s = sample[col]
        null_count = s.null_count()
        total = len(s)
        n_unique = s.n_unique()
        fields.append({
            "name": col,
            "dtype": str(s.dtype),
            "null_count": null_count,
            "null_fraction": round(null_count / total, 4) if total else 0,
            "n_unique": n_unique,
            "uniqueness_ratio": round(n_unique / total, 4) if total else 0,
            "is_pii_field": is_pii_field(col),
        })

    return {
        "file": str(path),
        "row_count_sampled": len(sample),
        "column_count": len(sample.columns),
        "columns": fields,
    }
