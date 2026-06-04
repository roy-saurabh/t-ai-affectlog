import React, { Suspense } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Wand2, Plus, Clock, CheckCircle, ArrowRight, Database, Zap } from "lucide-react";
import { listRuns, type WizardRunResponse } from "../../api/wizard";
import { WizardShell } from "../../components/wizard/WizardShell";
import { WIZARD_PRESETS } from "../../content/wizardPresets";

function WizardHome() {
  const navigate = useNavigate();
  const [runs, setRuns] = React.useState<WizardRunResponse[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    listRuns()
      .then((r) => setRuns(r.runs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Guided Assessment</h1>
          <p className="mt-1.5 text-sm text-slate-400 max-w-xl">
            The wizard guides you through a complete, audit-ready assessment. It detects your
            dataset format, identifies valid analyses, blocks unsupported operations, and produces
            transparent output contracts before execution.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("new")}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          <Plus size={14} />
          New assessment
        </button>
      </div>

      {/* Feature overview */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: Wand2,
            title: "Guided, not guessed",
            description: "Every analysis, chart, and export is derived from a typed capability registry backed by production APIs.",
          },
          {
            icon: CheckCircle,
            title: "Guardrails built in",
            description: "Invalid analyses are blocked with precise explanations. Conditional analyses show exactly what's needed.",
          },
          {
            icon: Clock,
            title: "Audit-ready output",
            description: "Produces a signed audit manifest, SOP, JSON-LD compliance graph, and data/model cards.",
          },
        ].map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
            <Icon size={16} className="text-indigo-400 mb-3" />
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>

      {/* Supported workflows */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Supported workflows</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Dataset readiness audit",
            "Privacy & PII audit",
            "xAPI normalisation",
            "Fairness & representation analysis",
            "Recommender system evaluation",
            "Model explanation & interpretability",
            "Model comparison",
            "EU AI Act compliance export",
          ].map((w) => (
            <div key={w} className="flex items-center gap-2 text-xs text-slate-400">
              <ArrowRight size={10} className="text-indigo-400 flex-shrink-0" />
              {w}
            </div>
          ))}
        </div>
      </div>

      {/* Real datasets — quick-start presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Start from a real dataset</p>
          <span className="text-[11px] text-slate-600">Production data · pre-configured</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Object.values(WIZARD_PRESETS).map((preset) => {
            const Icon = preset.format === "CSV" ? Database : Zap;
            const isIndigo = preset.accent === "indigo";
            return (
              <div
                key={preset.id}
                className={`rounded-xl border p-5 space-y-3 ${
                  isIndigo
                    ? "border-indigo-500/30 bg-indigo-500/5"
                    : "border-emerald-500/30 bg-emerald-500/5"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon
                      size={14}
                      className={isIndigo ? "text-indigo-400" : "text-emerald-400"}
                    />
                    <p className="text-sm font-semibold text-white">{preset.label}</p>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      isIndigo
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {preset.format}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{preset.description}</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">{preset.useCaseContext}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-600">{preset.rowCount}</span>
                  <button
                    type="button"
                    onClick={() => navigate(`new?preset=${preset.id}`)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                      isIndigo
                        ? "bg-indigo-600 text-white hover:bg-indigo-500"
                        : "bg-emerald-700 text-white hover:bg-emerald-600"
                    }`}
                  >
                    <ArrowRight size={10} />
                    Launch assessment
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past runs */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-white">Past assessments</p>
        {loading ? (
          <div className="text-xs text-slate-600 animate-pulse">Loading…</div>
        ) : runs.length === 0 ? (
          <div className="rounded-xl border border-slate-700/40 bg-slate-800/20 p-8 text-center">
            <Wand2 size={20} className="mx-auto mb-2 text-slate-600" />
            <p className="text-sm text-slate-500">No assessments yet.</p>
            <p className="text-xs text-slate-600 mt-1">Start your first guided assessment above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {runs.slice(0, 10).map((run) => (
              <button
                key={run.wizard_run_id}
                type="button"
                onClick={() => navigate(`runs/${run.wizard_run_id}/results`)}
                className="w-full flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-800/30 px-4 py-3 text-left hover:border-slate-600/50 hover:bg-slate-800/60 transition-all"
              >
                <div
                  className={`h-2 w-2 rounded-full flex-shrink-0 ${
                    run.status === "completed" ? "bg-emerald-400" :
                    run.status === "failed" ? "bg-red-400" : "bg-amber-400"
                  }`}
                />
                <span className="font-mono text-xs text-slate-400 flex-shrink-0">
                  {run.wizard_run_id}
                </span>
                <span className="text-xs text-slate-500 capitalize">{run.status}</span>
                <span className="ml-auto text-[11px] text-slate-600">{run.created_at?.slice(0, 16)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalysisWizard() {
  return (
    <Suspense fallback={<div className="text-slate-500 text-sm">Loading wizard…</div>}>
      <Routes>
        <Route index element={<WizardHome />} />
        <Route path="new" element={<WizardShell />} />
        <Route path="runs/:runId/results" element={<WizardShell />} />
      </Routes>
    </Suspense>
  );
}
