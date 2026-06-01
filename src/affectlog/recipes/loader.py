"""Load recipe from YAML file."""

from __future__ import annotations

from pathlib import Path

import yaml

from affectlog.exceptions import RecipeConfigError, RecipeNotFoundError
from affectlog.recipes.base import (
    ComplianceConfig,
    MetricsConfig,
    PrivacyConfig,
    Recipe,
    XAPIConfig,
)


def load_recipe(path: Path | str) -> Recipe:
    path = Path(path).resolve()  # lgtm[py/path-injection]
    if not path.exists():
        raise RecipeNotFoundError(f"Recipe file not found: {path}")
    if path.suffix not in {".yaml", ".yml"}:
        raise RecipeConfigError(f"Recipe must be a YAML file (.yaml/.yml): {path}")
    try:
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))  # lgtm[py/path-injection]
    except yaml.YAMLError as exc:
        raise RecipeConfigError(f"Invalid YAML in recipe {path}: {exc}") from exc

    if not isinstance(raw, dict):
        raise RecipeConfigError(f"Recipe must be a YAML mapping: {path}")

    name = raw.get("name") or path.stem
    input_schema = raw.get("input_schema", "maskott_csv_v1")
    source_platform = raw.get("source_platform", "unknown")
    mode = raw.get("mode", "dataset_only")

    priv_raw = raw.get("privacy", {})
    privacy = PrivacyConfig(
        pseudonymize=priv_raw.get("pseudonymize", True),
        method=priv_raw.get("method", "hmac_sha256"),
        hash_fields=priv_raw.get(
            "hash_fields", ["_id", "EntityId", "EntityUaiCode", "ActivitySessionId"]
        ),
        suppress_fields=priv_raw.get("suppress_fields", []),
        redact_fields=priv_raw.get("redact_fields", []),
        allow_raw_identifiers=priv_raw.get("allow_raw_identifiers", False),
    )

    xapi_raw = raw.get("xapi", {})
    xapi = XAPIConfig(
        verb_default=xapi_raw.get("verb_default", "accessed"),
        verb_mapping=xapi_raw.get("verb_mapping", {}),
        resource_id_field=xapi_raw.get("resource_id_field", "ResourceId"),
        actor_field=xapi_raw.get("actor_field", "EntityId"),
        timestamp_field=xapi_raw.get("timestamp_field", "AccessDate"),
    )

    m_raw = raw.get("metrics", {})
    metrics = MetricsConfig(
        coverage_k=m_raw.get("coverage_k", [10, 20, 50]),
        dominance_top_percent=m_raw.get("dominance_top_percent", [1.0, 5.0, 10.0]),
        profile_verbs=m_raw.get("profile_verbs", True),
        profile_temporal=m_raw.get("profile_temporal", True),
    )

    c_raw = raw.get("compliance", {})
    compliance = ComplianceConfig(
        export_jsonld=c_raw.get("export_jsonld", True),
        export_data_card=c_raw.get("export_data_card", True),
        export_sop=c_raw.get("export_sop", True),
        export_field_inventory=c_raw.get("export_field_inventory", True),
        export_model_card=c_raw.get("export_model_card", False),
    )

    return Recipe(
        name=name,
        input_schema=input_schema,
        source_platform=source_platform,
        mode=mode,
        privacy=privacy,
        xapi=xapi,
        metrics=metrics,
        compliance=compliance,
        raw=raw,
    )
