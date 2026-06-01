"""Simple temporal drift detection between two time windows."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any

from affectlog.core.time import parse_iso


def compute_drift(
    path: Path | str,
    split_date: str,  # ISO 8601 date string to split before/after
    limit: int = 0,
) -> dict[str, Any]:
    """Compare resource distribution before and after *split_date*."""
    path = Path(path)
    from datetime import timezone
    split_dt = parse_iso(split_date)
    if split_dt is None:
        raise ValueError(f"Cannot parse split_date: {split_date}")

    before: Counter[str] = Counter()
    after: Counter[str] = Counter()
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

            ts = parse_iso(str(evt.get("timestamp", "")))
            rid = str(evt.get("object", {}).get("id", ""))
            if ts:
                if ts < split_dt:
                    before[rid] += 1
                else:
                    after[rid] += 1

    total_before = sum(before.values())
    total_after = sum(after.values())

    # Compute Jensen–Shannon-like overlap
    all_keys = set(before) | set(after)
    overlap = sum(min(before.get(k, 0) / max(total_before, 1), after.get(k, 0) / max(total_after, 1)) for k in all_keys)

    return {
        "split_date": split_date,
        "events_before": total_before,
        "events_after": total_after,
        "unique_resources_before": len(before),
        "unique_resources_after": len(after),
        "resources_in_both": len(set(before) & set(after)),
        "distribution_overlap_estimate": round(overlap, 4),
        "drift_detected": overlap < 0.5,
    }
