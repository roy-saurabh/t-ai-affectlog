"""Dataset inspector — detects format, schema, and field roles from uploaded input."""

from __future__ import annotations

import csv
import io
import json
import logging
import tempfile
import urllib.request
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from affectlog.capabilities.formats import FORMAT_BY_ID
from affectlog.wizard.schemas import (
    FieldInventoryEntry,
    FieldRole,
    InspectInputRequest,
    InspectInputResponse,
)

log = logging.getLogger(__name__)

_URL_SIZE_LIMIT = 50 * 1024 * 1024  # 50 MB safety cap for remote fetches


def _is_url(s: str) -> bool:
    try:
        p = urlparse(s)
        return p.scheme in ("http", "https")
    except Exception:
        return False


def _fetch_url_to_tempfile(url: str) -> tuple[Path, int] | tuple[None, str]:
    """Download url into a named temp file. Returns (path, size) or (None, error_msg)."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "AffectLog-Inspector/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:  # noqa: S310
            content_length = int(resp.headers.get("Content-Length", 0))
            if content_length > _URL_SIZE_LIMIT:
                return None, f"Remote file too large ({content_length // 1_048_576} MB). Limit is 50 MB."
            data = resp.read(_URL_SIZE_LIMIT + 1)
            if len(data) > _URL_SIZE_LIMIT:
                return None, "Remote file exceeds 50 MB limit."
            suffix = Path(urlparse(url).path).suffix or ".tmp"
            tf = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
            tf.write(data)
            tf.flush()
            return Path(tf.name), len(data)
    except Exception as exc:
        return None, f"Could not fetch URL: {exc}"

MASKOTT_REQUIRED = frozenset(["_id", "AccessDate", "ResourceId", "EntityId", "ResourceType"])
MASKOTT_ALL = frozenset(
    [
        "_id",
        "AccessDate",
        "ViewContext",
        "ResourceId",
        "ResourceType",
        "CollectionId",
        "ActivitySessionId",
        "Duration",
        "EntityId",
        "EntityUaiCode",
        "IsViewerAuthor",
        "IsViewerAnonymous",
    ]
)
XAPI_REQUIRED = frozenset(["actor", "verb", "object"])

_PII_PATTERNS = {
    "email": ["email", "mail", "e-mail"],
    "name": ["name", "firstname", "lastname", "prenom", "nom"],
    "phone": ["phone", "tel", "mobile"],
    "address": ["address", "adresse", "postcode", "zip"],
    "identifier": ["userid", "user_id", "entityid", "entity_id", "studentid", "pupilid"],
    "institution": ["uai", "uaicode", "school_id", "etablissement"],
    "url": ["url", "href", "link"],
    "session": ["session_id", "sessionid", "activitysessionid"],
}

_IDENTIFIER_KEYWORDS = ["id", "uid", "uuid", "key", "code"]
_TIMESTAMP_KEYWORDS = ["date", "time", "timestamp", "created", "updated", "at"]
_ENTITY_KEYWORDS = ["user", "actor", "entity", "student", "learner", "person"]
_ITEM_KEYWORDS = ["resource", "item", "object", "content", "course", "activity", "collection"]
_SESSION_KEYWORDS = ["session", "trace", "attempt"]
_GROUP_KEYWORDS = ["group", "class", "cohort", "segment", "category", "school", "institution"]


def _likely_roles(col: str, sample_vals: list[str]) -> list[FieldRole]:  # noqa: ARG001
    roles: list[FieldRole] = []
    cl = col.lower().replace("-", "_").replace(" ", "_")
    if any(kw in cl for kw in _TIMESTAMP_KEYWORDS):
        roles.append(FieldRole.TIMESTAMP)
    if any(kw in cl for kw in _ENTITY_KEYWORDS):
        roles.append(FieldRole.ENTITY)
    if any(kw in cl for kw in _ITEM_KEYWORDS):
        roles.append(FieldRole.ITEM)
    if any(kw in cl for kw in _SESSION_KEYWORDS):
        roles.append(FieldRole.SESSION)
    if any(kw in cl for kw in _GROUP_KEYWORDS):
        roles.append(FieldRole.GROUP)
    if any(kw in cl for kw in _IDENTIFIER_KEYWORDS) and not roles:
        roles.append(FieldRole.IDENTIFIER)
    for _pii_type, patterns in _PII_PATTERNS.items():
        if any(p in cl for p in patterns):
            if FieldRole.IDENTIFIER not in roles:
                roles.append(FieldRole.IDENTIFIER)
            break
    return roles


def _is_pii(col: str) -> bool:
    cl = col.lower().replace("-", "_")
    return any(any(p in cl for p in patterns) for patterns in _PII_PATTERNS.values())


def _infer_type(values: list[str]) -> str:
    if not values:
        return "unknown"
    non_null = [v for v in values if v and v.lower() not in ("null", "none", "nan", "")]
    if not non_null:
        return "null"
    numeric = 0
    for v in non_null[:20]:
        try:
            float(v)
            numeric += 1
        except (ValueError, TypeError):
            pass
    if numeric >= max(1, len(non_null[:20]) * 0.8):
        if all("." not in v for v in non_null[:10]):
            return "int"
        return "float"
    bool_vals = {"true", "false", "1", "0", "yes", "no"}
    if all(v.lower() in bool_vals for v in non_null[:20]):
        return "bool"
    return "str"


def _read_csv_sample(
    path: Path, max_rows: int = 500
) -> tuple[list[str], list[dict[str, Any]], int]:
    cols: list[str] = []
    rows: list[dict[str, Any]] = []
    total = 0
    try:
        with path.open(newline="", encoding="utf-8", errors="replace") as fh:
            reader = csv.DictReader(fh)
            cols = list(reader.fieldnames or [])
            for row in reader:
                total += 1
                if len(rows) < max_rows:
                    rows.append(dict(row))
    except Exception:
        pass
    return list(cols), rows, total


def _read_json_sample(path: Path) -> tuple[list[str], list[dict[str, Any]], int]:
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(raw, list):
            items = raw[:500]
            total = len(raw)
        elif isinstance(raw, dict):
            items = [raw]
            total = 1
        else:
            return [], [], 0
        if not items:
            return [], [], 0
        cols = list(items[0].keys()) if isinstance(items[0], dict) else []
        return cols, [i for i in items if isinstance(i, dict)], total
    except Exception:
        return [], [], 0


def _read_jsonl_sample(
    path: Path, max_rows: int = 500
) -> tuple[list[str], list[dict[str, Any]], int]:
    cols: list[str] = []
    rows: list[dict[str, Any]] = []
    total = 0
    try:
        with path.open(encoding="utf-8", errors="replace") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                total += 1
                try:
                    obj = json.loads(line)
                    if isinstance(obj, dict) and len(rows) < max_rows:
                        rows.append(obj)
                        if not cols:
                            cols = list(obj.keys())
                except Exception:
                    pass
    except Exception:
        pass
    return cols, rows, total


def _score_maskott(cols: list[str]) -> float:
    col_set = {c.lower() for c in cols}
    matches = sum(1 for f in MASKOTT_REQUIRED if f.lower() in col_set)
    return matches / len(MASKOTT_REQUIRED)


def _score_xapi(cols: list[str], rows: list[dict[str, Any]]) -> float:
    col_set = {c.lower() for c in cols}
    required_matches = sum(1 for f in XAPI_REQUIRED if f in col_set)
    if required_matches == len(XAPI_REQUIRED):
        return 1.0
    # Check nested structure
    if rows:
        first = rows[0]
        found = sum(1 for k in XAPI_REQUIRED if k in first)
        return found / len(XAPI_REQUIRED)
    return required_matches / len(XAPI_REQUIRED)


def _detect_format(
    path: Path,  # noqa: ARG001
    cols: list[str],
    rows: list[dict[str, Any]],
    suffix: str,
) -> tuple[str | None, float]:
    if suffix in (".csv", ".tsv"):
        maskott_score = _score_maskott(cols)
        if maskott_score >= 0.8:
            return "maskott_csv_v1", maskott_score
        return "generic_csv_tabular", 0.7
    if suffix == ".jsonl" or suffix == ".ndjson":
        xapi_score = _score_xapi(cols, rows)
        if xapi_score >= 0.7:
            return "generic_xapi_jsonl", xapi_score
        return "generic_xapi_jsonl", 0.5
    if suffix == ".json":
        xapi_score = _score_xapi(cols, rows)
        if xapi_score >= 0.7:
            return "generic_xapi_json", xapi_score
        if rows and "id" in (rows[0] if rows else {}):
            return "becomino_json", 0.5
        return "generic_xapi_json", 0.4
    if suffix in (".parquet", ".pq"):
        return "parquet_tabular", 0.95
    if suffix in (".pkl", ".joblib"):
        return "model_artifact_sklearn", 0.9
    if suffix == ".onnx":
        return "model_artifact_onnx", 0.95
    if suffix in (".pt", ".pth"):
        return "model_artifact_torch", 0.9
    if suffix in (".h5", ".keras"):
        return "model_artifact_tensorflow", 0.9
    return None, 0.0


def inspect(req: InspectInputRequest) -> InspectInputResponse:
    path_str = req.dataset_path or req.dataset_reference
    if not path_str:
        return InspectInputResponse(
            is_supported=False,
            unsupported_reason="No dataset path or reference provided.",
        )

    _temp_path: Path | None = None
    fetched_size: int | None = None

    if _is_url(path_str):
        result, meta = _fetch_url_to_tempfile(path_str)
        if result is None:
            return InspectInputResponse(
                is_supported=False,
                unsupported_reason=str(meta),
            )
        _temp_path = result
        fetched_size = meta
        path = _temp_path
        # Preserve original extension so format detection works by suffix
        suffix = Path(urlparse(path_str).path).suffix.lower() or path.suffix.lower()
    else:
        path = Path(path_str)
        if not path.exists():
            return InspectInputResponse(
                is_supported=False,
                unsupported_reason=f"File not found: {path_str}",
            )
        if not path.is_file():
            return InspectInputResponse(
                is_supported=False,
                unsupported_reason=f"Path is not a file: {path_str}",
            )
        suffix = path.suffix.lower()

    # ── Read sample ────────────────────────────────────────────────────
    cols: list[str] = []
    rows: list[dict[str, Any]] = []
    total_rows = 0
    file_size = fetched_size if fetched_size is not None else path.stat().st_size

    if suffix in (".csv", ".tsv"):
        cols, row_dicts, total_rows = _read_csv_sample(path)
        rows = row_dicts
    elif suffix in (".json",):
        cols, rows, total_rows = _read_json_sample(path)
    elif suffix in (".jsonl", ".ndjson"):
        cols, rows, total_rows = _read_jsonl_sample(path)

    # Text-based formats with no columns are unreadable — fail early rather
    # than letting the user advance to schema mapping with an empty inventory.
    _tabular_suffixes = {".csv", ".tsv", ".json", ".jsonl", ".ndjson"}
    if suffix in _tabular_suffixes and not cols:
        return InspectInputResponse(
            is_supported=False,
            unsupported_reason="No columns detected — file may be empty or malformed.",
        )

    # ── Format detection ───────────────────────────────────────────────
    detected_format, confidence = _detect_format(path, cols, rows, suffix)

    # Apply user hints
    if req.user_hints.dataset_type and req.user_hints.dataset_type in FORMAT_BY_ID:
        detected_format = req.user_hints.dataset_type
        confidence = max(confidence, 0.9)

    is_supported = detected_format is not None

    # ── Field inventory ────────────────────────────────────────────────
    field_inventory: list[FieldInventoryEntry] = []
    for col in cols:
        sample_vals = [str(r.get(col, "")) for r in rows[:20] if r.get(col) is not None]
        unique_count = len({str(r.get(col, "")) for r in rows if r.get(col) is not None})
        missing = sum(1 for r in rows if not r.get(col))
        missing_rate = missing / len(rows) if rows else None
        field_inventory.append(
            FieldInventoryEntry(
                name=col,
                inferred_type=_infer_type(sample_vals),
                cardinality=unique_count,
                missing_rate=missing_rate,
                sample_values=sample_vals[:5],
                pii_flag=_is_pii(col),
                likely_roles=_likely_roles(col, sample_vals),
            )
        )

    # ── Compatibility scores ───────────────────────────────────────────
    maskott_score = _score_maskott(cols) if cols else None
    xapi_score = _score_xapi(cols, rows) if (cols or rows) else None

    # ── Pre-mapped fields for Maskott ─────────────────────────────────
    pre_mapped: dict[str, str] = {}
    if detected_format == "maskott_csv_v1":
        col_lower = {c.lower(): c for c in cols}
        mapping = {
            "entity_field": "entityid",
            "item_field": "resourceid",
            "timestamp_field": "accessdate",
            "session_field": "activitysessionid",
            "verb_field": "viewcontext",
        }
        for role, pattern in mapping.items():
            if pattern in col_lower:
                pre_mapped[role] = col_lower[pattern]

    # ── Missing required fields ────────────────────────────────────────
    missing_required: list[str] = []
    if detected_format == "maskott_csv_v1":
        col_set = {c.lower() for c in cols}
        missing_required = [f for f in MASKOTT_REQUIRED if f.lower() not in col_set]

    # ── Risk warnings ──────────────────────────────────────────────────
    risk_warnings: list[str] = []
    pii_fields = [f.name for f in field_inventory if f.pii_flag]
    if pii_fields:
        risk_warnings.append(
            f"Detected likely identifier fields: {', '.join(pii_fields[:5])}. "
            "These will be pseudonymised by default."
        )
    if total_rows > 1_000_000:
        risk_warnings.append(
            f"Large dataset ({total_rows:,} rows). Statistical analyses will use sampling where necessary."
        )

    response = InspectInputResponse(
        detected_format=detected_format,
        detected_format_label=FORMAT_BY_ID[detected_format].label
        if detected_format in FORMAT_BY_ID
        else detected_format,
        format_confidence=round(confidence, 3),
        row_count_estimate=total_rows,
        file_size_bytes=file_size,
        field_inventory=field_inventory,
        xapi_compatibility_score=round(xapi_score, 3) if xapi_score is not None else None,
        becomino_template_match_score=None,
        maskott_schema_match_score=round(maskott_score, 3) if maskott_score is not None else None,
        missing_required_fields=missing_required,
        detected_model_type=None,
        model_adapter_compatibility=None,
        risk_warnings=risk_warnings,
        recommended_next_step="confirm_schema" if not pre_mapped else "confirm_mapping",
        is_supported=is_supported,
        unsupported_reason=None if is_supported else f"Unsupported file type: {suffix}",
        pre_mapped_fields=pre_mapped,
    )

    if _temp_path is not None:
        try:
            _temp_path.unlink(missing_ok=True)
        except Exception:
            pass

    return response
