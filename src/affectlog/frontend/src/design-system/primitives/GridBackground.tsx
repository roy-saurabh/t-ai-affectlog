import React from "react";
import { cn } from "../cn";

interface GridBackgroundProps {
  className?: string;
  density?: "sparse" | "normal" | "dense";
  opacity?: number;
  fade?: boolean;
}

export function GridBackground({
  className,
  density = "normal",
  opacity = 1,
  fade = true,
}: GridBackgroundProps) {
  const sizeMap = { sparse: "80px 80px", normal: "64px 64px", dense: "32px 32px" };
  const size = sizeMap[density];

  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      aria-hidden="true"
    >
      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: size,
          opacity,
        }}
      />
      {/* Radial fade mask to blend edges */}
      {fade && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(5,8,20,0.9) 100%)",
          }}
        />
      )}
    </div>
  );
}

// ── Noise overlay (film grain texture) ───────────────────────────────────
interface NoiseOverlayProps {
  className?: string;
  opacity?: number;
}

export function NoiseOverlay({ className, opacity = 0.025 }: NoiseOverlayProps) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      aria-hidden="true"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "256px 256px",
      }}
    />
  );
}

// ── Glow orb ──────────────────────────────────────────────────────────────
interface GlowOrbProps {
  color?: "cyan" | "violet" | "blue" | "green";
  size?: number;
  x?: string;
  y?: string;
  opacity?: number;
  className?: string;
}

const orbColors = {
  cyan:   "rgba(34,211,238,0.22)",
  violet: "rgba(139,92,246,0.20)",
  blue:   "rgba(37,99,235,0.22)",
  green:  "rgba(16,185,129,0.18)",
};

export function GlowOrb({ color = "cyan", size = 600, x = "50%", y = "50%", opacity = 1, className }: GlowOrbProps) {
  return (
    <div
      className={cn("absolute pointer-events-none rounded-full", className)}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, ${orbColors[color]} 0%, transparent 70%)`,
        opacity,
        filter: "blur(1px)",
      }}
    />
  );
}
