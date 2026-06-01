"""Provenance records: PROV-O compatible run metadata."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from affectlog.core.time import now_iso


def build_provenance(
    run_id: str,
    recipe_name: str,
    input_path: str,
    config_hash: str,
    stages: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    return {
        "@context": "http://www.w3.org/ns/prov#",
        "@type": "Activity",
        "prov:wasAssociatedWith": {"@type": "Agent", "name": "AffectLog ALT-AI"},
        "prov:used": {"@type": "Entity", "prov:value": input_path},
        "prov:generated": {"@type": "Collection", "prov:label": run_id},
        "prov:startedAtTime": now_iso(),
        "run_id": run_id,
        "recipe": recipe_name,
        "config_hash": config_hash,
        "stages": stages or [],
    }
