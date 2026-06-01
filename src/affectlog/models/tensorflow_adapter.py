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
    def from_file(cls, path: Path | str, *, trusted_dir: Path | None = None) -> TensorFlowAdapter:
        if trusted_dir is None:
            raise ModelAdapterError(
                "trusted_dir is required; pass the directory that contains trusted model files."
            )
        from affectlog.core.paths import resolve_safe_path

        try:
            resolved = resolve_safe_path(Path(trusted_dir), path)
        except ValueError as exc:
            raise ModelAdapterError(str(exc)) from exc
        try:
            import tensorflow as tf

            model = tf.keras.models.load_model(str(resolved))
            return cls(model)
        except ImportError as exc:
            raise ModelAdapterError("tensorflow not installed.") from exc
        except Exception as exc:
            raise ModelAdapterError(f"Cannot load TensorFlow model: {exc}") from exc

    def predict(self, X: np.ndarray | list[Any]) -> list[Any]:
        try:
            arr = np.array(X, dtype=np.float32)
            return self._model.predict(arr).tolist()  # type: ignore[no-any-return]
        except Exception as exc:
            raise ModelAdapterError(f"TF prediction failed: {exc}") from exc

    def metadata(self) -> dict[str, Any]:
        return {"adapter": "tensorflow"}
