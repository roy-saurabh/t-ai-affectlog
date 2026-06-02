"""
AffectLog – Trustworthy AI Assessment
FastAPI Application Entry Point — OpenAPI 3.1.

Full-stack API: dataset profiling, xAPI normalization, fairness metrics,
model explainability, EU AI Act / GDPR compliance, authentication, RBAC,
admin-approved registration, CARiSMA/LOLA interoperability.
Part of Prometheus-X BB04 / EDGE-Skills.
"""
from __future__ import annotations

import logging
import uuid
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from affectlog.api.routers import (
    audits,
    compliance,
    datasets,
    explanations,
    health,
    models,
    pdc,
    recipes,
    transforms,
)
from affectlog.api.routers.admin import router as admin_router
from affectlog.api.routers.auth import router as auth_router
from affectlog.api.routers.capabilities import router as capabilities_router
from affectlog.api.routers.editions import router as editions_router
from affectlog.api.routers.interoperability import router as interoperability_router
from affectlog.api.routers.platform_admin import router as platform_admin_router
from affectlog.api.routers.public import router as public_router
from affectlog.api.routers.wizard import router as wizard_router
from affectlog.auth.rate_limit import limiter
from affectlog.config import get_settings
from affectlog.logging import configure_logging
from affectlog.version import __version__


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    settings = get_settings()
    configure_logging(settings.log_level, settings.log_format)
    log = logging.getLogger(__name__)
    log.info("AffectLog API starting — version %s — env=%s", __version__, settings.app_env)

    # Ensure upload/runs directories exist
    settings.uploads_dir.mkdir(parents=True, exist_ok=True)
    settings.runs_dir.mkdir(parents=True, exist_ok=True)
    settings.data_dir.mkdir(parents=True, exist_ok=True)

    yield
    log.info("AffectLog API shutting down.")


settings = get_settings()

app = FastAPI(
    title="AffectLog – Trustworthy AI Assessment",
    description=(
        "Open-source assessment platform for privacy-preserving dataset and model audits "
        "in education and skills data spaces. Part of the Prometheus-X Trustworthy AI "
        "Assessment building block ecosystem (BB04), developed in the context of EDGE-Skills "
        "/ Digital Europe Programme.\n\n"
        "**Key capabilities:** dataset profiling · xAPI normalization · PII detection · "
        "pseudonymisation · fairness metrics · model explanation · GDPR/EU AI Act compliance "
        "exports · CARiSMA/LOLA interoperability · JSON-LD audit graphs · admin-approved RBAC.\n\n"
        "**Links:** "
        "[Prometheus-X BB04](https://prometheus-x.org/bb04-trustworthy-ai-assessment/) · "
        "[Technical docs](https://prometheus-x-association.github.io/docs/t-ai/) · "
        "[GitHub](https://github.com/roy-saurabh/edge_affectlog)"
    ),
    version=__version__,
    license_info={"name": "MIT", "url": "https://opensource.org/licenses/MIT"},
    contact={
        "name": "AffectLog / Prometheus-X",
        "url": "https://github.com/roy-saurabh/edge_affectlog",
    },
    lifespan=lifespan,
    openapi_version="3.1.0",
)

# ── Rate limiting ─────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]
app.add_middleware(SlowAPIMiddleware)

# ── CORS ──────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# ── Security headers ──────────────────────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next: Any) -> Any:
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "0"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


# ── Request ID ────────────────────────────────────────────────────────────
@app.middleware("http")
async def request_id_middleware(request: Request, call_next: Any) -> Any:
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


# ── Error handlers ────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def generic_error_handler(_request: Request, exc: Exception) -> JSONResponse:
    log = logging.getLogger(__name__)
    log.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please contact support."},
    )


# ── Routers ───────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(public_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(datasets.router)
app.include_router(transforms.router)
app.include_router(audits.router)
app.include_router(compliance.router)
app.include_router(models.router)
app.include_router(explanations.router)
app.include_router(recipes.router)
app.include_router(pdc.router)
app.include_router(interoperability_router)
app.include_router(editions_router)
app.include_router(platform_admin_router)
app.include_router(capabilities_router)
app.include_router(wizard_router)
