"""
Fairness and representation metrics.

Note: requires non-sensitive grouping metadata (e.g., role: teacher/student).
When no sensitive attributes are available, computes representation index
based on activity strata only.
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Optional


def compute_fairness(
    path: Path | str,
    group_field: str = "viewContext",
    limit: int = 0,
) -> dict[str, Any]:
    """
    Compute event distribution across groups identified by *group_field* in event context.
    Returns representation index and balance ratio.
    """
    path = Path(path)
    group_counter: Counter[str] = Counter()
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

            cats = evt.get("context", {}).get("contextActivities", {}).get("category", [])
            for cat in cats:
                gid = str(cat.get("id", "unknown"))
                group_counter[gid] += 1

    if not group_counter:
        return {"total_events": total, "note": "No group field found in events."}

    counts = list(group_counter.values())
    max_c = max(counts)
    min_c = min(counts)
    mean_c = sum(counts) / len(counts)

    representation_index = {
        g: round(c / mean_c, 4) for g, c in group_counter.items()
    }

    underrepresented = [g for g, ri in representation_index.items() if ri < 0.5]
    overrepresented = [g for g, ri in representation_index.items() if ri > 2.0]

    return {
        "total_events": total,
        "group_field": group_field,
        "groups": dict(group_counter),
        "representation_index": representation_index,
        "balance_ratio": round(min_c / max_c, 4) if max_c > 0 else 0,
        "underrepresented_groups": underrepresented,
        "overrepresented_groups": overrepresented,
        "note": (
            "Groups derived from ViewContext (activity category). "
            "Sensitive attribute fairness requires additional approved metadata."
        ),
    }


def compute_representation(groups: dict[str, int]) -> dict[str, Any]:
    """Compute representation index from a pre-computed group count dict."""
    if not groups:
        return {}
    counts = list(groups.values())
    mean_c = sum(counts) / len(counts)
    return {g: round(c / mean_c, 4) for g, c in groups.items()}
