# ADR 0003 — Privacy-by-Default: HMAC-SHA256 Pseudonymisation

**Status:** Accepted

## Context

Raw personal identifiers (EntityId, EntityUaiCode, ActivitySessionId, _id) must never appear in public output artifacts.

## Decision

1. `allow_raw_identifiers` defaults to `false` in all recipes and configs.
2. HMAC-SHA256 with project salt is the default pseudonymisation method.
3. The hash secret (`AFFECTLOG_HASH_SECRET`) is loaded from environment, never from config files.
4. Any path that produces output with raw identifiers in default mode is treated as a security bug.
5. Dashboard renders only hashed/truncated identifiers.

## Consequences

- Privacy defaults are enforced at the SecurityLayer, before any output is written.
- Reproducibility is maintained: same input + same secret = same hashes.
- Secrets must be rotated when changing pseudonymisation (hashes will change).
