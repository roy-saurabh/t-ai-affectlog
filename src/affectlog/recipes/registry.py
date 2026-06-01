"""Recipe registry: discover and load recipes by name."""

from __future__ import annotations

from pathlib import Path

from affectlog.recipes.base import Recipe
from affectlog.recipes.loader import load_recipe


RECIPE_SEARCH_DIRS: list[Path] = [
    Path("configs/recipes"),
    Path("~/.affectlog/recipes").expanduser(),
]


def find_recipe_path(name: str) -> Path:
    for d in RECIPE_SEARCH_DIRS:
        candidate = d / f"{name}.yaml"
        if candidate.exists():
            return candidate
    raise FileNotFoundError(f"Recipe '{name}' not found in: {RECIPE_SEARCH_DIRS}")


def get_recipe(name_or_path: str) -> Recipe:
    p = Path(name_or_path)
    if p.exists():
        return load_recipe(p)
    return load_recipe(find_recipe_path(name_or_path))
