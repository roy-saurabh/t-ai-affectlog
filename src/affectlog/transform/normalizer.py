"""Generic normalizer: dispatch to format-specific transformers."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Optional

from affectlog.transform.maskott_csv_to_xapi import convert_maskott_csv_to_xapi


def normalize(
    input_path: Path | str,
    output_path: Path | str,
    format_hint: str = "auto",
    **kwargs: Any,
) -> dict[str, Any]:
    path = Path(input_path)
    ext = path.suffix.lower()

    if format_hint == "maskott_csv" or ext == ".csv":
        return convert_maskott_csv_to_xapi(path, output_path, **kwargs)

    raise NotImplementedError(f"Normalization for format '{format_hint}' ({ext}) not implemented.")
