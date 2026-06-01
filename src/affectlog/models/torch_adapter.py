"""PyTorch model adapter."""

from __future__ import annotations

import hashlib
import io
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
        expected_sha256: str | None = None,
    ) -> TorchAdapter:
        if trusted_dir is None:
            raise ModelAdapterError(
                "trusted_dir is required; pass the directory that contains trusted model files."
            )
        from affectlog.core.paths import resolve_safe_path

        try:
            resolved = resolve_safe_path(Path(trusted_dir), path)
        except ValueError as exc:
            raise ModelAdapterError(str(exc)) from exc
        model_bytes = resolved.read_bytes()
        actual_sha256 = hashlib.sha256(model_bytes).hexdigest()
        if expected_sha256 is not None and actual_sha256 != expected_sha256:
            raise ModelAdapterError(
                f"SHA-256 mismatch for '{resolved}': expected {expected_sha256}, got {actual_sha256}"
            )
        try:
            import torch

            model = torch.jit.load(io.BytesIO(model_bytes))
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
