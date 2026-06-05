import React from "react";
import { motion } from "framer-motion";

const NODES = [
  { id: "affectlog", label: "AffectLog",    role: "Assessment",          x: 200, y: 140, color: "#67E8F9",  r: 22, highlight: true },
  { id: "pdc",       label: "PDC",          role: "Policy & Consent",    x: 340, y: 60,  color: "#C4B5FD",  r: 16 },
  { id: "carisma",   label: "CARiSMA",      role: "Design-time Risk",    x: 80,  y: 60,  color: "#93C5FD",  r: 16 },
  { id: "lola",      label: "LOLA",         role: "Scenario Evaluation", x: 60,  y: 220, color: "#86EFAC",  r: 16 },
  { id: "provider",  label: "Data Provider",role: "Dataset Source",      x: 340, y: 220, color: "#94a3b8",  r: 14 },
  { id: "auditor",   label: "Auditor",      role: "Evidence Consumer",   x: 200, y: 280, color: "#FCD34D",  r: 14 },
];

const EDGES = [
  { from: "affectlog", to: "pdc",      label: "consent check",     color: "#C4B5FD" },
  { from: "affectlog", to: "carisma",  label: "metadata bridge",   color: "#93C5FD" },
  { from: "affectlog", to: "lola",     label: "eval interop",      color: "#86EFAC" },
  { from: "affectlog", to: "provider", label: "dataset ingest",    color: "#67E8F9" },
  { from: "affectlog", to: "auditor",  label: "artifact export",   color: "#FCD34D" },
];

function getNode(id: string) {
  return NODES.find((n) => n.id === id)!;
}

export function DataSpaceConstellation() {
  return (
    <div className="relative w-full select-none" style={{ height: "320px" }}>
      <svg viewBox="0 0 420 320" className="w-full h-full">
        <defs>
          {NODES.map((n) => (
            <radialGradient key={n.id} id={`cn-${n.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={n.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={n.color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* Grid dots background */}
        {Array.from({ length: 7 }).map((_, row) =>
          Array.from({ length: 9 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={col * 52 + 8}
              cy={row * 48 + 12}
              r={1}
              fill="rgba(255,255,255,0.06)"
            />
          ))
        )}

        {/* Edge lines */}
        {EDGES.map((e, i) => {
          const from = getNode(e.from);
          const to = getNode(e.to);
          return (
            <motion.g key={e.from + e.to}>
              <line
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={e.color}
                strokeWidth="1"
                strokeOpacity="0.25"
                strokeDasharray="4 4"
              />
              <motion.circle
                r={3}
                fill={e.color}
                opacity={0.7}
                animate={{
                  cx: [from.x, to.x],
                  cy: [from.y, to.y],
                  opacity: [0, 0.9, 0],
                }}
                transition={{
                  duration: 2.4,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.g>
          );
        })}

        {/* Nodes */}
        {NODES.map((n, i) => (
          <motion.g
            key={n.id}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1, type: "spring", stiffness: 180 }}
          >
            {/* Glow */}
            <circle cx={n.x} cy={n.y} r={n.r + 18} fill={`url(#cn-${n.id})`} />
            {/* Ring */}
            {n.highlight && (
              <motion.circle
                cx={n.x} cy={n.y} r={n.r + 6}
                fill="none"
                stroke={n.color}
                strokeWidth="1"
                strokeOpacity="0.4"
                animate={{ r: [n.r + 6, n.r + 12], opacity: [0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            {/* Main circle */}
            <circle
              cx={n.x} cy={n.y} r={n.r}
              fill={n.highlight ? `rgba(103,232,249,0.15)` : `rgba(255,255,255,0.05)`}
              stroke={n.color}
              strokeWidth={n.highlight ? 2 : 1}
              strokeOpacity={n.highlight ? 0.8 : 0.5}
            />
            {/* Label */}
            <text
              x={n.x} y={n.y + 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={n.color}
              fontSize={n.highlight ? "7.5" : "6.5"}
              fontWeight={n.highlight ? "700" : "600"}
              fontFamily="var(--font-sans, sans-serif)"
            >
              {n.label}
            </text>
            {/* Role sublabel */}
            <text
              x={n.x} y={n.y + n.r + 10}
              textAnchor="middle"
              fill="#475569"
              fontSize="6"
              fontFamily="var(--font-sans, sans-serif)"
            >
              {n.role}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
