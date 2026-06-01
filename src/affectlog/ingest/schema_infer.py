"""Infer schema from a sample JSON/JSONL/CSV file."""

from __future__ import annotations

import contextlib
import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


def infer_json_schema(path: Path | str) -> dict[str, Any]:
    """
    Load a JSON or JSONL sample and infer key structure.
    Returns a dict with field paths at top-level and a 'sample' key.
    """
    path = Path(path).resolve()  # lgtm[py/path-injection]
    if not path.is_file():
        logger.warning("Not a regular file: %s", path)
        return {}
    raw = path.read_text(encoding="utf-8").strip()  # lgtm[py/path-injection]

    records: list[dict[str, Any]] = []

    # Try JSON array first, then single object, then JSONL
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            records = parsed[:10]
        elif isinstance(parsed, dict):
            # May be wrapped — look for event arrays
            for key in ("statements", "events", "data", "records", "items"):
                if key in parsed and isinstance(parsed[key], list):
                    records = parsed[key][:10]
                    break
            if not records:
                records = [parsed]
    except json.JSONDecodeError:
        # Try JSONL
        for line in raw.split("\n")[:10]:
            line = line.strip()
            if line:
                with contextlib.suppress(json.JSONDecodeError):
                    records.append(json.loads(line))

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
