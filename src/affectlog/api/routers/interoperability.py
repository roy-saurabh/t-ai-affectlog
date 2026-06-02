"""
Interoperability API — CARiSMA and LOLA metadata exchange endpoints.

These endpoints are integration-ready stubs; full operational integration
requires external CARiSMA / LOLA service configuration.
"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends

from affectlog.auth.dependencies import require_permission
from affectlog.auth.permissions import P
from affectlog.interoperability.carisma import (
    CARISMA_EXCHANGE_SCHEMA,
    build_carisma_export,
    parse_carisma_report,
)
from affectlog.interoperability.lola import (
    LOLA_EXCHANGE_SCHEMA,
    SHARED_METRICS_VOCABULARY,
    build_lola_export,
    parse_lola_results,
)

router = APIRouter(prefix="/v1/interoperability", tags=["interoperability"])

_require_read = require_permission(P.COMPLIANCE_READ)
_require_export = require_permission(P.COMPLIANCE_EXPORT)


@router.get("/carisma/schema")
async def carisma_schema(_actor: Any = Depends(_require_read)) -> dict[str, Any]:
    """Return the JSON schema for AffectLog → CARiSMA metadata exchange."""
    return CARISMA_EXCHANGE_SCHEMA


@router.post("/carisma/export")
async def carisma_export(
    audit_artifacts: dict[str, Any],
    _actor: Any = Depends(_require_export),
) -> dict[str, Any]:
    """
    Export AffectLog audit findings in CARiSMA-compatible format.

    POST the `dashboard_payload.json` content from a completed audit run.
    Returns a structured metadata export ready for CARiSMA import.
    """
    return build_carisma_export(audit_artifacts)


@router.post("/carisma/import-report")
async def carisma_import_report(
    report: dict[str, Any],
    _actor: Any = Depends(_require_export),
) -> dict[str, Any]:
    """
    Import a CARiSMA design-time risk report for cross-referencing
    with AffectLog operation-time findings.
    """
    return parse_carisma_report(report)


@router.get("/lola/schema")
async def lola_schema(_actor: Any = Depends(_require_read)) -> dict[str, Any]:
    """Return the JSON schema for AffectLog → LOLA metadata exchange."""
    return LOLA_EXCHANGE_SCHEMA


@router.get("/lola/metrics-vocabulary")
async def lola_metrics_vocabulary(_actor: Any = Depends(_require_read)) -> dict[str, str]:
    """Return the shared metrics vocabulary aligned between AffectLog and LOLA."""
    return SHARED_METRICS_VOCABULARY


@router.post("/lola/export")
async def lola_export(
    audit_artifacts: dict[str, Any],
    scenario_id: str = "",
    _actor: Any = Depends(_require_export),
) -> dict[str, Any]:
    """
    Export AffectLog dataset metrics in LOLA-compatible format.

    POST the `dashboard_payload.json` content from a completed audit run.
    Returns structured metrics aligned with LOLA's evaluation vocabulary.
    """
    return build_lola_export(audit_artifacts, lola_scenario_id=scenario_id)


@router.post("/lola/import-results")
async def lola_import_results(
    results: dict[str, Any],
    _actor: Any = Depends(_require_export),
) -> dict[str, Any]:
    """
    Import LOLA algorithm evaluation results for cross-referencing
    with AffectLog dataset profiling findings.
    """
    return parse_lola_results(results)
