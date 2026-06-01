import React, { useState } from "react";
import { runAudit, getAudit, getAuditMetrics } from "../api";

interface Props {
  onComplete: (runId: string, metrics: Record<string, unknown>) => void;
}

export default function AuditRun({ onComplete }: Props) {
  const [inputPath, setInputPath] = useState("");
  const [recipe, setRecipe] = useState("configs/recipes/maskott_tactileo.yaml");
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");

  async function handleRun() {
    setRunning(true);
    setStatus("Starting audit...");
    try {
      const runResp = await runAudit(inputPath, recipe);
      const runId = runResp.run_id;
      setStatus(`Run started: ${runId}. Polling...`);
      // Poll every 3s for up to 60s
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const statusResp = await getAudit(runId);
        setStatus(`Status: ${statusResp.status}`);
        if (statusResp.status === "completed") {
          const metrics = await getAuditMetrics(runId);
          onComplete(runId, metrics.metrics || {});
          setStatus("Audit complete!");
          break;
        }
        if (statusResp.status === "failed") {
          setStatus("Audit failed. Check server logs.");
          break;
        }
      }
    } catch (e) {
      setStatus("Error: " + String(e));
    }
    setRunning(false);
  }

  return (
    <div className="card">
      <h3>Run Audit</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input
          style={{ background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", padding: "0.5rem", borderRadius: "4px" }}
          placeholder="Input path (JSONL or CSV)"
          value={inputPath}
          onChange={(e) => setInputPath(e.target.value)}
        />
        <input
          style={{ background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", padding: "0.5rem", borderRadius: "4px" }}
          placeholder="Recipe path"
          value={recipe}
          onChange={(e) => setRecipe(e.target.value)}
        />
        <button
          onClick={handleRun}
          disabled={running || !inputPath}
          style={{ background: "#6366f1", color: "white", border: "none", padding: "0.6rem 1rem", borderRadius: "4px", cursor: "pointer" }}
        >
          {running ? "Running…" : "Start Audit"}
        </button>
        {status && <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{status}</p>}
      </div>
    </div>
  );
}
