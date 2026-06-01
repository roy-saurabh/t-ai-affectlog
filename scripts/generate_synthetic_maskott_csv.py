#!/usr/bin/env python3
"""
Generate a synthetic Maskott-style CSV dataset for testing and benchmarks.

Usage:
  python scripts/generate_synthetic_maskott_csv.py --rows 1000000 --output data/samples/maskott_1m.csv
  affectlog generate-synthetic --rows 1000000 --output data/samples/maskott_1m.csv
"""

from __future__ import annotations

import argparse
import base64
import csv
import os
import random
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path


VIEW_CONTEXTS = ["GROUP_SESSION", "TEST", "ACCESSED", "OPENED", "SEARCHED"]
RESOURCE_TYPES = ["ACTIVITY", "DOCUMENT", "VIDEO", "QUIZ", "EXERCISE", "LINK"]
N_ENTITIES = 5000
N_RESOURCES = 2000
N_COLLECTIONS = 50
ENTITY_UAI_CODES = [f"0{random.randint(100000, 999999):07d}{chr(65 + i % 26)}" for i in range(100)]


def _random_base64_id(rng: random.Random) -> str:
    raw = bytes([rng.randint(0, 255) for _ in range(16)])
    return base64.b64encode(raw).decode("ascii")


def generate_csv(output_path: Path | str, n_rows: int = 1_000_000, seed: int = 42) -> None:
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    rng = random.Random(seed)
    start_date = datetime(2024, 1, 1, tzinfo=timezone.utc)

    entities = [f"entity_{i:05d}" for i in range(N_ENTITIES)]
    resources = [_random_base64_id(rng) for _ in range(N_RESOURCES)]
    collections = [_random_base64_id(rng) for _ in range(N_COLLECTIONS)]
    uai_codes = ENTITY_UAI_CODES

    HEADERS = [
        "_id", "AccessDate", "ViewContext", "ResourceId", "ResourceType",
        "CollectionId", "ActivitySessionId", "Duration", "EntityId",
        "EntityUaiCode", "IsViewerAuthor", "IsViewerAnonymous",
    ]

    chunk_size = 50_000
    written = 0

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(HEADERS)

        while written < n_rows:
            batch = min(chunk_size, n_rows - written)
            rows = []
            for _ in range(batch):
                entity_idx = int(rng.expovariate(0.002)) % N_ENTITIES  # heavy-tail
                entity_id = entities[entity_idx]
                resource_idx = int(rng.expovariate(0.001)) % N_RESOURCES
                resource_id = resources[resource_idx]
                ts = start_date + timedelta(
                    seconds=rng.randint(0, 365 * 24 * 3600)
                )
                is_anon = rng.random() < 0.3
                is_author = rng.random() < 0.05
                duration = rng.randint(1, 7200) if rng.random() < 0.8 else ""
                has_collection = rng.random() < 0.6
                rows.append([
                    _random_base64_id(rng),
                    ts.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
                    rng.choice(VIEW_CONTEXTS),
                    resource_id,
                    rng.choice(RESOURCE_TYPES),
                    rng.choice(collections) if has_collection else "",
                    _random_base64_id(rng),
                    str(duration),
                    entity_id if not is_anon else entity_id,
                    rng.choice(uai_codes),
                    str(is_author).lower(),
                    str(is_anon).lower(),
                ])
            writer.writerows(rows)
            written += batch
            print(f"  {written:,} / {n_rows:,} rows written...", end="\r", flush=True)

    print(f"\nDone. Synthetic CSV: {output_path} ({written:,} rows)")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate synthetic Maskott CSV")
    parser.add_argument("--rows", type=int, default=100_000)
    parser.add_argument("--output", type=str, default="data/samples/maskott_synthetic.csv")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    generate_csv(args.output, args.rows, args.seed)


if __name__ == "__main__":
    main()
