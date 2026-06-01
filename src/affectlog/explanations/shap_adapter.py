"""SHAP wrapper (optional dependency)."""

from __future__ import annotations

from typing import Any

import numpy as np


def shap_explain(predict_fn: Any, X: np.ndarray, max_samples: int = 100) -> dict[str, Any]:
    try:
        import shap  # type: ignore[import]
        X_sample = X[:max_samples]
        explainer = shap.Explainer(predict_fn, X_sample)
        values = explainer(X_sample)
        mean_abs = np.abs(values.values).mean(axis=0)
        return {
            "method": "shap",
            "mean_abs_shap": mean_abs.tolist(),
        }
    except ImportError:
        return {"method": "shap", "error": "shap not installed"}
