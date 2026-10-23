import React from "react";
import { CheckCircle, AlertCircle, HelpCircle, RefreshCw } from "lucide-react";
import clsx from "clsx";
import type { InspectInputResponse } from "../../api/wizard";

interface StepFormatDetectionProps {
  inspection: InspectInputResponse | null;
  loading: boolean;
  onRetry: () => void;
  onFormatOverride: (formatId: string) => void;
}

const SUPPORTED_OVERRIDES = [
  { id: "maskott_csv_v1", label: "Maskott / Tactileo CSV" },
  { id: "becomino_json", label: "Becomino JSON" },
  { id: "generic_xapi_json", label: "Generic xAPI JSON" },
  { id: "generic_xapi_jsonl", label: "Generic xAPI JSONL" },
  { id: "generic_csv_tabular", label: "Generic Tabular CSV" },
  { id: "parquet_tabular", label: "Parquet Tabular" },
];

function confidenceBarColor(value: number): string {
  if (value >= 0.8) return "bg-emerald-500";
  if (value >= 0.5) return "bg-amber-500";
  return "bg-red-500";
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
        <div
          className={clsx(
            "h-full rounded-full transition-all",
            confidenceBarColor(value),
          )}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 w-10 text-right">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

export function StepFormatDetection({
  inspection,
  loading,
  onRetry,
  onFormatOverride,
}: StepFormatDetectionProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <RefreshCw size={20} className="text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400">Inspecting input…</p>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <HelpCircle size={20} className="text-slate-600" />
        <p className="text-sm text-slate-500">No inspection result yet. Complete Step 1 first.</p>
      </div>
    );
  }

  const confidence = inspection.format_confidence;
  const isSupported = inspection.is_supported;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white">Format Detection</h2>
        <p className="mt-1 text-xs text-slate-500">
          AffectLog has inspected your input and detected the format below.
        </p>
      </div>

      {!isSupported && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300">Unsupported format</p>
              <p className="mt-1 text-xs text-slate-400">
                {inspection.unsupported_reason ??
                  "This input is outside the current AffectLog analysis scope."}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                AffectLog supports structured/tabular datasets, xAPI-style educational traces,
                pre-trained tabular ML models, and compatible prediction outputs. Convert this input
                into a supported format or implement a compatible adapter.
              </p>
            </div>
          </div>
        </div>
      )}

      {isSupported && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 space-y-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Detected Format</p>
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
              <span className="text-sm font-medium text-white">
                {inspection.detected_format_label ?? inspection.detected_format ?? "Unknown"}
              </span>
            </div>
            <ConfidenceBar value={confidence} />
            <p className="text-[11px] text-slate-600">
              Detection confidence: {Math.round(confidence * 100)}%
            </p>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 space-y-2">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Dataset Info</p>
            {inspection.row_count_estimate != null && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Rows (estimate)</span>
                <span className="text-slate-300">{inspection.row_count_estimate.toLocaleString()}</span>
              </div>
            )}
            {inspection.file_size_bytes != null && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">File size</span>
                <span className="text-slate-300">{(inspection.file_size_bytes / 1e6).toFixed(1)} MB</span>
              </div>
            )}
            {inspection.xapi_compatibility_score != null && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">xAPI score</span>
                <span className="text-slate-300">{Math.round(inspection.xapi_compatibility_score * 100)}%</span>
              </div>
            )}
            {inspection.maskott_schema_match_score != null && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Maskott match</span>
                <span className="text-slate-300">{Math.round(inspection.maskott_schema_match_score * 100)}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {inspection.risk_warnings.length > 0 && (
        <div className="space-y-2">
          {inspection.risk_warnings.map((w) => (
            <div key={w} className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <AlertCircle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">{w}</p>
            </div>
          ))}
        </div>
      )}

      {inspection.missing_required_fields.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-xs font-medium text-red-300 mb-2">Missing required fields</p>
          <div className="flex flex-wrap gap-1.5">
            {inspection.missing_required_fields.map((f) => (
              <span key={f} className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-400">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {isSupported && confidence < 0.8 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400">
            Low confidence — confirm the correct format:
          </p>
          <select
            onChange={(e) => onFormatOverride(e.target.value)}
            defaultValue=""
            className="w-full rounded-xl border border-slate-700/50 bg-slate-800 px-3 py-2.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Use detected format</option>
            {SUPPORTED_OVERRIDES.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        <RefreshCw size={12} />
        Re-inspect
      </button>
    </div>
  );
}
