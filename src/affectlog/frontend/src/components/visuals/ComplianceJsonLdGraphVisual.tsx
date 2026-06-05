import React, { useEffect, useState } from "react";

const NODES = [
  { id: "dataset",   label: "Dataset",          x: 310, y: 180, color: "#67E8F9", size: 36 },
  { id: "field",     label: "DataField",         x: 160, y: 100, color: "#93C5FD", size: 28 },
  { id: "activity",  label: "Processing\nActivity", x: 460, y: 100, color: "#C4B5FD", size: 28 },
  { id: "privacy",   label: "PrivacyControl",    x: 120, y: 240, color: "#86EFAC", size: 26 },
  { id: "metric",    label: "Metric",            x: 240, y: 300, color: "#5EEAD4", size: 26 },
  { id: "risk",      label: "RiskFinding",       x: 390, y: 300, color: "#FCA5A5", size: 26 },
  { id: "artifact",  label: "ExportArtifact",    x: 500, y: 240, color: "#A7F3D0", size: 26 },
];

const EDGES = [
  { from: "dataset",  to: "field",    label: "hasField" },
  { from: "dataset",  to: "activity", label: "processedBy" },
  { from: "dataset",  to: "metric",   label: "hasMeasurement" },
  { from: "field",    to: "privacy",  label: "protectedBy" },
  { from: "activity", to: "artifact", label: "generates" },
  { from: "metric",   to: "artifact", label: "includedIn" },
  { from: "risk",     to: "artifact", label: "reportedIn" },
  { from: "dataset",  to: "risk",     label: "hasRisk" },
];

function getNode(id: string) { return NODES.find((n) => n.id === id)!; }

function useTick(ms: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % EDGES.length), ms);
    return () => clearInterval(id);
  }, [ms]);
  return tick;
}

export function ComplianceJsonLdGraphVisual() {
  const activeTick = useTick(1100);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="w-full" style={{ aspectRatio: "640 / 380" }}>
      <svg
        viewBox="0 0 640 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="JSON-LD compliance graph showing relationships between Dataset, DataField, ProcessingActivity, PrivacyControl, Metric, RiskFinding, and ExportArtifact nodes"
        role="img"
      >
        <defs>
          <pattern id="ldGrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(203,213,225,0.04)" strokeWidth="0.5" />
          </pattern>
          <marker id="arrowHead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill="rgba(203,213,225,0.30)" />
          </marker>
          <style>{`
            @keyframes edgePulse {
              0%   { stroke-dashoffset: 200; opacity: 0.3; }
              50%  { opacity: 0.85; }
              100% { stroke-dashoffset: 0;   opacity: 0.3; }
            }
            @media (prefers-reduced-motion: reduce) {
              .ld-edge { animation: none !important; }
            }
          `}</style>
        </defs>

        <rect width="640" height="380" fill="url(#ldGrid)" />

        {/* ── Graph edges ────────────────────────────────────── */}
        {EDGES.map((edge, i) => {
          const from = getNode(edge.from);
          const to   = getNode(edge.to);
          const active = mounted && activeTick === i;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={active ? from.color : "rgba(203,213,225,0.18)"}
                strokeWidth={active ? 1.4 : 0.8}
                strokeDasharray={active ? "180" : undefined}
                markerEnd={active ? undefined : "url(#arrowHead)"}
                className={active ? "ld-edge" : ""}
                style={active ? { animation: `edgePulse 1.4s linear` } : undefined}
              />
              {active && (
                <text
                  x={mx}
                  y={my - 5}
                  textAnchor="middle"
                  fill={from.color}
                  fontSize="8"
                  fontFamily="var(--font-mono)"
                  opacity="0.80"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* ── Graph nodes ────────────────────────────────────── */}
        {NODES.map((node) => {
          const lines = node.label.split("\n");
          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size}
                fill={`${node.color}10`}
                stroke={node.color}
                strokeWidth="1.2"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size * 0.45}
                fill={`${node.color}25`}
              />
              {lines.map((line, li) => (
                <text
                  key={li}
                  x={node.x}
                  y={node.y + (lines.length === 1 ? 4 : -3 + li * 13)}
                  textAnchor="middle"
                  fill={node.color}
                  fontSize="8.5"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}

        {/* ── JSON-LD context label ──────────────────────────── */}
        <rect x={14} y={14} width={160} height={30} rx={8} fill="rgba(15,23,42,0.80)" stroke="rgba(103,232,249,0.28)" strokeWidth="0.8" />
        <text x={24} y={25} fill="#6F7D96" fontSize="7.5" fontFamily="var(--font-mono)">@context</text>
        <text x={24} y={36} fill="#67E8F9" fontSize="8.5" fontFamily="var(--font-mono)">schema.org · AI Act · GDPR</text>
      </svg>
    </div>
  );
}
