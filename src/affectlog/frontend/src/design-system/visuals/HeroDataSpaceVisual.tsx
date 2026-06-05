import React, { useEffect, useState } from "react";

const SOURCES = [
  { id: "csv",     label: "CSV",       x: 60,  y: 80,  color: "#22d3ee" },
  { id: "json",    label: "JSON",      x: 60,  y: 160, color: "#22d3ee" },
  { id: "parquet", label: "Parquet",   x: 60,  y: 240, color: "#38bdf8" },
  { id: "xapi",    label: "xAPI",      x: 60,  y: 320, color: "#a78bfa" },
];

const OUTPUTS = [
  { id: "sop",     label: "SOP",        x: 560, y: 80,  color: "#34d399" },
  { id: "graph",   label: "JSON-LD",    x: 560, y: 160, color: "#34d399" },
  { id: "card",    label: "Data Card",  x: 560, y: 240, color: "#22d3ee" },
  { id: "dash",    label: "Dashboard",  x: 560, y: 320, color: "#a78bfa" },
];

const METRICS = [
  { label: "1M+ rows",    x: 310, y: 56,  color: "#22d3ee" },
  { label: "PII scan",    x: 310, y: 84,  color: "#34d399" },
  { label: "Gini / Cov@K",x: 310, y: 112, color: "#a78bfa" },
  { label: "OpenAPI",     x: 310, y: 140, color: "#38bdf8" },
  { label: "RBAC",        x: 310, y: 168, color: "#6366f1" },
];

const ENGINE_X = 280, ENGINE_Y = 190, ENGINE_W = 60, ENGINE_H = 60;

function useAnimationTick(interval: number): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 4), interval);
    return () => clearInterval(id);
  }, [interval]);
  return tick;
}

