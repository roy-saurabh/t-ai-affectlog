"""Tests: Maskott CSV schema validation."""

import pytest
from pathlib import Path

FIXTURE = Path(__file__).parent.parent / "fixtures" / "maskott_small.csv"


def test_valid_maskott_csv(tmp_path):
    from affectlog.ingest.validators import validate_schema
    result = validate_schema(FIXTURE, "maskott_csv_v1")
    assert result["valid"] is True
    assert result["missing_columns"] == []


def test_missing_columns_detected(tmp_path):
    bad_csv = tmp_path / "bad.csv"
    bad_csv.write_text("_id,AccessDate\nfoo,2024-01-01T00:00:00Z\n")
    from affectlog.ingest.validators import validate_schema
    result = validate_schema(bad_csv, "maskott_csv_v1")
    assert result["valid"] is False
    assert len(result["missing_columns"]) > 0


def test_extra_columns_reported(tmp_path):
    from affectlog.ingest.large_file import MASKOTT_REQUIRED_COLUMNS
    all_cols = MASKOTT_REQUIRED_COLUMNS + ["ExtraCol1", "ExtraCol2"]
    header = ",".join(all_cols)
    row = ",".join(["val"] * len(all_cols))
    csv_path = tmp_path / "extra.csv"
    csv_path.write_text(f"{header}\n{row}\n")
    from affectlog.ingest.validators import validate_schema
    result = validate_schema(csv_path, "maskott_csv_v1")
    assert result["valid"] is True
    assert "ExtraCol1" in result["extra_columns"]


def test_unknown_schema_returns_error():
    from affectlog.ingest.validators import validate_schema
    result = validate_schema(FIXTURE, "nonexistent_schema_v99")
    assert result["valid"] is False
    assert "error" in result
