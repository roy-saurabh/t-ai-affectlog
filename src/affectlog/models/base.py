"""Base model adapter interface."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

import numpy as np


class BaseModelAdapter(ABC):
    """Standardized interface for all model types."""

    @abstractmethod
    def predict(self, X: np.ndarray | list[Any]) -> list[Any]:
        """Return predictions for input X."""
        ...

    def predict_proba(self, X: np.ndarray | list[Any]) -> list[list[float]]:
        """Return probability estimates. Override if supported."""
        raise NotImplementedError("predict_proba not supported for this adapter.")

    @abstractmethod
    def metadata(self) -> dict[str, Any]:
        """Return model metadata for model card generation."""
        ...

    @property
    def input_schema(self) -> dict[str, Any]:
        """Return expected input schema (feature names, dtypes). Override if available."""
        return {}

    @property
    def feature_names(self) -> list[str]:
        return []

    def is_classifier(self) -> bool:
        return False

    def is_regressor(self) -> bool:
        return False
