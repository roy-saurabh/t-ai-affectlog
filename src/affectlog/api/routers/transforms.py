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

    # Resolve the sample by file *name* only: Path(...).name strips every
    # directory component, so traversal sequences ("../") cannot escape the data
    # directory. The path used downstream is then taken from the set of real
    # files found under that directory — never built from the raw request string.
    requested_name = Path(sample_path).name
    settings = get_settings()
    base = Path(settings.data_dir).resolve()
    matches = [
        candidate
        for pattern in ("*.json", "*.jsonl")
        for candidate in base.rglob(pattern)
        if candidate.name == requested_name and candidate.is_file()
    ]
    if not matches:
        raise HTTPException(
            status_code=400,
            detail="sample_path must name an existing JSON/JSONL file under the data directory.",
        )

    try:
        return infer_becomino_template(matches[0])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
