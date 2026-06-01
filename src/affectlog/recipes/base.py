"""Recipe data model."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class PrivacyConfig:
    pseudonymize: bool = True
    method: str = "hmac_sha256"
    hash_fields: list[str] = field(default_factory=lambda: ["_id", "EntityId", "EntityUaiCode", "ActivitySessionId"])
    suppress_fields: list[str] = field(default_factory=list)
    redact_fields: list[str] = field(default_factory=list)
    allow_raw_identifiers: bool = False


@dataclass
class XAPIConfig:
    verb_default: str = "accessed"
    verb_mapping: dict[str, str] = field(default_factory=dict)
    resource_id_field: str = "ResourceId"
    actor_field: str = "EntityId"
    timestamp_field: str = "AccessDate"


@dataclass
class MetricsConfig:
    coverage_k: list[int] = field(default_factory=lambda: [10, 20, 50])
    dominance_top_percent: list[float] = field(default_factory=lambda: [1.0, 5.0, 10.0])
    profile_verbs: bool = True
    profile_temporal: bool = True


@dataclass
class ComplianceConfig:
    export_jsonld: bool = True
    export_data_card: bool = True
    export_sop: bool = True
    export_field_inventory: bool = True
    export_model_card: bool = False


@dataclass
class Recipe:
    name: str
    input_schema: str
    source_platform: str
    mode: str = "dataset_only"
    privacy: PrivacyConfig = field(default_factory=PrivacyConfig)
    xapi: XAPIConfig = field(default_factory=XAPIConfig)
    metrics: MetricsConfig = field(default_factory=MetricsConfig)
    compliance: ComplianceConfig = field(default_factory=ComplianceConfig)
    raw: dict[str, Any] = field(default_factory=dict)
