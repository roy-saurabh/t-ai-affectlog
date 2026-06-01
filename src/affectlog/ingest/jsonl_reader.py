"""JSONL-specific streaming reader (alias to json_reader for clarity)."""

from affectlog.ingest.json_reader import iter_jsonl, read_json

__all__ = ["iter_jsonl", "read_json"]
