"""PyTorch model adapter."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np

from affectlog.exceptions import ModelAdapterError
from affectlog.models.base import BaseModelAdapter


class TorchAdapter(BaseModelAdapter):
    def __init__(self, model: Any) -> None:
        self._model = model

    @classmethod
    def from_file(cls, path: Path | str) -> "TorchAdapter":
        try:
            import torch
            model = torch.jit.load(str(path))
            model.eval()
            return cls(model)
        except ImportError as exc:
            raise ModelAdapterError("torch not installed.") from exc
        except Exception as exc:
            raise ModelAdapterError(f"Cannot load PyTorch model: {exc}") from exc

    def predict(self, X: np.ndarray | list[Any]) -> list[Any]:
        try:
            import torch
            t = torch.tensor(np.array(X, dtype=np.float32))
            with torch.no_grad():
                out = self._model(t)
            return out.numpy().tolist()
        except Exception as exc:
            raise ModelAdapterError(f"Torch prediction failed: {exc}") from exc

    def metadata(self) -> dict[str, Any]:
        return {"adapter": "torch"}
