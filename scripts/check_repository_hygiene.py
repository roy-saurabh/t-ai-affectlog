#!/usr/bin/env python3
"""Repository privacy hygiene guard.

Prevents private personal data from being committed to what is a public,
consortium-published repository:

  1. No private personal identifiers or private-correspondence markers in
     tracked content or commit messages.
  2. No accidental commit of local scratch / notes / transcript dumps, which
     commonly contain unreviewed private or unpublished content.

Design notes:
  * Product and regulatory terminology is first-class and never flagged — "AI",
    "ALT-AI", "Trustworthy AI", "AI model", "EU AI Act", "AI governance" and
    similar all pass. This guard is about privacy, not about tooling or authorship.
  * Private personal names are intentionally NOT hard-coded. They are supplied at
    scan time via ``HYGIENE_DENYLIST_FILE`` or ``HYGIENE_EXTRA_PATTERNS`` so that
    no private identifier is ever committed to this repository in order to check
    for it.

Usage:
    python scripts/check_repository_hygiene.py            # scan tracked files
    python scripts/check_repository_hygiene.py --base origin/main   # scan a diff
    python scripts/check_repository_hygiene.py --base origin/main --check-commits

Exit code 0 = clean, 1 = violations found (printed as ``file:line: match``),
2 = usage/git error.
"""

from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
from pathlib import Path

# ── Structural private-correspondence markers ────────────────────────────────
# Generic (non-name) signals that private correspondence or an individual report
# leaked into the tree. These are phrasings, never a real person's identity.
CORRESPONDENCE_PATTERNS: list[str] = [
    r"\bofficial tester\b",
    r"\btester report\b",
    r"\bthe tester (?:reported|encountered|found)\b",
    r"\bin response to (?:tester|reviewer) feedback\b",
    r"\bprivate correspondence\b",
]

# Filenames that must never be tracked: local scratch / notes / transcript dumps
# that commonly hold unreviewed private or unpublished content. This is a
# cleanliness-and-privacy check, not a statement about how content was produced.
FORBIDDEN_FILENAMES = {
    "ai_notes.md",
    "prompt.md",
    "agent-report.md",
    "assistant-output.md",
    "conversation.md",
    "scratch.md",
    "notes-private.md",
}

# Paths excluded from content scanning. The guard itself necessarily contains the
# very tokens it searches for, so it is skipped to avoid self-matching.
EXCLUDED_PATHS = {
    "scripts/check_repository_hygiene.py",
}

TEXT_SUFFIXES = {
    ".py",
    ".md",
    ".txt",
    ".yml",
    ".yaml",
    ".toml",
    ".cfg",
    ".ini",
    ".json",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".css",
    ".html",
    ".sh",
    ".env",
    ".example",
    ".cff",
    ".properties",
    ".conf",
    "",
}


def _run(cmd: list[str]) -> str:
    result = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        sys.stderr.write(result.stderr)
        raise SystemExit(2)
    return result.stdout


def _load_extra_patterns() -> list[str]:
    """Load private-identifier patterns supplied out-of-band (never committed)."""
    patterns: list[str] = []
    inline = os.environ.get("HYGIENE_EXTRA_PATTERNS", "")
    patterns += [p.strip() for p in re.split(r"[,\n]", inline) if p.strip()]
    path = os.environ.get("HYGIENE_DENYLIST_FILE", "")
    if path and Path(path).is_file():
        for line in Path(path).read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#"):
                patterns.append(line)
    return patterns


def _tracked_files() -> list[str]:
    return [f for f in _run(["git", "ls-files"]).splitlines() if f]


def _changed_files(base: str) -> list[str]:
    out = _run(["git", "diff", "--name-only", "--diff-filter=ACMR", f"{base}...HEAD"])
    return [f for f in out.splitlines() if f]


def _is_text(path: Path) -> bool:
    if path.suffix.lower() not in TEXT_SUFFIXES:
        return False
    try:
        chunk = path.read_bytes()[:4096]
    except OSError:
        return False
    return b"\x00" not in chunk


def _scan_file(path: Path, regexes: list[re.Pattern[str]]) -> list[tuple[int, str]]:
    hits: list[tuple[int, str]] = []
    try:
        lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return hits
    for lineno, line in enumerate(lines, start=1):
        for rx in regexes:
            if rx.search(line):
                hits.append((lineno, line.strip()[:200]))
                break
    return hits


def main() -> int:
    parser = argparse.ArgumentParser(description="Repository privacy hygiene guard.")
    parser.add_argument(
        "--base",
        help="Only scan files changed vs this ref (e.g. origin/main). "
        "Omit to scan all tracked files.",
    )
    parser.add_argument(
        "--check-commits",
        action="store_true",
        help="Also scan commit messages in <base>..HEAD.",
    )
    args = parser.parse_args()

    all_patterns = CORRESPONDENCE_PATTERNS + _load_extra_patterns()
    regexes = [re.compile(p, re.IGNORECASE) for p in all_patterns]

    files = _changed_files(args.base) if args.base else _tracked_files()
    violations = 0

    for rel in files:
        name = Path(rel).name.lower()
        if name in FORBIDDEN_FILENAMES:
            print(f"{rel}:0: forbidden scratch/notes/transcript filename")
            violations += 1
        if rel in EXCLUDED_PATHS:
            continue
        path = Path(rel)
        if not path.is_file() or not _is_text(path):
            continue
        for lineno, snippet in _scan_file(path, regexes):
            print(f"{rel}:{lineno}: {snippet}")
            violations += 1

    if args.check_commits and args.base:
        msg = _run(["git", "log", "--format=%H%n%B", f"{args.base}..HEAD"])
        for lineno, line in enumerate(msg.splitlines(), start=1):
            for rx in regexes:
                if rx.search(line):
                    print(f"<commit-message>:{lineno}: {line.strip()[:200]}")
                    violations += 1
                    break

    if violations:
        print(
            f"\nRepository privacy check FAILED: {violations} match(es). "
            "Remove private identifiers or correspondence markers, then re-run.",
            file=sys.stderr,
        )
        return 1

    print("Repository privacy check passed: no private identifiers or correspondence found.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
