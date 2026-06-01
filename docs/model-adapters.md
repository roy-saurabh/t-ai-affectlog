# Model Adapters

ALT-AI supports multiple model backends through a standardized `BaseModelAdapter` interface.

## Available Adapters

| Adapter | Class | Load from |
|---|---|---|
| scikit-learn | `SklearnAdapter` | `.joblib` or `.pkl` |
| ONNX | `OnnxAdapter` | `.onnx` file |
| PyTorch | `TorchAdapter` | TorchScript `.pt` |
| TensorFlow/Keras | `TensorFlowAdapter` | SavedModel or `.h5` |
| HTTP | `HttpAdapter` | External endpoint URL |
| Dummy | `DummyAdapter` | No file (for tests) |

## Dataset-Only Mode

Models are **optional**. All dataset profiling, privacy, and compliance features work without a model.

## Implementing a Custom Adapter

```python
from affectlog.models.base import BaseModelAdapter
import numpy as np

class MyAdapter(BaseModelAdapter):
    def predict(self, X: np.ndarray) -> list:
        return [0] * len(X)

    def metadata(self) -> dict:
        return {"adapter": "my_adapter", "version": "1.0"}
```

## Registering via API

```bash
curl -X POST http://localhost:8000/v1/models/register \
  -d '{"model_path": "model.joblib", "adapter_type": "sklearn"}'
```
