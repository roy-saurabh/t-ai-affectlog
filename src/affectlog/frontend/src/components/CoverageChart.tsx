import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";

interface Props {
  coverageAtK: Record<string, number>;
}

const CHART_STYLE = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "6px",
  color: "#e2e8f0",
  fontSize: "12px",
};

export default function CoverageChart({ coverageAtK }: Props) {
  const data = Object.entries(coverageAtK)
    .map(([k, v]) => ({ k: Number(k), coverage: Math.round(v * 1000) / 10 }))
    .sort((a, b) => a.k - b.k);

  if (data.length === 0) return null;

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-100 mb-1">Coverage @ K</h3>
        <p className="text-xs text-slate-500">
          Fraction of all events covered by the top-K most active resources. Higher = more concentrated.
        </p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="k"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            label={{ value: "K (top resources)", position: "insideBottom", fill: "#64748b", fontSize: 11, dy: 8 }}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={CHART_STYLE}
            formatter={(v: number) => [`${v.toFixed(1)}%`, "Coverage"]}
            labelFormatter={(k) => `Top-${k} resources`}
          />
          <ReferenceLine y={50} stroke="#A7F3D0" strokeDasharray="4 4" label={{ value: "50%", fill: "#C4B5FD", fontSize: 10 }} />
          <Line
            type="monotone"
            dataKey="coverage"
            stroke="#A7F3D0"
            strokeWidth={2}
            dot={{ fill: "#C4B5FD", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#a5b4fc" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
