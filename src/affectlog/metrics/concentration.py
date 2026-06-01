"""
Gini index and event-contribution concentration metrics.

Gini = 0: perfectly equal distribution
Gini = 1: one entity produces all events
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any, Sequence


def gini_index(counts: Sequence[float]) -> float:
    """Compute Gini index from a sequence of counts (non-negative)."""
    values = sorted(counts)
    n = len(values)
    if n == 0:
        return 0.0
    total = sum(values)
    if total == 0:
        return 0.0
    cumsum = 0.0
    gini_sum = 0.0
    for i, v in enumerate(values, 1):
        cumsum += v
        gini_sum += (2 * i - n - 1) * v
    return gini_sum / (n * total)


def compute_concentration(path: Path | str, limit: int = 0) -> dict[str, Any]:
    """Compute Gini and dominance metrics from a JSONL file."""
    path = Path(path)
    actor_counter: Counter[str] = Counter()
    resource_counter: Counter[str] = Counter()
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
            actor = str(evt.get("actor", {}).get("account", {}).get("name", ""))
            resource = str(evt.get("object", {}).get("id", ""))
            if actor:
                actor_counter[actor] += 1
            if resource:
                resource_counter[resource] += 1

    actor_counts = list(actor_counter.values())
    resource_counts = list(resource_counter.values())

    actor_gini = gini_index(actor_counts)
    resource_gini = gini_index(resource_counts)

    def dominance_ratio(counter: Counter[str], top_pcts: list[float]) -> dict[str, float]:
        total_c = sum(counter.values())
        sorted_c = sorted(counter.values(), reverse=True)
        n = len(sorted_c)
        result: dict[str, float] = {}
        for pct in top_pcts:
            k = max(1, int(n * pct / 100))
            top_k_sum = sum(sorted_c[:k])
            result[f"top_{pct}pct_dominance"] = round(top_k_sum / total_c, 4) if total_c else 0
        return result

    return {
        "total_events": total,
        "actor_gini": round(actor_gini, 4),
        "resource_gini": round(resource_gini, 4),
        "actor_dominance": dominance_ratio(actor_counter, [1, 5, 10]),
        "resource_dominance": dominance_ratio(resource_counter, [1, 5, 10]),
        "unique_actors": len(actor_counter),
        "unique_resources": len(resource_counter),
        "interpretation": {
            "actor_gini": "High concentration — a few users generate most activity" if actor_gini > 0.6 else "Moderate/low concentration",
            "resource_gini": "High concentration — a few resources dominate access" if resource_gini > 0.6 else "Moderate/low concentration",
        },
    }
