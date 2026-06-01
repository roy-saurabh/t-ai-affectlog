"""Shannon entropy for categorical distributions."""

from __future__ import annotations

import math
from collections import Counter
from typing import Any, Sequence


def shannon_entropy(counts: Sequence[int]) -> float:
    total = sum(counts)
    if total == 0:
        return 0.0
    return -sum((c / total) * math.log2(c / total) for c in counts if c > 0)


def entropy_from_counter(counter: Counter[Any]) -> dict[str, float]:
    counts = list(counter.values())
    h = shannon_entropy(counts)
    max_h = math.log2(len(counts)) if len(counts) > 1 else 0.0
    return {
        "entropy_bits": round(h, 4),
        "max_entropy_bits": round(max_h, 4),
        "normalized_entropy": round(h / max_h, 4) if max_h > 0 else 0.0,
    }
