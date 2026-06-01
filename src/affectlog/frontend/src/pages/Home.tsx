import React, { useEffect, useState } from "react";
import { checkHealth } from "../api";

export default function Home() {
  const [health, setHealth] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    checkHealth().then(setHealth).catch(() => setHealth({ status: "unreachable" }));
  }, []);

  return (
    <div>
      <h1>AffectLog ALT-AI Dashboard</h1>
      <p style={{ color: "#94a3b8" }}>
        Trustworthy AI Assessment Building Block — D3.7 EDGE-Skills / Prometheus-X
      </p>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <strong>API Status:</strong>{" "}
        {health ? (
          <span className={`badge-${health.status === "ok" ? "ok" : "err"}`}>{health.status}</span>
        ) : "Checking…"}
        {health?.version && <span style={{ marginLeft: "1rem", color: "#64748b" }}>v{health.version}</span>}
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>What is ALT-AI?</h3>
          <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>
            ALT-AI profiles educational AI datasets, applies privacy-preserving pseudonymisation,
            computes fairness and concentration metrics, and generates EU AI Act / GDPR compliance exports.
          </p>
        </div>
        <div className="card">
          <h3>Quick Links</h3>
          <ul style={{ color: "#94a3b8" }}>
            <li><a href="/datasets">→ Validate &amp; ingest a dataset</a></li>
            <li><a href="/audit">→ Run a trustworthy AI audit</a></li>
            <li><a href="/compliance">→ View compliance exports</a></li>
            <li><a href="/openapi.json" target="_blank" rel="noopener">→ OpenAPI spec</a></li>
            <li><a href="/docs" target="_blank" rel="noopener">→ Swagger UI</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
