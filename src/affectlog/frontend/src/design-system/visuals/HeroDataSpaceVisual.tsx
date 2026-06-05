import React, { useEffect, useState } from "react";

const SOURCES = [
  { id: "csv",     label: "CSV",     x: 64,  y: 80,  color: "#67E8F9" },
  { id: "json",    label: "JSON",    x: 64,  y: 158, color: "#93C5FD" },
  { id: "parquet", label: "Parquet", x: 64,  y: 236, color: "#5EEAD4" },
  { id: "xapi",    label: "xAPI",    x: 64,  y: 314, color: "#C4B5FD" },
];

const OUTPUTS = [
  { id: "sop",  label: "SOP",       x: 556, y: 80,  color: "#86EFAC" },
  { id: "ld",   label: "JSON-LD",   x: 556, y: 158, color: "#A7F3D0" },
  { id: "card", label: "Data Card", x: 556, y: 236, color: "#67E8F9" },
  { id: "dash", label: "Dashboard", x: 556, y: 314, color: "#C4B5FD" },
];

const MODULES = [
  { label: "PII Scan",     x: 200, y: 88,  color: "#86EFAC" },
  { label: "xAPI Norm",    x: 200, y: 164, color: "#67E8F9" },
  { label: "Profiler",     x: 200, y: 240, color: "#93C5FD" },
  { label: "Metrics",      x: 200, y: 316, color: "#C4B5FD" },
  { label: "Compliance",   x: 420, y: 88,  color: "#A7F3D0" },
  { label: "Explainability", x: 420, y: 164, color: "#C4B5FD" },
  { label: "Model Card",   x: 420, y: 240, color: "#D8B4FE" },
  { label: "Artifact Gen", x: 420, y: 316, color: "#86EFAC" },
];

const ENGINE_X = 279, ENGINE_Y = 170, ENGINE_W = 62, ENGINE_H = 62;

function useTick(interval: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 4), interval);
    return () => clearInterval(id);
  }, [interval]);
  return tick;
}

