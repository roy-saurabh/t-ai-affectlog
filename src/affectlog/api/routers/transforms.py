"""Transform endpoints."""

from __future__ import annotations

import tempfile
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

    # Containment check: a caller-supplied path must resolve inside an allowed
    # data directory. This blocks path traversal (e.g. '../../etc/passwd') before
    # the path reaches any filesystem read, mirroring the wizard inspector guard.
    settings = get_settings()
    allowed_bases = [
        Path(settings.data_dir).resolve(),
        Path(settings.runs_dir).resolve(),
        Path(tempfile.gettempdir()).resolve(),
    ]
    resolved = Path(sample_path).resolve()
    if not any(resolved.is_relative_to(base) for base in allowed_bases):
        raise HTTPException(
            status_code=400,
            detail="sample_path is outside the allowed data directories.",
        )

    try:
        return infer_becomino_template(resolved)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
