import React, { useState } from "react";
import AuditRun from "../components/AuditRun";
import MetricsCards from "../components/MetricsCards";
import BiasDashboard from "../components/BiasDashboard";
import RunArtifacts from "../components/RunArtifacts";
import { getAudit } from "../api";

export default function Audit() {
  const [runId, setRunId] = useState("");
  const [metrics, setMetrics] = useState<Record<string, unknown>>({});
  const [dashboardPayload, setDashboardPayload] = useState<Record<string, unknown>>({});

  function handleComplete(rid: string, m: Record<string, unknown>) {
    setRunId(rid);
    setMetrics(m);
  }

  async function handleLookup() {
    if (!runId) return;
    const audit = await getAudit(runId);
    if (audit.artifacts) setDashboardPayload(audit);
  }

  return (
    <div>
      <h2>Trustworthy AI Audit</h2>
      <AuditRun onComplete={handleComplete} />
      {runId && (
        <>
          <div style={{ margin: "1.5rem 0" }}>
            <h3>Metrics</h3>
            <MetricsCards metrics={metrics as any} />
          </div>
          <div style={{ margin: "1.5rem 0" }}>
            <h3>Distribution Charts</h3>
            <BiasDashboard
              resourceTypeDistribution={(metrics.resource_type_distribution as any) || {}}
              verbDistribution={(metrics.verb_distribution as any) || {}}
              topResources={(metrics.top_10_resources as any) || []}
            />
          </div>
          <RunArtifacts artifacts={(metrics as any).artifacts || {}} runId={runId} />
        </>
      )}
    </div>
  );
}
