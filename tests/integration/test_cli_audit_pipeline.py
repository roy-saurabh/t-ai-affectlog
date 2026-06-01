"""Integration tests: end-to-end CLI audit pipeline."""

import json
import subprocess
import sys
import pytest
from pathlib import Path

FIXTURE = Path(__file__).parent.parent / "fixtures" / "maskott_small.csv"
REPO_ROOT = Path(__file__).parent.parent.parent
RECIPE = REPO_ROOT / "configs" / "recipes" / "maskott_tactileo.yaml"


@pytest.mark.integration
def test_cli_validate_csv(tmp_path):
    result = subprocess.run(
        [sys.executable, "-m", "affectlog.cli", "validate-csv",
         "--input", str(FIXTURE), "--schema", "maskott_csv_v1"],
        capture_output=True, text=True, cwd=str(REPO_ROOT),
    )
    assert result.returncode == 0 or "VALID" in result.stdout + result.stderr


@pytest.mark.integration
def test_cli_convert_csv(tmp_path):
    if not RECIPE.exists():
        pytest.skip("Recipe not found — run from repo root")
    output = tmp_path / "out.jsonl"
    result = subprocess.run(
        [sys.executable, "-m", "affectlog.cli", "convert-csv",
         "--input", str(FIXTURE),
         "--recipe", str(RECIPE),
         "--output", str(output),
         "--chunk-size", "100"],
        capture_output=True, text=True, cwd=str(REPO_ROOT),
    )
    assert output.exists(), f"JSONL output not created. stderr: {result.stderr}\nstdout: {result.stdout}"
    lines = [ln for ln in output.read_text().strip().split("\n") if ln]
    assert len(lines) > 0, f"Output is empty. stderr: {result.stderr}"
    first = json.loads(lines[0])
    assert "actor" in first
