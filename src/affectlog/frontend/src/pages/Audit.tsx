import React, { useEffect, useState } from "react";
import {
  PlayCircle, CheckCircle2, Clock, AlertCircle,
  ChevronRight, RefreshCw, FolderOpen,
} from "lucide-react";
import clsx from "clsx";
import {
  listDatasets, listRecipes, startAudit, getAuditStatus, getAuditDashboard,
  DashboardPayload, DataFile, Recipe,
} from "../api";
import MetricsCards from "../components/MetricsCards";
import GiniChart from "../components/GiniChart";
import CoverageChart from "../components/CoverageChart";
import PrivacyPanel from "../components/PrivacyPanel";
import BiasDashboard from "../components/BiasDashboard";
import RunArtifacts from "../components/RunArtifacts";

type Step = "configure" | "running" | "done" | "error";

const STAGES = [
  "validate", "pii_scan", "normalize_xapi", "profile_schema",
  "profile_statistics", "profile_temporal", "compute_concentration",
  "compute_coverage", "compute_fairness", "quality", "compliance_map",
];

function StageIcon({ index, currentIdx }: { index: number; currentIdx: number }) {
  if (index < currentIdx) return <CheckCircle2 size={12} className="flex-shrink-0" />;
  if (index === currentIdx) return <RefreshCw size={12} className="animate-spin flex-shrink-0" />;
  return <Clock size={12} className="flex-shrink-0" />;
}

function StageList({ currentIdx }: { currentIdx: number }) {
  return (
    <div className="space-y-1">
      {STAGES.map((stage, i) => (
        <div
          key={stage}
          className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-colors",
            i < currentIdx && "text-emerald-400",
            i === currentIdx && "text-indigo-400 bg-indigo-900/20",
            i > currentIdx && "text-slate-600",
          )}
        >
          <StageIcon index={i} currentIdx={currentIdx} />
          {stage.replace(/_/g, " ")}
        </div>
      ))}
    </div>
  );
}

