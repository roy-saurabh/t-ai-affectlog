"""Pseudonymizer: SHA-256 / HMAC-SHA256 / redaction / suppression."""

from __future__ import annotations

import logging
from typing import Any, Optional

from affectlog.core.hashing import hmac_sha256, sha256_hash

logger = logging.getLogger(__name__)

METHOD_SHA256 = "sha256"
METHOD_HMAC = "hmac_sha256"
METHOD_REDACT = "redact"
METHOD_SUPPRESS = "suppress"


class Pseudonymizer:
    """Apply configurable pseudonymisation to field values."""

    def __init__(
        self,
        secret: str = "",
        method: str = METHOD_HMAC,
        salt: str = "affectlog",
        hash_fields: Optional[list[str]] = None,
        suppress_fields: Optional[list[str]] = None,
        redact_fields: Optional[list[str]] = None,
        allow_raw: bool = False,
    ) -> None:
        self._secret = secret
        self._method = method
        self._salt = salt
        self._hash_fields: set[str] = set(hash_fields or [])
        self._suppress_fields: set[str] = set(suppress_fields or [])
        self._redact_fields: set[str] = set(redact_fields or [])
        self._allow_raw = allow_raw

        if not secret and method == METHOD_HMAC:
            logger.warning("Pseudonymizer: HMAC secret is empty — using SHA-256 fallback.")
            self._method = METHOD_SHA256

    def hash(self, field_name: str, value: str) -> str:
        """Return a pseudonymised version of *value* for the given field."""
        if not value:
            return ""
        if field_name in self._suppress_fields:
            return ""
        if field_name in self._redact_fields:
            return "[REDACTED]"
        if self._allow_raw:
            return value
        if self._method == METHOD_HMAC and self._secret:
            return hmac_sha256(value, self._secret)[:32]
        return sha256_hash(value, self._salt)[:32]

    def process_dict(self, record: dict[str, Any]) -> dict[str, Any]:
        """Apply pseudonymisation to all hash_fields found in *record*."""
        out = dict(record)
        for field in self._hash_fields:
            if field in out and out[field] is not None:
                out[field] = self.hash(field, str(out[field]))
            elif field in self._suppress_fields:
                out[field] = None
        return out

    @classmethod
    def from_recipe(cls, privacy_cfg: dict[str, Any], secret: str = "") -> "Pseudonymizer":
        return cls(
            secret=secret,
            method=privacy_cfg.get("method", METHOD_HMAC),
            salt=privacy_cfg.get("salt", "affectlog"),
            hash_fields=privacy_cfg.get("hash_fields", []),
            suppress_fields=privacy_cfg.get("suppress_fields", []),
            redact_fields=privacy_cfg.get("redact_fields", []),
            allow_raw=privacy_cfg.get("allow_raw_identifiers", False),
        )
