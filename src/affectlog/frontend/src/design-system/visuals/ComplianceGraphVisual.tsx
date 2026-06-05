import React from "react";

const NODES = [
  { id: "dataset",   label: "Dataset",           x: 200, y: 60,  color: "#22d3ee", r: 22 },
  { id: "field",     label: "DataField",          x: 80,  y: 160, color: "#38bdf8", r: 18 },
  { id: "proc",      label: "Processing\nActivity",x: 200,y: 210, color: "#a78bfa", r: 20, center: true },
  { id: "control",   label: "Control",            x: 360, y: 140, color: "#34d399", r: 18 },
  { id: "metric",    label: "Metric",             x: 340, y: 230, color: "#34d399", r: 16 },
  { id: "risk",      label: "RiskFinding",        x: 130, y: 290, color: "#f87171", r: 18 },
  { id: "artifact",  label: "Artifact",           x: 300, y: 310, color: "#fbbf24", r: 20 },
];

const EDGES = [
  { from: "dataset", to: "field" },
  { from: "dataset", to: "proc" },
  { from: "proc",    to: "control" },
  { from: "proc",    to: "metric" },
  { from: "field",   to: "risk" },
  { from: "proc",    to: "artifact" },
  { from: "metric",  to: "artifact" },
  { from: "control", to: "artifact" },
];

function getNode(id: string) { return NODES.find((n) => n.id === id)!; }

export function ComplianceGraphVisual() {
  return (
    <div className="w-full" style={{ aspectRatio: "420/360" }}>
      <svg
        viewBox="0 0 420 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        role="img"
        aria-label="JSON-LD compliance graph: Dataset, DataField, ProcessingActivity, Control, Metric, RiskFinding, and Artifact nodes"
      >
        <style>{`
          @keyframes edgePulse {
            0%   { stroke-dashoffset: 100; opacity: 0.2; }
            50%  { opacity: 0.6; }
            100% { stroke-dashoffset: 0;   opacity: 0.2; }
          }
        `}</style>

        {/* ── Edges ────────────────────────────────────────────── */}
        {EDGES.map((edge, i) => {
          const from = getNode(edge.from);
          const to   = getNode(edge.to);
          return (
            <line
              key={i}
              x1={from.x} y1={from.y}
              x2={to.x}   y2={to.y}
              stroke="rgba(148,163,184,0.25)"
              strokeWidth="1"
              strokeDasharray="100"
              strokeDashoffset="100"
              strokeLinecap="round"
              style={{ animation: `edgePulse 2.5s ${i * 0.25}s linear infinite` }}
            />
          );
        })}

        {/* ── Nodes ────────────────────────────────────────────── */}
        {NODES.map((node) => (
          <g key={node.id}>
            {/* Glow ring */}
            <circle
              cx={node.x} cy={node.y} r={node.r + 6}
              fill="none" stroke={node.color}
              strokeWidth="0.8" strokeOpacity="0.15"
            />
            {/* Node circle */}
            <circle
              cx={node.x} cy={node.y} r={node.r}
              fill={`${node.color}14`}
              stroke={node.color}
              strokeWidth="1.5"
            />
            {/* Center dot */}
            <circle cx={node.x} cy={node.y} r={3.5} fill={node.color} fillOpacity="0.7" />

            {/* Label */}
            {node.label.includes("\n") ? (
              node.label.split("\n").map((line, j) => (
                <text
                  key={j}
                  x={node.x}
                  y={node.y + node.r + 14 + j * 12}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="var(--font-sans)"
                >
                  {line}
                </text>
              ))
            ) : (
              <text
                x={node.x}
                y={node.y + node.r + 14}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="9"
                fontFamily="var(--font-sans)"
              >
                {node.label}
              </text>
            )}
          </g>
        ))}

        {/* ── JSON-LD badge ──────────────────────────────────────── */}
        <rect x={340} y={20} width={64} height={22} rx={11}
          fill="rgba(34,211,238,0.10)" stroke="rgba(34,211,238,0.30)" strokeWidth={0.8}
        />
        <text x={372} y={35} textAnchor="middle" fill="#22d3ee" fontSize="9" fontFamily="var(--font-mono)" fontWeight="600">
          JSON-LD
        </text>
      </svg>
    </div>
  );
}