export default function Audit() {
  const [files, setFiles] = useState<DataFile[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [inputPath, setInputPath] = useState("");
  const [recipePath, setRecipePath] = useState("");
  const [step, setStep] = useState<Step>("configure");
  const [statusMsg, setStatusMsg] = useState("");
  const [stageIdx, setStageIdx] = useState(0);
  const [runId, setRunId] = useState("");
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [activeTab, setActiveTab] = useState<"metrics" | "charts" | "artifacts">("metrics");

  useEffect(() => {
    listDatasets().then((d) => setFiles(d.files)).catch(() => {});
    listRecipes().then((d) => {
      setRecipes(d.recipes);
      if (d.recipes.length > 0) setRecipePath(d.recipes[0].path);
    }).catch(() => {});
  }, []);

  async function handleRun() {
    if (!inputPath || !recipePath) return;
    setStep("running");
    setStageIdx(0);
    setStatusMsg("Starting audit pipeline…");
    setPayload(null);

    try {
      const run = await startAudit(inputPath, recipePath);
      const rid = run.run_id;
      setRunId(rid);

      let stageI = 0;
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        stageI = Math.min(stageI + 1, STAGES.length - 1);
        setStageIdx(stageI);

        const status = await getAuditStatus(rid);
        setStatusMsg(`Status: ${status.status}`);

        if (status.status === "completed") {
          setStageIdx(STAGES.length);
          const dash = await getAuditDashboard(rid).catch(() => null);
          setPayload(dash);
          setStep("done");
          return;
        }
        if (status.status === "failed") {
          setStatusMsg("Audit pipeline failed — check server logs.");
          setStep("error");
          return;
        }
      }
      setStatusMsg("Timed out waiting for completion.");
      setStep("error");
    } catch (e) {
      setStatusMsg("Error: " + String(e));
      setStep("error");
    }
  }

  const csvFiles = files.filter((f) => f.format === "csv");
  const jsonlFiles = files.filter((f) => f.format !== "csv");

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Trustworthy AI Audit</h1>
        <p className="text-slate-400 text-sm">
          Run the full pipeline: ingest → privacy → profile → metrics → compliance exports.
        </p>
      </div>

      {/* Configure panel */}
      {(step === "configure" || step === "error") && (
        <div className="card space-y-5">
          <h2 className="font-semibold text-slate-100">Configure Pipeline</h2>

          {/* Input dataset */}
          <div>
            <label htmlFor="audit-input-path" className="stat-label block mb-2">Input Dataset</label>
            <div className="space-y-2">
              {/* Quick-select from available files */}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {[...csvFiles, ...jsonlFiles].slice(0, 8).map((f) => (
                    <button
                      key={f.path}
                      onClick={() => setInputPath(f.path)}
                      className={clsx(
                        "px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                        inputPath === f.path
                          ? "bg-indigo-600/30 border-indigo-500/50 text-indigo-300"
                          : "bg-slate-700/50 border-slate-600/50 text-slate-400 hover:text-slate-200 hover:border-slate-500",
                      )}
                    >
                      <FolderOpen size={11} className="inline mr-1 -mt-0.5" />
                      {f.name}
                    </button>
                  ))}
                </div>
              )}
              <input
                id="audit-input-path"
                className="input"
                placeholder="data/samples/maskott_csv_sample.csv"
                value={inputPath}
                onChange={(e) => setInputPath(e.target.value)}
              />
            </div>
          </div>

          {/* Recipe */}
          <div>
            <label htmlFor="audit-recipe" className="stat-label block mb-2">Pipeline Recipe</label>
            <select
              id="audit-recipe"
              className="select w-full"
              value={recipePath}
              onChange={(e) => setRecipePath(e.target.value)}
            >
              {recipes.map((r) => (
                <option key={r.path} value={r.path}>{r.name} — {r.filename}</option>
              ))}
              {recipes.length === 0 && (
                <option value="configs/recipes/maskott_tactileo.yaml">maskott_tactileo</option>
              )}
            </select>
          </div>

          {step === "error" && (
            <div className="flex items-center gap-2 text-red-400 bg-red-900/20 rounded-lg px-3 py-2 text-sm">
              <AlertCircle size={16} />
              {statusMsg}
            </div>
          )}

          <button
            onClick={handleRun}
            disabled={!inputPath || !recipePath}
            className="btn-primary"
          >
            <PlayCircle size={16} />
            Start Audit
          </button>
        </div>
      )}

      {/* Running panel */}
      {step === "running" && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw size={18} className="animate-spin text-indigo-400" />
            <div>
              <div className="font-semibold text-slate-100">Pipeline Running</div>
              <div className="text-xs text-slate-500 mt-0.5">{statusMsg}</div>
            </div>
          </div>
          <StageList currentIdx={stageIdx} />
          <div className="mt-4 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.round((stageIdx / STAGES.length) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Run ID: <code className="text-slate-500">{runId || "—"}</code>
          </p>
        </div>
      )}

      {/* Results */}
      {step === "done" && payload && (
        <>
          {/* Done banner */}
          <div className="flex items-center gap-3 bg-emerald-900/20 border border-emerald-700/40 rounded-xl px-4 py-3">
            <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
            <div>
              <div className="font-semibold text-emerald-300">Audit Complete</div>
              <div className="text-xs text-emerald-700 font-mono mt-0.5">{payload.run_id}</div>
            </div>
            <button
              onClick={() => { setStep("configure"); setPayload(null); setRunId(""); }}
              className="ml-auto btn-secondary text-xs"
            >
              New Audit
            </button>
          </div>

          {/* Top-level metrics */}
          <MetricsCards payload={payload} />

          {/* Tab bar */}
          <div className="flex gap-1 border-b border-slate-700">
            {(["metrics", "charts", "artifacts"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={clsx(
                  "px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px",
                  activeTab === t
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-300",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {activeTab === "metrics" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <GiniChart
                  actorGini={payload.actor_gini}
                  resourceGini={payload.resource_gini}
                  uniqueActors={payload.unique_actors}
                  uniqueResources={payload.unique_resources}
                />
                <PrivacyPanel
                  riskLevel={payload.risk_level}
                  sparsityRatio={payload.sparsity_ratio}
                  completeness={payload.overall_completeness}
                />
              </div>
              {Object.keys(payload.coverage_at_k || {}).length > 0 && (
                <CoverageChart coverageAtK={payload.coverage_at_k} />
              )}
            </div>
          )}

          {activeTab === "charts" && (
            <BiasDashboard payload={payload} />
          )}

          {activeTab === "artifacts" && (
            <RunArtifacts artifacts={payload.artifacts} runId={payload.run_id} />
          )}
        </>
      )}

      {/* Lookup existing run */}
      <div className="card">
        <h3 className="font-semibold text-slate-100 mb-3 flex items-center gap-2">
          <ChevronRight size={16} className="text-indigo-400" /> Load Existing Run
        </h3>
        <LoadRun onLoad={setPayload} onRunId={setRunId} onStep={setStep} />
      </div>
    </div>
  );
}

function LoadRun({
  onLoad, onRunId, onStep,
}: {
  onLoad: (p: DashboardPayload) => void;
  onRunId: (id: string) => void;
  onStep: (s: Step) => void;
}) {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const dash = await getAuditDashboard(id);
      onLoad(dash);
      onRunId(id);
      onStep("done");
    } catch {
      setErr("Run not found or dashboard not generated yet.");
    }
    setLoading(false);
  }

  return (
    <div className="flex gap-3 flex-wrap">
      <input
        className="input flex-1 min-w-48"
        placeholder="Run ID (e.g. 01J2KQZXM…)"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <button onClick={load} disabled={loading || !id} className="btn-secondary">
        {loading ? "Loading…" : "Load"}
      </button>
      {err && <p className="w-full text-xs text-red-400">{err}</p>}
    </div>
  );
}
