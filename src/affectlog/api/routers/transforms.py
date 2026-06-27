"""Transform endpoints."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/v1/transforms", tags=["Transforms"])


@router.post(
    "/infer-template",
    summary="Infer Becomino xAPI template from a JSON sample",
    responses={400: {"description": "Failed to infer template from the JSON sample"}},
)
async def infer_template(sample_path: str) -> dict[str, Any]:
    from affectlog.config import get_settings
    from affectlog.transform.becomino_template import infer_becomino_template

    # The path passed downstream is never built from the request string. Instead
    # we build a server-side allowlist of the JSON/JSONL sample files that already
    # exist under the configured data directory, and select the one the caller
    # asked for from that set. A request that does not match an existing,
    # in-bounds sample is rejected — eliminating path traversal at the source.
    settings = get_settings()
    base = Path(settings.data_dir).resolve()
    requested = Path(sample_path).resolve()
    allowed_samples = {
        candidate.resolve()
        for pattern in ("*.json", "*.jsonl")
        for candidate in base.rglob(pattern)
    }
    safe_path = next((p for p in allowed_samples if p == requested), None)
    if safe_path is None:
        raise HTTPException(
            status_code=400,
            detail="sample_path must be an existing JSON/JSONL file under the data directory.",
        )

    try:
        return infer_becomino_template(safe_path)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
