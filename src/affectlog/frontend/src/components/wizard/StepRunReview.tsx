import React from "react";
import { Play, AlertTriangle, CheckCircle } from "lucide-react";
import type { WizardPlan } from "../../api/wizard";
import { WizardSummaryPanel } from "./WizardSummaryPanel";

interface StepRunReviewProps {
  plan: Partial<WizardPlan>;
  validationPassed: boolean;
  onRun: () => void;
  running: boolean;
}

export function StepRunReview({ plan, validationPassed, onRun, running }: StepRunReviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white">Run Review</h2>
        <p className="mt-1 text-xs text-slate-500">
          Final check before execution. Confirm the plan is complete and click Run Assessment.
        </p>
      </div>

      <WizardSummaryPanel plan={plan} />

      {validationPassed ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-emerald-300">Plan validated — no blocking issues.</p>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-300">Plan has blocking issues. Return to previous steps to resolve them.</p>
        </div>
      )}

      <button
        type="button"
        disabled={!validationPassed || running}
        onClick={onRun}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {running ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span>Starting assessment…</span>
          </>
        ) : (
          <>
            <Play size={14} />
            Run Assessment
          </>
        )}
      </button>
    </div>
  );
}
