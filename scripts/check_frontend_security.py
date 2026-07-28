#!/usr/bin/env python3
"""Frontend dependency and React Router RSC-exposure regression guard.

Narrow scope by design. This guard exists so that the resolved frontend
dependency graph cannot silently drift back into a version affected by a
published advisory, and so that the unstable React Router RSC surface cannot be
introduced without the change being noticed.

Two independent checks run on every invocation.

1. Dependency ranges. The *lockfile* is inspected rather than ``package.json``,
   because a permissive range such as ``^8.4.38`` says nothing about the version
   that is actually installed and shipped. Every entry is checked, including
   nested and transitive copies. The advisories covered are:

     * GHSA-jjmj-jmhj-qwj2 / CVE-2026-53668 (CWE-601) — react-router open redirect
     * GHSA-3jxr-9vmj-r5cp / CVE-2026-13149 — brace-expansion expansion DoS
     * GHSA-mh99-v99m-4gvg / CVE-2026-14257 — brace-expansion unbounded expansion
     * GHSA-52cp-r559-cp3m / CVE-2026-59869 — js-yaml merge-key quadratic CPU
     * GHSA-r28c-9q8g-f849 — postcss source-map path traversal

   brace-expansion is required to be >= 5.0.8: that is the first release outside
   *both* brace-expansion advisories, and GHSA-mh99-v99m-4gvg affects every
   earlier release including the 1.1.16 and 2.1.2 lines that the expansion-DoS
   advisory alone would accept.

2. RSC exposure. GHSA-qwww-vcr4-c8h2 affects only React Router's unstable RSC
   mode, which this client-only Vite SPA does not use. That claim has to stay
   true, so the maintained frontend sources are checked for RSC imports, RSC
   server handlers, React server-action directives and framework/RSC packages,
   and the application is confirmed to still mount a client ``BrowserRouter``.

Inspection is deliberately restricted to the maintained frontend — its ``src``
tree, ``package.json`` and ``vite.config.ts``. Documentation is never scanned
for these tokens, so prose may discuss RSC freely.

This is not a general vulnerability scanner and is not a replacement for
``npm audit``; it is a focused check for known advisories. Exit code 0 = clean,
1 = an affected version or an RSC exposure was found, 2 = the inputs could not
be read or did not have the expected structure (the check fails closed).

Usage:
    python scripts/check_frontend_security.py            # default frontend
    python scripts/check_frontend_security.py path/to/package-lock.json
    python scripts/check_frontend_security.py path/to/package-lock.json path/to/frontend
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_FRONTEND = REPO_ROOT / "src" / "affectlog" / "frontend"
DEFAULT_LOCKFILE = DEFAULT_FRONTEND / "package-lock.json"

ADVISORY = "GHSA-jjmj-jmhj-qwj2 / CVE-2026-53668 (CWE-601)"
RSC_ADVISORY = "GHSA-qwww-vcr4-c8h2 (React Router unstable RSC mode)"

# Closed, fully inclusive affected ranges. Both bounds are inclusive because the
# React Router open-redirect advisory has no patched v6 release and publishes
# closed ranges. Retained as a three-tuple because it is the guard's original
# public shape.
AFFECTED_RANGES: list[tuple[str, str, str]] = [
    ("react-router-dom", "6.30.2", "6.30.4"),
    ("react-router", "7.9.6", "7.12.0"),
]

# Half-open affected ranges: affected when introduced <= version < fixed. An
# ``introduced`` of None means "every release below ``fixed``". These mirror the
# ranges published by the corresponding GitHub advisories.
FIXED_IN_RANGES: list[tuple[str, str | None, str, str]] = [
    # A single floor covering both brace-expansion advisories. GHSA-mh99-v99m-4gvg
    # affects <= 5.0.7 across every release line, so 1.1.16 / 2.1.2 / 5.0.7 —
    # the per-line fixes for GHSA-3jxr-9vmj-r5cp — are all still affected.
    (
        "brace-expansion",
        None,
        "5.0.8",
        "GHSA-3jxr-9vmj-r5cp / CVE-2026-13149 and GHSA-mh99-v99m-4gvg / CVE-2026-14257",
    ),
    ("js-yaml", "3.0.0", "3.15.0", "GHSA-52cp-r559-cp3m / CVE-2026-59869"),
    ("js-yaml", "4.0.0", "4.3.0", "GHSA-52cp-r559-cp3m / CVE-2026-59869"),
    # Published as "<= 8.5.17"; expressed here as "< 8.5.18", its first patch.
    ("postcss", None, "8.5.18", "GHSA-r28c-9q8g-f849"),
]

# Packages whose absence from the lockfile means the guard cannot confirm what
# it is meant to confirm, so it fails closed. The dependency-range packages are
# not listed: a toolchain upgrade may legitimately drop js-yaml or
# brace-expansion from the graph entirely, which is a stronger result than
# resolving a patched version.
REQUIRED_PACKAGES = frozenset({"react-router", "react-router-dom"})

# ── RSC exposure ─────────────────────────────────────────────────────────────

# Source files in the maintained frontend that are scanned for RSC tokens.
SOURCE_SUFFIXES = frozenset({".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"})

# Module specifiers that only exist in React Router's RSC / framework surface.
RSC_IMPORT_PATTERNS: list[tuple[str, str]] = [
    (r"react-router/rsc", "React Router RSC entry point"),
    (r"react-router-dom/server", "React Router server entry point"),
    (r"react-router/server", "React Router server entry point"),
    (r"react-server-dom[\w.-]*", "React Server Components runtime package"),
    (r"@react-router/[\w.-]+", "React Router framework/RSC package"),
]

# Identifiers exported only by the RSC surface.
RSC_SYMBOL_PATTERNS: list[tuple[str, str]] = [
    (r"\bmatchRSCServerRequest\b", "RSC server request handler"),
    (r"\bRSCHydratedRouter\b", "RSC hydrated router"),
    (r"\bRSCStaticRouter\b", "RSC static router"),
    (r"\bServerRouter\b", "RSC/server router"),
    (r"\bcreateCallServer\b", "RSC call-server bridge"),
    (r"\bcreateFromReadableStream\b", "RSC flight-stream decoder"),
    (r"\bdecodeReply\b", "RSC server-action decoder"),
    (r"\bdecodeAction\b", "RSC server-action decoder"),
    (r"\bdecodeFormState\b", "RSC form-state decoder"),
    (r"\bunstable_createCallServer\b", "unstable RSC call-server bridge"),
    (r"\bunstable_RSC\w*\b", "unstable RSC API"),
]

# A React server-action directive, matched only as a directive on its own line
# so that prose or identifiers containing the words are not flagged.
SERVER_DIRECTIVE = re.compile(r"""^[ \t]*(['"])use server\1[ \t]*;?[ \t]*$""", re.MULTILINE)

# Dependency names that would pull an RSC/framework runtime into the bundle.
RSC_PACKAGE_PATTERNS: list[str] = [r"^react-server-dom[\w.-]*$", r"^@react-router/[\w.-]+$"]

# A client router root proves the app still mounts client-side.
CLIENT_ROUTER_PATTERN = re.compile(r"\b(BrowserRouter|createBrowserRouter)\b")

DEPENDENCY_SECTIONS = (
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
)

_SEMVER = re.compile(
    r"^(?P<major>0|[1-9]\d*)\.(?P<minor>0|[1-9]\d*)\.(?P<patch>0|[1-9]\d*)"
    r"(?:-(?P<prerelease>[0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$"
)


class LockfileError(Exception):
    """The lockfile is missing, unreadable or structurally unexpected."""


class FrontendError(Exception):
    """The maintained frontend is missing or cannot be inspected."""


def parse_version(version: str) -> tuple[tuple[int, int, int], list[object]] | None:
    """Parse a semantic version into a comparable key, or ``None`` if invalid."""
    match = _SEMVER.match(version.strip())
    if match is None:
        return None
    core = (int(match["major"]), int(match["minor"]), int(match["patch"]))
    prerelease = match["prerelease"]
    if prerelease is None:
        # A release ranks above any prerelease of the same core version.
        return core, []
    identifiers: list[object] = []
    for part in prerelease.split("."):
        # Numeric identifiers compare numerically and rank below alphanumerics.
        identifiers.append((0, int(part), "") if part.isdigit() else (1, 0, part))
    return core, identifiers


def compare(left: str, right: str) -> int:
    """Return -1/0/1 comparing two semantic versions by precedence."""
    parsed_left = parse_version(left)
    parsed_right = parse_version(right)
    if parsed_left is None or parsed_right is None:
        raise LockfileError(f"cannot compare versions {left!r} and {right!r}")

    left_core, left_pre = parsed_left
    right_core, right_pre = parsed_right
    if left_core != right_core:
        return -1 if left_core < right_core else 1
    if not left_pre and not right_pre:
        return 0
    # An empty prerelease list means a release, which outranks any prerelease.
    if not left_pre:
        return 1
    if not right_pre:
        return -1
    if left_pre == right_pre:
        return 0
    return -1 if left_pre < right_pre else 1  # type: ignore[operator]


def is_affected(version: str, low: str, high: str) -> bool:
    """Return True when ``low <= version <= high``."""
    return compare(version, low) >= 0 and compare(version, high) <= 0


def is_affected_below(version: str, introduced: str | None, fixed: str) -> bool:
    """Return True when ``introduced <= version < fixed``.

    ``introduced`` of ``None`` means every release below ``fixed`` is affected.
    """
    if compare(version, fixed) >= 0:
        return False
    return introduced is None or compare(version, introduced) >= 0


def watched_packages() -> set[str]:
    """Return every package name the dependency check inspects."""
    names = {name for name, _, _ in AFFECTED_RANGES}
    names.update(name for name, _, _, _ in FIXED_IN_RANGES)
    return names


def resolved_versions(lockfile: Path) -> list[tuple[str, str, str]]:
    """Return ``(package, version, location)`` for every watched package entry.

    Raises ``LockfileError`` when the lockfile cannot be read or does not have a
    structure this guard understands, so that a malformed lockfile fails the
    check rather than silently passing it.
    """
    try:
        raw = lockfile.read_text(encoding="utf-8")
    except OSError as exc:
        raise LockfileError(f"cannot read {lockfile}: {exc}") from exc

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise LockfileError(f"{lockfile} is not valid JSON: {exc}") from exc

    if not isinstance(data, dict):
        raise LockfileError(f"{lockfile} does not contain a JSON object")

    watched = watched_packages()
    found: list[tuple[str, str, str]] = []

    packages = data.get("packages")
    dependencies = data.get("dependencies")

    if isinstance(packages, dict):
        # lockfileVersion 2/3: keys are install paths such as
        # "node_modules/react-router-dom" or a nested equivalent.
        for location, entry in packages.items():
            if not location:
                continue  # the root project entry has no package path
            name = location.rsplit("node_modules/", 1)[-1]
            if name not in watched:
                continue
            if not isinstance(entry, dict) or not isinstance(entry.get("version"), str):
                raise LockfileError(f"{lockfile}: entry {location!r} has no resolved version")
            found.append((name, entry["version"], location))
    elif isinstance(dependencies, dict):
        # lockfileVersion 1 fallback: a recursive "dependencies" tree.
        def walk(tree: dict, prefix: str) -> None:
            for name, entry in tree.items():
                if not isinstance(entry, dict):
                    raise LockfileError(f"{lockfile}: malformed entry for {name!r}")
                location = f"{prefix}{name}"
                if name in watched:
                    if not isinstance(entry.get("version"), str):
                        raise LockfileError(
                            f"{lockfile}: entry {location!r} has no resolved version"
                        )
                    found.append((name, entry["version"], location))
                nested = entry.get("dependencies")
                if isinstance(nested, dict):
                    walk(nested, f"{location}/")

        walk(dependencies, "")
    else:
        raise LockfileError(f"{lockfile} has neither a 'packages' nor a 'dependencies' map")

    if not any(name in REQUIRED_PACKAGES for name, _, _ in found):
        raise LockfileError(
            f"{lockfile} resolves none of {sorted(REQUIRED_PACKAGES)}; "
            "the guard cannot confirm a safe dependency graph"
        )
    return found


def check_dependencies(entries: list[tuple[str, str, str]]) -> list[str]:
    """Return a violation message for every resolved version inside a range."""
    closed = {name: (low, high) for name, low, high in AFFECTED_RANGES}
    violations: list[str] = []

    for name, version, location in sorted(entries):
        bounds = closed.get(name)
        if bounds is not None and is_affected(version, *bounds):
            low, high = bounds
            violations.append(
                f"{location}: {name} {version} is within the affected range "
                f">= {low}, <= {high} ({ADVISORY})"
            )
        for pkg, introduced, fixed, advisory in FIXED_IN_RANGES:
            if pkg == name and is_affected_below(version, introduced, fixed):
                lower = f">= {introduced}, " if introduced else ""
                violations.append(
                    f"{location}: {name} {version} is within the affected range "
                    f"{lower}< {fixed} ({advisory})"
                )
    return violations


def _iter_source_files(source_root: Path) -> list[Path]:
    return sorted(
        path for path in source_root.rglob("*") if path.is_file() and path.suffix in SOURCE_SUFFIXES
    )


def check_rsc_exposure(frontend: Path) -> list[str]:
    """Return a violation message for every RSC exposure in the frontend.

    Raises ``FrontendError`` when the frontend layout is not what this guard
    expects, so a moved or deleted entry point fails the check rather than
    silently passing it.
    """
    manifest = frontend / "package.json"
    vite_config = frontend / "vite.config.ts"
    source_root = frontend / "src"

    if not manifest.is_file():
        raise FrontendError(f"expected frontend manifest {manifest} is missing")
    if not vite_config.is_file():
        raise FrontendError(
            f"expected Vite configuration {vite_config} is missing; "
            "the guard cannot confirm the app is still a client-only SPA"
        )
    if not source_root.is_dir():
        raise FrontendError(f"expected frontend source tree {source_root} is missing")

    try:
        manifest_data = json.loads(manifest.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise FrontendError(f"cannot read {manifest}: {exc}") from exc
    if not isinstance(manifest_data, dict):
        raise FrontendError(f"{manifest} does not contain a JSON object")

    violations: list[str] = []

    # Declared dependencies must not pull an RSC or framework runtime.
    for section in DEPENDENCY_SECTIONS:
        declared = manifest_data.get(section)
        if declared is None:
            continue
        if not isinstance(declared, dict):
            raise FrontendError(f"{manifest}: '{section}' is not an object")
        for dependency in sorted(declared):
            for pattern in RSC_PACKAGE_PATTERNS:
                if re.match(pattern, dependency):
                    violations.append(
                        f"package.json ({section}): {dependency} is a React Router "
                        f"RSC/framework package"
                    )

    # Sources and the Vite config must not reference the RSC surface.
    sources = _iter_source_files(source_root)
    source_texts: dict[Path, str] = {}
    for path in [*sources, vite_config]:
        try:
            source_texts[path] = path.read_text(encoding="utf-8")
        except OSError as exc:
            raise FrontendError(f"cannot read {path}: {exc}") from exc

    for path, text in source_texts.items():
        relative = path.relative_to(frontend)

        for pattern, description in RSC_IMPORT_PATTERNS:
            match = re.search(pattern, text)
            if match:
                violations.append(f"{relative}: imports {match.group(0)} — {description}")
        for pattern, description in RSC_SYMBOL_PATTERNS:
            match = re.search(pattern, text)
            if match:
                violations.append(f"{relative}: uses {match.group(0)} — {description}")
        if SERVER_DIRECTIVE.search(text):
            violations.append(f'{relative}: declares a "use server" React server-action directive')

    # The app must still mount a client router. Absence is a fail-closed
    # condition rather than a violation: the guard can no longer tell whether
    # the SPA claim holds.
    if not any(CLIENT_ROUTER_PATTERN.search(source_texts[path]) for path in sources):
        raise FrontendError(
            f"no client router root (BrowserRouter / createBrowserRouter) found under "
            f"{source_root}; the guard cannot confirm the app is still a client-only SPA"
        )

    return violations


def main(argv: list[str]) -> int:
    lockfile = Path(argv[1]) if len(argv) > 1 else DEFAULT_LOCKFILE
    frontend = Path(argv[2]) if len(argv) > 2 else DEFAULT_FRONTEND

    try:
        entries = resolved_versions(lockfile)
        dependency_violations = check_dependencies(entries)
    except LockfileError as exc:
        print(f"error: {exc}", file=sys.stderr)
        print("frontend dependency guard failed closed.", file=sys.stderr)
        return 2

    try:
        rsc_violations = check_rsc_exposure(frontend)
    except FrontendError as exc:
        print(f"error: {exc}", file=sys.stderr)
        print("frontend RSC-exposure guard failed closed.", file=sys.stderr)
        return 2

    if dependency_violations:
        print("Affected frontend dependency versions resolved:", file=sys.stderr)
        for violation in dependency_violations:
            print(f"  {violation}", file=sys.stderr)
        print(
            "\nPin the affected dependency to a version outside the "
            "affected range and regenerate the lockfile with npm.",
            file=sys.stderr,
        )

    if rsc_violations:
        print(f"React Router RSC exposure detected — {RSC_ADVISORY}:", file=sys.stderr)
        for violation in rsc_violations:
            print(f"  {violation}", file=sys.stderr)
        print(
            "\nThis application is a client-only Vite SPA and alert #10 is closed on "
            "the basis that unstable RSC mode is unused. Adopting RSC mode requires "
            "moving to a React Router release outside the advisory first.",
            file=sys.stderr,
        )

    if dependency_violations or rsc_violations:
        return 1

    for name, version, location in sorted(entries):
        print(f"ok: {location} resolves {name} {version}")
    print(f"No React Router version affected by {ADVISORY} is resolved.")
    print("No brace-expansion, js-yaml or postcss version inside a published advisory range.")
    print(f"No React Router RSC exposure — {RSC_ADVISORY} does not apply.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
