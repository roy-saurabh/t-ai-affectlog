"""Tests: JSON-LD compliance graph export."""

import json
import pytest
from affectlog.compliance.jsonld import build_compliance_graph, export_jsonld


def test_compliance_graph_structure():
    graph = build_compliance_graph(
        run_id="test_run_001",
        dataset_name="TestDataset",
        fields=["_id", "EntityId", "AccessDate"],
    )
    assert "@context" in graph
    assert "@graph" in graph
    assert isinstance(graph["@graph"], list)


def test_compliance_graph_has_provenance():
    graph = build_compliance_graph("run_xyz", "DS", ["f1"])
    prov_nodes = [n for n in graph["@graph"] if n.get("@type") == "Provenance"]
    assert len(prov_nodes) >= 1
    assert prov_nodes[0]["runId"] == "run_xyz"


def test_export_jsonld_writes_file(tmp_path):
    graph = build_compliance_graph("run_test", "DS", [])
    out = tmp_path / "graph.jsonld"
    export_jsonld(graph, out)
    assert out.exists()
    loaded = json.loads(out.read_text())
    assert "@graph" in loaded


def test_compliance_graph_includes_privacy_when_provided():
    privacy_report = {
        "fields_pseudonymised": ["EntityId"],
        "allow_raw_identifiers": False,
        "risk_summary": {"score": 3.0, "level": "medium"},
    }
    graph = build_compliance_graph(
        "run_p",
        "DS",
        ["EntityId"],
        privacy_report=privacy_report,
    )
    pseudo_nodes = [n for n in graph["@graph"] if n.get("@type") == "PseudonymisationControl"]
    assert len(pseudo_nodes) >= 1
    assert pseudo_nodes[0]["riskLevel"] == "medium"
