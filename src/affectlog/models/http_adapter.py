"""HTTP model adapter for external prediction endpoints."""

from __future__ import annotations

from typing import Any

import numpy as np

from affectlog.exceptions import ModelAdapterError
from affectlog.models.base import BaseModelAdapter


class HttpAdapter(BaseModelAdapter):
    """Calls a remote prediction endpoint over HTTP."""

    def __init__(self, url: str, headers: dict[str, str] | None = None) -> None:
        self._url = url
        self._headers = headers or {"Content-Type": "application/json"}

    def predict(self, X: np.ndarray | list[Any]) -> list[Any]:
        try:
            import httpx
            payload = {"instances": (X.tolist() if hasattr(X, "tolist") else X)}
            resp = httpx.post(self._url, json=payload, headers=self._headers, timeout=30)
            resp.raise_for_status()
            return resp.json().get("predictions", [])
        except Exception as exc:
            raise ModelAdapterError(f"HTTP prediction failed: {exc}") from exc

    def metadata(self) -> dict[str, Any]:
        return {"adapter": "http", "url": self._url}
