"""ODRL policy stub for PDC integration."""

from __future__ import annotations

from typing import Any


def build_odrl_policy(
    policy_id: str,
    asset_id: str,
    assigner: str = "AffectLog",
    permissions: list[str] | None = None,
    prohibitions: list[str] | None = None,
) -> dict[str, Any]:
    return {
        "@context": "http://www.w3.org/ns/odrl.jsonld",
        "@type": "Policy",
        "@id": policy_id,
        "uid": policy_id,
        "assigner": {"uid": assigner},
        "permission": [
            {"action": p, "target": {"uid": asset_id}}
            for p in (permissions or ["use"])
        ],
        "prohibition": [
            {"action": p, "target": {"uid": asset_id}}
            for p in (prohibitions or ["redistribute"])
        ],
    }
