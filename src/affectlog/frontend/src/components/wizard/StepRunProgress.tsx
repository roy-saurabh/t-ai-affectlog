import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import type { WizardRunStatusResponse } from "../../api/wizard";
import { getRunProgress } from "../../api/wizard";

interface StepRunProgressProps {
  runId: string | null;
  onComplete: () => void;
}

function StageRow({ stage, active }: { stage: string; active: boolean }) {
  return (
    <div className={clsx("flex items-center gap-2.5 py-1.5", active && "text-indigo-300")}>
      <div className="flex-shrink-0">
        {active ? (
          <Loader size={12} className="text-indigo-400 animate-spin" />
        ) : (
          <CheckCircle size={12} className="text-emerald-400" />
        )}
      </div>
      <span className="text-xs text-slate-400 capitalize">{stage.replace(/_/g, " ")}</span>
    </div>
  );
}

export function StepRunProgress({ runId, onComplete }: StepRunProgressProps) {
  const [status, setStatus] = useState<WizardRunStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;
    let active = true;
    const poll = async () => {
      while (active) {
        try {
          const s = await getRunProgress(runId);
          if (active) {
            setStatus(s);
            if (s.status === "completed") { onComplete(); return; }
            if (s.status === "failed") return;
          }
        } catch (e) {
          if (active) setError(String(e));
          return;
        }
        await new Promise((r) => setTimeout(r, 2500));
      }
    };
    poll();
    return () => { active = false; };
  }, [runId, onComplete]);

  if (!runId) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Loader size={20} className="text-slate-600" />
        <p className="text-sm text-slate-500">Waiting for run to start…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-300">Run error</p>
          <p className="text-xs text-slate-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const progress = status?.progress_pct ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white">Run Progress</h2>
        <p className="mt-1 text-xs text-slate-500">
          Run ID: <span className="font-mono text-slate-400">{runId}</span>
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span className="capitalize">{status?.current_stage?.replace(/_/g, " ") ?? "Starting…"}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-700/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>
      </div>

      {status?.stages_completed && status.stages_completed.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-3">Pipeline</p>
          {status.stages_completed.map((s) => <StageRow key={s} stage={s} active={false} />)}
          {status.current_stage && <StageRow stage={status.current_stage} active />}
        </div>
      )}

      {status?.warnings && status.warnings.length > 0 && (
        <div className="space-y-2">
          {status.warnings.map((w) => (
            <div key={w} className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <AlertTriangle size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500">{w}</p>
            </div>
          ))}
        </div>
      )}

      {status?.errors && status.errors.length > 0 && (
        <div className="space-y-2">
          {status.errors.map((e) => (
            <div key={e} className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <XCircle size={12} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">{e}</p>
            </div>
          ))}
        </div>
      )}

      {status?.rows_processed != null && (
        <p className="text-xs text-slate-600 text-right">
          {status.rows_processed.toLocaleString()} rows processed
        </p>
      )}
    </div>
  );
}
