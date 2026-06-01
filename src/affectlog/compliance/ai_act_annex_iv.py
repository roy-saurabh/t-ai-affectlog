"""EU AI Act Annex IV-style technical documentation fields."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from affectlog.core.time import now_iso


def build_annex_iv(run_id: str, model_meta: dict[str, Any] | None = None) -> dict[str, Any]:
    return {
        "annex_iv_version": "EU AI Act 2024",
        "generated_at": now_iso(),
        "run_id": run_id,
        "article_11_technical_documentation": {
            "general_description": "AffectLog ALT-AI assessment building block for educational recommendation AI.",
            "purpose_intended_use": "Trustworthy AI assessment; explainability; fairness; privacy; compliance.",
            "persons_responsible": "AffectLog / Prometheus-X EDGE-Skills consortium",
            "capabilities_limitations": (
                "Processes xAPI-normalized educational interaction logs. "
                "Dataset-only mode does not require a model. "
                "Model adapter supports sklearn, ONNX, PyTorch, TensorFlow."
            ),
            "accuracy_robustness_cybersecurity": (
                "HMAC-SHA256 pseudonymisation applied to all personal identifiers. "
                "No raw personal data in public artifacts. "
                "Audit trail via run manifests and config hashes."
            ),
        },
        "article_13_transparency": {
            "instructions_for_use": "See docs/ and CLI --help for usage instructions.",
            "intended_purpose_description": "Dataset profiling, fairness metrics, compliance documentation.",
            "capability_boundaries": "Not a production recommendation model; assessment tool only.",
        },
        "article_14_human_oversight": {
            "measures": [
                "SOP.md generated for every audit run — human review required before sharing outputs.",
                "Risk score included in privacy_report.json.",
                "Recommendations for mitigations surfaced in SOP.",
            ],
        },
        "model_metadata": model_meta or {},
    }


def export_annex_iv(doc: dict[str, Any], output_path: Path | str) -> None:
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    Path(output_path).write_text(json.dumps(doc, indent=2))
