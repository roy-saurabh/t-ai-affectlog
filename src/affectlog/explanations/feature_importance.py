"""Feature importance via permutation importance."""

from __future__ import annotations

from typing import Any

import numpy as np


def permutation_importance(
    adapter: Any,
    X: np.ndarray,
    y: np.ndarray,
    metric: str = "accuracy",
    n_repeats: int = 5,
    seed: int = 42,
) -> dict[str, Any]:
    """
    Compute permutation feature importance.

    Baseline metric is evaluated, then each feature column is permuted
    *n_repeats* times and the metric drop is recorded.
    """
    rng = np.random.default_rng(seed)
    feature_names = adapter.feature_names or [f"f{i}" for i in range(X.shape[1])]

    def score(preds: list[Any], labels: np.ndarray) -> float:
        if metric == "accuracy":
            return float(np.mean(np.array(preds) == labels))
        return 0.0

    baseline_preds = adapter.predict(X)
    baseline_score = score(baseline_preds, y)

    importances: dict[str, list[float]] = {}
    for col_idx in range(X.shape[1]):
        drops = []
        for _ in range(n_repeats):
            X_perm = X.copy()
            X_perm[:, col_idx] = rng.permutation(X_perm[:, col_idx])
            perm_preds = adapter.predict(X_perm)
            perm_score = score(perm_preds, y)
            drops.append(baseline_score - perm_score)
        fname = feature_names[col_idx] if col_idx < len(feature_names) else f"f{col_idx}"
        importances[fname] = drops

    mean_importance = {f: float(np.mean(v)) for f, v in importances.items()}
    std_importance = {f: float(np.std(v)) for f, v in importances.items()}
    sorted_names = sorted(mean_importance, key=lambda k: mean_importance[k], reverse=True)

    return {
        "baseline_score": round(baseline_score, 4),
        "metric": metric,
        "n_repeats": n_repeats,
        "feature_importance": [
            {"feature": f, "importance_mean": round(mean_importance[f], 6), "importance_std": round(std_importance[f], 6)}
            for f in sorted_names
        ],
    }
