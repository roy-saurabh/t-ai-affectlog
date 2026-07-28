#!/usr/bin/env python3
"""Frontend dependency regression guard for the React Router open-redirect advisory.

Narrow scope by design. This guard exists so that the resolved frontend
dependency graph cannot silently drift back into the versions affected by:

  * GHSA-jjmj-jmhj-qwj2
  * CVE-2026-53668
  * CWE-601 (open redirect leading to cross-site scripting)

It inspects the *lockfile*, not ``package.json``, because a permissive range such
as ``^6.23.0`` says nothing about the version that is actually installed and
shipped in the built bundle. Every entry in the lockfile is checked, including
nested and transitive copies of the packages.

This is not a general vulnerability scanner and is not a replacement for
``npm audit``; it is a focused check for one advisory. Exit code 0 = clean,
1 = an affected version is resolved, 2 = the lockfile could not be read or did
not have the expected structure (the check fails closed).

Usage:
    python scripts/check_frontend_security.py            # default frontend lockfile
    python scripts/check_frontend_security.py path/to/package-lock.json
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_LOCKFILE = REPO_ROOT / "src" / "affectlog" / "frontend" / "package-lock.json"

ADVISORY = "GHSA-jjmj-jmhj-qwj2 / CVE-2026-53668 (CWE-601)"

# Affected ranges as published in the advisory, expressed as inclusive bounds.
# Both bounds are inclusive because the advisory has no patched v6 release and
# publishes closed ranges.
AFFECTED_RANGES: list[tuple[str, str, str]] = [
    ("react-router-dom", "6.30.2", "6.30.4"),
    ("react-router", "7.9.6", "7.12.0"),
]

_SEMVER = re.compile(
    r"^(?P<major>0|[1-9]\d*)\.(?P<minor>0|[1-9]\d*)\.(?P<patch>0|[1-9]\d*)"
    r"(?:-(?P<prerelease>[0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$"
)


class LockfileError(Exception):
    """The lockfile is missing, unreadable or structurally unexpected."""


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

    watched = {name for name, _, _ in AFFECTED_RANGES}
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

    if not found:
        raise LockfileError(
            f"{lockfile} resolves none of {sorted(watched)}; "
            "the guard cannot confirm a safe dependency graph"
        )
    return found


def main(argv: list[str]) -> int:
    lockfile = Path(argv[1]) if len(argv) > 1 else DEFAULT_LOCKFILE

    try:
        entries = resolved_versions(lockfile)
    except LockfileError as exc:
        print(f"error: {exc}", file=sys.stderr)
        print("frontend dependency guard failed closed.", file=sys.stderr)
        return 2

    ranges = {name: (low, high) for name, low, high in AFFECTED_RANGES}
    violations: list[str] = []

    try:
        for name, version, location in sorted(entries):
            low, high = ranges[name]
            if is_affected(version, low, high):
                violations.append(
                    f"{location}: {name} {version} is within the affected range >= {low}, <= {high}"
                )
    except LockfileError as exc:
        print(f"error: {exc}", file=sys.stderr)
        print("frontend dependency guard failed closed.", file=sys.stderr)
        return 2

    if violations:
        print(f"Affected React Router versions resolved — {ADVISORY}:", file=sys.stderr)
        for violation in violations:
            print(f"  {violation}", file=sys.stderr)
        print(
            "\nPin the frontend router dependency to a version outside the "
            "affected range and regenerate the lockfile with npm.",
            file=sys.stderr,
        )
        return 1

    for name, version, location in sorted(entries):
        print(f"ok: {location} resolves {name} {version}")
    print(f"No React Router version affected by {ADVISORY} is resolved.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
