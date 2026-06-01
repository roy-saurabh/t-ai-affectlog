"""CSV table generation for metrics reports."""

from __future__ import annotations

import csv
import io
from typing import Any


def metrics_to_csv(metrics: dict[str, Any]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["metric", "value"])
    for k, v in metrics.items():
        if isinstance(v, (int, float, str, bool)):
            writer.writerow([k, v])
    return output.getvalue()
