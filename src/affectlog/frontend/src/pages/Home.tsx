import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical, Database, ShieldCheck, Cpu, Clock, FileText, ArrowRight, TrendingUp } from "lucide-react";
import { checkHealth, listRuns, RunEntry } from "../api";

function QuickAction({ icon: Icon, title, desc, to, color }: {
  icon: React.ElementType; title: string; desc: string; to: string; color: string;
}) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => nav(to)}
      className="card text-left hover:border-indigo-500/50 hover:bg-slate-700/50 transition-all group w-full"
    >
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="font-semibold text-slate-100 mb-1 group-hover:text-white">{title}</div>
      <div className="text-sm text-slate-500 group-hover:text-slate-400">{desc}</div>
      <div className="mt-3 flex items-center gap-1 text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
        Open <ArrowRight size={12} />
      </div>
    </button>
  );
}

export default function Home() {
  const [health, setHealth] = useState<{ status: string; version?: string } | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);

  useEffect(() => {
    checkHealth().then(setHealth).catch(() => setHealth({ status: "error" }));
    listRuns().then((r) => setRuns(r.runs.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Hero */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          AffectLog Trustworthy AI
        </h1>
        <p className="text-slate-400 text-sm">
          Assessment Building Block (ALT-AI) · D3.7 EDGE-Skills / Prometheus-X ·{" "}
          <span className="text-slate-500">Dataset profiling · Fairness metrics · EU AI Act compliance</span>
        </p>
      </div>

      {/* Status row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "API Status",
            value: health?.status === "ok" ? "Online" : health ? "Error" : "…",
            sub: health?.version ? `v${health.version}` : "",
            accent: health?.status === "ok" ? "text-emerald-400" : "text-red-400",
          },
          {
            label: "Total Runs",
            value: runs.length > 0 ? String(runs.length) : "—",
            sub: "audit runs",
            accent: "text-indigo-400",
          },
          {
            label: "TRL Level",
            value: "5",
            sub: "validated",
            accent: "text-violet-400",
          },
          {
            label: "Deliverable",
            value: "D3.7",
            sub: "EDGE-Skills WP3",
            accent: "text-sky-400",
          },
        ].map((s) => (
          <div key={s.label} className="card-sm">
            <div className="stat-label mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.accent}`}>{s.value}</div>
            <div className="text-xs text-slate-600 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-title">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction
            icon={Database}
            title="Validate Dataset"
            desc="Check CSV schema against Maskott / xAPI spec"
            to="/app/datasets"
            color="bg-sky-600"
          />
          <QuickAction
            icon={FlaskConical}
            title="Run Audit"
            desc="Full pipeline: profile → metrics → compliance"
            to="/app/audit"
            color="bg-indigo-600"
          />
          <QuickAction
            icon={ShieldCheck}
            title="Compliance"
            desc="EU AI Act Annex IV, GDPR, SOP, JSON-LD"
            to="/app/compliance"
            color="bg-emerald-600"
          />
          <QuickAction
            icon={Cpu}
            title="Models"
            desc="Register adapters: sklearn, ONNX, PyTorch, TF"
            to="/app/models"
            color="bg-violet-600"
          />
        </div>
      </div>

      {/* Recent Runs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Recent Audit Runs</h2>
          <a href="/app/audit" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            Run new audit <ArrowRight size={12} />
          </a>
        </div>
        {runs.length === 0 ? (
          <div className="card border-dashed border-slate-600 text-center py-10">
            <TrendingUp size={32} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-500 text-sm">No audit runs yet.</p>
            <p className="text-slate-600 text-xs mt-1">
              Go to the Audit page and run the pipeline on a dataset.
            </p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Run ID</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Recipe</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Artifacts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {runs.map((r) => (
                  <tr key={r.run_id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-indigo-400 text-xs font-mono">{r.run_id}</code>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{r.recipe || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={r.status === "completed" ? "badge-ok" : r.status === "running" ? "badge-info" : "badge-warn"}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {r.artifacts?.length ?? 0} files
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pipeline overview */}
      <div>
        <h2 className="section-title">Audit Pipeline Stages</h2>
        <div className="flex flex-wrap gap-2 items-center">
          {[
            "Ingest", "Validate", "PII Scan", "Pseudonymise", "Normalise xAPI",
            "Profile Schema", "Descriptive Stats", "Temporal", "Concentration",
            "Coverage@K", "Fairness", "Compliance Map", "Export Artifacts",
          ].map((stage, i, arr) => (
            <React.Fragment key={stage}>
              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs text-slate-400 font-mono">
                {stage}
              </span>
              {i < arr.length - 1 && (
                <ArrowRight size={12} className="text-slate-700 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
