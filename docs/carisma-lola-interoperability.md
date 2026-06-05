# CARiSMA and LOLA Interoperability

AffectLog is designed as a **complementary** component in the Prometheus-X Trustworthy AI Assessment ecosystem (BB04). It does not replace CARiSMA or LOLA, but is designed for metadata interoperability and complementary coverage.

---

## Ecosystem positioning

| Component | Affiliation | Role | AffectLog relationship |
|-----------|-------------|------|----------------------|
| **CARiSMA** | University of Koblenz | Design-time risk, compliance, and security analysis | Integration-ready; metadata export compatible |
| **LOLA** | LORIA / Université de Lorraine | Algorithm evaluation scenarios under secure execution | Shared metrics vocabulary; metadata interoperability |
| **AffectLog** | Prometheus-X / EDGE-Skills | Operation-time dataset and model assessment | This platform |

---

## CARiSMA integration

### What CARiSMA does

CARiSMA (Compliance, Analysis, Risk, and Security Modelling of Applications) from the University of Koblenz supports:

- Model-based security and risk analysis at **design time**
- Compliance analysis against regulatory frameworks
- Detection of design-level security policy violations

### What AffectLog exports for CARiSMA

AffectLog exports **operation-time** dataset and model audit findings in a structured JSON format that CARiSMA workflows can consume for cross-referencing with design-time risk analyses.

**Schema endpoint:**
```
GET /v1/interoperability/carisma/schema
```

**Export endpoint:**
```
POST /v1/interoperability/carisma/export
```
Body: `dashboard_payload.json` from a completed audit run.

**Import CARiSMA report:**
```
POST /v1/interoperability/carisma/import-report
```
Body: CARiSMA report JSON — stored for cross-referencing.

### Exchange format

```json
{
  "schemaVersion": "1.0",
  "exportType": "dataset_audit",
  "generatedAt": "2026-06-02T10:00:00Z",
  "sourceSystem": "AffectLog Trustworthy AI Assessment v1.0",
  "auditRunId": "run-001",
  "auditSummary": {
    "privacyRiskLevel": "low",
    "piiFieldsDetected": 2,
    "pseudonymisationApplied": true,
    "rowCount": 50000,
    "completenessScore": 0.97,
    "qualityScore": 0.91,
    "fairnessFlags": ["long_tail_imbalance"]
  },
  "concentrationMetrics": {
    "giniCoefficient": 0.42,
    "dominanceRatio": 0.15,
    "coverageAtK": 0.78
  },
  "complianceMappings": {
    "gdprArticlesTriggered": ["Art.5", "Art.25"],
    "aiActAnnexIVRelevant": true,
    "dataGovernancePolicyRef": "https://github.com/Prometheus-X-association/t-ai-affectlog/docs/data-governance.md"
  },
  "carismaAnnotations": {}
}
```

### Important notes

- AffectLog does **not** execute CARiSMA directly.
- No CARiSMA service endpoint is contacted unless explicitly configured.
- The exchange format is AffectLog → CARiSMA direction only; CARiSMA reports can be ingested as external evidence via `/v1/interoperability/carisma/import-report`.

---

## LOLA integration

### What LOLA does

LOLA (from LORIA / Université de Lorraine) supports:

- Algorithm evaluation scenarios using **real-world data** under secure execution conditions
- Evaluation of recommendation and personalisation algorithms
- Privacy-preserving evaluation protocols

### What AffectLog exports for LOLA

AffectLog exports dataset-level profiling metrics aligned with LOLA's evaluation vocabulary.

**Shared metrics vocabulary:**

| Metric | Definition |
|--------|-----------|
| `coverage_at_k` | Fraction of items with ≥ K interactions |
| `gini_coefficient` | Gini concentration over item distribution |
| `ndcg` | Normalised Discounted Cumulative Gain |
| `precision_at_k` | Precision@K for recommendation evaluation |
| `recall_at_k` | Recall@K |
| `hit_rate` | Fraction of users with ≥ 1 relevant item in top-K |
| `diversity` | Intra-list diversity of recommended items |
| `novelty` | Popularity-adjusted novelty |
| `personalization` | Degree of personalisation across users |
| `entropy` | Shannon entropy of activity distribution |
| `sparsity` | Fraction of missing user-item interactions |
| `long_tail_coverage` | Fraction of long-tail items represented |

**Schema endpoint:**
```
GET /v1/interoperability/lola/schema
```

**Metrics vocabulary:**
```
GET /v1/interoperability/lola/metrics-vocabulary
```

**Export endpoint:**
```
POST /v1/interoperability/lola/export
```

**Import LOLA results:**
```
POST /v1/interoperability/lola/import-results
```

### Exchange format

```json
{
  "schemaVersion": "1.0",
  "exportType": "dataset_metrics",
  "generatedAt": "2026-06-02T10:00:00Z",
  "sourceSystem": "AffectLog Trustworthy AI Assessment v1.0",
  "auditRunId": "run-001",
  "scenarioId": "lola-scenario-42",
  "metrics": {
    "coverage_at_k": 0.78,
    "gini_coefficient": 0.42,
    "entropy": 3.2,
    "sparsity": 0.85
  },
  "datasetProfile": {
    "rowCount": 50000,
    "entityCount": 1200,
    "resourceCount": 340,
    "temporalSpanDays": 180
  },
  "lolaAnnotations": {}
}
```

### Important notes

- AffectLog does **not** claim direct operational integration with LOLA unless a LOLA service endpoint is explicitly configured.
- The shared metrics vocabulary enables cross-system reporting, not joint execution.
- LOLA results can be imported as external evidence for cross-referencing.

---

## Full exchange example

See [`examples/carisma_lola_interoperability/metadata-exchange-example.json`](../examples/carisma_lola_interoperability/metadata-exchange-example.json) for a complete worked example.

---

## Reference links

- [Prometheus-X BB04 Technical Documentation](https://prometheus-x-association.github.io/docs/t-ai/)
- [Prometheus-X Association](https://prometheus-x.org/)
- [AffectLog GitHub Repository](https://github.com/Prometheus-X-association/t-ai-affectlog)
