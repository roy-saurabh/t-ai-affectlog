"""
Secure token generation and storage.

Activation tokens expire in 24 h.
Password-reset tokens expire in 30 min.
All tokens are stored as SHA-256 hashes; plaintext is emailed once.
"""
from __future__ import annotations

import hashlib
import secrets
from datetime import UTC, datetime, timedelta


def generate_token(n_bytes: int = 32) -> tuple[str, str]:
    """Return (plaintext, sha256_hex_hash) pair."""
    plain = secrets.token_urlsafe(n_bytes)
    digest = hashlib.sha256(plain.encode()).hexdigest()
    return plain, digest


def hash_token(plain: str) -> str:
    return hashlib.sha256(plain.encode()).hexdigest()


def activation_expiry() -> datetime:
    from affectlog.config import get_settings
    ttl = get_settings().activation_token_ttl_seconds
    return datetime.now(UTC) + timedelta(seconds=ttl)


def password_reset_expiry() -> datetime:
    from affectlog.config import get_settings
    ttl = get_settings().password_reset_token_ttl_seconds
    return datetime.now(UTC) + timedelta(seconds=ttl)


def is_expired(expires_at: datetime) -> bool:
    # Normalise to offset-aware before comparing (SQLite returns naive datetimes).
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    return datetime.now(UTC) > expires_at
