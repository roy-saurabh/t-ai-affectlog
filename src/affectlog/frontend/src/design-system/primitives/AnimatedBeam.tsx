import React, { useEffect, useRef } from "react";

interface BeamPoint { x: number; y: number; }

interface AnimatedBeamProps {
  from: BeamPoint;
  to: BeamPoint;
  color?: string;
  duration?: number;
  delay?: number;
  width?: number;
  dashed?: boolean;
}

export function AnimatedBeam({
  from,
  to,
  color = "#67E8F9",
  duration = 2,
  delay = 0,
  width = 1.5,
  dashed = false,
}: AnimatedBeamProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);

  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dashed ? `6 6` : `${len}`}
      strokeDashoffset={len}
      strokeOpacity="0.7"
      strokeLinecap="round"
      style={{
        animation: `beamTravel ${duration}s ${delay}s linear infinite`,
      }}
    />
  );
}

// ── DataNode — SVG circle with label ─────────────────────────────────────
interface DataNodeProps {
  x: number;
  y: number;
  label: string;
  sublabel?: string;
  color?: string;
  size?: number;
  pulse?: boolean;
}

export function DataNode({
  x,
  y,
  label,
  sublabel,
  color = "#67E8F9",
  size = 32,
  pulse = false,
}: DataNodeProps) {
  const r = size / 2;

  return (
    <g>
      {/* Outer glow ring */}
      {pulse && (
        <circle
          cx={x}
          cy={y}
          r={r + 6}
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.3"
          style={{ animation: "nodePulse 2s ease-in-out infinite" }}
        />
      )}
      {/* Background */}
      <circle cx={x} cy={y} r={r} fill={`${color}15`} stroke={color} strokeWidth="1.2" />
      {/* Label */}
      <text
        x={x}
        y={y - r - 8}
        textAnchor="middle"
        fill="#F8FAFC"
        fontSize="11"
        fontFamily="var(--font-sans)"
        fontWeight="500"
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={x}
          y={y - r - 8 + 14}
          textAnchor="middle"
          fill={color}
          fontSize="9"
          fontFamily="var(--font-mono)"
        >
          {sublabel}
        </text>
      )}
    </g>
  );
}

// ── DataFlowLine — animated dashed path between two points ───────────────
interface DataFlowLineProps {
  points: BeamPoint[];
  color?: string;
  speed?: number;
  delay?: number;
}

export function DataFlowLine({
  points,
  color = "#67E8F9",
  speed = 1.8,
  delay = 0,
}: DataFlowLineProps) {
  if (points.length < 2) return null;

  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Approximate path length
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    len += Math.sqrt(dx * dx + dy * dy);
  }

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeDasharray={`${len}`}
      strokeDashoffset={len}
      strokeLinecap="round"
      strokeOpacity="0.6"
      style={{
        animation: `beamTravel ${speed}s ${delay}s linear infinite`,
      }}
    />
  );
}
