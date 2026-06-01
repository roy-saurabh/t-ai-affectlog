"""
AffectLog ALT-AI — FastAPI Application Entry Point.

OpenAPI 3.1 compatible. All routes versioned under /v1/.
"""

from __future__ import annotations

import logging
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from affectlog.api.routers import (
    audits,
    compliance,
    datasets,
    explanations,
    health,
    models,
    pdc,
    transforms,
)
from affectlog.config import get_settings
from affectlog.logging import configure_logging
from affectlog.version import __version__


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    settings = get_settings()
    configure_logging(settings.log_level, settings.log_format)
    logging.getLogger(__name__).info("ALT-AI API starting — version %s", __version__)
    yield
    logging.getLogger(__name__).info("ALT-AI API shutting down.")


app = FastAPI(
    title="AffectLog Trustworthy AI Assessment Building Block (ALT-AI)",
    description=(
        "API for dataset profiling, xAPI normalization, fairness metrics, "
        "model explainability, and EU AI Act / GDPR compliance exports. "
        "Aligned with D3.7 EDGE-Skills / Prometheus-X."
    ),
    version=__version__,
    license_info={"name": "MIT", "url": "https://opensource.org/licenses/MIT"},
    contact={"name": "AffectLog", "url": "https://github.com/roy-saurabh/edge_affectlog"},
    lifespan=lifespan,
    openapi_version="3.1.0",
)

# ── Middleware ────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_id(request: Request, call_next):  # type: ignore[no-untyped-def]
    request_id = request.headers.get("X-Request-ID", uuid.uuid4().hex)
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


# ── Exception handlers ────────────────────────────────────────────────
@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logging.getLogger(__name__).error("Unhandled error: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "request_id": request.headers.get("X-Request-ID")},
    )


# ── Routers ───────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(datasets.router)
app.include_router(transforms.router)
app.include_router(audits.router)
app.include_router(models.router)
app.include_router(explanations.router)
app.include_router(compliance.router)
app.include_router(pdc.router)


@app.get("/", include_in_schema=False)
async def root() -> dict:  # type: ignore[type-arg]
    return {
        "service": "AffectLog ALT-AI",
        "version": __version__,
        "docs": "/docs",
        "openapi": "/openapi.json",
        "health": "/healthz",
    }
