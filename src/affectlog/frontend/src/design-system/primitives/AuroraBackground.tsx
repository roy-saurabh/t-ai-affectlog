import React from "react";
import { cn } from "../cn";

interface AuroraBackgroundProps {
  className?: string;
  /** Pass 1–3 radial orbs to customize aurora positions */
  orbs?: Array<{
    color: "blue" | "cyan" | "violet" | "green" | "teal";
    x: string;
    y: string;
    size?: number;
    opacity?: number;
  }>;
  /** Add a 48px grid overlay */
  grid?: boolean;
  /** Add noise texture overlay */
  noise?: boolean;
  /** Add edge vignette */
  vignette?: boolean;
  children?: React.ReactNode;
}

const ORB_COLORS: Record<string, string> = {
  blue:   "rgba(147,197,253,0.22)",
  cyan:   "rgba(103,232,249,0.24)",
  violet: "rgba(196,181,253,0.20)",
  green:  "rgba(134,239,172,0.16)",
  teal:   "rgba(94,234,212,0.18)",
};

const DEFAULT_ORBS: AuroraBackgroundProps["orbs"] = [
  { color: "cyan",   x: "18%", y: "12%", size: 640, opacity: 0.9 },
  { color: "violet", x: "80%", y: "10%", size: 540, opacity: 0.85 },
  { color: "teal",   x: "52%", y: "80%", size: 480, opacity: 0.7 },
];

export function AuroraBackground({
  className,
  orbs = DEFAULT_ORBS,
  grid = true,
  noise = true,
  vignette = true,
  children,
}: AuroraBackgroundProps) {
  const resolvedOrbs = (orbs ?? DEFAULT_ORBS) as Array<{ color: "blue" | "cyan" | "violet" | "green" | "teal"; x: string; y: string; size?: number; opacity?: number }>;
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background:
          "linear-gradient(160deg, #030712 0%, #070B1A 45%, #0B1224 100%)",
      }}
    >
      {/* Aurora radial blobs — animated, reduced motion safe */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ zIndex: 0 }}
      >
        {resolvedOrbs.map((orb, i) => {
          const col = ORB_COLORS[orb.color] ?? ORB_COLORS.blue;
          const sz  = orb.size ?? 580;
          const op  = orb.opacity ?? 0.85;
          return (
            <div
              key={i}
              className="absolute animate-aurora"
              style={{
                left: orb.x,
                top:  orb.y,
                width:  sz,
                height: sz,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${col} 0%, transparent 70%)`,
                opacity: op,
                animationDelay: `${i * -4}s`,
                animationDuration: `${12 + i * 3}s`,
                willChange: "transform",
              }}
            />
          );
        })}
      </div>

      {/* Grid overlay */}
      {grid && (
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            zIndex: 1,
            backgroundImage:
              "linear-gradient(rgba(203,213,225,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(203,213,225,0.045) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      )}

      {/* Noise texture */}
      {noise && (
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            zIndex: 2,
            opacity: 0.035,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundSize: "256px 256px",
          }}
        />
      )}

      {/* Vignette */}
      {vignette && (
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            zIndex: 3,
            background:
              "radial-gradient(ellipse at center, transparent 58%, rgba(3,7,18,0.50) 100%)",
          }}
        />
      )}

      {/* Content */}
      <div className="relative" style={{ zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}

/* ── Simpler inline orb (for individual hero sections) ─────────── */
interface GlowOrbProps {
  color?: "blue" | "cyan" | "violet" | "green" | "teal" | "pink";
  size?: number;
  x?: string;
  y?: string;
  opacity?: number;
  blur?: number;
  animate?: boolean;
}

const GLOW_COLORS: Record<string, string> = {
  blue:   "147,197,253",
  cyan:   "103,232,249",
  violet: "196,181,253",
  green:  "134,239,172",
  teal:   "94,234,212",
  pink:   "249,168,212",
};

export function GlowOrb({
  color = "blue",
  size = 500,
  x = "50%",
  y = "50%",
  opacity = 0.55,
  blur = 80,
  animate = false,
}: GlowOrbProps) {
  const rgb = GLOW_COLORS[color] ?? GLOW_COLORS.blue;
  return (
    <div
      className={animate ? "animate-aurora" : ""}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(${rgb},${opacity}) 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        pointerEvents: "none",
        willChange: animate ? "transform" : "auto",
      }}
      aria-hidden="true"
    />
  );
}