export function HeroDataSpaceVisual() {
  const activeTick = useTick(900);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="w-full relative" style={{ aspectRatio: "620 / 400" }}>
      <svg
        viewBox="0 0 620 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="AffectLog assessment pipeline: data inputs flow through modules to audit artifacts"
        role="img"
      >
        <defs>
          <pattern id="heroGrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(203,213,225,0.04)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="heroFade" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#070B1A" stopOpacity="0" />
            <stop offset="100%" stopColor="#070B1A" stopOpacity="0.75" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <style>{`
            @keyframes beamPasstel {
              0%   { stroke-dashoffset: 280; opacity: 0.35; }
              50%  { opacity: 1; }
              100% { stroke-dashoffset: 0;   opacity: 0.35; }
            }
            @keyframes enginePulse {
              0%, 100% { opacity: 0.65; r: 5; }
              50%       { opacity: 1; r: 6.5; }
            }
            @media (prefers-reduced-motion: reduce) {
              .beam-anim, .engine-dot { animation: none !important; }
            }
          `}</style>
        </defs>

        <rect width="620" height="400" fill="url(#heroGrid)" />
        <rect width="620" height="400" fill="url(#heroFade)" />

        {/* ── Source → Engine beams ──────────────────────────── */}
        {SOURCES.map((src, i) => (
          <line
            key={`s-${src.id}`}
            x1={src.x + 30}
            y1={src.y}
            x2={ENGINE_X}
            y2={ENGINE_Y + ENGINE_H / 2}
            stroke={src.color}
            strokeWidth="1"
            strokeDasharray="240"
            strokeLinecap="round"
            strokeOpacity="0.7"
            className="beam-anim"
            style={{ animation: `beamPasstel 1.8s ${i * 0.22}s linear infinite` }}
          />
        ))}

        {/* ── Engine → Output beams ─────────────────────────── */}
        {OUTPUTS.map((out, i) => (
          <line
            key={`o-${out.id}`}
            x1={ENGINE_X + ENGINE_W}
            y1={ENGINE_Y + ENGINE_H / 2}
            x2={out.x - 30}
            y2={out.y}
            stroke={out.color}
            strokeWidth="1"
            strokeDasharray="240"
            strokeLinecap="round"
            strokeOpacity="0.7"
            className="beam-anim"
            style={{ animation: `beamPasstel 1.8s ${0.9 + i * 0.22}s linear infinite` }}
          />
        ))}

        {/* ── Source nodes ──────────────────────────────────── */}
        {SOURCES.map((src, i) => {
          const active = mounted && activeTick === i;
          return (
            <g key={src.id}>
              <rect
                x={src.x - 30}
                y={src.y - 15}
                width={60}
                height={30}
                rx={8}
                fill={active ? `${src.color}1A` : "rgba(15,23,42,0.70)"}
                stroke={active ? src.color : "rgba(203,213,225,0.14)"}
                strokeWidth={active ? 1.2 : 0.8}
                style={{ transition: "all 0.4s ease" }}
              />
              <text
                x={src.x}
                y={src.y + 4.5}
                textAnchor="middle"
                fill={active ? src.color : "#8391A8"}
                fontSize="10.5"
                fontFamily="var(--font-mono)"
                fontWeight={active ? "600" : "400"}
              >
                {src.label}
              </text>
            </g>
          );
        })}

        {/* ── Engine core ───────────────────────────────────── */}
        <rect
          x={ENGINE_X}
          y={ENGINE_Y}
          width={ENGINE_W}
          height={ENGINE_H}
          rx={14}
          fill="rgba(103,232,249,0.10)"
          stroke="#67E8F9"
          strokeWidth="1.4"
          filter="url(#glow)"
        />
        <circle
          cx={ENGINE_X + ENGINE_W / 2}
          cy={ENGINE_Y + ENGINE_H / 2}
          r="9"
          fill="rgba(103,232,249,0.22)"
        />
        <circle
          className="engine-dot"
          cx={ENGINE_X + ENGINE_W / 2}
          cy={ENGINE_Y + ENGINE_H / 2}
          r="5"
          fill="#67E8F9"
          fillOpacity="0.85"
          style={{ animation: "enginePulse 2s ease-in-out infinite" }}
        />

        {/* Engine label */}
        <text
          x={ENGINE_X + ENGINE_W / 2}
          y={ENGINE_Y + ENGINE_H + 16}
          textAnchor="middle"
          fill="#F8FAFC"
          fontSize="9.5"
          fontFamily="var(--font-sans)"
          fontWeight="600"
        >
          AffectLog
        </text>
        <text
          x={ENGINE_X + ENGINE_W / 2}
          y={ENGINE_Y + ENGINE_H + 28}
          textAnchor="middle"
          fill="#6F7D96"
          fontSize="8.5"
          fontFamily="var(--font-sans)"
        >
          Assessment Engine
        </text>

        {/* ── Module chips (floating around engine area) ──── */}
        {MODULES.map((m, i) => (
          <g key={m.label} style={{ opacity: 0, animation: `metricFadeIn 0.45s ${0.5 + i * 0.08}s ease forwards` }}>
            <defs>
              <style>{`@keyframes metricFadeIn { to { opacity:1; } }`}</style>
            </defs>
            <rect
              x={m.x - 36}
              y={m.y - 11}
              width={72}
              height={22}
              rx={11}
              fill={`${m.color}12`}
              stroke={`${m.color}30`}
              strokeWidth={0.8}
            />
            <text
              x={m.x}
              y={m.y + 4}
              textAnchor="middle"
              fill={m.color}
              fontSize="8.5"
              fontFamily="var(--font-mono)"
              fontWeight="500"
            >
              {m.label}
            </text>
          </g>
        ))}

        {/* ── Output nodes ──────────────────────────────────── */}
        {OUTPUTS.map((out, i) => {
          const active = mounted && activeTick === i;
          return (
            <g key={out.id}>
              <rect
                x={out.x - 34}
                y={out.y - 15}
                width={68}
                height={30}
                rx={8}
                fill={active ? `${out.color}18` : "rgba(15,23,42,0.70)"}
                stroke={active ? out.color : "rgba(203,213,225,0.14)"}
                strokeWidth={active ? 1.2 : 0.8}
                style={{ transition: "all 0.4s ease" }}
              />
              <text
                x={out.x}
                y={out.y + 4.5}
                textAnchor="middle"
                fill={active ? out.color : "#8391A8"}
                fontSize="10"
                fontFamily="var(--font-mono)"
                fontWeight={active ? "600" : "400"}
              >
                {out.label}
              </text>
            </g>
          );
        })}

        {/* ── Column headers ─────────────────────────────────── */}
        <text x="64" y="28" textAnchor="middle" fill="#6F7D96" fontSize="8" fontFamily="var(--font-sans)" fontWeight="600" letterSpacing="0.1em">INPUTS</text>
        <text x="556" y="28" textAnchor="middle" fill="#6F7D96" fontSize="8" fontFamily="var(--font-sans)" fontWeight="600" letterSpacing="0.1em">ARTIFACTS</text>
      </svg>
    </div>
  );
}
