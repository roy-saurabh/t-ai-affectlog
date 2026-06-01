"""Model comparison utilities."""

from __future__ import annotations

from typing import Any

import numpy as np

from affectlog.models.base import BaseModelAdapter


def compare_models(
    models: list[BaseModelAdapter],
    X: np.ndarray,
    y: np.ndarray,
) -> list[dict[str, Any]]:
    results = []
    for adapter in models:
        preds = adapter.predict(X)
        acc = float(np.mean(np.array(preds) == y))
        results.append({
            **adapter.metadata(),
            "accuracy": round(acc, 4),
        })
    return sorted(results, key=lambda r: r.get("accuracy", 0), reverse=True)
