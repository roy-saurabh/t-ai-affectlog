"""
Performance test: generate 1M synthetic rows, convert, profile.

Marked @pytest.mark.slow — excluded from default CI run.
Run explicitly: pytest -m slow
"""

import json
import time
import pytest
from pathlib import Path


@pytest.mark.slow
def test_generate_1m_rows(tmp_path):
    """Synthetic CSV generation must complete without OOM."""
    from scripts.generate_synthetic_maskott_csv import generate_csv
    out = tmp_path / "maskott_1m.csv"
    t0 = time.time()
    generate_csv(out, n_rows=1_000_000, seed=99)
    elapsed = time.time() - t0
    assert out.exists()
    line_count = sum(1 for _ in open(out)) - 1  # minus header
    assert line_count == 1_000_000
    # Should complete in under 5 minutes on a laptop
    assert elapsed < 300, f"Generation took {elapsed:.1f}s — too slow"


@pytest.mark.slow
def test_stream_convert_1m_rows(tmp_path):
    """CSV→JSONL streaming conversion must handle 1M rows without loading all into memory."""
    from scripts.generate_synthetic_maskott_csv import generate_csv
    from affectlog.transform.maskott_csv_to_xapi import convert_maskott_csv_to_xapi
    from affectlog.privacy.pseudonymizer import Pseudonymizer

    csv_path = tmp_path / "maskott_1m.csv"
    generate_csv(csv_path, n_rows=1_000_000, seed=42)

    jsonl_path = tmp_path / "maskott_1m.jsonl"
    pseudo = Pseudonymizer(secret="bench-secret", hash_fields=["EntityId", "_id", "EntityUaiCode", "ActivitySessionId"])

    t0 = time.time()
    summary = convert_maskott_csv_to_xapi(
        csv_path, jsonl_path,
        chunk_size=100_000,
        pseudonymizer=pseudo,
        allow_raw=False,
        progress=False,
    )
    elapsed = time.time() - t0

    assert jsonl_path.exists()
    assert summary["total_rows_out"] == 1_000_000
    assert summary["error_count"] == 0
    assert elapsed < 600, f"Conversion took {elapsed:.1f}s"

    # Spot-check: first line is valid JSON xAPI
    with open(jsonl_path) as f:
        first = json.loads(f.readline())
    assert "actor" in first
    assert "verb" in first
    # Raw EntityId must NOT appear
    content_first_10k = "\n".join(open(jsonl_path).read(10_000_000).split("\n")[:1000])
    assert "entity_" not in content_first_10k or pseudo is not None


@pytest.mark.slow
def test_profile_1m_jsonl(tmp_path):
    """Profiling 1M JSONL events must compute concentration and coverage."""
    from scripts.generate_synthetic_maskott_csv import generate_csv
    from affectlog.transform.maskott_csv_to_xapi import convert_maskott_csv_to_xapi
    from affectlog.metrics.concentration import compute_concentration
    from affectlog.metrics.coverage import compute_coverage

    csv_path = tmp_path / "maskott_1m.csv"
    generate_csv(csv_path, n_rows=1_000_000, seed=1)
    jsonl_path = tmp_path / "out.jsonl"
    convert_maskott_csv_to_xapi(csv_path, jsonl_path, chunk_size=100_000, progress=False)

    conc = compute_concentration(jsonl_path)
    assert conc["total_events"] == 1_000_000
    assert conc["actor_gini"] > 0
    assert conc["resource_gini"] > 0

    cov = compute_coverage(jsonl_path, k_values=[10])
    assert cov["total_events"] == 1_000_000
