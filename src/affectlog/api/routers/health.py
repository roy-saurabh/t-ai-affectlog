"""Health and readiness endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from affectlog.core.time import now_iso
from affectlog.schemas.api import HealthResponse
from affectlog.version import __version__

router = APIRouter(tags=["Health"])


@router.get("/healthz", response_model=HealthResponse, summary="Liveness check")
async def healthz() -> HealthResponse:
    return HealthResponse(status="ok", version=__version__, timestamp=now_iso())


@router.get("/readyz", response_model=HealthResponse, summary="Readiness check")
async def readyz() -> HealthResponse:
    return HealthResponse(status="ready", version=__version__, timestamp=now_iso())


@router.get("/", summary="API root")
async def root() -> dict[str, str]:
    return {"version": __version__, "status": "ok"}


@router.get("/metrics", summary="Prometheus-compatible metrics (stub)")
async def metrics() -> dict:  # type: ignore[type-arg]
    return {
        "info": "Prometheus metrics endpoint — integrate with prometheus-fastapi-instrumentator for full metrics."
    }
