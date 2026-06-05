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
  const sizeMap = { sparse: "80px 80px", normal: "48px 48px", dense: "24px 24px" };
  const size = sizeMap[density];

  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(203,213,225,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(203,213,225,0.045) 1px, transparent 1px)",
          backgroundSize: size,
          opacity,
        }}
      />
      {fade && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(7,11,26,0.88) 100%)",
          }}
        />
      )}
    </div>
  );
}

/* ── Noise overlay (film grain) ──────────────────────────────────── */
interface NoiseOverlayProps {
  className?: string;
  opacity?: number;
}

export function NoiseOverlay({ className, opacity = 0.035 }: NoiseOverlayProps) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      aria-hidden="true"
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "256px 256px",
      }}
    />
  );
}

/* ── Glow orb — pastel edition ────────────────────────────────────── */
interface GlowOrbProps {
  color?: "cyan" | "violet" | "blue" | "green" | "teal" | "pink";
  size?: number;
  x?: string;
  y?: string;
  opacity?: number;
  className?: string;
  animate?: boolean;
}

const ORB_COLORS: Record<string, string> = {
  cyan:   "rgba(103,232,249,0.24)",
  violet: "rgba(196,181,253,0.20)",
  blue:   "rgba(147,197,253,0.22)",
  green:  "rgba(134,239,172,0.18)",
  teal:   "rgba(94,234,212,0.20)",
  pink:   "rgba(249,168,212,0.18)",
};

export function GlowOrb({
  color = "cyan",
  size = 600,
  x = "50%",
  y = "50%",
  opacity = 1,
  className,
  animate = false,
}: GlowOrbProps) {
  return (
    <div
      className={cn(
        "absolute pointer-events-none rounded-full",
        animate && "animate-aurora",
        className
      )}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, ${ORB_COLORS[color] ?? ORB_COLORS.blue} 0%, transparent 70%)`,
        opacity,
        filter: "blur(2px)",
        willChange: animate ? "transform" : "auto",
      }}
    />
  );
}
