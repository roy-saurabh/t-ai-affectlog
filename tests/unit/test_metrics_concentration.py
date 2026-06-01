"""Tests: Gini index and concentration metrics."""

import json
import math
import pytest
from affectlog.metrics.concentration import gini_index, compute_concentration


def test_gini_uniform():
    counts = [10, 10, 10, 10, 10]
    assert abs(gini_index(counts)) < 0.001  # ~0 for uniform


def test_gini_monopoly():
    counts = [0, 0, 0, 0, 100]
    g = gini_index(counts)
    assert g > 0.6  # high concentration


def test_gini_all_zeros():
    assert gini_index([0, 0, 0]) == 0.0


def test_gini_single_value():
    assert gini_index([100]) == 0.0


def test_compute_concentration_from_jsonl(tmp_path):
    events = [
        {"actor": {"account": {"name": "u1"}}, "object": {"id": "r1"}},
        {"actor": {"account": {"name": "u1"}}, "object": {"id": "r2"}},
        {"actor": {"account": {"name": "u2"}}, "object": {"id": "r1"}},
        {"actor": {"account": {"name": "u3"}}, "object": {"id": "r3"}},
    ]
    p = tmp_path / "test.jsonl"
    p.write_text("\n".join(json.dumps(e) for e in events))
    result = compute_concentration(p)
    assert result["unique_actors"] == 3
    assert result["unique_resources"] == 3
    assert "actor_gini" in result
    assert 0 <= result["actor_gini"] <= 1
    assert 0 <= result["resource_gini"] <= 1
