"""
JSON-LD compliance graph export.

Generates a structured JSON-LD document covering:
- Dataset and fields
- Processing activities
- Pseudonymisation controls
- Metrics
- Risk findings
- Provenance
- GDPR / EU AI Act mappings
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional

from affectlog.core.time import now_iso


def build_compliance_graph(
    run_id: str,
    dataset_name: str,
    fields: list[str],
    privacy_report: Optional[dict[str, Any]] = None,
    metrics: Optional[dict[str, Any]] = None,
    stages: Optional[list[dict[str, Any]]] = None,
    config_hash: Optional[str] = None,
) -> dict[str, Any]:
    base_urn = f"urn:affectlog:run:{run_id}"

    nodes: list[dict[str, Any]] = []

    # Dataset node
    nodes.append({
        "@id": f"{base_urn}:dataset",
        "@type": ["Dataset", "dcat:Dataset"],
        "name": dataset_name,
        "schema": "maskott_csv_v1",
        "fields": [{"@id": f"{base_urn}:field:{f}", "@type": "DataField", "name": f} for f in fields],
        "gdpr:personalData": True,
        "gdpr:legalBasis": "legitimate_interest",
        "gdpr:pseudonymised": True,
    })

    # Pseudonymisation control
    if privacy_report:
        nodes.append({
            "@id": f"{base_urn}:pseudonymisation",
            "@type": "PseudonymisationControl",
            "method": "HMAC-SHA256",
            "fieldsApplied": privacy_report.get("fields_pseudonymised", []),
            "riskScore": privacy_report.get("risk_summary", {}).get("score"),
            "riskLevel": privacy_report.get("risk_summary", {}).get("level"),
            "allowRawIdentifiers": privacy_report.get("allow_raw_identifiers", False),
        })

    # Metrics nodes
    if metrics:
        nodes.append({
            "@id": f"{base_urn}:metrics",
            "@type": "Metric",
            "actorGini": metrics.get("actor_gini"),
            "resourceGini": metrics.get("resource_gini"),
            "sparsityRatio": metrics.get("sparsity_ratio"),
            "uniqueActors": metrics.get("unique_actors"),
            "uniqueResources": metrics.get("unique_resources"),
        })

    # Processing activity nodes (stages)
    if stages:
        for stage in stages:
            nodes.append({
                "@id": f"{base_urn}:stage:{stage['name']}",
                "@type": "ProcessingActivity",
                "name": stage["name"],
                "status": stage.get("status"),
                "start": stage.get("start"),
                "end": stage.get("end"),
                "inputArtifact": stage.get("input_artifact"),
                "outputArtifact": stage.get("output_artifact"),
                "recordsIn": stage.get("record_count_in"),
                "recordsOut": stage.get("record_count_out"),
            })

    # Provenance
    nodes.append({
        "@id": f"{base_urn}:provenance",
        "@type": "Provenance",
        "generatedAt": now_iso(),
        "generatedBy": "AffectLog ALT-AI",
        "configHash": config_hash,
        "runId": run_id,
        "euAiActAlignments": [
            "Annex IV Article 11 — technical documentation",
            "Annex IV Article 13 — transparency",
            "Annex IV Article 14 — human oversight",
        ],
        "gdprAlignments": [
            "Article 5(1)(f) — integrity and confidentiality",
            "Article 25 — data protection by design and by default",
            "Article 32 — security of processing",
        ],
    })

    graph: dict[str, Any] = {
        "@context": {
            "@base": "urn:affectlog:",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "dcat": "https://www.w3.org/ns/dcat#",
            "gdpr": "https://w3id.org/dpv/dpv-gdpr#",
            "xapi": "https://w3id.org/xapi/ontology#",
            "Dataset": "dcat:Dataset",
            "DataField": "https://schema.org/DataType",
            "ProcessingActivity": "gdpr:ProcessingActivity",
            "PseudonymisationControl": "gdpr:PseudonymisationControl",
            "Metric": "https://w3id.org/affectlog/ontology#Metric",
            "Provenance": "http://www.w3.org/ns/prov#Entity",
        },
        "@graph": nodes,
    }
    return graph


def export_jsonld(graph: dict[str, Any], output_path: Path | str) -> None:
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(graph, indent=2, ensure_ascii=False))
