import React from "react";
import { motion } from "framer-motion";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

const DATA = [
  { metric: "Gini",        score: 0.72 },
  { metric: "Coverage@K",  score: 0.58 },
  { metric: "Sparsity",    score: 0.85 },
  { metric: "Entropy",     score: 0.63 },
  { metric: "Dominance",   score: 0.44 },
  { metric: "Repr. Index", score: 0.67 },
];

const chartData = DATA.map((d) => ({ ...d, fullMark: 1.0 }));

export function FairnessMetricRadar() {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Fairness & Representation</span>
        <span className="badge-violet text-xs">audit run #42</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius={75}>
          <PolarGrid
            stroke="rgba(255,255,255,0.08)"
            gridType="polygon"
          />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "#64748b", fontSize: 10, fontFamily: "var(--font-sans, sans-serif)" }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#C4B5FD"
            fill="#C4B5FD"
            fillOpacity={0.15}
            strokeWidth={1.5}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-2 mt-2">
        {DATA.map((d) => (
          <div key={d.metric} className="text-center">
            <div
              className="text-xs font-semibold"
              style={{ color: d.score > 0.65 ? "#86EFAC" : d.score > 0.5 ? "#FCD34D" : "#FCA5A5" }}
            >
              {(d.score * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-slate-600">{d.metric}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
