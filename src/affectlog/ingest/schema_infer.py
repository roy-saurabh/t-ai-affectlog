"""Infer schema from a sample JSON/JSONL/CSV file."""

from __future__ import annotations

import contextlib
import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


_WRAPPER_KEYS = ("statements", "events", "data", "records", "items")


def _records_from_object(parsed: dict[str, Any]) -> list[Any]:
    """Unwrap an object that holds an event array; otherwise treat it as a single record."""
    for key in _WRAPPER_KEYS:
        value = parsed.get(key)
        if isinstance(value, list):
            return value[:10] or [parsed]
    return [parsed]


def _records_from_json_lines(raw: str) -> list[Any]:
    records: list[Any] = []
    for line in raw.split("\n")[:10]:
        line = line.strip()
        if line:
            with contextlib.suppress(json.JSONDecodeError):
                records.append(json.loads(line))
    return records


def _parse_sample_records(raw: str) -> list[Any]:
    """Parse a JSON array, a single (possibly wrapped) object, or JSONL — in that order."""
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return _records_from_json_lines(raw)
    if isinstance(parsed, list):
        return parsed[:10]
    if isinstance(parsed, dict):
        return _records_from_object(parsed)
    return []


def infer_json_schema(path: Path | str) -> dict[str, Any]:
    """
    Load a JSON or JSONL sample and infer key structure.
    Returns a dict with field paths at top-level and a 'sample' key.
    """
    path = Path(path).resolve()
    if not path.is_file():
        logger.warning("Not a regular file: %s", path)
        return {}
    raw = path.read_text(encoding="utf-8").strip()
    records = _parse_sample_records(raw)

    if not records:
        logger.warning("No parseable records found in %s", path)
        return {}

    sample = records[0]
    keys = list(sample.keys())
    return {
        "top_level_keys": keys,
        "sample_record": sample,
        "record_count_sampled": len(records),
        "inferred_paths": {
            "id": _find_path(sample, ["id", "statementId", "statement_id", "_id"]),
            "timestamp": _find_path(sample, ["timestamp", "stored", "time", "date", "AccessDate"]),
            "verb": _find_path(sample, ["verb"]),
            "actor": _find_path(sample, ["actor"]),
            "object": _find_path(sample, ["object"]),
            "context": _find_path(sample, ["context"]),
            "result": _find_path(sample, ["result"]),
        },
    }


def _find_path(obj: dict[str, Any], candidates: list[str]) -> str | None:
    for c in candidates:
        if c in obj:
            return c
    return None
