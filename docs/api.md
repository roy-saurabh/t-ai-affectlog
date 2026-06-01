# API Reference

ALT-AI exposes a fully documented OpenAPI 3.1 REST API at `http://localhost:8000`.

## Swagger UI

Visit `http://localhost:8000/docs` after starting `affectlog serve`.

## OpenAPI Spec

`http://localhost:8000/openapi.json` or `docs/openapi.yaml`.

## Key Endpoints

### Health
```bash
curl http://localhost:8000/healthz
curl http://localhost:8000/readyz
```

### Validate Dataset
```bash
curl -X POST http://localhost:8000/v1/datasets/validate \
  -H "Content-Type: application/json" \
  -d '{"file_path": "data/samples/maskott_csv_sample.csv", "schema_name": "maskott_csv_v1"}'
```

### Run Audit
```bash
curl -X POST http://localhost:8000/v1/audits/run \
  -H "Content-Type: application/json" \
  -d '{"input_path": "data/samples/maskott_csv_sample.csv", "recipe": "configs/recipes/maskott_tactileo.yaml"}'
```

### Get Audit Metrics
```bash
curl http://localhost:8000/v1/audits/{run_id}/metrics
```

### Get Compliance Graph
```bash
curl http://localhost:8000/v1/audits/{run_id}/compliance-graph
```

### Register Model
```bash
curl -X POST http://localhost:8000/v1/models/register \
  -H "Content-Type: application/json" \
  -d '{"model_path": "tests/fixtures/model_sklearn.joblib", "adapter_type": "sklearn"}'
```

### Predict
```bash
curl -X POST http://localhost:8000/v1/models/{model_id}/predict \
  -H "Content-Type: application/json" \
  -d '{"instances": [[1.0, 2.0, 3.0]]}'
```
