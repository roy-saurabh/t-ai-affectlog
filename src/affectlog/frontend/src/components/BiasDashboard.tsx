import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { DashboardPayload } from "../api";

const CHART_STYLE = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "6px",
  color: "#e2e8f0",
  fontSize: "12px",
};

const PIE_COLORS = [
  "#A7F3D0", "#C4B5FD", "#a5b4fc", "#c7d2fe",
  "#8b5cf6", "#C4B5FD", "#7c3aed", "#4f46e5",
];

function truncate(s: string, n = 22): string {
  if (!s) return "—";
  const parts = s.split(/[/:]/);
  const last = parts[parts.length - 1] || s;
  return last.length > n ? last.slice(0, n) + "…" : last;
}

interface Props {
  payload: DashboardPayload;
}

export default function BiasDashboard({ payload }: Props) {
  const {
    resource_type_distribution, verb_distribution,
    top_10_resources, view_context_distribution, temporal,
  } = payload;

  const rtData = Object.entries(resource_type_distribution || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name: truncate(name), value }));

  const vData = Object.entries(verb_distribution || {})
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const topData = (top_10_resources || [])
    .slice(0, 10)
    .map(([id, count]) => ({ name: truncate(id), count }));

  const vcData = Object.entries(view_context_distribution || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name: truncate(name, 28), value }));

  return (
    <div className="space-y-4">
      {/* Temporal */}
      {temporal && (temporal.min_timestamp || temporal.span_days) && (
        <div className="card">
          <h3 className="font-semibold text-slate-100 mb-3">Temporal Coverage</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="stat-label mb-1">First Event</div>
              <div className="text-sm text-slate-200 font-mono">
                {temporal.min_timestamp ? temporal.min_timestamp.slice(0, 10) : "—"}
              </div>
            </div>
            <div>
              <div className="stat-label mb-1">Last Event</div>
              <div className="text-sm text-slate-200 font-mono">
                {temporal.max_timestamp ? temporal.max_timestamp.slice(0, 10) : "—"}
              </div>
            </div>
            <div>
              <div className="stat-label mb-1">Span</div>
              <div className="text-sm font-bold text-white">
                {temporal.span_days != null ? `${temporal.span_days} days` : "—"}
              </div>
            </div>
            <div>
              <div className="stat-label mb-1">Active Days</div>
              <div className="text-sm font-bold text-white">
                {temporal.unique_days != null ? temporal.unique_days.toLocaleString() : "—"}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Resource types — pie */}
        {rtData.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-slate-100 mb-3">Resource Type Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={rtData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {rtData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [v.toLocaleString(), "Events"]} />
                <Legend
                  formatter={(v) => <span style={{ color: "#94a3b8", fontSize: "11px" }}>{v}</span>}
                  wrapperStyle={{ fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Verb distribution */}
        {vData.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-slate-100 mb-3">Verb Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={vData} margin={{ left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [v.toLocaleString(), "Events"]} />
                <Bar dataKey="value" fill="#C4B5FD" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top resources */}
      {topData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-100 mb-1">Top 10 Resources by Event Count</h3>
          <p className="text-xs text-slate-600 mb-3">IDs shown truncated — raw identifiers never rendered.</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topData} layout="vertical" margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} width={140} />
              <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [v.toLocaleString(), "Events"]} />
              <Bar dataKey="count" fill="#A7F3D0" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* View context */}
      {vcData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-100 mb-3">View Context Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={vcData} margin={{ left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-20} textAnchor="end" height={40} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [v.toLocaleString(), "Events"]} />
              <Bar dataKey="value" fill="#C4B5FD" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
