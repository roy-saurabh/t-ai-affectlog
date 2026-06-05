import React from "react";
import { motion } from "framer-motion";

const STAGES = [
  { id: "csv",    label: "CSV / JSON / Parquet", color: "#67E8F9",  x: 40,  y: 50 },
  { id: "ingest", label: "Ingest & Validate",    color: "#93C5FD",  x: 160, y: 50 },
  { id: "pii",    label: "PII Scan",             color: "#86EFAC",  x: 280, y: 50 },
  { id: "xapi",   label: "xAPI Normalize",       color: "#C4B5FD",  x: 400, y: 50 },
  { id: "audit",  label: "Dataset Audit",        color: "#93C5FD",  x: 520, y: 50 },
  { id: "model",  label: "Model Assessment",     color: "#C4B5FD",  x: 640, y: 50 },
  { id: "export", label: "SOP + JSON-LD",        color: "#86EFAC",  x: 760, y: 50 },
];

const OVERLAY_CARDS = [
  { label: "1M+ rows",    sub: "CSV processing",   x: 60,  y: 130, color: "#67E8F9" },
  { label: "PII scan",    sub: "GDPR-aware",        x: 240, y: 130, color: "#86EFAC" },
  { label: "Gini / C@K", sub: "Fairness metrics",  x: 420, y: 130, color: "#C4B5FD" },
  { label: "JSON-LD",     sub: "Audit artifacts",   x: 640, y: 130, color: "#86EFAC" },
];

function FlowArrow({ x1, y1, x2, y2, color, delay }: {
  x1: number; y1: number; x2: number; y2: number; color: string; delay: number;
}) {
  const mid = (x1 + x2) / 2;
  const path = `M ${x1} ${y1} C ${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`;
  const len = Math.abs(x2 - x1) + Math.abs(y2 - y1);
  return (
    <motion.path
      d={path}
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeDasharray={len}
      strokeDashoffset={len}
      animate={{ strokeDashoffset: 0 }}
      transition={{ duration: 1.2, delay, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
      opacity={0.6}
    />
  );
}

export function DatasetToModelPipeline() {
  return (
    <div className="relative w-full select-none" style={{ height: "200px" }}>
      <svg
        viewBox="0 0 840 200"
        className="w-full h-full"
        style={{ overflow: "visible" }}
      >
        <defs>
          {STAGES.map((s) => (
            <radialGradient key={s.id} id={`grad-${s.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* Connecting flow lines */}
        {STAGES.slice(0, -1).map((stage, i) => (
          <FlowArrow
            key={stage.id}
            x1={stage.x + 46}
            y1={stage.y + 14}
            x2={STAGES[i + 1].x - 2}
            y2={STAGES[i + 1].y + 14}
            color={STAGES[i + 1].color}
            delay={i * 0.18}
          />
        ))}

        {/* Stage nodes */}
        {STAGES.map((s, i) => (
          <motion.g
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            {/* Glow halo */}
            <circle cx={s.x + 22} cy={s.y + 14} r={28} fill={`url(#grad-${s.id})`} />
            {/* Main pill */}
            <rect
              x={s.x}
              y={s.y}
              width={96}
              height={28}
              rx={6}
              fill="rgba(255,255,255,0.05)"
              stroke={s.color}
              strokeWidth="1"
              strokeOpacity="0.5"
            />
            {/* Dot */}
            <circle cx={s.x + 10} cy={s.y + 14} r={3.5} fill={s.color} opacity={0.9} />
            <text
              x={s.x + 20}
              y={s.y + 18}
              fill="#cbd5e1"
              fontSize="8"
              fontFamily="var(--font-mono, monospace)"
            >
              {s.label.length > 14 ? s.label.slice(0, 13) + "…" : s.label}
            </text>
          </motion.g>
        ))}

        {/* Overlay metric cards */}
        {OVERLAY_CARDS.map((c, i) => (
          <motion.g
            key={c.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 + i * 0.12 }}
          >
            <rect
              x={c.x}
              y={c.y}
              width={100}
              height={38}
              rx={6}
              fill="rgba(0,0,0,0.6)"
              stroke={c.color}
              strokeWidth="1"
              strokeOpacity="0.4"
            />
            <text x={c.x + 8} y={c.y + 16} fill={c.color} fontSize="10" fontWeight="600" fontFamily="var(--font-sans, sans-serif)">
              {c.label}
            </text>
            <text x={c.x + 8} y={c.y + 29} fill="#64748b" fontSize="8" fontFamily="var(--font-sans, sans-serif)">
              {c.sub}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
