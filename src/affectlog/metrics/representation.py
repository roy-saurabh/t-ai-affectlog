"""Representation index for strata/groups."""

from __future__ import annotations

from typing import Any


def representation_index(group_counts: dict[str, int]) -> dict[str, float]:
    """RI = count_group / mean_count. RI > 1 = overrepresented, < 1 = underrepresented."""
    if not group_counts:
        return {}
    mean = sum(group_counts.values()) / len(group_counts)
    if mean == 0:
        return {g: 0.0 for g in group_counts}
    return {g: round(c / mean, 4) for g, c in group_counts.items()}
