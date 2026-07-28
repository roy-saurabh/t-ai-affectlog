"""Tests for the frontend dependency and RSC-exposure regression guard.

Covers advisory range detection for react-router (GHSA-jjmj-jmhj-qwj2 /
CVE-2026-53668), brace-expansion (GHSA-3jxr-9vmj-r5cp / CVE-2026-13149 and
GHSA-mh99-v99m-4gvg / CVE-2026-14257), js-yaml (GHSA-52cp-r559-cp3m /
CVE-2026-59869) and postcss (GHSA-r28c-9q8g-f849); React Router RSC-exposure
detection for GHSA-qwww-vcr4-c8h2; semantic-version comparison; and fail-closed
behaviour on malformed lockfiles and unrecognisable frontends.

React Router 7.18.1 is permitted by these tests *only* while unstable RSC mode
remains absent. GHSA-qwww-vcr4-c8h2 has no patched v7 release, so alert #10 is
closed as not-used rather than fixed; the RSC cases below are what keeps that
justification true. Introducing any RSC import, handler, server action or
framework package must fail the guard.
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


def dependency_violations(tmp_path: Path, **versions: str) -> list[str]:
    """Return dependency violations for a lockfile resolving ``versions``.

    React Router is always present so the guard's required-package check is
    satisfied and the assertion is about the package under test.
    """
    versions.setdefault("react_router_dom", "7.18.1")
    versions.setdefault("react_router", "7.18.1")
    return guard.check_dependencies(guard.resolved_versions(lock_with(tmp_path, **versions)))


SPA_APP = """\
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div />} />
      </Routes>
    </BrowserRouter>
  );
}
"""

VITE_CONFIG = """\
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({ plugins: [react()] });
"""


def make_frontend(
    tmp_path: Path,
    *,
    sources: dict[str, str] | None = None,
    manifest: dict | None = None,
    vite_config: str | None = VITE_CONFIG,
) -> Path:
    """Build a synthetic frontend tree mirroring the maintained layout."""
    frontend = tmp_path / "frontend"
    source_root = frontend / "src"
    source_root.mkdir(parents=True)

    for name, text in (sources if sources is not None else {"App.tsx": SPA_APP}).items():
        path = source_root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")

    default_manifest = {
        "name": "affectlog-ui",
        "dependencies": {"react": "^18.3.0", "react-router-dom": "7.18.1"},
        "devDependencies": {"vite": "^6.4.3"},
    }
    (frontend / "package.json").write_text(
        json.dumps(manifest if manifest is not None else default_manifest), encoding="utf-8"
    )
    if vite_config is not None:
        (frontend / "vite.config.ts").write_text(vite_config, encoding="utf-8")
    return frontend


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


# ── brace-expansion (GHSA-3jxr-9vmj-r5cp + GHSA-mh99-v99m-4gvg) ──────────────
#
# 1.1.16, 2.1.2 and 5.0.7 are the per-line fixes for the expansion-DoS advisory
# alone. GHSA-mh99-v99m-4gvg affects every release <= 5.0.7, so all three are
# still affected and only 5.0.8 clears both.


@pytest.mark.parametrize(
    ("version", "affected"),
    [
        ("1.1.15", True),
        ("1.1.16", True),
        ("2.1.1", True),
        ("2.1.2", True),
        ("5.0.7", True),
        ("5.0.8", False),
        ("5.1.0", False),
        ("6.0.0", False),
    ],
)
def test_brace_expansion_range(tmp_path: Path, version: str, affected: bool) -> None:
    violations = dependency_violations(tmp_path, brace_expansion=version)
    assert bool(violations) is affected
    if affected:
        assert "GHSA-mh99-v99m-4gvg" in violations[0]


def test_brace_expansion_violation_cites_both_advisories(tmp_path: Path) -> None:
    (violation,) = dependency_violations(tmp_path, brace_expansion="1.1.16")
    assert "GHSA-3jxr-9vmj-r5cp" in violation
    assert "GHSA-mh99-v99m-4gvg" in violation


def test_brace_expansion_nested_copy_is_detected(tmp_path: Path, capsys) -> None:
    lockfile = write_lock(
        tmp_path,
        {
            "": {"name": "affectlog-ui"},
            "node_modules/react-router-dom": {"version": "7.18.1"},
            "node_modules/react-router": {"version": "7.18.1"},
            "node_modules/brace-expansion": {"version": "5.0.8"},
            "node_modules/eslint/node_modules/brace-expansion": {"version": "1.1.15"},
        },
    )
    assert guard.main(["check", str(lockfile)]) == 1
    assert "eslint/node_modules/brace-expansion" in capsys.readouterr().err


# ── js-yaml (GHSA-52cp-r559-cp3m / CVE-2026-59869) ───────────────────────────


@pytest.mark.parametrize(
    ("version", "affected"),
    [
        ("3.14.1", True),
        ("3.15.0", False),
        ("4.0.0", True),
        ("4.1.0", True),
        ("4.2.0", True),  # the version resolved before this correction
        ("4.3.0", False),  # the patched v4 release
        ("4.4.0", False),
    ],
)
def test_js_yaml_range(tmp_path: Path, version: str, affected: bool) -> None:
    violations = dependency_violations(tmp_path, js_yaml=version)
    assert bool(violations) is affected
    if affected:
        assert "GHSA-52cp-r559-cp3m" in violations[0]


def test_js_yaml_absence_is_not_a_failure(tmp_path: Path) -> None:
    """Dropping js-yaml from the graph is a stronger result than patching it."""
    assert dependency_violations(tmp_path) == []


# ── postcss (GHSA-r28c-9q8g-f849) ────────────────────────────────────────────


@pytest.mark.parametrize(
    ("version", "affected"),
    [
        ("8.4.38", True),
        ("8.5.15", True),  # the version resolved before this correction
        ("8.5.17", True),  # the advisory's inclusive upper bound
        ("8.5.18", False),  # first patched release
        ("8.5.24", False),
        ("9.0.0", False),
    ],
)
def test_postcss_range(tmp_path: Path, version: str, affected: bool) -> None:
    violations = dependency_violations(tmp_path, postcss=version)
    assert bool(violations) is affected
    if affected:
        assert "GHSA-r28c-9q8g-f849" in violations[0]


# ── React Router dependency check is unchanged by the RSC work ───────────────


def test_react_router_7_18_1_passes_dependency_check(tmp_path: Path) -> None:
    assert dependency_violations(tmp_path, react_router="7.18.1") == []


@pytest.mark.parametrize("version", ["7.9.6", "7.10.0", "7.12.0"])
def test_react_router_open_redirect_range_still_fails(tmp_path: Path, version: str) -> None:
    (violation,) = dependency_violations(tmp_path, react_router=version)
    assert "GHSA-jjmj-jmhj-qwj2" in violation


# ── RSC exposure (GHSA-qwww-vcr4-c8h2) ───────────────────────────────────────


def test_browser_router_vite_spa_passes(tmp_path: Path) -> None:
    assert guard.check_rsc_exposure(make_frontend(tmp_path)) == []


def test_ordinary_react_router_dom_usage_passes(tmp_path: Path) -> None:
    sources = {
        "App.tsx": SPA_APP,
        "pages/Login.tsx": (
            'import { useNavigate, useLocation, Link } from "react-router-dom";\n'
            "export const Login = () => <Link to='/'>home</Link>;\n"
        ),
    }
    assert guard.check_rsc_exposure(make_frontend(tmp_path, sources=sources)) == []


def test_prose_mentioning_server_use_is_not_a_directive(tmp_path: Path) -> None:
    sources = {"App.tsx": "// We deliberately do not use server rendering.\n" + SPA_APP}
    assert guard.check_rsc_exposure(make_frontend(tmp_path, sources=sources)) == []


@pytest.mark.parametrize(
    ("snippet", "expected"),
    [
        ('import { matchRSCServerRequest } from "react-router/rsc";', "react-router/rsc"),
        ('import { x } from "react-router/rsc";', "react-router/rsc"),
        ("export const handler = matchRSCServerRequest;", "matchRSCServerRequest"),
        ("export const Router = RSCHydratedRouter;", "RSCHydratedRouter"),
        ("export const Router = RSCStaticRouter;", "RSCStaticRouter"),
        ("export const Router = ServerRouter;", "ServerRouter"),
        ("export const callServer = createCallServer({});", "createCallServer"),
        ("const stream = createFromReadableStream(body);", "createFromReadableStream"),
        ('import x from "react-server-dom-webpack/client";', "react-server-dom-webpack"),
        ('import x from "@react-router/dev/vite";', "@react-router/dev"),
    ],
)
def test_rsc_tokens_fail(tmp_path: Path, snippet: str, expected: str) -> None:
    sources = {"App.tsx": SPA_APP, "rsc.tsx": snippet + "\n"}
    violations = guard.check_rsc_exposure(make_frontend(tmp_path, sources=sources))
    assert violations, f"expected {expected} to be reported"
    assert any(expected in violation for violation in violations)


def test_use_server_directive_fails(tmp_path: Path) -> None:
    sources = {"App.tsx": SPA_APP, "actions.ts": '"use server";\nexport async function save() {}\n'}
    violations = guard.check_rsc_exposure(make_frontend(tmp_path, sources=sources))
    assert any("use server" in violation for violation in violations)


def test_react_server_dom_dependency_fails(tmp_path: Path) -> None:
    manifest = {
        "name": "affectlog-ui",
        "dependencies": {"react-router-dom": "7.18.1", "react-server-dom-webpack": "^19.0.0"},
    }
    violations = guard.check_rsc_exposure(make_frontend(tmp_path, manifest=manifest))
    assert any("react-server-dom-webpack" in violation for violation in violations)


def test_react_router_framework_dependency_fails(tmp_path: Path) -> None:
    manifest = {
        "name": "affectlog-ui",
        "devDependencies": {"@react-router/dev": "^7.18.1"},
        "dependencies": {"react-router-dom": "7.18.1"},
    }
    violations = guard.check_rsc_exposure(make_frontend(tmp_path, manifest=manifest))
    assert any("@react-router/dev" in violation for violation in violations)


def test_rsc_exposure_reported_through_main(tmp_path: Path, capsys) -> None:
    frontend = make_frontend(
        tmp_path, sources={"App.tsx": SPA_APP, "rsc.tsx": 'import "react-router/rsc";\n'}
    )
    lockfile = lock_with(tmp_path, react_router_dom="7.18.1", react_router="7.18.1")
    assert guard.main(["check", str(lockfile), str(frontend)]) == 1
    err = capsys.readouterr().err
    assert "GHSA-qwww-vcr4-c8h2" in err
    assert "react-router/rsc" in err


# ── RSC guard fail-closed behaviour ──────────────────────────────────────────


def test_fails_closed_on_missing_manifest(tmp_path: Path) -> None:
    frontend = make_frontend(tmp_path)
    (frontend / "package.json").unlink()
    with pytest.raises(guard.FrontendError):
        guard.check_rsc_exposure(frontend)


def test_fails_closed_on_missing_vite_config(tmp_path: Path) -> None:
    with pytest.raises(guard.FrontendError):
        guard.check_rsc_exposure(make_frontend(tmp_path, vite_config=None))


def test_fails_closed_when_routing_root_unidentifiable(tmp_path: Path) -> None:
    sources = {"App.tsx": "export default function App() { return <div />; }\n"}
    with pytest.raises(guard.FrontendError):
        guard.check_rsc_exposure(make_frontend(tmp_path, sources=sources))


def test_fails_closed_on_missing_source_tree(tmp_path: Path) -> None:
    frontend = make_frontend(tmp_path)
    for path in sorted((frontend / "src").rglob("*"), reverse=True):
        path.unlink()
    (frontend / "src").rmdir()
    with pytest.raises(guard.FrontendError):
        guard.check_rsc_exposure(frontend)


def test_main_returns_2_when_frontend_unrecognisable(tmp_path: Path, capsys) -> None:
    lockfile = lock_with(tmp_path, react_router_dom="7.18.1", react_router="7.18.1")
    assert guard.main(["check", str(lockfile), str(tmp_path / "absent-frontend")]) == 2
    assert "failed closed" in capsys.readouterr().err


# ── the guard must agree with the committed repository ───────────────────────


def test_repository_lockfile_is_not_affected() -> None:
    assert guard.main(["check", str(guard.DEFAULT_LOCKFILE)]) == 0


def test_repository_frontend_has_no_rsc_exposure() -> None:
    assert guard.check_rsc_exposure(guard.DEFAULT_FRONTEND) == []
