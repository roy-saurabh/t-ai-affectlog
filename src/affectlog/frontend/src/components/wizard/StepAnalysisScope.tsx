import React from "react";
import { CheckSquare, Square, ChevronRight, Clock } from "lucide-react";
import clsx from "clsx";
import type { RecommendResponse, ScopeItem } from "../../api/wizard";
import { ScopeBadge } from "./ScopeBadge";
import { UnsupportedAnalysisCard } from "./UnsupportedAnalysisCard";

interface StepAnalysisScopeProps {
  recommendation: RecommendResponse | null;
  selectedAnalyses: string[];
  onToggleAnalysis: (id: string) => void;
}

const RUNTIME_ICONS: Record<string, string> = {
  fast: "< 30s",
  medium: "30s – 5min",
  slow: "> 5min",
};

function AvailableAnalysisCard({
  item,
  selected,
  onToggle,
}: {
  item: ScopeItem;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(item.id)}
      className={clsx(
        "w-full rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-indigo-500/60 bg-indigo-500/10"
          : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50 hover:bg-slate-800/50",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {selected ? (
            <CheckSquare size={15} className="text-indigo-400" />
          ) : (
            <Square size={15} className="text-slate-600" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-300">{item.label}</span>
            <ScopeBadge status={item.status} compact />
            {item.runtime_category && (
              <span className="text-[10px] text-slate-600 flex items-center gap-0.5">
                <Clock size={9} />
                {RUNTIME_ICONS[item.runtime_category] ?? item.runtime_category}
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{item.description}</p>
          {item.backend_route && (
            <p className="mt-1.5 text-[10px] text-slate-600 font-mono">{item.backend_route}</p>
          )}
        </div>
      </div>
    </button>
  );
}

export function StepAnalysisScope({
  recommendation,
  selectedAnalyses,
  onToggleAnalysis,
}: StepAnalysisScopeProps) {
  if (!recommendation) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <ChevronRight size={20} className="text-slate-600" />
        <p className="text-sm text-slate-500">Complete Steps 1–4 to see analysis scope.</p>
      </div>
    );
  }

  const available = recommendation.valid_analyses;
  const conditional = recommendation.conditional_analyses;
  const outOfScope = recommendation.invalid_analyses.slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white">Analysis Scope</h2>
        <p className="mt-1 text-xs text-slate-500">{recommendation.scope_summary}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: "Available now", count: available.length, color: "text-emerald-400" },
          { label: "Needs more input", count: conditional.length, color: "text-amber-400" },
          { label: "Out of scope", count: recommendation.invalid_analyses.length, color: "text-slate-500" },
        ].map(({ label, count, color }) => (
          <div key={label} className="rounded-xl border border-slate-700/50 bg-slate-800/30 py-4">
            <p className={clsx("text-2xl font-bold tabular-nums", color)}>{count}</p>
            <p className="mt-1 text-[11px] text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {available.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-400">Available now</p>
            <button
              type="button"
              onClick={() => {
                const allIds = available.map((a) => a.id);
                const allSelected = allIds.every((id) => selectedAnalyses.includes(id));
                allIds.forEach((id) => {
                  if (allSelected || !selectedAnalyses.includes(id)) onToggleAnalysis(id);
                });
              }}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {available.every((a) => selectedAnalyses.includes(a.id)) ? "Deselect all" : "Select all"}
            </button>
          </div>
          <div className="space-y-2">
            {available.map((item) => (
              <AvailableAnalysisCard
                key={item.id}
                item={item}
                selected={selectedAnalyses.includes(item.id)}
                onToggle={onToggleAnalysis}
              />
            ))}
          </div>
        </div>
      )}

      {conditional.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-400">Available with additional input</p>
          <div className="space-y-2">
            {conditional.map((item) => (
              <UnsupportedAnalysisCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {outOfScope.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">Out of scope for this input</p>
          <div className="space-y-1.5">
            {outOfScope.map((item) => (
              <UnsupportedAnalysisCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
