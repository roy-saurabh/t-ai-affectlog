"""Dataset inspector — detects format, schema, and field roles from uploaded input."""

from __future__ import annotations

import contextlib
import csv
import http.client
import ipaddress
import json
import logging
import socket
import ssl
import tempfile
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from affectlog.capabilities.formats import FORMAT_BY_ID
from affectlog.config import get_settings
from affectlog.wizard.schemas import (
    FieldInventoryEntry,
    FieldRole,
    InspectInputRequest,
    InspectInputResponse,
)

log = logging.getLogger(__name__)

_URL_SIZE_LIMIT = 50 * 1024 * 1024  # 50 MB safety cap for remote fetches

_PRIVATE_NETWORKS: tuple[ipaddress.IPv4Network | ipaddress.IPv6Network, ...] = (
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),  # link-local / AWS metadata
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
)


def _is_url(s: str) -> bool:
    try:
        p = urlparse(s)
        return p.scheme in ("http", "https")
    except Exception:
        return False


def _resolve_public_ip(host: str, port: int) -> tuple[str | None, str]:
    """
    Resolve *host* exactly once and reject private or reserved addresses (SSRF guard).
    Returns (ip, "") or (None, error_msg).
    """
    try:
        addrinfos = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM)
    except OSError:
        return None, "Could not resolve hostname."
    if not addrinfos:
        return None, "Could not resolve hostname."
    ip_str = str(addrinfos[0][4][0])

    try:
        ip = ipaddress.ip_address(ip_str)
    except ValueError:
        return None, "Could not parse resolved IP address."

    if any(ip in net for net in _PRIVATE_NETWORKS):
        return None, "URL resolves to a private or reserved address."
    return ip_str, ""


def _open_pinned_connection(
    scheme: str, host: str, ip_str: str, port: int
) -> http.client.HTTPConnection:
    # Connect directly to the pre-resolved IP — no DNS re-lookup at request time.
    # HTTPConnection is constructed with ip_str (validated IP, not user-supplied host)
    # to prevent SSRF. For HTTPS the TLS handshake uses server_hostname=host for
    # correct SNI / certificate verification; the socket is then injected so
    # http.client never performs its own DNS lookup or TLS setup.
    raw_sock = socket.create_connection((ip_str, port), timeout=30)
    conn = http.client.HTTPConnection(ip_str, port=port, timeout=30)
    if scheme == "https":
        ctx = ssl.create_default_context()
        conn.sock = ctx.wrap_socket(raw_sock, server_hostname=host)
    else:
        conn.sock = raw_sock
    return conn


def _read_limited_body(resp: http.client.HTTPResponse) -> tuple[bytes | None, str]:
    """Return (body, "") for a 200 response within the size cap, else (None, error_msg)."""
    # Do NOT follow redirects — redirect targets bypass the SSRF validation above
    if resp.status in (301, 302, 303, 307, 308):
        return None, f"Redirects are not followed for security (HTTP {resp.status})."
    if resp.status != 200:
        return None, f"Remote server returned HTTP {resp.status}."

    content_length = int(resp.getheader("Content-Length", 0) or 0)
    if content_length > _URL_SIZE_LIMIT:
        return (
            None,
            f"Remote file too large ({content_length // 1_048_576} MB). Limit is 50 MB.",
        )
    data = resp.read(_URL_SIZE_LIMIT + 1)
    if len(data) > _URL_SIZE_LIMIT:
        return None, "Remote file exceeds 50 MB limit."
    return data, ""


def _fetch_url_to_tempfile(url: str) -> tuple[Path, int] | tuple[None, str]:
    """
    Download url into a named temp file.
    Resolves DNS once and connects directly to the pre-resolved IP to prevent DNS rebinding.
    Returns (path, size) or (None, error_msg). Does NOT follow HTTP redirects.
    """
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        return None, "Only http/https URLs are supported."
    host = parsed.hostname or ""
    if not host:
        return None, "No hostname in URL."
    port = parsed.port or (443 if parsed.scheme == "https" else 80)

    ip_str, error = _resolve_public_ip(host, port)
    if ip_str is None:
        return None, error

    path_qs = (parsed.path or "/") + (f"?{parsed.query}" if parsed.query else "")

    conn: http.client.HTTPConnection | None = None
    try:
        conn = _open_pinned_connection(parsed.scheme, host, ip_str, port)
        conn.request(
            "GET",
            path_qs,
            headers={"Host": host, "User-Agent": "AffectLog-Inspector/1.0"},
        )
        data, error = _read_limited_body(conn.getresponse())
        if data is None:
            return None, error

        with tempfile.NamedTemporaryFile(delete=False, suffix=".tmp") as tf:
            tf.write(data)
            tf.flush()
            return Path(tf.name), len(data)
    except Exception as exc:
        return None, f"Could not fetch URL: {exc}"
    finally:
        if conn is not None:
            with contextlib.suppress(Exception):
                conn.close()


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


