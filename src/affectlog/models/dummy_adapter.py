"""Dummy model adapter for tests and demos."""

from __future__ import annotations

from typing import Any

import numpy as np

from affectlog.models.base import BaseModelAdapter


class DummyAdapter(BaseModelAdapter):
    """Returns zeros; useful for integration tests without a real model."""

    def __init__(self, n_classes: int = 2, feature_names: list[str] | None = None) -> None:
        self._n_classes = n_classes
        self._feature_names = feature_names or ["f0", "f1", "f2"]

    def predict(self, X: np.ndarray | list[Any]) -> list[Any]:
        arr = np.array(X)
        return [0] * len(arr)

    def predict_proba(self, X: np.ndarray | list[Any]) -> list[list[float]]:
        arr = np.array(X)
        prob = 1.0 / self._n_classes
        return [[prob] * self._n_classes for _ in range(len(arr))]

    def metadata(self) -> dict[str, Any]:
        return {
            "adapter": "dummy",
            "n_classes": self._n_classes,
            "feature_names": self._feature_names,
        }

    @property
    def feature_names(self) -> list[str]:  # type: ignore[override]
        return self._feature_names

    def is_classifier(self) -> bool:
        return True
