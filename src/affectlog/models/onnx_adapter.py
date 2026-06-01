"""ONNX model adapter via onnxruntime."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np

from affectlog.exceptions import ModelAdapterError
from affectlog.models.base import BaseModelAdapter


class OnnxAdapter(BaseModelAdapter):
    def __init__(self, session: Any, input_name: str | None = None) -> None:
        self._session = session
        self._input_name = input_name or session.get_inputs()[0].name

    @classmethod
    def from_file(cls, path: Path | str, *, trusted_dir: Path | None = None) -> OnnxAdapter:
        if trusted_dir is None:
            raise ModelAdapterError(
                "trusted_dir is required; pass the directory that contains trusted model files."
            )
        resolved = Path(path).resolve()
        if not resolved.is_relative_to(trusted_dir.resolve()):
            raise ModelAdapterError(
                f"Model path '{resolved}' is outside the trusted directory '{trusted_dir}'"
            )
        try:
            import onnxruntime as ort

            sess = ort.InferenceSession(str(resolved))
            return cls(sess)
        except ImportError as exc:
            raise ModelAdapterError(
                "onnxruntime not installed. Install with: pip install onnxruntime"
            ) from exc
        except Exception as exc:
            raise ModelAdapterError(f"Cannot load ONNX model from {resolved}: {exc}") from exc

    def predict(self, X: np.ndarray | list[Any]) -> list[Any]:
        arr = np.array(X, dtype=np.float32)
        result = self._session.run(None, {self._input_name: arr})
        return result[0].tolist()  # type: ignore[no-any-return]

    def metadata(self) -> dict[str, Any]:
        inputs = self._session.get_inputs()
        return {
            "adapter": "onnx",
            "inputs": [{"name": i.name, "shape": i.shape, "type": i.type} for i in inputs],
        }
