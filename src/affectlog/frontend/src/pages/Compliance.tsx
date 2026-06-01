import React, { useState } from "react";
import { getComplianceGraph, getAuditSop } from "../api";

export default function Compliance() {
  const [runId, setRunId] = useState("");
  const [graph, setGraph] = useState<Record<string, unknown> | null>(null);
  const [sop, setSop] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleLoad() {
    setLoading(true);
    try {
      const [g, s] = await Promise.all([getComplianceGraph(runId), getAuditSop(runId)]);
      setGraph(g);
      setSop(s);
    } catch (e) {
      setGraph({ error: String(e) });
    }
    setLoading(false);
  }

  return (
    <div>
      <h2>Compliance Exports</h2>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <input
            style={{ flex: 1, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", padding: "0.5rem", borderRadius: "4px" }}
            placeholder="Run ID (e.g. run_20240315T..."
            value={runId}
            onChange={(e) => setRunId(e.target.value)}
          />
          <button
            onClick={handleLoad}
            disabled={loading || !runId}
            style={{ background: "#6366f1", color: "white", border: "none", padding: "0.6rem 1rem", borderRadius: "4px", cursor: "pointer" }}
          >
            {loading ? "Loading…" : "Load"}
          </button>
        </div>
      </div>

      {graph && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <h3>JSON-LD Compliance Graph</h3>
          <pre style={{ color: "#94a3b8", fontSize: "0.78rem", maxHeight: "300px", overflow: "auto" }}>
            {JSON.stringify(graph, null, 2)}
          </pre>
        </div>
      )}

      {sop && (
        <div className="card">
          <h3>SOP.md</h3>
          <pre style={{ color: "#94a3b8", fontSize: "0.78rem", maxHeight: "400px", overflow: "auto", whiteSpace: "pre-wrap" }}>
            {sop}
          </pre>
        </div>
      )}
    </div>
  );
}
