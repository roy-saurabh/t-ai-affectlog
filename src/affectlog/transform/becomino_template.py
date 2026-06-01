"""
Becomino template inference module.

Reads a Becomino JSON sample (if present) and infers the xAPI mapping template.
Falls back to a documented default normalized xAPI template when no sample exists.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Optional

from affectlog.ingest.schema_infer import infer_json_schema

logger = logging.getLogger(__name__)

DEFAULT_TEMPLATE: dict[str, Any] = {
    "_meta": {
        "source": "affectlog_default",
        "description": "Default normalized xAPI template used when no Becomino sample is present.",
        "version": "1.0",
    },
    "id_path": "id",
    "timestamp_path": "timestamp",
    "verb_path": "verb.id",
    "actor_path": "actor.account.name",
    "object_path": "object.id",
    "context_path": "context",
    "result_path": "result",
    "duration_path": "result.duration",
    "structure": "flat_xapi",
    "output_format": "jsonl",
}


def infer_becomino_template(
    sample_path: Optional[Path | str] = None,
    output_path: Optional[Path | str] = None,
) -> dict[str, Any]:
    """
    Infer a Becomino-compatible template from a sample JSON file.

    Args:
        sample_path: Path to Becomino sample JSON/JSONL. If None or missing, uses DEFAULT_TEMPLATE.
        output_path: If provided, writes the inferred template as JSON to this path.

    Returns:
        Template dict describing mapping paths.
    """
    template = _infer(sample_path) if sample_path and Path(sample_path).exists() else DEFAULT_TEMPLATE.copy()

    if output_path:
        out = Path(output_path)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(template, indent=2))
        logger.info("Becomino template written to %s", out)

    return template


def _infer(sample_path: Path | str) -> dict[str, Any]:
    path = Path(sample_path)
    schema = infer_json_schema(path)
    if not schema:
        logger.warning("Could not infer schema from %s; using default template.", path)
        return DEFAULT_TEMPLATE.copy()

    paths = schema.get("inferred_paths", {})
    sample = schema.get("sample_record", {})

    template: dict[str, Any] = {
        "_meta": {
            "source": str(path),
            "description": "Inferred from Becomino sample",
            "version": "1.0",
            "top_level_keys": schema.get("top_level_keys", []),
            "record_count_sampled": schema.get("record_count_sampled", 0),
        },
        "id_path": paths.get("id") or "id",
        "timestamp_path": paths.get("timestamp") or "timestamp",
        "verb_path": _detect_verb_path(sample),
        "actor_path": _detect_actor_path(sample),
        "object_path": _detect_object_path(sample),
        "context_path": paths.get("context") or "context",
        "result_path": paths.get("result") or "result",
        "duration_path": _detect_duration_path(sample),
        "structure": _detect_structure(sample),
        "output_format": "jsonl",
    }
    logger.info("Inferred Becomino template: %s", template)
    return template


def _detect_verb_path(record: dict[str, Any]) -> str:
    if "verb" in record:
        v = record["verb"]
        if isinstance(v, dict) and "id" in v:
            return "verb.id"
        return "verb"
    for candidate in ("action", "event_type", "type"):
        if candidate in record:
            return candidate
    return "verb"


def _detect_actor_path(record: dict[str, Any]) -> str:
    if "actor" in record:
        a = record["actor"]
        if isinstance(a, dict):
            if "account" in a and isinstance(a["account"], dict) and "name" in a["account"]:
                return "actor.account.name"
            if "mbox" in a:
                return "actor.mbox"
            if "name" in a:
                return "actor.name"
    for candidate in ("userId", "user_id", "entityId", "learner_id"):
        if candidate in record:
            return candidate
    return "actor.account.name"


def _detect_object_path(record: dict[str, Any]) -> str:
    if "object" in record:
        o = record["object"]
        if isinstance(o, dict) and "id" in o:
            return "object.id"
        return "object"
    for candidate in ("resource_id", "resourceId", "activity_id"):
        if candidate in record:
            return candidate
    return "object.id"


def _detect_duration_path(record: dict[str, Any]) -> str:
    if "result" in record:
        r = record["result"]
        if isinstance(r, dict) and "duration" in r:
            return "result.duration"
    if "duration" in record:
        return "duration"
    return "result.duration"


def _detect_structure(record: dict[str, Any]) -> str:
    xapi_keys = {"actor", "verb", "object", "context", "result", "id", "timestamp"}
    overlap = xapi_keys & set(record.keys())
    if len(overlap) >= 3:
        return "flat_xapi"
    return "custom"
