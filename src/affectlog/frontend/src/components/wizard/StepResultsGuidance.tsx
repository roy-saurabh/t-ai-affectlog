import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CheckCircle, XCircle, Lightbulb, ArrowRight, Package, BarChart2, Info } from "lucide-react";
import type { WizardRunResultsResponse } from "../../api/wizard";
import { fetchArtifactJson } from "../../api/wizard";
import { OutputArtifactCard } from "./OutputArtifactCard";

interface DashboardPayload {
  verb_distribution?: Record<string, number>;
  view_context_distribution?: Record<string, number>;
  resource_type_distribution?: Record<string, number>;
  top_10_resources?: Array<[string, number] | { resource: string; count: number }>;
  coverage_at_k?: Record<string, number>;
  actor_gini?: number;
  resource_gini?: number;
  sparsity_ratio?: number;
  overall_completeness?: number;
  total_events?: number;
  unique_actors?: number;
  unique_resources?: number;
}

interface StepResultsGuidanceProps {
  results: WizardRunResultsResponse | null;
  runId: string;
}

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8", "#4f46e5"];

function dictToBarData(d: Record<string, number>, maxItems = 12) {
  return Object.entries(d)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxItems)
    .map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
}

// Compact dark tooltip
function DarkTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 shadow-lg">
      <p className="font-medium text-white">{label}</p>
      <p>{payload[0].value}</p>
    </div>
  );
}

function CoverageTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 shadow-lg">
      <p className="font-medium text-white">K = {label}</p>
      <p>{(payload[0].value * 100).toFixed(1)}%</p>
    </div>
  );
}

function GiniCard({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const interp = value < 0.3 ? "Low concentration" : value < 0.6 ? "Moderate concentration" : "High concentration";
  const color = value < 0.3 ? "text-emerald-400" : value < 0.6 ? "text-amber-400" : "text-red-400";
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 space-y-2">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className={`text-2xl font-semibold tabular-nums ${color}`}>{pct}<span className="text-sm text-slate-500 ml-0.5">/ 100</span></p>
      <p className="text-[11px] text-slate-500">{interp}</p>
    </div>
  );
}

function PlotUnavailable({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-slate-700/30 bg-slate-800/10 p-4 flex items-center gap-2.5 opacity-50">
      <Info size={12} className="text-slate-600 flex-shrink-0" />
      <p className="text-[11px] text-slate-600">{label} — data not available for this run type.</p>
    </div>
  );
}

// Map plot IDs to renderer functions that take dashboard payload
type PlotRenderer = (payload: DashboardPayload) => React.ReactNode;

const PLOT_RENDERERS: Record<string, PlotRenderer> = {
  verb_distribution_bar: (p) => {
    const data = p.verb_distribution ?? p.view_context_distribution;
    if (!data || Object.keys(data).length === 0) return null;
    const chartData = dictToBarData(data);
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-medium text-slate-400">Verb / ViewContext Distribution</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 0, right: 4, left: -20, bottom: 40 }}>
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
            <Tooltip content={<DarkTooltip />} />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  },

  resource_type_bar: (p) => {
    const data = p.resource_type_distribution;
    if (!data || Object.keys(data).length === 0) return null;
    const chartData = dictToBarData(data);
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-medium text-slate-400">Resource Type Distribution</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 0, right: 4, left: -20, bottom: 40 }}>
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
            <Tooltip content={<DarkTooltip />} />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  },

  top_resources_bar: (p) => {
    const raw = p.top_10_resources;
    if (!raw || raw.length === 0) return null;
    const chartData = raw.slice(0, 10).map((r) => {
      const [res, cnt] = Array.isArray(r) ? r : [r.resource, r.count];
      return { name: String(res).slice(0, 18), value: Number(cnt) };
    });
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-medium text-slate-400">Top Resources</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 4, left: 8, bottom: 0 }}>
            <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} width={72} />
            <Tooltip content={<DarkTooltip />} />
            <Bar dataKey="value" radius={[0, 3, 3, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  },

  coverage_at_k_curve: (p) => {
    const raw = p.coverage_at_k;
    if (!raw || Object.keys(raw).length === 0) return null;
    const chartData = Object.entries(raw)
      .map(([k, v]) => ({ k: Number(String(k).replace(/^k=/, "")), coverage: v }))
      .filter((d) => !isNaN(d.k))
      .sort((a, b) => a.k - b.k);
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-medium text-slate-400">Coverage@K</p>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis dataKey="k" tick={{ fill: "#64748b", fontSize: 10 }} label={{ value: "K", position: "insideBottomRight", offset: -4, fill: "#64748b", fontSize: 10 }} />
            <YAxis tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} tick={{ fill: "#64748b", fontSize: 10 }} />
            <Tooltip content={<CoverageTooltip />} />
            <Line type="monotone" dataKey="coverage" stroke="#6366f1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  },

  gini_summary_card: (p) => {
    if (p.actor_gini == null && p.resource_gini == null) return null;
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-medium text-slate-400">Gini Concentration</p>
        <div className="grid grid-cols-2 gap-3">
          {p.actor_gini != null && <GiniCard label="Actor Gini" value={p.actor_gini} />}
          {p.resource_gini != null && <GiniCard label="Resource Gini" value={p.resource_gini} />}
        </div>
      </div>
    );
  },

  lorenz_curve: (p) => PLOT_RENDERERS.gini_summary_card(p),

  // Schema/quality plots that need data not in dashboard_payload — shown as stat summary
  schema_overview_table: (p) => {
    if (p.total_events == null) return null;
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-medium text-slate-400">Dataset Summary</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total events", value: p.total_events?.toLocaleString() },
            { label: "Unique actors", value: p.unique_actors?.toLocaleString() },
            { label: "Unique resources", value: p.unique_resources?.toLocaleString() },
          ].map(({ label, value }) => value != null ? (
            <div key={label} className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-3 text-center">
              <p className="text-lg font-semibold text-white tabular-nums">{value}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">{label}</p>
            </div>
          ) : null)}
        </div>
      </div>
    );
  },

  completeness_bar: (p) => {
    if (p.overall_completeness == null) return null;
    const pct = Math.round(p.overall_completeness * 100);
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-medium text-slate-400">Overall Completeness</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 rounded-full bg-slate-700">
            <div className="h-2.5 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-semibold text-white tabular-nums">{pct}%</span>
        </div>
      </div>
    );
  },
};

