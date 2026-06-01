"""Deterministic hashing utilities used throughout the privacy layer."""

from __future__ import annotations

import hashlib
import hmac
import os


def sha256_hash(value: str, salt: str = "") -> str:
    """SHA-256 hash with optional salt prefix."""
    payload = (salt + value).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def hmac_sha256(value: str, secret: str) -> str:
    """HMAC-SHA256 keyed hash."""
    key = secret.encode("utf-8")
    return hmac.new(key, value.encode("utf-8"), hashlib.sha256).hexdigest()


def config_hash(config_dict: dict) -> str:  # type: ignore[type-arg]
    """Stable hash of a configuration dict for reproducibility records."""
    import json

    canonical = json.dumps(config_dict, sort_keys=True, ensure_ascii=True)
    return hashlib.sha256(canonical.encode()).hexdigest()[:16]


def file_hash(path: str) -> str:
    """SHA-256 of a file's contents (streaming)."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()
