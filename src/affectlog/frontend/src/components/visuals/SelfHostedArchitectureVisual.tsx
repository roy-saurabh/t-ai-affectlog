import React from "react";

const LAYERS = [
  {
    label: "Browser / CLI",
    items: [{ label: "Web UI", color: "#93C5FD" }, { label: "OpenAPI", color: "#67E8F9" }],
    color: "#93C5FD",
    y: 30,
  },
  {
    label: "Application",
    items: [{ label: "FastAPI", color: "#C4B5FD" }, { label: "Celery Worker", color: "#C4B5FD" }],
    color: "#C4B5FD",
    y: 110,
  },
  {
    label: "Data",
    items: [{ label: "PostgreSQL", color: "#86EFAC" }, { label: "Redis", color: "#5EEAD4" }],
    color: "#86EFAC",
    y: 190,
  },
  {
    label: "Storage & Comms",
    items: [{ label: "Local FS / S3", color: "#A7F3D0" }, { label: "SMTP", color: "#FCD34D" }],
    color: "#A7F3D0",
    y: 270,
  },
];

export function SelfHostedArchitectureVisual() {
  return (
    <div className="w-full" style={{ aspectRatio: "580 / 360" }}>
      <svg
        viewBox="0 0 580 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="Self-hosted AffectLog architecture: Browser/CLI → FastAPI + Celery → PostgreSQL + Redis → Local storage + SMTP"
        role="img"
      >
        <defs>
          <pattern id="archGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(203,213,225,0.04)" strokeWidth="0.5" />
          </pattern>
          <style>{`
            @keyframes layerFadeIn {
              from { opacity: 0; transform: translateX(-12px); }
              to   { opacity: 1; transform: translateX(0); }
            }
            @media (prefers-reduced-motion: reduce) {
              .arch-layer { animation: none !important; }
            }
          `}</style>
        </defs>
        <rect width="580" height="360" fill="url(#archGrid)" />

        {/* ── Layer label column ─────────────────────────────── */}
        {LAYERS.map((layer, i) => (
          <g
            key={layer.label}
            className="arch-layer"
            style={{ animation: `layerFadeIn 0.5s ${i * 0.12}s ease both` }}
          >
            {/* Layer band */}
            <rect
              x={20}
              y={layer.y}
              width={540}
              height={64}
              rx={12}
              fill={`${layer.color}08`}
              stroke={`${layer.color}26`}
              strokeWidth="0.9"
            />

            {/* Layer label */}
            <text
              x={52}
              y={layer.y + 36}
              fill={layer.color}
              fontSize="9"
              fontFamily="var(--font-sans)"
              fontWeight="700"
              textAnchor="start"
              opacity="0.80"
            >
              {layer.label}
            </text>

            {/* Service chips */}
            {layer.items.map((item, j) => {
              const chipX = 160 + j * 160;
              return (
                <g key={item.label}>
                  <rect
                    x={chipX}
                    y={layer.y + 16}
                    width={130}
                    height={32}
                    rx={10}
                    fill={`${item.color}14`}
                    stroke={`${item.color}38`}
                    strokeWidth="0.9"
                  />
                  <text
                    x={chipX + 65}
                    y={layer.y + 36}
                    textAnchor="middle"
                    fill={item.color}
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                    fontWeight="500"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}

            {/* Vertical connector to next layer */}
            {i < LAYERS.length - 1 && (
              <line
                x1={290}
                y1={layer.y + 64}
                x2={290}
                y2={LAYERS[i + 1].y}
                stroke={layer.color}
                strokeWidth="0.8"
                strokeDasharray="4 3"
                strokeOpacity="0.35"
              />
            )}
          </g>
        ))}

        {/* ── Docker compose label ───────────────────────────── */}
        <rect x={20} y={340} width={540} height={14} rx={4} fill="rgba(103,232,249,0.06)" stroke="rgba(103,232,249,0.20)" strokeWidth="0.7" />
        <text x={290} y={350} textAnchor="middle" fill="#67E8F9" fontSize="7.5" fontFamily="var(--font-mono)" fontWeight="500">
          docker compose up — single command deployment
        </text>
      </svg>
    </div>
  );
}
