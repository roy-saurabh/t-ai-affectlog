"""
Coverage@K: fraction of resources accessed by at least K distinct actors.

Sparsity ratio computed here too for cross-reference.
"""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path
from typing import Any


def compute_coverage(path: Path | str, k_values: list[int] | None = None, limit: int = 0) -> dict[str, Any]:
    if k_values is None:
        k_values = [1, 5, 10, 20, 50]
    path = Path(path)

    # resource -> set of actors
    resource_actors: dict[str, set[str]] = defaultdict(set)
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
            if actor and resource:
                resource_actors[resource].add(actor)

    total_resources = len(resource_actors)
    result: dict[str, Any] = {
        "total_events": total,
        "unique_resources": total_resources,
        "coverage_at_k": {},
    }

    for k in k_values:
        covered = sum(1 for actors in resource_actors.values() if len(actors) >= k)
        result["coverage_at_k"][f"k={k}"] = {
            "resources_covered": covered,
            "coverage_fraction": round(covered / total_resources, 4) if total_resources else 0,
        }

    return result
