"""
Transform Maskott/Tactileo CSV rows into normalized xAPI JSONL.

Streams output — never builds a giant list for 1M+ rows.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Optional

import polars as pl

from affectlog.core.time import parse_iso, to_iso8601_duration
from affectlog.ingest.csv_reader import read_maskott_csv
from affectlog.privacy.pseudonymizer import Pseudonymizer
from affectlog.transform.becomino_template import infer_becomino_template
from affectlog.transform.duration import duration_to_iso8601
from affectlog.transform.verb_mapper import VerbMapper

logger = logging.getLogger(__name__)


def row_to_xapi(
    row: dict[str, Any],
    *,
    pseudonymizer: Optional[Pseudonymizer] = None,
    verb_mapper: Optional[VerbMapper] = None,
    template: Optional[dict[str, Any]] = None,
    allow_raw: bool = False,
) -> dict[str, Any]:
    """Convert a single Maskott CSV row dict to a normalized xAPI statement dict."""
    vm = verb_mapper or VerbMapper()
    verb = vm.get(str(row.get("ViewContext", "")))

    # Actor pseudonymisation
    entity_id = str(row.get("EntityId", ""))
    is_anon = _parse_bool(row.get("IsViewerAnonymous"))

    if is_anon or not entity_id:
        actor_name = "anonymous"
    elif pseudonymizer and not allow_raw:
        actor_name = pseudonymizer.hash("EntityId", entity_id)
    else:
        actor_name = entity_id

    # EntityUaiCode
    uai_raw = str(row.get("EntityUaiCode", "")) if row.get("EntityUaiCode") else None
    if uai_raw and pseudonymizer and not allow_raw:
        uai_hashed = pseudonymizer.hash("EntityUaiCode", uai_raw)
    else:
        uai_hashed = None

    # Statement ID
    stmt_id_raw = str(row.get("_id", ""))
    if pseudonymizer and not allow_raw:
        stmt_id = pseudonymizer.hash("_id", stmt_id_raw) if stmt_id_raw else stmt_id_raw
    else:
        stmt_id = stmt_id_raw

    # ActivitySessionId
    session_raw = str(row.get("ActivitySessionId", "")) if row.get("ActivitySessionId") else None
    if session_raw and pseudonymizer and not allow_raw:
        session_id = pseudonymizer.hash("ActivitySessionId", session_raw)
    else:
        session_id = session_raw

    # Duration
    duration_raw = row.get("Duration")
    duration_iso = duration_to_iso8601(duration_raw)

    # Timestamp
    ts_raw = str(row.get("AccessDate", ""))
    ts_parsed = parse_iso(ts_raw)
    timestamp = ts_parsed.isoformat() if ts_parsed else ts_raw

    # Resource
    resource_id = str(row.get("ResourceId", "")) if row.get("ResourceId") else ""
    resource_type = str(row.get("ResourceType", "")) if row.get("ResourceType") else ""

    # Collection
    collection_id = str(row.get("CollectionId", "")) if row.get("CollectionId") else None
    view_context = str(row.get("ViewContext", "")) if row.get("ViewContext") else ""

    stmt: dict[str, Any] = {
        "id": stmt_id,
        "timestamp": timestamp,
        "actor": {
            "objectType": "Agent",
            "account": {
                "homePage": "urn:affectlog:entity",
                "name": actor_name,
            },
            "extensions": {
                "isViewerAnonymous": is_anon,
            },
        },
        "verb": {
            "id": verb["id"],
            "display": {"en-US": verb["display"]},
        },
        "object": {
            "id": resource_id,
            "objectType": "Activity",
            "definition": {
                "type": resource_type,
                "name": {"en-US": resource_type},
            },
        },
        "context": {
            "registration": session_id,
            "contextActivities": {
                "grouping": [{"id": collection_id}] if collection_id else [],
                "category": [{"id": view_context}] if view_context else [],
            },
            "extensions": {
                "entityUaiCodeHash": uai_hashed,
                "isViewerAuthor": _parse_bool(row.get("IsViewerAuthor")),
                "durationRaw": str(duration_raw) if duration_raw is not None else None,
            },
        },
        "result": {
            "duration": duration_iso,
        },
        "authority": {
            "name": "AffectLog ALT-AI",
        },
        "source": {
            "platform": "Maskott/Tactileo",
            "schema": "maskott_csv_v1",
            "transformedBy": "affectlog",
        },
    }
    return stmt


def _parse_bool(val: object) -> Optional[bool]:
    if val is None:
        return None
    if isinstance(val, bool):
        return val
    s = str(val).strip().lower()
    if s in ("true", "1", "yes"):
        return True
    if s in ("false", "0", "no"):
        return False
    return None


def convert_maskott_csv_to_xapi(
    input_path: Path | str,
    output_path: Path | str,
    *,
    chunk_size: int = 100_000,
    template_path: Optional[Path | str] = None,
    pseudonymizer: Optional[Pseudonymizer] = None,
    verb_mapper: Optional[VerbMapper] = None,
    allow_raw: bool = False,
    strict: bool = False,
    invalid_output: Optional[Path] = None,
    progress: bool = True,
) -> dict[str, Any]:
    """
    Stream-convert a Maskott CSV to normalized xAPI JSONL.

    Returns summary stats dict.
    """
    input_path = Path(input_path)
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    template = infer_becomino_template(template_path)

    total_in = 0
    total_out = 0
    error_count = 0

    with open(output_path, "w", encoding="utf-8") as out_f:
        for chunk in read_maskott_csv(
            input_path,
            chunk_size=chunk_size,
            strict=strict,
            invalid_output=invalid_output,
        ):
            rows = chunk.to_dicts()
            total_in += len(rows)
            for row in rows:
                try:
                    stmt = row_to_xapi(
                        row,
                        pseudonymizer=pseudonymizer,
                        verb_mapper=verb_mapper,
                        template=template,
                        allow_raw=allow_raw,
                    )
                    out_f.write(json.dumps(stmt, ensure_ascii=False, default=str) + "\n")
                    total_out += 1
                except Exception as exc:
                    error_count += 1
                    logger.warning("Row transform error: %s", exc)

            if progress:
                logger.info("Converted %d rows so far...", total_out)

    summary = {
        "input_path": str(input_path),
        "output_path": str(output_path),
        "total_rows_in": total_in,
        "total_rows_out": total_out,
        "error_count": error_count,
        "template_used": template.get("_meta", {}).get("source", "default"),
    }
    logger.info("Conversion complete: %s", summary)
    return summary
