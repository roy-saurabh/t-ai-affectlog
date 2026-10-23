import React, { useState } from "react";
import { ShieldCheck, FileText, Download, CheckCircle2, ChevronRight } from "lucide-react";
import { getComplianceGraph, getAuditSop } from "../api";

const EU_AI_CHECKLIST = [
  { id: "1.a", text: "AI system purpose and intended use documented", category: "Purpose" },
  { id: "1.b", text: "Developer/deployer identity registered", category: "Purpose" },
  { id: "2.a", text: "General description of AI system capabilities provided", category: "Description" },
  { id: "2.b", text: "Interaction with hardware/software described", category: "Description" },
  { id: "3.a", text: "Training/validation/testing data documented (Data Cards)", category: "Data" },
  { id: "3.b", text: "GDPR field inventory complete", category: "Data" },
  { id: "3.c", text: "Pseudonymisation applied to personal identifiers", category: "Data" },
  { id: "4.a", text: "Logging and event traceability implemented", category: "Monitoring" },
  { id: "4.b", text: "Audit run manifest with config_hash recorded", category: "Monitoring" },
  { id: "5.a", text: "Fairness/representation metrics computed", category: "Fairness" },
  { id: "5.b", text: "Concentration (Gini) analysis documented", category: "Fairness" },
  { id: "6.a", text: "SOP document generated for each audit run", category: "Compliance" },
  { id: "6.b", text: "JSON-LD compliance graph exported", category: "Compliance" },
];

export default function Compliance() {
  const [runId, setRunId] = useState("");
  const [graph, setGraph] = useState<Record<string, unknown> | null>(null);
  const [sop, setSop] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"checklist" | "sop" | "graph">("checklist");

  async function handleLoad() {
    setLoading(true);
    setError("");
    try {
      const [g, s] = await Promise.all([
        getComplianceGraph(runId).catch(() => null),
        getAuditSop(runId).catch(() => ""),
      ]);
      setGraph(g);
      setSop(s);
    } catch {
      setError("Could not load compliance data for this run.");
    }
    setLoading(false);
  }

  const tabs = [
    { id: "checklist" as const, label: "EU AI Act Checklist" },
    { id: "sop" as const, label: "SOP Document", disabled: !sop },
    { id: "graph" as const, label: "JSON-LD Graph", disabled: !graph },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Compliance Exports</h1>
        <p className="text-slate-400 text-sm">
          EU AI Act Annex IV, GDPR field inventory, JSON-LD compliance graph, and SOP documentation.
        </p>
      </div>

      {/* Run loader */}
      <div className="card">
        <h2 className="font-semibold text-slate-100 mb-3 flex items-center gap-2">
          <ChevronRight size={16} className="text-indigo-400" /> Load Audit Run
        </h2>
        <div className="flex gap-3 flex-wrap">
          <input
            className="input flex-1 min-w-48"
            placeholder="Run ID (e.g. 01J2KQZXM…)"
            value={runId}
            onChange={(e) => setRunId(e.target.value)}
          />
          <button onClick={handleLoad} disabled={loading || !runId} className="btn-primary">
            <ShieldCheck size={15} />
            {loading ? "Loading…" : "Load Compliance"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-700">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => !t.disabled && setActiveTab(t.id)}
            disabled={t.disabled}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px
              ${activeTab === t.id ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"}
              ${t.disabled ? "opacity-40 cursor-default" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* EU AI Act checklist */}
      {activeTab === "checklist" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            ALT-AI automatically generates these artifacts for every audit run.
            Load a run above to verify specific export completeness.
          </p>
          {["Purpose", "Description", "Data", "Monitoring", "Fairness", "Compliance"].map((cat) => (
            <div key={cat} className="card">
              <h3 className="font-medium text-slate-300 mb-3 text-sm flex items-center gap-2">
                <ShieldCheck size={14} className="text-indigo-400" />
                {cat}
              </h3>
              <div className="space-y-2">
                {EU_AI_CHECKLIST.filter((c) => c.category === cat).map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{item.text}</span>
                    <span className="ml-auto text-xs text-slate-600 font-mono flex-shrink-0">{item.id}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SOP document */}
      {activeTab === "sop" && sop && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              <FileText size={16} className="text-emerald-400" /> Standard Operating Procedure
            </h3>
            <button
              onClick={() => {
                const blob = new Blob([sop], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `SOP-${runId}.md`;
                a.click();
              }}
              className="btn-ghost text-xs"
            >
              <Download size={13} /> Download
            </button>
          </div>
          <pre className="text-xs text-slate-400 font-mono leading-relaxed max-h-[500px] overflow-auto whitespace-pre-wrap bg-slate-900/50 rounded-lg p-4">
            {sop}
          </pre>
        </div>
      )}

      {/* JSON-LD graph */}
      {activeTab === "graph" && graph && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-100">JSON-LD Compliance Graph</h3>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(graph, null, 2)], { type: "application/ld+json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `compliance-${runId}.jsonld`;
                a.click();
              }}
              className="btn-ghost text-xs"
            >
              <Download size={13} /> Download
            </button>
          </div>
          {/* Key graph fields */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {["@type", "identifier", "name", "version"].map((k) => (
              graph[k] != null && (
                <div key={k} className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-slate-600 font-mono mb-0.5">{k}</div>
                  <div className="text-sm text-slate-300 font-mono">{String(graph[k])}</div>
                </div>
              )
            ))}
          </div>
          <pre className="text-xs text-slate-500 font-mono leading-relaxed max-h-80 overflow-auto whitespace-pre-wrap bg-slate-900/50 rounded-lg p-4">
            {JSON.stringify(graph, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
