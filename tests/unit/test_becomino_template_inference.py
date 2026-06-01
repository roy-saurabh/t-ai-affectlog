"""Tests: Becomino template inference."""

import json
import pytest
from pathlib import Path

FIXTURE = Path(__file__).parent.parent / "fixtures" / "becomino_sample.json"


def test_infer_template_from_sample(tmp_path):
    from affectlog.transform.becomino_template import infer_becomino_template
    template = infer_becomino_template(FIXTURE, tmp_path / "template.json")
    assert "id_path" in template
    assert "timestamp_path" in template
    assert "verb_path" in template
    assert "actor_path" in template
    assert (tmp_path / "template.json").exists()


def test_fallback_template_when_no_sample():
    from affectlog.transform.becomino_template import infer_becomino_template, DEFAULT_TEMPLATE
    template = infer_becomino_template(sample_path=None)
    assert template["_meta"]["source"] == "affectlog_default"
    assert "id_path" in template


def test_fallback_when_nonexistent_sample():
    from affectlog.transform.becomino_template import infer_becomino_template
    template = infer_becomino_template(sample_path="/nonexistent/path.json")
    assert template["_meta"]["source"] == "affectlog_default"


def test_inferred_template_has_correct_paths():
    from affectlog.transform.becomino_template import infer_becomino_template
    template = infer_becomino_template(FIXTURE)
    # Sample has "statements" array with xAPI structure
    assert template["id_path"] == "id"
    assert "timestamp" in template["timestamp_path"]
