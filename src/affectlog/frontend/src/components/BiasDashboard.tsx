import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  resourceTypeDistribution: Record<string, number>;
  verbDistribution: Record<string, number>;
  topResources: [string, number][];
}

function truncateId(id: string, maxLen = 20): string {
  if (!id) return "—";
  // Show only last part of URL/URN, never raw person IDs
  const parts = id.split(/[/:]/);
  const last = parts[parts.length - 1] || id;
  return last.length > maxLen ? last.slice(0, maxLen) + "…" : last;
}

export default function BiasDashboard({ resourceTypeDistribution, verbDistribution, topResources }: Props) {
  const rtData = Object.entries(resourceTypeDistribution || {}).map(([name, value]) => ({ name, value }));
  const vData = Object.entries(verbDistribution || {}).map(([name, value]) => ({ name, value }));
  const topData = (topResources || []).map(([id, count]) => ({ name: truncateId(id), count }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="card">
        <h3>Resource Type Distribution</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={rtData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3>Verb Distribution</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={vData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
            <Bar dataKey="value" fill="#818cf8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3>Top Resources (pseudonymised IDs)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={topData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} width={130} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
            <Bar dataKey="count" fill="#a5b4fc" />
          </BarChart>
        </ResponsiveContainer>
        <p style={{ color: "#64748b", fontSize: "0.75rem" }}>IDs shown truncated — raw identifiers never rendered.</p>
      </div>
    </div>
  );
}
