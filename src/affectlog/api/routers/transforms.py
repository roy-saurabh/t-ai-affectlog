"""Transform endpoints."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/v1/transforms", tags=["Transforms"])


@router.post(
    "/infer-template",
    summary="Infer Becomino xAPI template from a JSON sample",
    responses={400: {"description": "Failed to infer template from the JSON sample"}},
)
async def infer_template(sample_path: str) -> dict[str, Any]:
    from pathlib import Path

    from affectlog.transform.becomino_template import infer_becomino_template

    try:
        template = infer_becomino_template(Path(sample_path))
        return template
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
