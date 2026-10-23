"""Temporal profiling: time density, session density, date range."""

from __future__ import annotations

from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any

from affectlog.core.time import parse_iso
from affectlog.ingest.json_reader import iter_jsonl_records


def _event_timestamp(evt: dict[str, Any]) -> datetime | None:
    ts_raw = evt.get("timestamp", "")
    return parse_iso(str(ts_raw)) if ts_raw else None


def compute_temporal_stats(path: Path | str, limit: int = 0) -> dict[str, Any]:
    ts_list = []
    session_counter: Counter[str] = Counter()
    total = 0

    for evt in iter_jsonl_records(Path(path), limit):
        total += 1
        dt = _event_timestamp(evt)
        if dt:
            ts_list.append(dt)

        reg = evt.get("context", {}).get("registration")
        if reg:
            session_counter[str(reg)] += 1

    if not ts_list:
        return {"total_events": total, "temporal_stats": None}

    ts_sorted = sorted(ts_list)
    min_ts = ts_sorted[0].isoformat()
    max_ts = ts_sorted[-1].isoformat()
    span_days = (ts_sorted[-1] - ts_sorted[0]).days

    # Day-level histogram
    day_counter: Counter[str] = Counter()
    for dt in ts_sorted:
        day_counter[dt.strftime("%Y-%m-%d")] += 1

    # Hour histogram
    hour_counter: Counter[int] = Counter()
    for dt in ts_sorted:
        hour_counter[dt.hour] += 1

    return {
        "total_events": total,
        "min_timestamp": min_ts,
        "max_timestamp": max_ts,
        "span_days": span_days,
        "events_with_valid_timestamp": len(ts_list),
        "unique_days": len(day_counter),
        "avg_events_per_day": round(total / max(len(day_counter), 1), 2),
        "peak_day": max(day_counter, key=lambda k: day_counter[k]) if day_counter else None,
        "hour_distribution": {str(h): c for h, c in sorted(hour_counter.items())},
        "unique_sessions": len(session_counter),
        "avg_events_per_session": round(total / max(len(session_counter), 1), 2),
        "top_10_days": day_counter.most_common(10),
    }
