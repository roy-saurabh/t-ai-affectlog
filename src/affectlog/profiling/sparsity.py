"""Sparsity: estimate entity-resource interaction matrix sparsity from streaming data."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def compute_sparsity(path: Path | str, limit: int = 0) -> dict[str, Any]:
    """
    Estimate sparsity ratio = 1 - (observed interactions / possible interactions).

    For very large datasets, uses sets of unique entities and resources
    plus the observed interaction count.
    """
    path = Path(path)
    actors: set[str] = set()
    resources: set[str] = set()
    interactions: set[tuple[str, str]] = set()
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

            actor = evt.get("actor", {}).get("account", {}).get("name", "")
            resource = evt.get("object", {}).get("id", "")

            if actor:
                actors.add(actor)
            if resource:
                resources.add(resource)
            if actor and resource:
                interactions.add((actor, resource))

    n_a = len(actors)
    n_r = len(resources)
    possible = n_a * n_r
    observed = len(interactions)
    sparsity = 1.0 - (observed / possible) if possible > 0 else 0.0

    return {
        "total_events": total,
        "unique_actors": n_a,
        "unique_resources": n_r,
        "possible_interactions": possible,
        "observed_unique_interactions": observed,
        "sparsity_ratio": round(sparsity, 6),
        "density": round(1 - sparsity, 6),
        "interpretation": (
            "Very sparse — typical of real-world recommendation datasets"
            if sparsity > 0.95
            else "Moderately sparse" if sparsity > 0.7 else "Dense"
        ),
    }
