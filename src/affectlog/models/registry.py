"""In-memory model registry."""

from __future__ import annotations

from typing import Any

from affectlog.models.base import BaseModelAdapter


class ModelRegistry:
    def __init__(self) -> None:
        self._models: dict[str, BaseModelAdapter] = {}
        self._meta: dict[str, dict[str, Any]] = {}

    def register(self, model_id: str, adapter: BaseModelAdapter) -> None:
        self._models[model_id] = adapter
        self._meta[model_id] = adapter.metadata()

    def get(self, model_id: str) -> BaseModelAdapter:
        if model_id not in self._models:
            from affectlog.exceptions import ModelAdapterError
            raise ModelAdapterError(f"Model '{model_id}' not found in registry.")
        return self._models[model_id]

    def list_models(self) -> list[dict[str, Any]]:
        return [{"model_id": mid, **meta} for mid, meta in self._meta.items()]


# Global registry instance
_registry = ModelRegistry()


def get_registry() -> ModelRegistry:
    return _registry
