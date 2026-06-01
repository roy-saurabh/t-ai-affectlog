"""Tests: PII detection."""

import pytest
from affectlog.privacy.pii_detector import is_pii_field, scan_field_names, scan_sample_values


def test_entity_id_is_pii():
    assert is_pii_field("EntityId") is True


def test_resource_id_is_not_pii():
    assert is_pii_field("ResourceId") is False


def test_email_is_pii():
    assert is_pii_field("email") is True
    assert is_pii_field("user_email") is True


def test_scan_field_names_finds_pii():
    fields = ["EntityId", "ResourceId", "AccessDate", "EntityUaiCode", "ActivitySessionId"]
    findings = scan_field_names(fields)
    found_names = {f["field"] for f in findings}
    assert "EntityId" in found_names
    assert "EntityUaiCode" in found_names
    assert "ActivitySessionId" in found_names
    assert "ResourceId" not in found_names


def test_scan_sample_values_detects_email():
    record = {"field1": "user@example.com", "field2": "not-an-email"}
    findings = scan_sample_values(record)
    assert any(f["type"] == "email" for f in findings)


def test_scan_sample_values_detects_ip():
    record = {"field1": "192.168.1.100"}
    findings = scan_sample_values(record)
    assert any(f["type"] == "ip_address" for f in findings)
