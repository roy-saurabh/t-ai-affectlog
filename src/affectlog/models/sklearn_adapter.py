"""scikit-learn model adapter."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import numpy as np

from affectlog.exceptions import ModelAdapterError
from affectlog.models.base import BaseModelAdapter

logger = logging.getLogger(__name__)


class SklearnAdapter(BaseModelAdapter):
    def __init__(self, model: Any, feature_names: list[str] | None = None) -> None:
        self._model = model
        self._feature_names = feature_names or getattr(model, "feature_names_in_", [])
        if hasattr(self._feature_names, "tolist"):
            self._feature_names = list(self._feature_names.tolist())

    @classmethod
    def from_file(cls, path: Path | str, feature_names: list[str] | None = None) -> "SklearnAdapter":
        try:
            import joblib
            model = joblib.load(path)
        except Exception:
            try:
                import pickle
                with open(path, "rb") as f:
                    model = pickle.load(f)
            except Exception as exc:
                raise ModelAdapterError(f"Cannot load sklearn model from {path}: {exc}") from exc
        return cls(model, feature_names)

    def predict(self, X: np.ndarray | list[Any]) -> list[Any]:
        arr = np.array(X)
        return list(self._model.predict(arr))

    def predict_proba(self, X: np.ndarray | list[Any]) -> list[list[float]]:
        if not hasattr(self._model, "predict_proba"):
            raise NotImplementedError
        arr = np.array(X)
        return self._model.predict_proba(arr).tolist()

    def metadata(self) -> dict[str, Any]:
        m = self._model
        return {
            "adapter": "sklearn",
            "class": type(m).__name__,
            "module": type(m).__module__,
            "params": m.get_params() if hasattr(m, "get_params") else {},
            "feature_names": list(self._feature_names),
        }

    @property
    def feature_names(self) -> list[str]:  # type: ignore[override]
        return list(self._feature_names)

    def is_classifier(self) -> bool:
        from sklearn.base import is_classifier as skl_is_clf
        try:
            return bool(skl_is_clf(self._model))
        except Exception:
            return False

    def is_regressor(self) -> bool:
        from sklearn.base import is_regressor as skl_is_reg
        try:
            return bool(skl_is_reg(self._model))
        except Exception:
            return False
