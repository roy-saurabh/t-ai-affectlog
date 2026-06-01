const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function checkHealth() {
  const resp = await fetch(`${API_BASE}/healthz`);
  return resp.json();
}

export async function validateDataset(filePath: string, schemaName = "maskott_csv_v1") {
  const resp = await fetch(`${API_BASE}/v1/datasets/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_path: filePath, schema_name: schemaName }),
  });
  return resp.json();
}

export async function runAudit(inputPath: string, recipe: string, outputDir?: string) {
  const resp = await fetch(`${API_BASE}/v1/audits/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input_path: inputPath, recipe, output_dir: outputDir }),
  });
  return resp.json();
}

export async function getAudit(runId: string) {
  const resp = await fetch(`${API_BASE}/v1/audits/${runId}`);
  return resp.json();
}

export async function getAuditMetrics(runId: string) {
  const resp = await fetch(`${API_BASE}/v1/audits/${runId}/metrics`);
  return resp.json();
}

export async function getAuditSop(runId: string): Promise<string> {
  const resp = await fetch(`${API_BASE}/v1/audits/${runId}/sop`);
  return resp.text();
}

export async function getComplianceGraph(runId: string) {
  const resp = await fetch(`${API_BASE}/v1/audits/${runId}/compliance-graph`);
  return resp.json();
}
