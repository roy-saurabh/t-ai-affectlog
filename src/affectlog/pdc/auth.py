"""PDC authentication helpers (stub)."""

from __future__ import annotations

from typing import Optional


def get_bearer_token(pdc_url: str, client_id: str, client_secret: str) -> Optional[str]:
    """Obtain a bearer token from the PDC OAuth endpoint (stub)."""
    # In production: POST to pdc_url/oauth/token with client credentials
    return None
