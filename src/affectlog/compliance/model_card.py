"""Model Card generation following Mitchell et al. 2019."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional

from affectlog.core.time import now_iso


def build_model_card(
    model_id: str,
    adapter_meta: dict[str, Any],
    feature_importance: Optional[dict[str, Any]] = None,
    comparison: Optional[dict[str, Any]] = None,
    dataset_name: str = "unknown",
    run_id: str = "unknown",
) -> dict[str, Any]:
    return {
        "model_card_version": "1.0",
        "generated_at": now_iso(),
        "run_id": run_id,
        "model": {
            "id": model_id,
            "adapter": adapter_meta.get("adapter", "unknown"),
            "class": adapter_meta.get("class", "unknown"),
            "params": adapter_meta.get("params", {}),
            "feature_names": adapter_meta.get("feature_names", []),
        },
        "intended_use": "Post-training trustworthy AI assessment; fairness and explainability analysis.",
        "out_of_scope": "Not for direct deployment as a production model without further validation.",
        "factors": {
            "dataset": dataset_name,
            "sensitive_features": "None explicitly — fairness analysis uses non-sensitive group proxies.",
        },
        "metrics": {
            "feature_importance": feature_importance or {},
            "comparison": comparison or {},
        },
        "ethical_considerations": [
            "Model trained on pseudonymised educational interaction data.",
            "Feature importance may surface proxy variables correlated with sensitive attributes.",
            "Fairness should be evaluated per institution type and learner cohort before deployment.",
        ],
        "caveats": [
            "Model card generated from synthetic or pseudonymised data.",
            "Real-world performance may differ; validate before operational use.",
        ],
        "eu_ai_act_annex_iv": {
            "technical_documentation_status": "partial",
            "risk_category": "limited_risk",
            "human_oversight": True,
            "transparency_measures": ["SHAP / permutation feature importance", "model card publication"],
        },
    }


def export_model_card(card: dict[str, Any], output_path: Path | str) -> None:
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(card, indent=2, ensure_ascii=False))
