import React, { useEffect, useState } from "react";

const FEATURES = [
  { label: "verb_diversity",    importance: 0.82, color: "#C4B5FD" },
  { label: "activity_count",   importance: 0.71, color: "#D8B4FE" },
  { label: "session_duration", importance: 0.64, color: "#C4B5FD" },
  { label: "resource_variety", importance: 0.55, color: "#A78BFA" },
  { label: "completion_rate",  importance: 0.48, color: "#D8B4FE" },
  { label: "time_of_day",      importance: 0.31, color: "#C4B5FD" },
  { label: "platform_type",    importance: 0.22, color: "#A78BFA" },
];

const OUTPUTS = [
  { label: "Feature Importance Chart",   color: "#C4B5FD" },
  { label: "Local Explanation (SHAP)",   color: "#86EFAC" },
  { label: "Model Card",                 color: "#67E8F9" },
  { label: "Comparison Report",         color: "#FCD34D" },
];

function useTick(ms: number, max: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % max), ms);
    return () => clearInterval(id);
  }, [ms, max]);
  return tick;
}

export function ModelExplanationGraphVisual() {
  const activeFeat = useTick(900, FEATURES.length);

  return (
    <div className="w-full" style={{ aspectRatio: "640 / 360" }}>
      <svg
        viewBox="0 0 640 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="Model explanation pipeline: feature matrix feeds model adapter to generate feature importance, local explanations, model card, and comparison outputs"
        role="img"
      >
        <defs>
          <pattern id="modelGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(203,213,225,0.04)" strokeWidth="0.5" />
          </pattern>
          <style>{`
            @keyframes featBeam {
              0%   { stroke-dashoffset: 200; opacity: 0.3; }
              50%  { opacity: 0.9; }
              100% { stroke-dashoffset: 0;   opacity: 0.3; }
            }
            @media (prefers-reduced-motion: reduce) {
              .feat-beam { animation: none !important; }
            }
          `}</style>
        </defs>
        <rect width="640" height="360" fill="url(#modelGrid)" />

        {/* ── Feature rows ──────────────────────────────────── */}
        {FEATURES.map((feat, i) => {
          const fy = 48 + i * 40;
          const active = activeFeat === i;
          const barW = feat.importance * 100;
          return (
            <g key={feat.label}>
              {/* Feature label */}
              <text
                x={14}
                y={fy + 4}
                fill={active ? feat.color : "#8391A8"}
                fontSize="9"
                fontFamily="var(--font-mono)"
                fontWeight={active ? "600" : "400"}
                style={{ transition: "fill 0.3s ease" }}
              >
                {feat.label}
              </text>
              {/* Importance bar */}
              <rect
                x={170}
                y={fy - 8}
                width={120}
                height={16}
                rx={4}
                fill="rgba(15,23,42,0.60)"
                stroke="rgba(203,213,225,0.10)"
                strokeWidth="0.7"
              />
              <rect
                x={170}
                y={fy - 8}
                width={barW * 1.2}
                height={16}
                rx={4}
                fill={`${feat.color}${active ? "45" : "28"}`}
                style={{ transition: "width 0.4s ease, fill 0.3s ease" }}
              />
              <text
                x={298}
                y={fy + 4}
                textAnchor="end"
                fill={feat.color}
                fontSize="8.5"
                fontFamily="var(--font-mono)"
                opacity={active ? 1 : 0.6}
              >
                {(feat.importance * 100).toFixed(0)}%
              </text>
              {/* Beam to model adapter */}
              {active && (
                <line
                  x1={302}
                  y1={fy}
                  x2={388}
                  y2={175}
                  stroke={feat.color}
                  strokeWidth="0.9"
                  strokeDasharray="180"
                  className="feat-beam"
                  style={{ animation: "featBeam 1s linear" }}
                />
              )}
            </g>
          );
        })}

        {/* ── Model adapter node ────────────────────────────── */}
        <rect
          x={380}
          y={150}
          width={70}
          height={50}
          rx={14}
          fill="rgba(196,181,253,0.12)"
          stroke="#C4B5FD"
          strokeWidth="1.2"
        />
        <text x={415} y={172} textAnchor="middle" fill="#C4B5FD" fontSize="9" fontFamily="var(--font-sans)" fontWeight="700">Model</text>
        <text x={415} y={185} textAnchor="middle" fill="#C4B5FD" fontSize="8" fontFamily="var(--font-sans)">Adapter</text>
        <circle cx={415} cy={197} r={3} fill="#C4B5FD" opacity="0.6" />

        {/* ── Output nodes ──────────────────────────────────── */}
        {OUTPUTS.map((out, i) => {
          const oy = 60 + i * 68;
          return (
            <g key={out.label}>
              <line
                x1={450}
                y1={175}
                x2={490}
                y2={oy}
                stroke={out.color}
                strokeWidth="0.8"
                strokeOpacity="0.45"
              />
              <rect
                x={490}
                y={oy - 14}
                width={140}
                height={28}
                rx={9}
                fill={`${out.color}12`}
                stroke={`${out.color}32`}
                strokeWidth="0.9"
              />
              <text
                x={560}
                y={oy + 4}
                textAnchor="middle"
                fill={out.color}
                fontSize="9"
                fontFamily="var(--font-sans)"
                fontWeight="500"
              >
                {out.label}
              </text>
            </g>
          );
        })}

        {/* ── Column labels ──────────────────────────────────── */}
        <text x="85"  y="26" textAnchor="middle" fill="#6F7D96" fontSize="8" fontFamily="var(--font-sans)" fontWeight="600" letterSpacing="0.08em">FEATURE MATRIX</text>
        <text x="560" y="26" textAnchor="middle" fill="#6F7D96" fontSize="8" fontFamily="var(--font-sans)" fontWeight="600" letterSpacing="0.08em">EXPLANATIONS</text>
      </svg>
    </div>
  );
}
