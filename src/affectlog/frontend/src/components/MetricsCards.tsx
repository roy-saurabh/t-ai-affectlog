import React from "react";

interface Metrics {
  total_events?: number;
  unique_actors?: number;
  unique_resources?: number;
  actor_gini?: number;
  resource_gini?: number;
  sparsity_ratio?: number;
  overall_completeness?: number;
  risk_level?: string;
}

function MetricCard({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="card">
      <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: "0.25rem" }}>{label}</div>
      <div className="metric-value">{value !== undefined ? String(value) : "—"}</div>
    </div>
  );
}

export default function MetricsCards({ metrics }: { metrics: Metrics }) {
  return (
    <div className="grid-4">
      <MetricCard label="Total Events" value={metrics.total_events?.toLocaleString()} />
      <MetricCard label="Unique Actors" value={metrics.unique_actors?.toLocaleString()} />
      <MetricCard label="Unique Resources" value={metrics.unique_resources?.toLocaleString()} />
      <MetricCard label="Actor Gini" value={metrics.actor_gini?.toFixed(3)} />
      <MetricCard label="Resource Gini" value={metrics.resource_gini?.toFixed(3)} />
      <MetricCard label="Sparsity Ratio" value={metrics.sparsity_ratio?.toFixed(4)} />
      <MetricCard label="Completeness" value={metrics.overall_completeness ? (metrics.overall_completeness * 100).toFixed(1) + "%" : undefined} />
      <div className="card">
        <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Privacy Risk</div>
        <span className={`badge-${metrics.risk_level === "low" ? "ok" : metrics.risk_level === "medium" ? "warn" : "err"}`}>
          {metrics.risk_level || "—"}
        </span>
      </div>
    </div>
  );
}
