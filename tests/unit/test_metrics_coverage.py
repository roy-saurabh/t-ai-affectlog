"""Tests: Coverage@K metrics."""

import json
import pytest
from affectlog.metrics.coverage import compute_coverage


def test_coverage_all_popular(tmp_path):
    """All resources accessed by 5+ actors."""
    events = []
    for r in ["r1", "r2", "r3"]:
        for u in ["u1", "u2", "u3", "u4", "u5"]:
            events.append({"actor": {"account": {"name": u}}, "object": {"id": r}})
    p = tmp_path / "test.jsonl"
    p.write_text("\n".join(json.dumps(e) for e in events))
    result = compute_coverage(p, k_values=[1, 5])
    assert result["coverage_at_k"]["k=1"]["coverage_fraction"] == 1.0
    assert result["coverage_at_k"]["k=5"]["coverage_fraction"] == 1.0


def test_coverage_tail_resources(tmp_path):
    """Some resources only accessed by 1 actor."""
    events = [
        {"actor": {"account": {"name": "u1"}}, "object": {"id": "r1"}},
        {"actor": {"account": {"name": "u2"}}, "object": {"id": "r1"}},
        {"actor": {"account": {"name": "u1"}}, "object": {"id": "r2"}},  # r2 only u1
    ]
    p = tmp_path / "test.jsonl"
    p.write_text("\n".join(json.dumps(e) for e in events))
    result = compute_coverage(p, k_values=[1, 2])
    # k=1: both r1 and r2 covered (both have >= 1 actor)
    assert result["coverage_at_k"]["k=1"]["coverage_fraction"] == 1.0
    # k=2: only r1 covered (r2 has only 1 actor)
    assert result["coverage_at_k"]["k=2"]["coverage_fraction"] < 1.0


def test_coverage_empty(tmp_path):
    p = tmp_path / "empty.jsonl"
    p.write_text("")
    result = compute_coverage(p)
    assert result["unique_resources"] == 0
