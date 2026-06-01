# Compliance Mapping

## GDPR Alignment

| GDPR Article | ALT-AI Control |
|---|---|
| Art. 5(1)(f) — Integrity & confidentiality | HMAC-SHA256 pseudonymisation of identifiers |
| Art. 25 — Data protection by design | `allow_raw_identifiers=false` by default |
| Art. 32 — Security of processing | No raw personal data in output artifacts |
| Art. 5(1)(c) — Data minimisation | Only hash fields required for analysis |

## EU AI Act Annex IV

Generated `eu_ai_act_annex_iv.json` covers:
- Art. 11 — Technical documentation
- Art. 13 — Transparency
- Art. 14 — Human oversight

## JSON-LD Compliance Graph

The `compliance_graph.jsonld` uses:
- `dcat:Dataset` for dataset nodes
- `gdpr:ProcessingActivity` for pipeline stages
- `gdpr:PseudonymisationControl` for privacy controls
- `prov:Entity` for provenance
- ODRL policy references for PDC integration

## Data Card (Gebru et al. 2018)

Generated `data_card.json` documents:
- Dataset purpose and provenance
- Collection method
- Known biases (long-tail, entity concentration)
- Intended and out-of-scope uses

## Model Card (Mitchell et al. 2019)

Generated `model_card.json` (when model present) documents:
- Model purpose and intended use
- Feature importance
- Ethical considerations
- EU AI Act Annex IV fields
