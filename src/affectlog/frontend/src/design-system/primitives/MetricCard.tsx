import React from "react";
import { cn } from "../cn";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: LucideIcon;
  accent?: "cyan" | "violet" | "green" | "blue" | "amber" | "red";
  trend?: { direction: "up" | "down" | "neutral"; value: string };
  loading?: boolean;
  className?: string;
}

const accentColors = {
  cyan:   { text: "#67E8F9", bg: "rgba(103,232,249,0.10)",  border: "rgba(103,232,249,0.20)" },
  violet: { text: "#C4B5FD", bg: "rgba(196,181,253,0.10)",  border: "rgba(196,181,253,0.20)" },
  green:  { text: "#86EFAC", bg: "rgba(134,239,172,0.10)",  border: "rgba(134,239,172,0.20)" },
  blue:   { text: "#C4B5FD", bg: "rgba(147,197,253,0.10)",   border: "rgba(147,197,253,0.20)"  },
  amber:  { text: "#FCD34D", bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.20)" },
  red:    { text: "#FCA5A5", bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.20)"  },
};

export function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "cyan",
  trend,
  loading = false,
  className,
}: MetricCardProps) {
  const { text, bg, border } = accentColors[accent];

  if (loading) {
    return (
      <div className={cn("card-sm space-y-3", className)} aria-busy="true">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-8 w-16 rounded" />
        <div className="skeleton h-2.5 w-32 rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl p-4 border transition-all duration-200 hover:scale-[1.01]",
        className
      )}
      style={{
        background: "rgba(11,16,32,0.8)",
        borderColor: "rgba(203,213,225,0.14)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: bg, border: `1px solid ${border}` }}
          >
            <Icon size={14} style={{ color: text }} aria-hidden="true" />
          </div>
        )}
      </div>

      <div
        className="text-2xl font-bold leading-none mb-1 tabular-nums"
        style={{ color: text }}
      >
        {value}
      </div>

      <div className="flex items-center gap-2 mt-2">
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trend.direction === "up" && "text-emerald-400",
              trend.direction === "down" && "text-red-400",
              trend.direction === "neutral" && "text-slate-400"
            )}
          >
            {trend.direction === "up" && "↑ "}
            {trend.direction === "down" && "↓ "}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Compact stat ──────────────────────────────────────────────────────────
interface MiniStatProps {
  label: string;
  value: string;
  accent?: string;
}

export function MiniStat({ label, value, accent = "#67E8F9" }: MiniStatProps) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold font-mono" style={{ color: accent }}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
