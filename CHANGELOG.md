# Changelog

All notable changes to ALT-AI are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.1.0] - 2024-12-20

### Added
- Initial public release aligned with D3.7 Trustworthy AI deliverable
- Maskott/Tactileo CSV ingestion with 1M+ row streaming via Polars
- xAPI / Becomino JSON normalization with template inference
- Privacy layer: PII detection, SHA-256/HMAC pseudonymisation, redaction
- Profiling: schema, descriptive statistics, temporal, sparsity, entropy
- Metrics: Gini, Coverage@K, sparsity ratio, entity/resource dominance, representation index
- Compliance exports: JSON-LD graph, Data Card, Model Card, SOP, GDPR field inventory
- Recipe-driven audit pipeline (YAML configuration)
- FastAPI backend with OpenAPI 3.1
- React + Vite dashboard
- CLI: validate-csv, convert-csv, audit, profile, compliance-export, sop, generate-synthetic, serve
- Model adapters: scikit-learn, ONNX, PyTorch, TensorFlow, HTTP, dummy
- Explanation generator with SHAP and permutation importance
- Mock PDC client for Prometheus-X connector interoperability
- Full pytest suite (unit, integration, performance)
- GitHub Actions CI/CD
- Docker Compose deployment
- MkDocs documentation
