"""
Recommender-system metrics (optional): nDCG, Precision@K, Recall@K, HitRate@K.
Only computed when prediction data and ground-truth expected data are available.
"""

from __future__ import annotations

import math
from typing import Any, Sequence


def precision_at_k(recommended: Sequence[str], relevant: Sequence[str], k: int) -> float:
    rec_k = list(recommended)[:k]
    hits = sum(1 for r in rec_k if r in relevant)
    return hits / k if k > 0 else 0.0


def recall_at_k(recommended: Sequence[str], relevant: Sequence[str], k: int) -> float:
    rec_k = list(recommended)[:k]
    hits = sum(1 for r in rec_k if r in relevant)
    return hits / len(relevant) if relevant else 0.0


def hit_rate_at_k(recommended: Sequence[str], relevant: Sequence[str], k: int) -> float:
    rec_k = list(recommended)[:k]
    return 1.0 if any(r in relevant for r in rec_k) else 0.0


def dcg_at_k(recommended: Sequence[str], relevant: Sequence[str], k: int) -> float:
    rec_k = list(recommended)[:k]
    return sum(
        1.0 / math.log2(i + 2)
        for i, r in enumerate(rec_k)
        if r in relevant
    )


def ndcg_at_k(recommended: Sequence[str], relevant: Sequence[str], k: int) -> float:
    ideal = sorted(relevant, reverse=True)[:k]
    ideal_dcg = dcg_at_k(ideal, relevant, k)
    if ideal_dcg == 0:
        return 0.0
    return dcg_at_k(recommended, relevant, k) / ideal_dcg


def compute_recommender_metrics(
    pairs: list[dict[str, Any]],
    k_values: list[int] | None = None,
) -> dict[str, Any]:
    """
    Compute P@K, R@K, HR@K, nDCG@K averaged over *pairs*.

    Each pair: {"recommended": [...], "relevant": [...]}
    """
    if k_values is None:
        k_values = [10, 20, 50]
    results: dict[str, Any] = {}
    for k in k_values:
        prec = [precision_at_k(p["recommended"], p["relevant"], k) for p in pairs]
        rec = [recall_at_k(p["recommended"], p["relevant"], k) for p in pairs]
        hr = [hit_rate_at_k(p["recommended"], p["relevant"], k) for p in pairs]
        nd = [ndcg_at_k(p["recommended"], p["relevant"], k) for p in pairs]
        n = len(pairs)
        results[f"k={k}"] = {
            f"precision@{k}": round(sum(prec) / n, 4) if n else 0,
            f"recall@{k}": round(sum(rec) / n, 4) if n else 0,
            f"hit_rate@{k}": round(sum(hr) / n, 4) if n else 0,
            f"ndcg@{k}": round(sum(nd) / n, 4) if n else 0,
        }
    return results
