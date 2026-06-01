"""TensorFlow/Keras model adapter."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np

from affectlog.exceptions import ModelAdapterError
from affectlog.models.base import BaseModelAdapter


class TensorFlowAdapter(BaseModelAdapter):
    def __init__(self, model: Any) -> None:
        self._model = model

    @classmethod
    def from_file(cls, path: Path | str) -> "TensorFlowAdapter":
        try:
            import tensorflow as tf  # type: ignore[import]
            model = tf.keras.models.load_model(str(path))
            return cls(model)
        except ImportError as exc:
            raise ModelAdapterError("tensorflow not installed.") from exc
        except Exception as exc:
            raise ModelAdapterError(f"Cannot load TensorFlow model: {exc}") from exc

    def predict(self, X: np.ndarray | list[Any]) -> list[Any]:
        try:
            arr = np.array(X, dtype=np.float32)
            return self._model.predict(arr).tolist()
        except Exception as exc:
            raise ModelAdapterError(f"TF prediction failed: {exc}") from exc

    def metadata(self) -> dict[str, Any]:
        return {"adapter": "tensorflow"}
