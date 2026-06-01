"""Tests: Recipe loader."""

import pytest
from pathlib import Path

RECIPE_PATH = Path("configs/recipes/maskott_tactileo.yaml")


def test_load_maskott_recipe():
    if not RECIPE_PATH.exists():
        pytest.skip("Recipe file not present (run from repo root)")
    from affectlog.recipes.loader import load_recipe
    recipe = load_recipe(RECIPE_PATH)
    assert recipe.name == "maskott_tactileo"
    assert recipe.input_schema == "maskott_csv_v1"
    assert recipe.privacy.pseudonymize is True
    assert "EntityId" in recipe.privacy.hash_fields
    assert recipe.privacy.allow_raw_identifiers is False


def test_recipe_compliance_flags():
    if not RECIPE_PATH.exists():
        pytest.skip("Recipe file not present")
    from affectlog.recipes.loader import load_recipe
    recipe = load_recipe(RECIPE_PATH)
    assert recipe.compliance.export_jsonld is True
    assert recipe.compliance.export_sop is True


def test_invalid_recipe_raises():
    from affectlog.recipes.loader import load_recipe
    from affectlog.exceptions import RecipeNotFoundError
    with pytest.raises(RecipeNotFoundError):
        load_recipe("/nonexistent/recipe.yaml")
