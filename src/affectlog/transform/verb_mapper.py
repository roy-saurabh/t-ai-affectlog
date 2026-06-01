"""Map ViewContext / event type strings to xAPI verb IDs."""

from __future__ import annotations

from pathlib import Path
from typing import Optional

import yaml

DEFAULT_VERB_MAP: dict[str, dict[str, str]] = {
    "GROUP_SESSION": {
        "id": "https://w3id.org/xapi/dod-isd/verbs/accessed",
        "display": "accessed",
    },
    "TEST": {
        "id": "https://w3id.org/xapi/dod-isd/verbs/assessed",
        "display": "assessed",
    },
    "OPENED": {
        "id": "https://w3id.org/xapi/dod-isd/verbs/opened",
        "display": "opened",
    },
    "SEARCHED": {
        "id": "http://id.tincanapi.com/verb/searched",
        "display": "searched",
    },
    "ACCESSED": {
        "id": "https://w3id.org/xapi/dod-isd/verbs/accessed",
        "display": "accessed",
    },
    "_default": {
        "id": "https://w3id.org/xapi/dod-isd/verbs/accessed",
        "display": "accessed",
    },
}


class VerbMapper:
    # Label → xAPI ID mappings for string-style recipe verb_mapping values
    _LABEL_TO_VERB: dict[str, dict[str, str]] = {
        "accessed": {"id": "https://w3id.org/xapi/dod-isd/verbs/accessed", "display": "accessed"},
        "assessed": {"id": "https://w3id.org/xapi/dod-isd/verbs/assessed", "display": "assessed"},
        "opened": {"id": "https://w3id.org/xapi/dod-isd/verbs/opened", "display": "opened"},
        "searched": {"id": "http://id.tincanapi.com/verb/searched", "display": "searched"},
        "completed": {"id": "http://adlnet.gov/expapi/verbs/completed", "display": "completed"},
        "attempted": {"id": "http://adlnet.gov/expapi/verbs/attempted", "display": "attempted"},
    }

    def __init__(self, mapping: dict[str, object] | None = None, yaml_path: Path | None = None) -> None:
        self._map: dict[str, dict[str, str]] = dict(DEFAULT_VERB_MAP)
        if yaml_path and yaml_path.exists():
            extra = yaml.safe_load(yaml_path.read_text())
            if isinstance(extra, dict):
                self._merge(extra)
        if mapping:
            self._merge(mapping)

    def _merge(self, extra: dict[str, object]) -> None:
        """Merge verb mapping entries, normalising string values to full verb dicts."""
        for k, v in extra.items():
            if isinstance(v, dict) and "id" in v:
                self._map[k.upper()] = {"id": str(v["id"]), "display": str(v.get("display", k))}
            elif isinstance(v, str):
                # Recipe uses short labels like "accessed" — look up the full verb
                resolved = self._LABEL_TO_VERB.get(v.lower(), self._LABEL_TO_VERB["accessed"])
                self._map[k.upper()] = resolved
            # ignore non-string, non-dict values

    def get(self, view_context: Optional[str]) -> dict[str, str]:
        if not view_context:
            return self._map["_default"]
        key = str(view_context).upper()
        return self._map.get(key, self._map["_default"])
