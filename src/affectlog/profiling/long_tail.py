"""Long-tail analysis: identify head/tail distribution of entities and resources."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any


def compute_long_tail(path: Path | str, top_k: list[int] | None = None, limit: int = 0) -> dict[str, Any]:
    if top_k is None:
        top_k = [1, 5, 10, 20]
    path = Path(path)
    resource_counter: Counter[str] = Counter()
    actor_counter: Counter[str] = Counter()
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
            resource_counter[str(evt.get("object", {}).get("id", ""))] += 1
            actor_counter[str(evt.get("actor", {}).get("account", {}).get("name", ""))] += 1

    def _concentration(counter: Counter[str], ks: list[int]) -> dict[str, Any]:
        total_c = sum(counter.values())
        sorted_counts = sorted(counter.values(), reverse=True)
        result: dict[str, Any] = {
            "total": total_c,
            "unique": len(counter),
        }
        for k in ks:
            top_sum = sum(sorted_counts[:k])
            result[f"top_{k}_pct_of_events"] = round(top_sum / total_c * 100, 2) if total_c else 0
        return result

    return {
        "total_events": total,
        "resource_long_tail": _concentration(resource_counter, top_k),
        "actor_long_tail": _concentration(actor_counter, top_k),
    }