export function HeroDataSpaceVisual() {
  const activeTick = useAnimationTick(800);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="w-full relative" style={{ aspectRatio: "620/380" }}>
      <svg
        viewBox="0 0 620 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="Assessment pipeline diagram: data sources flowing through AffectLog assessment engine to audit artifacts"
        role="img"
      >
        <style>{`
          @keyframes beamTravel {
            0%   { stroke-dashoffset: 300; opacity: 0.4; }
            50%  { opacity: 0.9; }
            100% { stroke-dashoffset: 0;   opacity: 0.4; }
          }
          @keyframes nodePulse {
            0%, 100% { opacity: 0.55; transform: scale(1); transform-origin: 310px 200px; }
            50%       { opacity: 1;    transform: scale(1.06); transform-origin: 310px 200px; }
          }
          @keyframes metricFadeIn {
            0%   { opacity: 0; transform: translateX(-6px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          .engine-core { animation: nodePulse 2.4s ease-in-out infinite; }
        `}</style>

        {/* ── Background grid ────────────────────────────────── */}
        <defs>
          <pattern id="heroGrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="centerFade" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#080D1F" stopOpacity="0" />
            <stop offset="100%" stopColor="#080D1F" stopOpacity="0.8" />
          </radialGradient>
        </defs>

        <rect width="620" height="380" fill="url(#heroGrid)" />
        <rect width="620" height="380" fill="url(#centerFade)" />

        {/* ── Source beams ───────────────────────────────────── */}
        {SOURCES.map((src, i) => (
          <line
            key={src.id}
            x1={src.x + 28}
            y1={src.y}
            x2={ENGINE_X}
            y2={ENGINE_Y + ENGINE_H / 2}
            stroke={src.color}
            strokeWidth="1.2"
            strokeDasharray="200"
            strokeDashoffset="200"
            strokeLinecap="round"
            strokeOpacity="0.6"
            style={{
              animation: `beamTravel 1.6s ${i * 0.2}s linear infinite`,
            }}
          />
        ))}

        {/* ── Output beams ───────────────────────────────────── */}
        {OUTPUTS.map((out, i) => (
          <line
            key={out.id}
            x1={ENGINE_X + ENGINE_W}
            y1={ENGINE_Y + ENGINE_H / 2}
            x2={out.x - 28}
            y2={out.y}
            stroke={out.color}
            strokeWidth="1.2"
            strokeDasharray="200"
            strokeDashoffset="200"
            strokeLinecap="round"
            strokeOpacity="0.6"
            style={{
              animation: `beamTravel 1.6s ${0.8 + i * 0.2}s linear infinite`,
            }}
          />
        ))}

        {/* ── Source nodes ───────────────────────────────────── */}
        {SOURCES.map((src, i) => {
          const isActive = mounted && activeTick === i;
          return (
            <g key={src.id}>
              <rect
                x={src.x - 28}
                y={src.y - 16}
                width={56}
                height={32}
                rx={8}
                fill={isActive ? `${src.color}20` : "rgba(255,255,255,0.04)"}
                stroke={isActive ? src.color : "rgba(255,255,255,0.12)"}
                strokeWidth={isActive ? 1.5 : 1}
                style={{ transition: "all 0.4s ease" }}
              />
              <text
                x={src.x}
                y={src.y + 5}
                textAnchor="middle"
                fill={isActive ? src.color : "#94a3b8"}
                fontSize="11"
                fontFamily="var(--font-mono)"
                fontWeight={isActive ? "600" : "400"}
              >
                {src.label}
              </text>
            </g>
          );
        })}

        {/* ── Engine core ────────────────────────────────────── */}
        <g className="engine-core">
          <rect
            x={ENGINE_X}
            y={ENGINE_Y}
            width={ENGINE_W}
            height={ENGINE_H}
            rx={14}
            fill="rgba(34,211,238,0.10)"
            stroke="#22d3ee"
            strokeWidth="1.5"
          />
          {/* Inner dot */}
          <circle cx={ENGINE_X + ENGINE_W / 2} cy={ENGINE_Y + ENGINE_H / 2} r={8} fill="#22d3ee" fillOpacity="0.25" />
          <circle cx={ENGINE_X + ENGINE_W / 2} cy={ENGINE_Y + ENGINE_H / 2} r={4} fill="#22d3ee" fillOpacity="0.8" />
        </g>

        {/* Engine label */}
        <text
          x={ENGINE_X + ENGINE_W / 2}
          y={ENGINE_Y + ENGINE_H + 18}
          textAnchor="middle"
          fill="#F8FAFC"
          fontSize="10"
          fontFamily="var(--font-sans)"
          fontWeight="600"
        >
          AffectLog
        </text>
        <text
          x={ENGINE_X + ENGINE_W / 2}
          y={ENGINE_Y + ENGINE_H + 31}
          textAnchor="middle"
          fill="#475569"
          fontSize="9"
          fontFamily="var(--font-sans)"
        >
          Assessment Engine
        </text>

        {/* ── Metric chips above engine ─────────────────────── */}
        {METRICS.map((m, i) => (
          <g key={m.label} style={{ animation: `metricFadeIn 0.5s ${0.6 + i * 0.1}s ease both` }}>
            <rect
              x={m.x - 38}
              y={m.y - 11}
              width={76}
              height={22}
              rx={11}
              fill={`${m.color}12`}
              stroke={`${m.color}35`}
              strokeWidth={0.8}
            />
            <text
              x={m.x}
              y={m.y + 4}
              textAnchor="middle"
              fill={m.color}
              fontSize="9"
              fontFamily="var(--font-mono)"
              fontWeight="500"
            >
              {m.label}
            </text>
          </g>
        ))}

        {/* ── Output nodes ───────────────────────────────────── */}
        {OUTPUTS.map((out, i) => {
          const isActive = mounted && activeTick === i;
          return (
            <g key={out.id}>
              <rect
                x={out.x - 32}
                y={out.y - 16}
                width={64}
                height={32}
                rx={8}
                fill={isActive ? `${out.color}18` : "rgba(255,255,255,0.04)"}
                stroke={isActive ? out.color : "rgba(255,255,255,0.12)"}
                strokeWidth={isActive ? 1.5 : 1}
                style={{ transition: "all 0.4s ease" }}
              />
              <text
                x={out.x}
                y={out.y + 5}
                textAnchor="middle"
                fill={isActive ? out.color : "#94a3b8"}
                fontSize="11"
                fontFamily="var(--font-mono)"
                fontWeight={isActive ? "600" : "400"}
              >
                {out.label}
              </text>
            </g>
          );
        })}

        {/* ── Column headers ─────────────────────────────────── */}
        <text x="60" y="32" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="var(--font-sans)" fontWeight="600" letterSpacing="0.08em">INPUTS</text>
        <text x="560" y="32" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="var(--font-sans)" fontWeight="600" letterSpacing="0.08em">OUTPUTS</text>
      </svg>
    </div>
  );
}
