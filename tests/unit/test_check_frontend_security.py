"""Tests for the React Router advisory regression guard.

Covers GHSA-jjmj-jmhj-qwj2 / CVE-2026-53668 range detection, semantic-version
comparison and fail-closed behaviour on malformed lockfiles.
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT = REPO_ROOT / "scripts" / "check_frontend_security.py"

_spec = importlib.util.spec_from_file_location("check_frontend_security", SCRIPT)
assert _spec is not None and _spec.loader is not None
guard = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(guard)


def write_lock(tmp_path: Path, packages: dict) -> Path:
    lockfile = tmp_path / "package-lock.json"
    lockfile.write_text(
        json.dumps({"name": "affectlog-ui", "lockfileVersion": 3, "packages": packages}),
        encoding="utf-8",
    )
    return lockfile


def lock_with(tmp_path: Path, **versions: str) -> Path:
    packages = {"": {"name": "affectlog-ui"}}
    for name, version in versions.items():
        packages[f"node_modules/{name.replace('_', '-')}"] = {"version": version}
    return write_lock(tmp_path, packages)


# ── semantic-version comparison ──────────────────────────────────────────────


@pytest.mark.parametrize(
    ("left", "right", "expected"),
    [
        ("6.30.1", "6.30.2", -1),
        ("6.30.2", "6.30.2", 0),
        ("6.30.4", "6.30.2", 1),
        ("6.9.0", "6.30.0", -1),  # numeric, not lexicographic
        ("7.13.0", "7.9.6", 1),
        ("7.18.1", "7.12.0", 1),
        ("6.30.2-pre-v6.0", "6.30.2", -1),  # prerelease ranks below its release
        ("6.30.2", "6.30.2-pre-v6.0", 1),
    ],
)
def test_compare(left: str, right: str, expected: int) -> None:
    assert guard.compare(left, right) == expected


@pytest.mark.parametrize(
    ("version", "affected"),
    [
        ("6.30.1", False),
        ("6.30.2", True),
        ("6.30.3", True),
        ("6.30.4", True),
        ("6.30.5", False),
        ("7.18.1", False),
        ("6.30.2-pre-v6.0", False),  # below the inclusive lower bound
    ],
)
def test_react_router_dom_range(version: str, affected: bool) -> None:
    assert guard.is_affected(version, "6.30.2", "6.30.4") is affected


@pytest.mark.parametrize(
    ("version", "affected"),
    [
        ("7.9.5", False),
        ("7.9.6", True),
        ("7.12.0", True),
        ("7.12.1", False),
        ("7.13.0", False),
        ("7.18.1", False),
        ("6.30.4", False),
    ],
)
def test_react_router_range(version: str, affected: bool) -> None:
    assert guard.is_affected(version, "7.9.6", "7.12.0") is affected


# ── end-to-end guard behaviour ───────────────────────────────────────────────


def test_passes_on_unaffected_versions(tmp_path: Path, capsys) -> None:
    lockfile = lock_with(tmp_path, react_router_dom="7.18.1", react_router="7.18.1")
    assert guard.main(["check", str(lockfile)]) == 0
    assert "No React Router version affected" in capsys.readouterr().out


def test_fails_on_affected_react_router_dom(tmp_path: Path, capsys) -> None:
    lockfile = lock_with(tmp_path, react_router_dom="6.30.4", react_router="6.30.4")
    assert guard.main(["check", str(lockfile)]) == 1
    err = capsys.readouterr().err
    assert "react-router-dom 6.30.4" in err
    assert "GHSA-jjmj-jmhj-qwj2" in err


def test_fails_on_affected_react_router_v7(tmp_path: Path, capsys) -> None:
    lockfile = lock_with(tmp_path, react_router_dom="7.12.0", react_router="7.12.0")
    assert guard.main(["check", str(lockfile)]) == 1
    assert "react-router 7.12.0" in capsys.readouterr().err


def test_detects_nested_transitive_copy(tmp_path: Path, capsys) -> None:
    lockfile = write_lock(
        tmp_path,
        {
            "": {"name": "affectlog-ui"},
            "node_modules/react-router-dom": {"version": "7.18.1"},
            "node_modules/react-router": {"version": "7.18.1"},
            "node_modules/some-package/node_modules/react-router-dom": {"version": "6.30.3"},
        },
    )
    assert guard.main(["check", str(lockfile)]) == 1
    assert "some-package/node_modules/react-router-dom" in capsys.readouterr().err


def test_supports_lockfile_version_1(tmp_path: Path) -> None:
    lockfile = tmp_path / "package-lock.json"
    lockfile.write_text(
        json.dumps(
            {
                "lockfileVersion": 1,
                "dependencies": {"react-router-dom": {"version": "6.30.4"}},
            }
        ),
        encoding="utf-8",
    )
    assert guard.main(["check", str(lockfile)]) == 1


# ── fail-closed behaviour ────────────────────────────────────────────────────


def test_fails_closed_on_missing_file(tmp_path: Path) -> None:
    assert guard.main(["check", str(tmp_path / "absent.json")]) == 2


def test_fails_closed_on_invalid_json(tmp_path: Path) -> None:
    lockfile = tmp_path / "package-lock.json"
    lockfile.write_text("{ not json", encoding="utf-8")
    assert guard.main(["check", str(lockfile)]) == 2


def test_fails_closed_on_unexpected_structure(tmp_path: Path) -> None:
    lockfile = tmp_path / "package-lock.json"
    lockfile.write_text(json.dumps({"lockfileVersion": 3}), encoding="utf-8")
    assert guard.main(["check", str(lockfile)]) == 2


def test_fails_closed_when_entry_has_no_version(tmp_path: Path) -> None:
    lockfile = write_lock(
        tmp_path,
        {"": {"name": "affectlog-ui"}, "node_modules/react-router-dom": {"resolved": "…"}},
    )
    assert guard.main(["check", str(lockfile)]) == 2


def test_fails_closed_when_router_absent(tmp_path: Path) -> None:
    lockfile = write_lock(
        tmp_path, {"": {"name": "affectlog-ui"}, "node_modules/react": {"version": "18.3.1"}}
    )
    assert guard.main(["check", str(lockfile)]) == 2


# ── the guard must agree with the committed lockfile ─────────────────────────


def test_repository_lockfile_is_not_affected() -> None:
    assert guard.main(["check", str(guard.DEFAULT_LOCKFILE)]) == 0
