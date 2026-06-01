import React, { useState } from "react";
import { validateDataset } from "../api";

export default function Datasets() {
  const [filePath, setFilePath] = useState("");
  const [schema, setSchema] = useState("maskott_csv_v1");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleValidate() {
    setLoading(true);
    setResult(null);
    const r = await validateDataset(filePath, schema);
    setResult(r);
    setLoading(false);
  }

  return (
    <div>
      <h2>Dataset Validation</h2>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <input
            style={{ flex: 1, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", padding: "0.5rem", borderRadius: "4px" }}
            placeholder="File path (e.g. data/samples/maskott_csv_sample.csv)"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
          />
          <select
            style={{ background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", padding: "0.5rem", borderRadius: "4px" }}
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
          >
            <option value="maskott_csv_v1">maskott_csv_v1</option>
          </select>
          <button
            onClick={handleValidate}
            disabled={loading || !filePath}
            style={{ background: "#6366f1", color: "white", border: "none", padding: "0.6rem 1rem", borderRadius: "4px", cursor: "pointer" }}
          >
            {loading ? "Validating…" : "Validate"}
          </button>
        </div>
      </div>
      {result && (
        <div className="card">
          <div style={{ marginBottom: "0.5rem" }}>
            <span className={`badge-${result.valid ? "ok" : "err"}`}>
              {result.valid ? "✓ VALID" : "✗ INVALID"}
            </span>
          </div>
          {(result.missing_columns as string[])?.length > 0 && (
            <p style={{ color: "#fca5a5" }}>Missing: {(result.missing_columns as string[]).join(", ")}</p>
          )}
          {(result.extra_columns as string[])?.length > 0 && (
            <p style={{ color: "#fcd34d" }}>Extra columns: {(result.extra_columns as string[]).join(", ")}</p>
          )}
          <details>
            <summary style={{ color: "#64748b", cursor: "pointer" }}>Raw response</summary>
            <pre style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
