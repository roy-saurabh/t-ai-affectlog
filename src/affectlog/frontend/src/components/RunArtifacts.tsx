import React from "react";

interface Props {
  artifacts: Record<string, string>;
  runId: string;
}

const DOWNLOAD_LABELS: Record<string, string> = {
  metrics: "metrics.json",
  compliance_graph: "compliance_graph.jsonld",
  sop: "SOP.md",
  data_card: "data_card.json",
  model_card: "model_card.json",
  privacy_report: "privacy_report.json",
};

export default function RunArtifacts({ artifacts, runId }: Props) {
  if (!artifacts || Object.keys(artifacts).length === 0) {
    return <div className="card"><p style={{ color: "#64748b" }}>No artifacts available yet.</p></div>;
  }
  return (
    <div className="card">
      <h3>Artifacts — Run: <code>{runId}</code></h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {Object.entries(artifacts).map(([key, path]) => (
          <li key={key} style={{ padding: "0.4rem 0", borderBottom: "1px solid #334155" }}>
            <span style={{ color: "#94a3b8", marginRight: "1rem", fontSize: "0.85rem" }}>{DOWNLOAD_LABELS[key] || key}</span>
            <code style={{ color: "#6366f1", fontSize: "0.8rem" }}>{path}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
