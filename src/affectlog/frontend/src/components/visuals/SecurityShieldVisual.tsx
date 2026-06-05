import React, { useEffect, useState } from "react";

const RAW_FIELDS = [
  { label: "email",      x: 50,  y: 80  },
  { label: "user_id",   x: 50,  y: 128 },
  { label: "ip_addr",   x: 50,  y: 176 },
  { label: "name",      x: 50,  y: 224 },
  { label: "device_id", x: 50,  y: 272 },
];

const TRANSFORMS = [
  { label: "HMAC",    color: "#5EEAD4", y: 80  },
  { label: "HASH",    color: "#86EFAC", y: 128 },
  { label: "REDACT",  color: "#67E8F9", y: 176 },
  { label: "HMAC",    color: "#5EEAD4", y: 224 },
  { label: "SUPPRESS",color: "#A7F3D0", y: 272 },
];

const SAFE_OUTPUTS = [
  { label: "Aggregate metrics", color: "#86EFAC" },
  { label: "Audit manifest",    color: "#67E8F9" },
  { label: "Privacy report",    color: "#A7F3D0" },
  { label: "JSON-LD graph",     color: "#C4B5FD" },
];

function usePulse(interval = 1000) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 5), interval);
    return () => clearInterval(id);
  }, [interval]);
  return tick;
}

export function SecurityShieldVisual() {
  const activeLine = usePulse(900);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="w-full" style={{ aspectRatio: "640 / 360" }}>
      <svg
        viewBox="0 0 640 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="Privacy-preserving transformation: raw identifiers are hashed, redacted, or suppressed; only aggregate evidence leaves the system"
        role="img"
      >
        <defs>
          <pattern id="shieldGrid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(203,213,225,0.04)" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(94,234,212,0.22)" />
            <stop offset="100%" stopColor="rgba(134,239,172,0.10)" />
          </linearGradient>
          <filter id="shieldGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <style>{`
            @keyframes beamShield {
              0%   { stroke-dashoffset: 180; opacity: 0.3; }
              50%  { opacity: 0.85; }
              100% { stroke-dashoffset: 0;   opacity: 0.3; }
            }
            @media (prefers-reduced-motion: reduce) {
              .shield-beam { animation: none !important; }
            }
          `}</style>
        </defs>

        <rect width="640" height="360" fill="url(#shieldGrid)" />

        {/* ── Section labels ─────────────────────────────────── */}
        <text x="56" y="36" fill="#6F7D96" fontSize="8" fontFamily="var(--font-sans)" fontWeight="600" letterSpacing="0.1em" textAnchor="middle">RAW IDENTIFIERS</text>
        <text x="322" y="36" fill="#6F7D96" fontSize="8" fontFamily="var(--font-sans)" fontWeight="600" letterSpacing="0.1em" textAnchor="middle">TRANSFORM</text>
        <text x="572" y="36" fill="#6F7D96" fontSize="8" fontFamily="var(--font-sans)" fontWeight="600" letterSpacing="0.1em" textAnchor="middle">SAFE OUTPUTS</text>

        {/* ── Shield boundary ────────────────────────────────── */}
        <rect
          x={240}
          y={54}
          width={164}
          height={248}
          rx={16}
          fill="url(#shieldGrad)"
          stroke="#5EEAD4"
          strokeWidth="1.2"
          filter="url(#shieldGlow)"
          strokeOpacity="0.7"
        />
        <text x={322} y={316} textAnchor="middle" fill="#5EEAD4" fontSize="9" fontFamily="var(--font-sans)" fontWeight="600" opacity="0.8">
          Privacy Shield
        </text>

        {/* ── Raw field nodes ────────────────────────────────── */}
        {RAW_FIELDS.map((f, i) => {
          const active = mounted && activeLine === i;
          return (
            <g key={f.label}>
              <rect
                x={f.x - 34}
                y={f.y - 13}
                width={68}
                height={26}
                rx={7}
                fill={active ? "rgba(252,165,165,0.12)" : "rgba(15,23,42,0.72)"}
                stroke={active ? "rgba(252,165,165,0.50)" : "rgba(203,213,225,0.14)"}
                strokeWidth={active ? 1.2 : 0.8}
                style={{ transition: "all 0.4s ease" }}
              />
              <text
                x={f.x}
                y={f.y + 4}
                textAnchor="middle"
                fill={active ? "#FCA5A5" : "#8391A8"}
                fontSize="9.5"
                fontFamily="var(--font-mono)"
              >
                {f.label}
              </text>
            </g>
          );
        })}

        {/* ── Beams: raw → shield ────────────────────────────── */}
        {RAW_FIELDS.map((f, i) => (
          <line
            key={`bl-${f.label}`}
            x1={f.x + 34}
            y1={f.y}
            x2={244}
            y2={TRANSFORMS[i].y}
            stroke="rgba(252,165,165,0.55)"
            strokeWidth="0.8"
            strokeDasharray="160"
            strokeLinecap="round"
            className="shield-beam"
            style={{ animation: `beamShield 1.6s ${i * 0.18}s linear infinite` }}
          />
        ))}

        {/* ── Transform pills inside shield ─────────────────── */}
        {TRANSFORMS.map((t) => (
          <g key={t.label}>
            <rect
              x={258}
              y={t.y - 12}
              width={128}
              height={24}
              rx={12}
              fill={`${t.color}16`}
              stroke={`${t.color}40`}
              strokeWidth={0.9}
            />
            <text
              x={322}
              y={t.y + 4}
              textAnchor="middle"
              fill={t.color}
              fontSize="9"
              fontFamily="var(--font-mono)"
              fontWeight="600"
            >
              {t.label}
            </text>
          </g>
        ))}

        {/* ── Beams: shield → outputs ────────────────────────── */}
        {SAFE_OUTPUTS.map((o, i) => {
          const ty = 80 + i * 56;
          const oy = 82 + i * 62;
          return (
            <line
              key={`br-${o.label}`}
              x1={404}
              y1={ty}
              x2={492}
              y2={oy}
              stroke={o.color}
              strokeWidth="0.8"
              strokeDasharray="130"
              strokeLinecap="round"
              className="shield-beam"
              style={{ animation: `beamShield 1.6s ${0.7 + i * 0.2}s linear infinite` }}
            />
          );
        })}

        {/* ── Safe output cards ──────────────────────────────── */}
        {SAFE_OUTPUTS.map((o, i) => {
          const cy = 82 + i * 62;
          return (
            <g key={o.label}>
              <rect
                x={492}
                y={cy - 14}
                width={110}
                height={28}
                rx={8}
                fill={`${o.color}12`}
                stroke={`${o.color}30`}
                strokeWidth={0.9}
              />
              <text
                x={547}
                y={cy + 4}
                textAnchor="middle"
                fill={o.color}
                fontSize="9"
                fontFamily="var(--font-sans)"
                fontWeight="500"
              >
                {o.label}
              </text>
            </g>
          );
        })}

        {/* ── Shield icon in center ──────────────────────────── */}
        <path
          d="M322 72 L338 80 L338 96 C338 108 330 118 322 122 C314 118 306 108 306 96 L306 80 Z"
          fill="rgba(94,234,212,0.18)"
          stroke="#5EEAD4"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
