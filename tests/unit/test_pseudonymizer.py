"""Tests: Pseudonymizer."""

import pytest
from affectlog.privacy.pseudonymizer import Pseudonymizer


def test_deterministic_hashing():
    p = Pseudonymizer(secret="test-secret", method="hmac_sha256")
    h1 = p.hash("EntityId", "entity_001")
    h2 = p.hash("EntityId", "entity_001")
    assert h1 == h2


def test_different_values_different_hashes():
    p = Pseudonymizer(secret="test-secret")
    h1 = p.hash("EntityId", "entity_001")
    h2 = p.hash("EntityId", "entity_002")
    assert h1 != h2


def test_empty_value_returns_empty():
    p = Pseudonymizer(secret="test-secret")
    assert p.hash("EntityId", "") == ""


def test_sha256_fallback_without_secret():
    p = Pseudonymizer(secret="", method="sha256")
    h = p.hash("EntityId", "entity_001")
    assert len(h) > 0
    assert h != "entity_001"


def test_raw_not_returned_by_default():
    p = Pseudonymizer(secret="test-secret")
    raw = "REAL_ENTITY_ID_XYZ"
    hashed = p.hash("EntityId", raw)
    assert raw not in hashed


def test_allow_raw_returns_original():
    p = Pseudonymizer(secret="test-secret", allow_raw=True)
    raw = "REAL_ENTITY_ID_XYZ"
    result = p.hash("EntityId", raw)
    assert result == raw


def test_process_dict_hashes_specified_fields():
    p = Pseudonymizer(secret="test-secret", hash_fields=["EntityId", "_id"])
    record = {"EntityId": "e001", "_id": "abc", "ResourceId": "r001"}
    out = p.process_dict(record)
    assert out["EntityId"] != "e001"
    assert out["_id"] != "abc"
    assert out["ResourceId"] == "r001"  # not in hash_fields


def test_from_recipe_factory():
    cfg = {
        "method": "hmac_sha256",
        "hash_fields": ["EntityId"],
        "suppress_fields": [],
        "allow_raw_identifiers": False,
    }
    p = Pseudonymizer.from_recipe(cfg, secret="test-secret")
    assert p.hash("EntityId", "x") != "x"
