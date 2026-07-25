#!/usr/bin/env python3
"""Validate that documentation references resolve to real repository objects.

Narrow scope by design. For the design/traceability documents it checks that:

  * every backtick-quoted repository path exists;
  * every relative Markdown link target exists;
  * every in-page anchor link resolves to a heading or explicit anchor;
  * every ``make`` target named in a fenced shell block exists in the Makefile.

It deliberately does *not* lint prose, spelling or style: its only job is to stop
the documentation from citing paths, links, anchors or targets that are not there.

Usage:
    python scripts/check_doc_references.py                 # default document set
    python scripts/check_doc_references.py docs/api.md ... # explicit files
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# Roots a cited path may be relative to. The design documents cite implementation
# modules relative to the ``src/affectlog`` package (e.g. ``metrics/coverage.py``)
# as well as relative to the repository root (e.g. ``docs/openapi.yaml``); both
# spellings are accepted, and the documents state the convention explicitly.
SEARCH_ROOTS = (Path(), Path("src/affectlog"))

DEFAULT_DOCS = (
    "docs/design-document.md",
    "docs/design-conformance.md",
    "docs/trl-assessment.md",
)

# A backticked token is treated as a repository path when it looks like one: it
# contains a "/" or ends in a known file extension, and carries no shell/URL or
# expression syntax that would mark it as a command or code fragment.
_PATH_EXTENSIONS = (".py", ".md", ".yml", ".yaml", ".json", ".toml", ".sh", ".png", ".txt")
_NOT_A_PATH = re.compile(r"[\s<>|*?$(){}\[\]=;:,\"']|^-|https?://|@|::")

# ``module.py::function`` — validate the file part only; symbol resolution is out
# of scope for a reference checker.
_SYMBOL_SUFFIX = re.compile(r"::.*$")

_BACKTICK = re.compile(r"`([^`\n]+)`")
_MD_LINK = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
_HEADING = re.compile(r"^#{1,6}\s+(.*?)\s*$", re.MULTILINE)
_EXPLICIT_ANCHOR = re.compile(r'<a\s+id="([^"]+)"', re.IGNORECASE)
_SHELL_BLOCK = re.compile(r"```(?:bash|sh|shell)\n(.*?)```", re.DOTALL)
_MAKE_CALL = re.compile(r"^\s*make\s+([a-zA-Z0-9_-]+)", re.MULTILINE)


def slugify(heading: str) -> str:
    """Approximate the GitHub/MkDocs heading-to-anchor transformation."""
    text = re.sub(r"`([^`]*)`", r"\1", heading)  # strip inline code
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)  # link text only
    text = re.sub(r"[*_]", "", text)  # emphasis markers
    text = text.strip().lower()
    text = re.sub(r"[^\w\s-]", "", text)  # drop punctuation
    # Each whitespace character becomes its own hyphen — consecutive spaces are
    # NOT collapsed. "R1 — ML framework" loses the em dash and yields
    # "r1--ml-framework", matching GitHub and MkDocs anchor generation.
    return re.sub(r"\s", "-", text)


def make_targets() -> set[str]:
    makefile = REPO_ROOT / "Makefile"
    if not makefile.is_file():
        return set()
    return set(re.findall(r"^([a-zA-Z0-9_-]+):", makefile.read_text(), re.MULTILINE))


def looks_like_path(token: str) -> bool:
    if _NOT_A_PATH.search(token):
        return False
    # Leading "/" marks an HTTP route (e.g. /openapi.json, /v1/datasets), not a
    # repository path. Repository paths in these documents are always relative.
    if token.startswith("/"):
        return False
    return "/" in token or token.endswith(_PATH_EXTENSIONS)


_BASENAME_INDEX: dict[str, int] | None = None

# Directories scanned when resolving a bare filename cited as list shorthand.
_INDEXED_DIRS = ("src", "docs", "scripts", "tests", "configs")


def _basename_index() -> dict[str, int]:
    """Map filename -> occurrence count across the indexed source directories."""
    global _BASENAME_INDEX
    if _BASENAME_INDEX is None:
        index: dict[str, int] = {}
        for directory in _INDEXED_DIRS:
            for path in (REPO_ROOT / directory).rglob("*"):
                if path.is_file():
                    index[path.name] = index.get(path.name, 0) + 1
        _BASENAME_INDEX = index
    return _BASENAME_INDEX


def resolve(candidate: str) -> bool:
    """True when the cited path exists under any accepted search root.

    The design documents list sibling modules as bare filenames after naming the
    directory once (``ingest/csv_reader.py``, ``json_reader.py``, ...). A bare
    filename therefore resolves when exactly one file of that name exists in the
    tree; an ambiguous name is reported so the document can be made specific.
    """
    if any((REPO_ROOT / root / candidate).exists() for root in SEARCH_ROOTS):
        return True
    if "/" not in candidate:
        return _basename_index().get(candidate, 0) == 1
    return False


def anchors_of(doc: Path) -> set[str]:
    """Anchors a Markdown file exposes: slugified headings plus explicit ids."""
    text = doc.read_text()
    return {slugify(h) for h in _HEADING.findall(text)} | set(_EXPLICIT_ANCHOR.findall(text))


def check_document(doc: Path, targets: set[str]) -> list[str]:
    errors: list[str] = []
    text = doc.read_text()
    rel = doc.relative_to(REPO_ROOT)

    anchors = anchors_of(doc)

    for token in _BACKTICK.findall(text):
        token = token.strip()
        if not looks_like_path(token):
            continue
        candidate = _SYMBOL_SUFFIX.sub("", token).rstrip("/")
        if not resolve(candidate):
            errors.append(f"{rel}: cited path does not exist: {token}")

    for target in _MD_LINK.findall(text):
        target = target.strip()
        if target.startswith(("http://", "https://", "mailto:")):
            continue
        if target.startswith("#"):
            if target[1:] not in anchors:
                errors.append(f"{rel}: unresolved in-page anchor: {target}")
            continue
        path_part, _, fragment = target.partition("#")
        linked = doc.parent / path_part
        if path_part and not linked.exists():
            errors.append(f"{rel}: broken relative link: {target}")
            continue
        # Cross-document anchors must resolve in the linked Markdown file too,
        # otherwise a rename silently produces a link that lands at the top.
        if (
            fragment
            and path_part.endswith(".md")
            and linked.is_file()
            and fragment not in anchors_of(linked)
        ):
            errors.append(f"{rel}: unresolved anchor in {path_part}: #{fragment}")

    for block in _SHELL_BLOCK.findall(text):
        for target in _MAKE_CALL.findall(block):
            if targets and target not in targets:
                errors.append(f"{rel}: unknown make target: make {target}")

    return errors


def main(argv: list[str]) -> int:
    docs = [Path(a) for a in argv[1:]] or [Path(d) for d in DEFAULT_DOCS]
    targets = make_targets()

    errors: list[str] = []
    for doc in docs:
        full = doc if doc.is_absolute() else REPO_ROOT / doc
        if not full.is_file():
            errors.append(f"{doc}: document not found")
            continue
        errors.extend(check_document(full, targets))

    if errors:
        print("Documentation reference check FAILED:\n")
        for error in errors:
            print(f"  - {error}")
        return 1

    print(f"Documentation reference check passed: {len(docs)} document(s) validated.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
