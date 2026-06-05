"""
Password hashing with Argon2id via argon2-cffi.

Policy: minimum 12 characters enforced at schema validation level.
Never store plaintext passwords; pepper is mixed in before hashing.
"""

from __future__ import annotations

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from affectlog.config import get_settings

_ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16,
)


def _peppered(password: str) -> str:
    pepper = get_settings().password_pepper
    if not pepper:
        return password
    # Pepper is prepended as a server-side secret; Argon2id is the actual KDF.
    return f"{pepper}:{password}"


def hash_password(plain: str) -> str:
    return _ph.hash(_peppered(plain))


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return _ph.verify(hashed, _peppered(plain))
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def needs_rehash(hashed: str) -> bool:
    return _ph.check_needs_rehash(hashed)
