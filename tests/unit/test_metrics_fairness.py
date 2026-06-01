"""Tests: Fairness / representation metrics."""

import json
import pytest
from affectlog.metrics.fairness import compute_fairness, compute_representation
from affectlog.metrics.representation import representation_index


def test_representation_equal_groups():
    groups = {"A": 100, "B": 100, "C": 100}
    ri = representation_index(groups)
    assert abs(ri["A"] - 1.0) < 0.01
    assert abs(ri["B"] - 1.0) < 0.01


def test_representation_unequal_groups():
    groups = {"A": 300, "B": 100, "C": 100}
    ri = representation_index(groups)
    assert ri["A"] > 1.0  # over-represented
    assert ri["B"] < 1.0  # under-represented


def test_fairness_from_jsonl(tmp_path):
    events = [
        {"context": {"contextActivities": {"category": [{"id": "GROUP_SESSION"}]}}},
        {"context": {"contextActivities": {"category": [{"id": "GROUP_SESSION"}]}}},
        {"context": {"contextActivities": {"category": [{"id": "TEST"}]}}},
    ]
    p = tmp_path / "f.jsonl"
    p.write_text("\n".join(json.dumps(e) for e in events))
    result = compute_fairness(p)
    assert "groups" in result
    assert "GROUP_SESSION" in result["groups"]
    assert result["groups"]["GROUP_SESSION"] == 2


def test_compute_representation_empty():
    assert compute_representation({}) == {}
