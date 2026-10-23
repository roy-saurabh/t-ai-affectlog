import React from "react";
import { ShieldCheck, ShieldAlert, Lock } from "lucide-react";
import clsx from "clsx";

interface Props {
  riskLevel: "low" | "medium" | "high" | "unknown";
  sparsityRatio?: number | null;
  completeness?: number | null;
}

const RISK_CONFIG = {
  low: {
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-900/30",
    border: "border-emerald-700/40",
    badge: "badge-ok",
    label: "Low Privacy Risk",
    desc: "Direct identifiers pseudonymised. Residual re-identification risk is low.",
  },
  medium: {
    icon: ShieldAlert,
    color: "text-amber-400",
    bg: "bg-amber-900/30",
    border: "border-amber-700/40",
    badge: "badge-warn",
    label: "Medium Privacy Risk",
    desc: "Some quasi-identifiers present. Review temporal and institutional attributes.",
  },
  high: {
    icon: ShieldAlert,
    color: "text-red-400",
    bg: "bg-red-900/30",
    border: "border-red-700/40",
    badge: "badge-err",
    label: "High Privacy Risk",
    desc: "Significant re-identification risk detected. Increase pseudonymisation scope.",
  },
  unknown: {
    icon: Lock,
    color: "text-slate-400",
    bg: "bg-slate-700/30",
    border: "border-slate-600/40",
    badge: "badge-info",
    label: "Risk Unknown",
    desc: "Privacy analysis not yet complete.",
  },
};

function completenessBarColor(completeness: number): string {
  if (completeness >= 0.9) return "bg-emerald-500";
  if (completeness >= 0.7) return "bg-amber-500";
  return "bg-red-500";
}

export default function PrivacyPanel({ riskLevel, sparsityRatio, completeness }: Props) {
  const cfg = RISK_CONFIG[riskLevel] ?? RISK_CONFIG.unknown;
  const Icon = cfg.icon;

  return (
    <div className={clsx("card border", cfg.border)}>
      <div className="flex items-start gap-3">
        <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", cfg.bg)}>
          <Icon size={20} className={cfg.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-100">{cfg.label}</h3>
            <span className={cfg.badge}>{riskLevel}</span>
          </div>
          <p className="text-sm text-slate-400">{cfg.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700/50">
        <div>
          <div className="stat-label mb-1">Data Completeness</div>
          <div className="text-xl font-bold text-white">
            {completeness != null ? `${(completeness * 100).toFixed(1)}%` : "—"}
          </div>
          {completeness != null && (
            <div className="h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div
                className={clsx(
                  "h-full rounded-full",
                  completenessBarColor(completeness),
                )}
                style={{ width: `${completeness * 100}%` }}
              />
            </div>
          )}
        </div>
        <div>
          <div className="stat-label mb-1">Sparsity Ratio</div>
          <div className="text-xl font-bold text-white">
            {sparsityRatio != null ? sparsityRatio.toFixed(4) : "—"}
          </div>
          <div className="text-xs text-slate-600 mt-1">actor×resource pairs observed / possible</div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-700/50">
        <p className="text-xs text-slate-600 leading-relaxed">
          HMAC-SHA256 pseudonymisation applied to: <code className="text-slate-500">_id</code>,{" "}
          <code className="text-slate-500">EntityId</code>,{" "}
          <code className="text-slate-500">ActivitySessionId</code>,{" "}
          <code className="text-slate-500">EntityUaiCode</code>.
          Raw identifiers are never stored or displayed.
        </p>
      </div>
    </div>
  );
}
