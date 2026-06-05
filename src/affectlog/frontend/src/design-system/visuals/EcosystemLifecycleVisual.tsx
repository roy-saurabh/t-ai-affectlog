import React from "react";

const STAGES = [
  { id: "design",    label: "Design-time",      tool: "CARiSMA",   color: "#93C5FD", x: 80 },
  { id: "eval",      label: "Evaluation",        tool: "LOLA",      color: "#C4B5FD", x: 240 },
  { id: "operation", label: "Operation-time",    tool: "AffectLog", color: "#67E8F9", x: 400, highlight: true },
  { id: "evidence",  label: "Audit Evidence",    tool: "Artifacts", color: "#86EFAC", x: 560 },
];

const ARROWS = [
  { x1: 110, y1: 70, x2: 200, y2: 70 },
  { x1: 280, y1: 70, x2: 360, y2: 70 },
  { x1: 440, y1: 70, x2: 520, y2: 70 },
];

export function EcosystemLifecycleVisual() {
  return (
    <div className="w-full" style={{ aspectRatio: "640/180" }}>
      <svg
        viewBox="0 0 640 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        role="img"
        aria-label="Ecosystem lifecycle: CARiSMA at design-time, LOLA for evaluation, AffectLog for operation-time assessment, leading to audit evidence"
      >
        <style>{`
          @keyframes arrowFlow {
            0%   { stroke-dashoffset: 60; opacity: 0.3; }
            50%  { opacity: 0.9; }
            100% { stroke-dashoffset: 0;  opacity: 0.3; }
          }
        `}</style>

        {/* ── Connector arrows ───────────────────────────────── */}
        {ARROWS.map((a, i) => (
          <line
            key={i}
            x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
            stroke="rgba(203,213,225,0.35)"
            strokeWidth="1.5"
            strokeDasharray="60"
            strokeDashoffset="60"
            strokeLinecap="round"
            style={{ animation: `arrowFlow 1.8s ${i * 0.3}s linear infinite` }}
          />
        ))}

        {/* ── Stage nodes ────────────────────────────────────── */}
        {STAGES.map((s) => (
          <g key={s.id}>
            {/* Outer glow for highlight */}
            {s.highlight && (
              <circle cx={s.x} cy={70} r={36}
                fill={`${s.color}08`} stroke={s.color}
                strokeWidth="1" strokeOpacity="0.4"
              />
            )}

            {/* Node circle */}
            <circle
              cx={s.x} cy={70} r={28}
              fill={`${s.color}12`}
              stroke={s.color}
              strokeWidth={s.highlight ? 2 : 1.2}
            />

            {/* Inner dot */}
            <circle cx={s.x} cy={70} r={6}
              fill={s.color} fillOpacity={s.highlight ? 0.9 : 0.6}
            />

            {/* Tool name */}
            <text
              x={s.x} y={70 + 4}
              textAnchor="middle"
              fill={s.color}
              fontSize="10"
              fontFamily="var(--font-mono)"
              fontWeight="600"
            >
              {s.tool}
            </text>

            {/* Stage label below */}
            <text
              x={s.x} y={118}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
              fontFamily="var(--font-sans)"
            >
              {s.label}
            </text>

            {/* Highlight badge */}
            {s.highlight && (
              <>
                <rect
                  x={s.x - 28} y={136}
                  width={56} height={18}
                  rx={9}
                  fill={`${s.color}15`}
                  stroke={`${s.color}35`}
                  strokeWidth={0.8}
                />
                <text
                  x={s.x} y={149}
                  textAnchor="middle"
                  fill={s.color}
                  fontSize="8"
                  fontFamily="var(--font-sans)"
                  fontWeight="600"
                >
                  this platform
                </text>
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
