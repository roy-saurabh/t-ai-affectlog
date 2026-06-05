import React from "react";
import { cn } from "../cn";

type BadgeColor = "cyan" | "violet" | "green" | "blue" | "amber" | "red" | "neutral" | "indigo";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  dot?: boolean;
  pulseDot?: boolean;
}

const colorMap: Record<BadgeColor, { bg: string; text: string; border: string }> = {
  cyan:    { bg: "rgba(103,232,249,0.10)",  text: "#67E8F9", border: "rgba(103,232,249,0.25)" },
  violet:  { bg: "rgba(196,181,253,0.10)",  text: "#C4B5FD", border: "rgba(196,181,253,0.25)" },
  green:   { bg: "rgba(134,239,172,0.10)",  text: "#86EFAC", border: "rgba(134,239,172,0.25)" },
  blue:    { bg: "rgba(147,197,253,0.10)",   text: "#C4B5FD", border: "rgba(147,197,253,0.25)" },
  amber:   { bg: "rgba(245,158,11,0.10)",  text: "#FCD34D", border: "rgba(245,158,11,0.25)" },
  red:     { bg: "rgba(239,68,68,0.10)",   text: "#FCA5A5", border: "rgba(239,68,68,0.25)" },
  neutral: { bg: "rgba(203,213,225,0.10)", text: "#94a3b8", border: "rgba(203,213,225,0.20)" },
  indigo:  { bg: "rgba(99,102,241,0.10)",  text: "#C4B5FD", border: "rgba(99,102,241,0.25)" },
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, color = "neutral", dot = false, pulseDot = false, children, ...props }, ref) => {
    const { bg, text, border } = colorMap[color];

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
          className
        )}
        style={{ background: bg, color: text, border: `1px solid ${border}` }}
        {...props}
      >
        {(dot || pulseDot) && (
          <span
            className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", pulseDot && "animate-pulse")}
            style={{ background: text }}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

// ── Pill — larger, softer ─────────────────────────────────────────────────
interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

export const Pill = React.forwardRef<HTMLSpanElement, PillProps>(
  ({ className, color = "neutral", children, ...props }, ref) => {
    const { bg, text, border } = colorMap[color];
    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-full", className)}
        style={{ background: bg, color: text, border: `1px solid ${border}` }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Pill.displayName = "Pill";

// ── StatPill — compact metric label ──────────────────────────────────────
interface StatPillProps {
  label: string;
  value: string;
  color?: BadgeColor;
}

export function StatPill({ label, value, color = "cyan" }: StatPillProps) {
  const { bg, text, border } = colorMap[color];
  return (
    <span
      className="inline-flex items-baseline gap-1.5 text-xs px-3 py-1.5 rounded-full font-mono"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <span className="font-bold" style={{ color: text }}>{value}</span>
      <span className="text-slate-500">{label}</span>
    </span>
  );
}
