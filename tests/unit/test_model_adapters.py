"""Tests: Model adapters."""

import numpy as np
import pytest
from affectlog.models.dummy_adapter import DummyAdapter


def test_dummy_predict():
    adapter = DummyAdapter(n_classes=2)
    X = np.array([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
    preds = adapter.predict(X)
    assert len(preds) == 2
    assert all(p == 0 for p in preds)


def test_dummy_predict_proba():
    adapter = DummyAdapter(n_classes=3)
    X = np.array([[1.0, 2.0, 3.0]])
    proba = adapter.predict_proba(X)
    assert len(proba) == 1
    assert len(proba[0]) == 3
    assert abs(sum(proba[0]) - 1.0) < 0.001


def test_dummy_metadata():
    adapter = DummyAdapter(feature_names=["a", "b", "c"])
    meta = adapter.metadata()
    assert meta["adapter"] == "dummy"
    assert "a" in meta["feature_names"]


def test_dummy_is_classifier():
    adapter = DummyAdapter()
    assert adapter.is_classifier() is True


def test_sklearn_adapter_from_fixture(tmp_path):
    """Create a tiny sklearn model, save it, load via SklearnAdapter."""
    try:
        from sklearn.linear_model import LogisticRegression
        import joblib
        X = np.array([[1, 0], [0, 1], [1, 1], [0, 0]])
        y = np.array([1, 0, 1, 0])
        model = LogisticRegression(max_iter=200).fit(X, y)
        model_path = tmp_path / "lr.joblib"
        joblib.dump(model, model_path)
        from affectlog.models.sklearn_adapter import SklearnAdapter
        adapter = SklearnAdapter.from_file(model_path)
        preds = adapter.predict(X)
        assert len(preds) == 4
        assert adapter.is_classifier()
    except ImportError:
        pytest.skip("scikit-learn not installed")
