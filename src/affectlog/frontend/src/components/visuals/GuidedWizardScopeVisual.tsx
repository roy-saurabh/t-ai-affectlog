import React, { useState, useEffect } from "react";

const STEPS = [
  { label: "Upload Dataset",     done: true  },
  { label: "Schema Detection",   done: true  },
  { label: "Privacy Review",     done: true  },
  { label: "Scope Analysis",     done: false, active: true },
  { label: "Run Assessment",     done: false },
  { label: "Review Results",     done: false },
];

type ScopeItem = { label: string; status: "available" | "needs-input" | "out-of-scope" };

const SCOPE_MATRIX: ScopeItem[] = [
  { label: "PII Scan",          status: "available"    },
  { label: "xAPI Normalization",status: "available"    },
  { label: "Gini Coefficient",  status: "available"    },
  { label: "Coverage@K",        status: "available"    },
  { label: "Sparsity Map",      status: "available"    },
  { label: "Model Explainability", status: "needs-input" },
  { label: "SHAP Values",       status: "needs-input"  },
  { label: "Temporal Density",  status: "needs-input"  },
  { label: "3D Embedding",      status: "out-of-scope" },
  { label: "Raw Record Export", status: "out-of-scope" },
  { label: "Cross-dataset Join",status: "out-of-scope" },
];

const STATUS_CONFIG: Record<string, { color: string; label: string; dot: string }> = {
  "available":    { color: "#86EFAC", label: "Available",     dot: "#86EFAC" },
  "needs-input":  { color: "#FCD34D", label: "Needs input",   dot: "#FCD34D" },
  "out-of-scope": { color: "#FCA5A5", label: "Out of scope",  dot: "#FCA5A5" },
};

function useTick(ms: number, max: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % max), ms);
    return () => clearInterval(id);
  }, [ms, max]);
  return tick;
}

export function GuidedWizardScopeVisual() {
  const flashTick = useTick(1400, SCOPE_MATRIX.length);

  return (
    <div className="w-full" style={{ aspectRatio: "640 / 380" }}>
      <svg
        viewBox="0 0 640 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="Guided wizard scope matrix: steps on left, analysis availability matrix on right"
        role="img"
      >
        <defs>
          <pattern id="wizGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(203,213,225,0.04)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="640" height="380" fill="url(#wizGrid)" />

        {/* ── Progress rail ──────────────────────────────────── */}
        <line x1={55} y1={54} x2={55} y2={330} stroke="rgba(203,213,225,0.12)" strokeWidth="1.5" strokeLinecap="round" />

        {/* ── Steps ─────────────────────────────────────────── */}
        {STEPS.map((step, i) => {
          const cy = 54 + i * 56;
          return (
            <g key={step.label}>
              {/* Connector */}
              {i < STEPS.length - 1 && (
                <line
                  x1={55}
                  y1={cy + 16}
                  x2={55}
                  y2={cy + 56 - 16}
                  stroke={step.done ? "#86EFAC" : "rgba(203,213,225,0.10)"}
                  strokeWidth="1.5"
                />
              )}
              {/* Circle */}
              <circle
                cx={55}
                cy={cy}
                r={14}
                fill={
                  step.active
                    ? "rgba(103,232,249,0.18)"
                    : step.done
                    ? "rgba(134,239,172,0.14)"
                    : "rgba(15,23,42,0.72)"
                }
                stroke={
                  step.active
                    ? "#67E8F9"
                    : step.done
                    ? "#86EFAC"
                    : "rgba(203,213,225,0.18)"
                }
                strokeWidth={step.active ? 1.4 : 1}
              />
              <text
                x={55}
                y={cy + 4}
                textAnchor="middle"
                fill={step.active ? "#67E8F9" : step.done ? "#86EFAC" : "#6F7D96"}
                fontSize="9"
                fontFamily="var(--font-mono)"
                fontWeight="700"
              >
                {step.done ? "✓" : step.active ? "→" : `${i + 1}`}
              </text>
              {/* Step label */}
              <text
                x={80}
                y={cy + 4}
                fill={step.active ? "#F8FAFC" : step.done ? "#86EFAC" : "#6F7D96"}
                fontSize="9.5"
                fontFamily="var(--font-sans)"
                fontWeight={step.active ? "600" : "400"}
              >
                {step.label}
              </text>
            </g>
          );
        })}

        {/* ── Scope matrix panel ─────────────────────────────── */}
        <rect x={210} y={24} width={408} height={336} rx={14} fill="rgba(15,23,42,0.60)" stroke="rgba(203,213,225,0.14)" strokeWidth="0.9" />

        {/* Matrix header */}
        <text x={414} y={48} textAnchor="middle" fill="#D8E0EE" fontSize="10" fontFamily="var(--font-sans)" fontWeight="700">
          Analysis Scope Matrix
        </text>

        {/* Legend */}
        {Object.entries(STATUS_CONFIG).map(([key, cfg], i) => (
          <g key={key}>
            <circle cx={226 + i * 120} cy={68} r={4} fill={cfg.dot} />
            <text x={236 + i * 120} y={72} fill={cfg.color} fontSize="8.5" fontFamily="var(--font-sans)">{cfg.label}</text>
          </g>
        ))}

        {/* Matrix rows */}
        {SCOPE_MATRIX.map((item, i) => {
          const cfg = STATUS_CONFIG[item.status];
          const row_y = 90 + i * 24;
          const flash = flashTick === i;
          return (
            <g key={item.label}>
              <rect
                x={220}
                y={row_y - 9}
                width={388}
                height={20}
                rx={5}
                fill={flash ? `${cfg.color}12` : "transparent"}
                style={{ transition: "fill 0.3s ease" }}
              />
              <circle cx={234} cy={row_y + 1} r={3.5} fill={cfg.dot} />
              <text x={246} y={row_y + 5} fill={flash ? cfg.color : "#AEBBD0"} fontSize="9" fontFamily="var(--font-sans)" style={{ transition: "fill 0.3s ease" }}>
                {item.label}
              </text>
              <text x={595} y={row_y + 5} textAnchor="end" fill={cfg.color} fontSize="8.5" fontFamily="var(--font-mono)" opacity="0.70">
                {item.status === "available" ? "✓" : item.status === "needs-input" ? "?" : "✗"}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
