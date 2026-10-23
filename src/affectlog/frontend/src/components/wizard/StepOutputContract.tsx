import React from "react";
import { FileCheck, AlertTriangle, Clock, HardDrive } from "lucide-react";
import type { OutputContract, ValidationIssue } from "../../api/wizard";
import { OutputArtifactCard } from "./OutputArtifactCard";
import { GuardrailAlert } from "./GuardrailAlert";

interface StepOutputContractProps {
  contract: OutputContract | null;
  validationIssues: ValidationIssue[];
  confirmed: boolean;
  onConfirm: (v: boolean) => void;
  runtimeEstimate?: number;
  memoryEstimate?: number;
}

export function StepOutputContract({
  contract,
  validationIssues,
  confirmed,
  onConfirm,
  runtimeEstimate,
  memoryEstimate,
}: StepOutputContractProps) {
  const blockingIssues = validationIssues.filter((i) => i.severity === "block");
  const warningIssues = validationIssues.filter((i) => i.severity === "warn");

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <FileCheck size={20} className="text-slate-600" />
        <p className="text-sm text-slate-500">Building output contract…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white">Output Contract</h2>
        <p className="mt-1 text-xs text-slate-500">
          This is a binding description of what this assessment will produce. Review it carefully before approving.
        </p>
      </div>

      {blockingIssues.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-red-400">Blocking issues — resolve before running</p>
          {blockingIssues.map((issue) => (
            <GuardrailAlert key={issue.rule_id} issue={issue} />
          ))}
        </div>
      )}

      {warningIssues.length > 0 && (
        <div className="space-y-2">
          {warningIssues.map((issue) => (
            <GuardrailAlert key={issue.rule_id} issue={issue} />
          ))}
        </div>
      )}

      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assessment summary</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-slate-500">Dataset</p>
            <p className="text-slate-300 mt-0.5">{contract.dataset_summary}</p>
          </div>
          {contract.model_summary && (
            <div>
              <p className="text-slate-500">Model</p>
              <p className="text-slate-300 mt-0.5">{contract.model_summary}</p>
            </div>
          )}
          <div>
            <p className="text-slate-500">Analyses</p>
            <p className="text-slate-300 mt-0.5">{contract.selected_analyses.length} selected</p>
          </div>
          <div>
            <p className="text-slate-500">Plots</p>
            <p className="text-slate-300 mt-0.5">{contract.selected_plots.length} selected</p>
          </div>
        </div>
        {(runtimeEstimate || memoryEstimate) && (
          <div className="flex gap-4 pt-2 border-t border-slate-700/30">
            {runtimeEstimate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock size={11} />
                ~{runtimeEstimate < 60 ? `${runtimeEstimate}s` : `${Math.round(runtimeEstimate / 60)}min`}
              </div>
            )}
            {memoryEstimate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <HardDrive size={11} />
                ~{memoryEstimate} MB
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400">Expected artifacts ({contract.expected_artifacts.length})</p>
        <div className="space-y-1.5">
          {contract.expected_artifacts.map((a) => (
            <OutputArtifactCard key={a.filename} artifact={a} />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} className="text-amber-400" />
          <p className="text-xs font-medium text-amber-300">Limitations</p>
        </div>
        <ul className="space-y-1.5 text-[11px] text-slate-500">
          {contract.limitations.map((l) => (
            <li key={l} className="flex items-start gap-1.5">
              <span className="text-slate-600 flex-shrink-0">•</span>
              {l}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => onConfirm(e.target.checked)}
            disabled={blockingIssues.length > 0}
            className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 disabled:opacity-40"
          />
          <p className="text-xs text-slate-400 leading-relaxed">{contract.confirmation_text}</p>
        </label>
      </div>
    </div>
  );
}