// Plot IDs that alias to another renderer
const PLOT_ALIASES: Record<string, string> = {
  long_tail_curve: "top_resources_bar",
  sparsity_heatmap_sample: "gini_summary_card",
  top_entities_bar_pseudonymised: "schema_overview_table",
  cooccurrence_network: "verb_distribution_bar",
  representation_index_bar: "resource_type_bar",
  missingness_matrix: "completeness_bar",
  type_distribution_bar: "schema_overview_table",
  entropy_bar: "schema_overview_table",
  audit_pipeline_timeline: "schema_overview_table",
  artifact_stack_view: "schema_overview_table",
};

export function StepResultsGuidance({ results, runId }: StepResultsGuidanceProps) {
  const [dashPayload, setDashPayload] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    if (!runId || !results || results.status !== "completed") return;
    fetchArtifactJson<DashboardPayload>(runId, "dashboard_payload.json")
      .then(setDashPayload)
      .catch(() => { /* dashboard_payload may not exist for all run types */ });
  }, [runId, results?.status]);

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Package size={20} className="text-slate-600" />
        <p className="text-sm text-slate-500">Results not yet available.</p>
      </div>
    );
  }

  const selectedPlots = results.selected_plots ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white">Results & Guidance</h2>
        <p className="mt-1 text-xs text-slate-500">
          Assessment complete. Review findings, download artifacts, and act on recommendations.
        </p>
      </div>

      {results.key_findings.length > 0 && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
          <p className="text-xs font-semibold text-emerald-400">Key findings</p>
          <ul className="space-y-1.5">
            {results.key_findings.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                <CheckCircle size={11} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {results.what_was_analyzed.length > 0 && (
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 space-y-2">
            <p className="text-xs font-medium text-slate-400">What was analyzed</p>
            <ul className="space-y-1">
              {results.what_was_analyzed.map((a) => (
                <li key={a} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <CheckCircle size={10} className="text-emerald-500 flex-shrink-0" />
                  {a.replace(/_/g, " ")}
                </li>
              ))}
            </ul>
          </div>
        )}

        {results.what_was_not_analyzed.length > 0 && (
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 space-y-2">
            <p className="text-xs font-medium text-slate-400">What was not analyzed</p>
            <ul className="space-y-1">
              {results.what_was_not_analyzed.map((a) => (
                <li key={a} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <XCircle size={10} className="text-slate-600 flex-shrink-0" />
                  {a.replace(/_/g, " ")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Visualisations ────────────────────────────────────────────── */}
      {selectedPlots.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart2 size={13} className="text-indigo-400" />
            <p className="text-xs font-semibold text-slate-400">
              Visualisations ({selectedPlots.length} selected)
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {selectedPlots.map((plotId) => {
              const resolvedId = PLOT_ALIASES[plotId] ?? plotId;
              const renderer = PLOT_RENDERERS[resolvedId];
              const rendered = dashPayload && renderer ? renderer(dashPayload) : null;

              return (
                <div
                  key={plotId}
                  className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-4"
                >
                  {rendered ?? (
                    <PlotUnavailable
                      label={plotId
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {results.recommended_next_actions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400">Recommended next actions</p>
          <div className="space-y-2">
            {results.recommended_next_actions.map((action, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-xl border border-slate-700/50 bg-slate-800/20 p-3">
                <ArrowRight size={12} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.developer_extension_suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400">Developer extension suggestions</p>
          <div className="space-y-2">
            {results.developer_extension_suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                <Lightbulb size={12} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.artifacts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400">Artifacts ({results.artifacts.length})</p>
          <div className="space-y-1.5">
            {results.artifacts.map((a) => (
              <OutputArtifactCard key={a.filename} artifact={a} downloadable runId={runId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
