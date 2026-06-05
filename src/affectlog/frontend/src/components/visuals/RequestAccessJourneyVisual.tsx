import React, { useEffect, useState } from "react";

const STEPS = [
  { id: "request",   label: "Submit Request",      sublabel: "org + use case",   color: "#93C5FD", x: 60  },
  { id: "review",    label: "AffectLog Reviews",   sublabel: "48–72h",            color: "#67E8F9", x: 190 },
  { id: "provision", label: "Tenant Provisioned",  sublabel: "isolated workspace", color: "#5EEAD4", x: 320 },
  { id: "admin",     label: "Admin Onboards",      sublabel: "invites team",      color: "#86EFAC", x: 450 },
  { id: "assess",    label: "Run Assessments",     sublabel: "guided wizard",     color: "#C4B5FD", x: 580 },
];

function usePulse(interval = 1200) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % STEPS.length), interval);
    return () => clearInterval(id);
  }, [interval]);
  return tick;
}

export function RequestAccessJourneyVisual() {
  const activeStep = usePulse(1200);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const cy = 160;

  return (
    <div className="w-full" style={{ aspectRatio: "640 / 300" }}>
      <svg
        viewBox="0 0 640 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="Request access journey: submit request → review → tenant provisioned → admin onboards → run assessments"
        role="img"
      >
        <defs>
          <pattern id="raqGrid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(203,213,225,0.04)" strokeWidth="0.5" />
          </pattern>
          <style>{`
            @keyframes stepPop {
              0%   { transform: scale(1); }
              30%  { transform: scale(1.12); }
              100% { transform: scale(1); }
            }
            @media (prefers-reduced-motion: reduce) {
              .step-active { animation: none !important; }
            }
          `}</style>
        </defs>

        <rect width="640" height="300" fill="url(#raqGrid)" />

        {/* ── Connecting rail ────────────────────────────────── */}
        <line
          x1={STEPS[0].x}
          y1={cy}
          x2={STEPS[STEPS.length - 1].x}
          y2={cy}
          stroke="rgba(203,213,225,0.12)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* ── Progress line ──────────────────────────────────── */}
        {mounted && activeStep > 0 && (
          <line
            x1={STEPS[0].x}
            y1={cy}
            x2={STEPS[Math.min(activeStep, STEPS.length - 1)].x}
            y2={cy}
            stroke={STEPS[activeStep].color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.60"
            style={{ transition: "x2 0.5s ease" }}
          />
        )}

        {/* ── Completed step ticks ───────────────────────────── */}
        {STEPS.slice(0, activeStep).map((s) => (
          <circle key={`done-${s.id}`} cx={s.x} cy={cy} r={4} fill={s.color} opacity="0.55" />
        ))}

        {/* ── Step nodes ─────────────────────────────────────── */}
        {STEPS.map((step, i) => {
          const active = mounted && activeStep === i;
          const done   = mounted && i < activeStep;
          return (
            <g
              key={step.id}
              className={active ? "step-active" : ""}
              style={active ? { animation: "stepPop 0.5s ease", transformOrigin: `${step.x}px ${cy}px` } : undefined}
            >
              {/* Glow ring */}
              {active && (
                <circle cx={step.x} cy={cy} r={28} fill={`${step.color}14`} stroke={`${step.color}30`} strokeWidth="1" />
              )}

              {/* Main circle */}
              <circle
                cx={step.x}
                cy={cy}
                r={active ? 20 : done ? 14 : 16}
                fill={active ? `${step.color}20` : done ? `${step.color}18` : "rgba(15,23,42,0.80)"}
                stroke={active || done ? step.color : "rgba(203,213,225,0.22)"}
                strokeWidth={active ? 1.6 : 1}
                style={{ transition: "all 0.4s ease" }}
              />

              {/* Step number / check */}
              <text
                x={step.x}
                y={cy + 4}
                textAnchor="middle"
                fill={active || done ? step.color : "#6F7D96"}
                fontSize={active ? "11" : "10"}
                fontFamily="var(--font-mono)"
                fontWeight="700"
              >
                {done ? "✓" : `${i + 1}`}
              </text>

              {/* Label card below */}
              <rect
                x={step.x - 54}
                y={cy + 32}
                width={108}
                height={48}
                rx={10}
                fill={active ? `${step.color}12` : "rgba(15,23,42,0.72)"}
                stroke={active ? `${step.color}36` : "rgba(203,213,225,0.12)"}
                strokeWidth={active ? 1 : 0.7}
                style={{ transition: "all 0.4s ease" }}
              />
              <text
                x={step.x}
                y={cy + 50}
                textAnchor="middle"
                fill={active ? step.color : "#D8E0EE"}
                fontSize="8.5"
                fontFamily="var(--font-sans)"
                fontWeight="600"
              >
                {step.label}
              </text>
              <text
                x={step.x}
                y={cy + 64}
                textAnchor="middle"
                fill="#6F7D96"
                fontSize="7.5"
                fontFamily="var(--font-sans)"
              >
                {step.sublabel}
              </text>

              {/* Label card above for active */}
              {active && (
                <>
                  <rect
                    x={step.x - 44}
                    y={cy - 80}
                    width={88}
                    height={26}
                    rx={8}
                    fill={`${step.color}14`}
                    stroke={`${step.color}36`}
                    strokeWidth="0.9"
                  />
                  <text
                    x={step.x}
                    y={cy - 64}
                    textAnchor="middle"
                    fill={step.color}
                    fontSize="8.5"
                    fontFamily="var(--font-sans)"
                    fontWeight="600"
                  >
                    Active
                  </text>
                  <line
                    x1={step.x}
                    y1={cy - 54}
                    x2={step.x}
                    y2={cy - 20}
                    stroke={step.color}
                    strokeWidth="0.8"
                    strokeDasharray="4 3"
                    strokeOpacity="0.50"
                  />
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
