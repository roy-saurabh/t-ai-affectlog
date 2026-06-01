"""Tests: ExplanationGenerator."""

import numpy as np
import pytest
from affectlog.models.dummy_adapter import DummyAdapter
from affectlog.explanations.generator import ExplanationGenerator
from affectlog.explanations.feature_importance import permutation_importance


def test_permutation_importance_returns_features():
    adapter = DummyAdapter(feature_names=["f0", "f1", "f2"])
    X = np.random.rand(50, 3)
    y = np.zeros(50)
    result = permutation_importance(adapter, X, y, n_repeats=2)
    assert "feature_importance" in result
    assert len(result["feature_importance"]) == 3
    assert all("feature" in fi for fi in result["feature_importance"])


def test_explanation_generator_generates():
    adapter = DummyAdapter(n_classes=2, feature_names=["x", "y", "z"])
    X = np.random.rand(10, 3)
    gen = ExplanationGenerator(adapter)
    # Without y, falls back to SHAP (which will fail gracefully) then returns dummy explanation
    # We just test it doesn't crash
    try:
        exp = gen.generate_feature_importance(X, y=np.zeros(10), method="permutation", n_repeats=2)
        assert "feature_importance" in exp
    except Exception as e:
        pytest.fail(f"generate_feature_importance raised unexpectedly: {e}")


def test_compare_models():
    from affectlog.explanations.comparison import compare_models
    a1 = DummyAdapter(n_classes=2)
    a2 = DummyAdapter(n_classes=2)
    X = np.ones((10, 3))
    y = np.zeros(10)
    results = compare_models([a1, a2], X, y)
    assert len(results) == 2
    assert "accuracy" in results[0]
