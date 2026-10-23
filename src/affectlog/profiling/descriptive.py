"""Descriptive statistics over xAPI JSONL events."""

from __future__ import annotations

from collections import Counter
from pathlib import Path
from typing import Any

from affectlog.ingest.json_reader import iter_jsonl_records


def _actor_name(evt: dict[str, Any]) -> str:
    actor = evt.get("actor", {})
    return str(actor.get("account", {}).get("name") or actor.get("mbox", "unknown"))


def _duration_seconds(evt: dict[str, Any]) -> float | None:
    """Return the raw duration in seconds, or None when absent or not numeric."""
    dur_raw = evt.get("context", {}).get("extensions", {}).get("durationRaw")
    if dur_raw is None:
        return None
    try:
        return float(dur_raw)
    except (TypeError, ValueError):
        return None


def compute_descriptive_stats(path: Path | str, limit: int = 0) -> dict[str, Any]:
    """
    Stream through a JSONL file and compute descriptive stats.
    *limit* = 0 means process all rows.
    """
    actor_counter: Counter[str] = Counter()
    resource_counter: Counter[str] = Counter()
    resource_type_counter: Counter[str] = Counter()
    verb_counter: Counter[str] = Counter()
    view_context_counter: Counter[str] = Counter()

    total = 0
    null_durations = 0
    total_duration = 0.0

    for evt in iter_jsonl_records(Path(path), limit):
        total += 1
        actor_counter[_actor_name(evt)] += 1

        obj_id = evt.get("object", {}).get("id", "unknown")
        resource_counter[str(obj_id)] += 1

        rtype = evt.get("object", {}).get("definition", {}).get("type", "unknown")
        resource_type_counter[str(rtype)] += 1

        verb = evt.get("verb", {}).get("display", {}).get("en-US", "unknown")
        verb_counter[str(verb)] += 1

        categories = evt.get("context", {}).get("contextActivities", {}).get("category", [])
        for cat in categories:
            view_context_counter[str(cat.get("id", "unknown"))] += 1

        duration = _duration_seconds(evt)
        if duration is None:
            null_durations += 1
        else:
            total_duration += duration

    n_unique_actors = len(actor_counter)
    n_unique_resources = len(resource_counter)

    return {
        "total_events": total,
        "unique_actors": n_unique_actors,
        "unique_resources": n_unique_resources,
        "unique_resource_types": len(resource_type_counter),
        "unique_verbs": len(verb_counter),
        "events_with_duration": total - null_durations,
        "total_duration_seconds": total_duration,
        "avg_duration_seconds": round(total_duration / max(total - null_durations, 1), 2),
        "top_10_actors": actor_counter.most_common(10),
        "top_10_resources": resource_counter.most_common(10),
        "resource_type_distribution": dict(resource_type_counter.most_common(20)),
        "verb_distribution": dict(verb_counter),
        "view_context_distribution": dict(view_context_counter.most_common(20)),
    }
