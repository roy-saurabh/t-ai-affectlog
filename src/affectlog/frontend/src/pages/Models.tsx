import React from "react";

export default function Models() {
  return (
    <div>
      <h2>Model Management</h2>
      <div className="card">
        <p style={{ color: "#94a3b8" }}>
          Register a model via the API (<code>POST /v1/models/register</code>) to enable
          predictions, explanations, and model card generation.
        </p>
        <p style={{ color: "#64748b" }}>
          Supported adapters: <strong>sklearn</strong>, <strong>onnx</strong>,{" "}
          <strong>torch</strong>, <strong>tensorflow</strong>, <strong>http</strong>, <strong>dummy</strong>
        </p>
        <a href="/docs#/Models" target="_blank" rel="noopener">→ Open Swagger UI for model endpoints</a>
      </div>
    </div>
  );
}