def _likely_roles(col: str) -> list[FieldRole]:
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


_FORMAT_BY_SUFFIX: dict[str, tuple[str, float]] = {
    ".parquet": ("parquet_tabular", 0.95),
    ".pq": ("parquet_tabular", 0.95),
    ".pkl": ("model_artifact_sklearn", 0.9),
    ".joblib": ("model_artifact_sklearn", 0.9),
    ".onnx": ("model_artifact_onnx", 0.95),
    ".pt": ("model_artifact_torch", 0.9),
    ".pth": ("model_artifact_torch", 0.9),
    ".h5": ("model_artifact_tensorflow", 0.9),
    ".keras": ("model_artifact_tensorflow", 0.9),
}


def _detect_csv_format(cols: list[str]) -> tuple[str, float]:
    maskott_score = _score_maskott(cols)
    if maskott_score >= 0.8:
        return "maskott_csv_v1", maskott_score
    return "generic_csv_tabular", 0.7


def _detect_jsonl_format(cols: list[str], rows: list[dict[str, Any]]) -> tuple[str, float]:
    xapi_score = _score_xapi(cols, rows)
    return "generic_xapi_jsonl", xapi_score if xapi_score >= 0.7 else 0.5


def _detect_json_format(cols: list[str], rows: list[dict[str, Any]]) -> tuple[str, float]:
    xapi_score = _score_xapi(cols, rows)
    if xapi_score >= 0.7:
        return "generic_xapi_json", xapi_score
    if rows and "id" in rows[0]:
        return "becomino_json", 0.5
    return "generic_xapi_json", 0.4


def _detect_format(
    cols: list[str],
    rows: list[dict[str, Any]],
    suffix: str,
) -> tuple[str | None, float]:
    if suffix in (".csv", ".tsv"):
        return _detect_csv_format(cols)
    if suffix in (".jsonl", ".ndjson"):
        return _detect_jsonl_format(cols, rows)
    if suffix == ".json":
        return _detect_json_format(cols, rows)
    return _FORMAT_BY_SUFFIX.get(suffix, (None, 0.0))


_SampleReader = Callable[[Path], tuple[list[str], list[dict[str, Any]], int]]

_SAMPLE_READERS: dict[str, _SampleReader] = {
    ".csv": _read_csv_sample,
    ".tsv": _read_csv_sample,
    ".json": _read_json_sample,
    ".jsonl": _read_jsonl_sample,
    ".ndjson": _read_jsonl_sample,
}

_MASKOTT_FIELD_ROLES = {
    "entity_field": "entityid",
    "item_field": "resourceid",
    "timestamp_field": "accessdate",
    "session_field": "activitysessionid",
    "verb_field": "viewcontext",
}


@dataclass
class _ResolvedInput:
    path: Path
    suffix: str
    file_size: int
    temp_path: Path | None = None


def _unsupported(reason: str) -> InspectInputResponse:
    return InspectInputResponse(is_supported=False, unsupported_reason=reason)


def _resolve_remote_input(url: str) -> _ResolvedInput | InspectInputResponse:
    result, meta = _fetch_url_to_tempfile(url)
    if result is None:
        return _unsupported(str(meta))
    assert isinstance(meta, int)
    # Preserve original extension so format detection works by suffix
    suffix = Path(urlparse(url).path).suffix.lower() or result.suffix.lower()
    return _ResolvedInput(path=result, suffix=suffix, file_size=meta, temp_path=result)


def _resolve_local_input(path_str: str) -> _ResolvedInput | InspectInputResponse:
    settings = get_settings()
    allowed_bases = [
        Path(settings.data_dir).resolve(),
        Path(settings.runs_dir).resolve(),
        Path(tempfile.gettempdir()).resolve(),
    ]
    path = Path(path_str).resolve()
    if not any(path.is_relative_to(base) for base in allowed_bases):
        return _unsupported("Dataset path is outside the allowed directories.")
    if not path.exists():
        return _unsupported("File not found.")
    if not path.is_file():
        return _unsupported("Path is not a file.")
    return _ResolvedInput(path=path, suffix=path.suffix.lower(), file_size=path.stat().st_size)


