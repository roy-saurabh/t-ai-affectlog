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
    def from_file(
        cls,
        path: Path | str,
        *,
        trusted_dir: Path | None = None,
    ) -> TorchAdapter:
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
            import torch

            model = torch.jit.load(str(resolved))
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
            return out.numpy().tolist()  # type: ignore[no-any-return]
        except Exception as exc:
            raise ModelAdapterError(f"Torch prediction failed: {exc}") from exc

    def metadata(self) -> dict[str, Any]:
        return {"adapter": "torch"}
