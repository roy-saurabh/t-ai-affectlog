"""Tests: CSV to xAPI transformation."""

import json
from pathlib import Path

FIXTURE = Path(__file__).parent.parent / "fixtures" / "maskott_small.csv"


def test_conversion_produces_jsonl(tmp_path):
    from affectlog.transform.maskott_csv_to_xapi import convert_maskott_csv_to_xapi

    output = tmp_path / "out.jsonl"
    summary = convert_maskott_csv_to_xapi(FIXTURE, output, chunk_size=100)
    assert output.exists()
    assert summary["total_rows_out"] > 0
    # Verify JSONL format
    lines = output.read_text().strip().split("\n")
    assert len(lines) == summary["total_rows_out"]
    first = json.loads(lines[0])
    assert "actor" in first
    assert "verb" in first
    assert "object" in first
    assert "timestamp" in first


def test_no_raw_entity_ids_in_default_output(tmp_path):
    """Raw EntityId must not appear in default (pseudonymised) output."""
    import polars as pl

    from affectlog.privacy.pseudonymizer import Pseudonymizer
    from affectlog.transform.maskott_csv_to_xapi import convert_maskott_csv_to_xapi

    # Get a real EntityId from the fixture
    df = pl.read_csv(FIXTURE, n_rows=5)
    raw_ids = df["EntityId"].to_list()

    output = tmp_path / "out.jsonl"
    pseudo = Pseudonymizer(
        secret="test-secret", hash_fields=["EntityId", "_id", "EntityUaiCode", "ActivitySessionId"]
    )
    convert_maskott_csv_to_xapi(FIXTURE, output, pseudonymizer=pseudo, chunk_size=100)
    content = output.read_text()
    for raw_id in raw_ids:
        if raw_id:
            assert raw_id not in content, f"Raw EntityId '{raw_id}' found in output!"


def test_duration_converted_to_iso8601(tmp_path):
    from affectlog.transform.maskott_csv_to_xapi import convert_maskott_csv_to_xapi

    output = tmp_path / "out.jsonl"
    convert_maskott_csv_to_xapi(FIXTURE, output, chunk_size=100)
    lines = [json.loads(ln) for ln in output.read_text().strip().split("\n")]
    # At least some durations should be PT...S format
    durations = [
        ln.get("result", {}).get("duration") for ln in lines if ln.get("result", {}).get("duration")
    ]
    if durations:
        assert any(d.startswith("PT") for d in durations if d)


def test_actor_anonymous_when_flag_true():
    """When IsViewerAnonymous is true, actor.name should be 'anonymous'."""
    from affectlog.transform.maskott_csv_to_xapi import row_to_xapi

    row = {
        "_id": "abc123",
        "AccessDate": "2024-01-01T00:00:00Z",
        "ViewContext": "GROUP_SESSION",
        "ResourceId": "res1",
        "ResourceType": "ACTIVITY",
        "CollectionId": "",
        "ActivitySessionId": "sess1",
        "Duration": "60",
        "EntityId": "REAL_ENTITY_ID",
        "EntityUaiCode": "UAI001",
        "IsViewerAuthor": False,
        "IsViewerAnonymous": True,
    }
    stmt = row_to_xapi(row, allow_raw=True)
    assert stmt["actor"]["account"]["name"] == "anonymous"


def test_row_has_source_metadata():
    from affectlog.transform.maskott_csv_to_xapi import row_to_xapi

    row = {
        "_id": "abc",
        "AccessDate": "2024-01-01T00:00:00Z",
        "ViewContext": "TEST",
        "ResourceId": "r1",
        "ResourceType": "QUIZ",
        "CollectionId": "c1",
        "ActivitySessionId": "s1",
        "Duration": "30",
        "EntityId": "e1",
        "EntityUaiCode": "u1",
        "IsViewerAuthor": False,
        "IsViewerAnonymous": False,
    }
    stmt = row_to_xapi(row, allow_raw=True)
    assert stmt["source"]["platform"] == "Maskott/Tactileo"
    assert stmt["source"]["schema"] == "maskott_csv_v1"
