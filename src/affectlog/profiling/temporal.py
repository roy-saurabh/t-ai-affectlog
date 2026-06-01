"""Temporal profiling: time density, session density, date range."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any, Optional

from affectlog.core.time import parse_iso


def compute_temporal_stats(path: Path | str, limit: int = 0) -> dict[str, Any]:
    path = Path(path)
    ts_list = []
    session_counter: Counter[str] = Counter()
    total = 0

    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                evt = json.loads(line)
            except json.JSONDecodeError:
                continue
            total += 1
            if limit and total > limit:
                break

            ts_raw = evt.get("timestamp", "")
            if ts_raw:
                dt = parse_iso(str(ts_raw))
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
