"""
ExplanationGenerator: unified interface for local/global explanations.

Supports SHAP (if installed) and permutation importance fallback.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import numpy as np

from affectlog.explanations.feature_importance import permutation_importance
from affectlog.models.base import BaseModelAdapter

logger = logging.getLogger(__name__)


class ExplanationGenerator:
    def __init__(self, adapter: BaseModelAdapter) -> None:
        self._adapter = adapter

    def generate_feature_importance(
        self,
        X: np.ndarray,
        y: Optional[np.ndarray] = None,
        method: str = "auto",
        n_repeats: int = 5,
    ) -> dict[str, Any]:
        """
        Generate global feature importance.

        method='auto': tries SHAP first, falls back to permutation.
        """
        if method in ("shap", "auto"):
            try:
                return self._shap_importance(X)
            except (ImportError, Exception) as exc:
                logger.info("SHAP not available (%s); falling back to permutation.", exc)

        if y is None:
            raise ValueError("y (labels) required for permutation importance.")
        return permutation_importance(self._adapter, X, y, n_repeats=n_repeats)

    def generate_explanations(
        self,
        X: np.ndarray,
        mode: str = "global",
    ) -> dict[str, Any]:
        """Generate local or global explanations."""
        preds = self._adapter.predict(X)
        fi = self.generate_feature_importance(X, method="auto")
        return {
            "mode": mode,
            "predictions": preds[:5],  # sample only
            "feature_importance": fi,
            "model_metadata": self._adapter.metadata(),
        }

    def compare_models(
        self,
        other: BaseModelAdapter,
        X: np.ndarray,
        y: np.ndarray,
        k: int = 5,
    ) -> dict[str, Any]:
        """Compare this model vs *other* on dataset X, y."""
        from sklearn.model_selection import cross_val_score  # type: ignore[import]
        import warnings

        def cv_scores(adapter: BaseModelAdapter) -> dict[str, Any]:
            preds = adapter.predict(X)
            acc = float(np.mean(np.array(preds) == y))
            return {"mean_accuracy": round(acc, 4)}

        m1_scores = cv_scores(self._adapter)
        m2_scores = cv_scores(other)
        return {
            "model_1": {**self._adapter.metadata(), **m1_scores},
            "model_2": {**other.metadata(), **m2_scores},
        }

    def _shap_importance(self, X: np.ndarray) -> dict[str, Any]:
        import shap  # type: ignore[import]
        explainer = shap.Explainer(self._adapter.predict, X[:100])
        shap_values = explainer(X[:100])
        mean_abs = np.abs(shap_values.values).mean(axis=0)
        feature_names = self._adapter.feature_names or [f"f{i}" for i in range(X.shape[1])]
        sorted_idx = np.argsort(mean_abs)[::-1]
        return {
            "method": "shap",
            "feature_importance": [
                {"feature": feature_names[i] if i < len(feature_names) else f"f{i}",
                 "importance_mean": round(float(mean_abs[i]), 6)}
                for i in sorted_idx
            ],
        }
