import React, { useEffect, useState } from "react";

const TENANT_CARDS = [
  { label: "Org A",   color: "#93C5FD", x: 44,  y: 90  },
  { label: "Org B",   color: "#C4B5FD", x: 44,  y: 162 },
  { label: "Org C",   color: "#5EEAD4", x: 44,  y: 234 },
];

const SERVICES = [
  { id: "rbac",    label: "RBAC",       x: 220, y: 90,  color: "#86EFAC" },
  { id: "jobs",    label: "Jobs",       x: 220, y: 160, color: "#67E8F9" },
  { id: "storage", label: "Artifacts",  x: 220, y: 230, color: "#93C5FD" },
  { id: "audit",   label: "Audit Log",  x: 370, y: 90,  color: "#A7F3D0" },
  { id: "monitor", label: "Monitoring", x: 370, y: 160, color: "#FCD34D" },
  { id: "backup",  label: "Backups",    x: 370, y: 230, color: "#C4B5FD" },
];

const CTRL = { x: 295, y: 295, label: "AffectLog Control Plane" };

function useTick(ms: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % SERVICES.length), ms);
    return () => clearInterval(id);
  }, [ms]);
  return tick;
}

export function ManagedSaaSControlPlaneVisual() {
  const activeTick = useTick(1000);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="w-full" style={{ aspectRatio: "590 / 360" }}>
      <svg
        viewBox="0 0 590 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="AffectLog managed SaaS control plane: tenants, RBAC, jobs, artifact storage, audit logs, monitoring, and backups"
        role="img"
      >
        <defs>
          <pattern id="saasGrid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(203,213,225,0.04)" strokeWidth="0.5" />
          </pattern>
          <style>{`
            @keyframes ctrlPulse {
              0%,100% { opacity: 0.65; }
              50%      { opacity: 1; }
            }
            @keyframes svcBeam {
              0%   { stroke-dashoffset: 200; opacity: 0.3; }
              50%  { opacity: 0.85; }
              100% { stroke-dashoffset: 0;   opacity: 0.3; }
            }
            @media (prefers-reduced-motion: reduce) {
              .svc-beam, .ctrl-panel { animation: none !important; }
            }
          `}</style>
        </defs>

        <rect width="590" height="360" fill="url(#saasGrid)" />

        {/* ── Tenant → service beams ─────────────────────────── */}
        {TENANT_CARDS.map((t) =>
          SERVICES.slice(0, 3).map((s) => (
            <line
              key={`${t.label}-${s.id}`}
              x1={t.x + 38}
              y1={t.y}
              x2={s.x - 30}
              y2={s.y}
              stroke={t.color}
              strokeWidth="0.6"
              strokeOpacity="0.22"
            />
          ))
        )}

        {/* ── Active beam ────────────────────────────────────── */}
        {mounted && (
          <line
            x1={220}
            y1={SERVICES[activeTick].y}
            x2={CTRL.x}
            y2={CTRL.y - 20}
            stroke={SERVICES[activeTick].color}
            strokeWidth="1"
            strokeDasharray="180"
            className="svc-beam"
            style={{ animation: "svcBeam 1.4s linear" }}
          />
        )}

        {/* ── Tenant cards ───────────────────────────────────── */}
        {TENANT_CARDS.map((t) => (
          <g key={t.label}>
            <rect
              x={t.x - 38}
              y={t.y - 20}
              width={76}
              height={40}
              rx={10}
              fill={`${t.color}10`}
              stroke={`${t.color}36`}
              strokeWidth="1"
            />
            <text x={t.x} y={t.y - 4} textAnchor="middle" fill={t.color} fontSize="9" fontFamily="var(--font-sans)" fontWeight="600">{t.label}</text>
            <text x={t.x} y={t.y + 10} textAnchor="middle" fill="#6F7D96" fontSize="7.5" fontFamily="var(--font-sans)">tenant</text>
          </g>
        ))}

        {/* ── Service nodes (left column) ────────────────────── */}
        {SERVICES.map((s, i) => {
          const active = mounted && activeTick === i;
          return (
            <g key={s.id}>
              <rect
                x={s.x - 34}
                y={s.y - 16}
                width={68}
                height={32}
                rx={10}
                fill={active ? `${s.color}1A` : "rgba(15,23,42,0.72)"}
                stroke={active ? s.color : "rgba(203,213,225,0.16)"}
                strokeWidth={active ? 1.2 : 0.8}
                style={{ transition: "all 0.4s ease" }}
              />
              <text
                x={s.x}
                y={s.y + 4}
                textAnchor="middle"
                fill={active ? s.color : "#8391A8"}
                fontSize="9.5"
                fontFamily="var(--font-mono)"
                fontWeight={active ? "600" : "400"}
              >
                {s.label}
              </text>
            </g>
          );
        })}

        {/* ── Service → control plane beams ─────────────────── */}
        {SERVICES.map((s) => (
          <line
            key={`${s.id}-ctrl`}
            x1={s.x + 34}
            y1={s.y}
            x2={CTRL.x}
            y2={CTRL.y - 18}
            stroke={s.color}
            strokeWidth="0.6"
            strokeOpacity="0.18"
          />
        ))}

        {/* ── Control plane panel ────────────────────────────── */}
        <rect
          x={CTRL.x - 130}
          y={CTRL.y - 22}
          width={260}
          height={44}
          rx={14}
          fill="rgba(103,232,249,0.09)"
          stroke="#67E8F9"
          strokeWidth="1.2"
          className="ctrl-panel"
          style={{ animation: "ctrlPulse 3s ease-in-out infinite" }}
        />
        <text
          x={CTRL.x}
          y={CTRL.y}
          textAnchor="middle"
          fill="#67E8F9"
          fontSize="10"
          fontFamily="var(--font-sans)"
          fontWeight="700"
        >
          {CTRL.label}
        </text>
        <text
          x={CTRL.x}
          y={CTRL.y + 14}
          textAnchor="middle"
          fill="#6F7D96"
          fontSize="8"
          fontFamily="var(--font-sans)"
        >
          operated by AffectLog
        </text>

        {/* ── Column headers ─────────────────────────────────── */}
        <text x="44"  y="44" textAnchor="middle" fill="#6F7D96" fontSize="8" fontFamily="var(--font-sans)" fontWeight="600" letterSpacing="0.08em">TENANTS</text>
        <text x="220" y="44" textAnchor="middle" fill="#6F7D96" fontSize="8" fontFamily="var(--font-sans)" fontWeight="600" letterSpacing="0.08em">SERVICES</text>
        <text x="370" y="44" textAnchor="middle" fill="#6F7D96" fontSize="8" fontFamily="var(--font-sans)" fontWeight="600" letterSpacing="0.08em">OPERATIONS</text>
      </svg>
    </div>
  );
}