def _read_sample(path: Path, suffix: str) -> tuple[list[str], list[dict[str, Any]], int]:
    reader = _SAMPLE_READERS.get(suffix)
    return reader(path) if reader else ([], [], 0)


def _field_inventory_entry(col: str, rows: list[dict[str, Any]]) -> FieldInventoryEntry:
    sample_vals = [str(r.get(col, "")) for r in rows[:20] if r.get(col) is not None]
    unique_count = len({str(r.get(col, "")) for r in rows if r.get(col) is not None})
    missing = sum(1 for r in rows if not r.get(col))
    return FieldInventoryEntry(
        name=col,
        inferred_type=_infer_type(sample_vals),
        cardinality=unique_count,
        missing_rate=missing / len(rows) if rows else None,
        sample_values=sample_vals[:5],
        pii_flag=_is_pii(col),
        likely_roles=_likely_roles(col),
    )


def _maskott_pre_mapping(cols: list[str]) -> dict[str, str]:
    col_lower = {c.lower(): c for c in cols}
    return {
        role: col_lower[pattern]
        for role, pattern in _MASKOTT_FIELD_ROLES.items()
        if pattern in col_lower
    }


def _maskott_missing_required(cols: list[str]) -> list[str]:
    col_set = {c.lower() for c in cols}
    return [f for f in MASKOTT_REQUIRED if f.lower() not in col_set]


def _risk_warnings(field_inventory: list[FieldInventoryEntry], total_rows: int) -> list[str]:
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
    return risk_warnings


def _round_score(score: float | None) -> float | None:
    return round(score, 3) if score is not None else None


def _format_label(detected_format: str | None) -> str | None:
    if detected_format in FORMAT_BY_ID:
        return FORMAT_BY_ID[detected_format].label
    return detected_format


def _inspect_file(req: InspectInputRequest, source: _ResolvedInput) -> InspectInputResponse:
    cols, rows, total_rows = _read_sample(source.path, source.suffix)

    # Text-based formats with no columns are unreadable — fail early rather
    # than letting the user advance to schema mapping with an empty inventory.
    if source.suffix in _SAMPLE_READERS and not cols:
        return _unsupported("No columns detected — file may be empty or malformed.")

    # ── Format detection ───────────────────────────────────────────────
    detected_format, confidence = _detect_format(cols, rows, source.suffix)

    # Apply user hints
    if req.user_hints.dataset_type and req.user_hints.dataset_type in FORMAT_BY_ID:
        detected_format = req.user_hints.dataset_type
        confidence = max(confidence, 0.9)

    is_supported = detected_format is not None
    field_inventory = [_field_inventory_entry(col, rows) for col in cols]

    # ── Compatibility scores ───────────────────────────────────────────
    maskott_score = _score_maskott(cols) if cols else None
    xapi_score = _score_xapi(cols, rows) if (cols or rows) else None

    # ── Maskott pre-mapped and missing required fields ─────────────────
    is_maskott = detected_format == "maskott_csv_v1"
    pre_mapped = _maskott_pre_mapping(cols) if is_maskott else {}
    missing_required = _maskott_missing_required(cols) if is_maskott else []

    return InspectInputResponse(
        detected_format=detected_format,
        detected_format_label=_format_label(detected_format),
        format_confidence=round(confidence, 3),
        row_count_estimate=total_rows,
        file_size_bytes=source.file_size,
        field_inventory=field_inventory,
        xapi_compatibility_score=_round_score(xapi_score),
        becomino_template_match_score=None,
        maskott_schema_match_score=_round_score(maskott_score),
        missing_required_fields=missing_required,
        detected_model_type=None,
        model_adapter_compatibility=None,
        risk_warnings=_risk_warnings(field_inventory, total_rows),
        recommended_next_step="confirm_mapping" if pre_mapped else "confirm_schema",
        is_supported=is_supported,
        unsupported_reason=None if is_supported else f"Unsupported file type: {source.suffix}",
        pre_mapped_fields=pre_mapped,
    )


def inspect(req: InspectInputRequest) -> InspectInputResponse:
    path_str = req.dataset_path or req.dataset_reference
    if not path_str:
        return _unsupported("No dataset path or reference provided.")

    resolved = (
        _resolve_remote_input(path_str) if _is_url(path_str) else _resolve_local_input(path_str)
    )
    if isinstance(resolved, InspectInputResponse):
        return resolved

    try:
        return _inspect_file(req, resolved)
    finally:
        if resolved.temp_path is not None:
            with contextlib.suppress(Exception):
                resolved.temp_path.unlink(missing_ok=True)
