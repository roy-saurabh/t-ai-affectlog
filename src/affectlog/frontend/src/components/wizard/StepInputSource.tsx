import React from "react";
import { type LucideIcon, Database, Cpu, FileInput, Shield, Layers } from "lucide-react";
import clsx from "clsx";
import type { WizardPreset } from "../../content/wizardPresets";

export type InputMode =
  | "upload_dataset"
  | "existing_dataset"
  | "dataset_only"
  | "model_aware";

interface StepInputSourceProps {
  datasetPath: string;
  onDatasetPathChange: (v: string) => void;
  modelPath: string;
  onModelPathChange: (v: string) => void;
  predictionPath: string;
  onPredictionPathChange: (v: string) => void;
  groundTruthPath: string;
  onGroundTruthPathChange: (v: string) => void;
  inputMode: InputMode;
  onInputModeChange: (m: InputMode) => void;
  activePreset?: WizardPreset | null;
}

const ACCEPTED_FORMATS = [".csv", ".tsv", ".json", ".jsonl", ".ndjson", ".parquet", ".pq"];
const ACCEPTED_MODELS = [".pkl", ".joblib", ".onnx", ".pt", ".pth", ".h5", ".keras"];

function FileInput_({
  label,
  hint,
  icon: Icon,
  accept,
  value,
  onChange,
  optional,
}: {
  label: string;
  hint: string;
  icon: LucideIcon;
  accept: string;
  value: string;
  onChange: (v: string) => void;
  optional?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 cursor-pointer group">
      <span className="text-xs font-medium text-slate-300">
        {label}
        {optional && <span className="ml-1.5 text-slate-600">(optional)</span>}
      </span>
      <div className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-3 group-hover:border-indigo-500/40 transition-colors">
        <Icon size={16} className="flex-shrink-0 text-slate-500" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Path or reference — accepted: ${accept}`}
          className="flex-1 bg-transparent text-xs text-slate-300 placeholder-slate-600 outline-none"
        />
      </div>
      <span className="text-[11px] text-slate-600">{hint}</span>
    </label>
  );
}

export function StepInputSource({
  datasetPath,
  onDatasetPathChange,
  modelPath,
  onModelPathChange,
  predictionPath,
  onPredictionPathChange,
  groundTruthPath,
  onGroundTruthPathChange,
  inputMode,
  onInputModeChange,
  activePreset,
}: StepInputSourceProps) {
  const modes: { id: InputMode; label: string; desc: string }[] = [
    { id: "dataset_only", label: "Dataset-only audit", desc: "Schema, profiling, PII, compliance outputs" },
    { id: "model_aware", label: "Model-aware audit", desc: "Add model, predictions, and ground truth" },
  ];

  const isIndigo = activePreset?.accent === "indigo";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white">Input Source</h2>
        <p className="mt-1 text-xs text-slate-500">
          Select what data you want to assess. At minimum, a dataset file is required.
        </p>
      </div>

      {/* Preset context banner */}
      {activePreset && (
        <div
          className={`rounded-xl border p-4 flex gap-3 ${
            isIndigo
              ? "border-indigo-500/30 bg-indigo-500/8"
              : "border-emerald-500/30 bg-emerald-500/8"
          }`}
        >
          <Layers
            size={14}
            className={`flex-shrink-0 mt-0.5 ${isIndigo ? "text-indigo-400" : "text-emerald-400"}`}
          />
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={`text-xs font-semibold ${isIndigo ? "text-indigo-300" : "text-emerald-300"}`}
              >
                {activePreset.label}
              </p>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  isIndigo
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                {activePreset.tag}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">{activePreset.useCaseContext}</p>
            <p className="text-[10px] text-slate-600">
              Schema: <span className="font-mono">{activePreset.schemaLabel}</span> · {activePreset.rowCount}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onInputModeChange(m.id)}
            className={clsx(
              "rounded-xl border p-4 text-left transition-all",
              inputMode === m.id
                ? "border-indigo-500/60 bg-indigo-500/10"
                : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50",
            )}
          >
            <p className="text-xs font-semibold text-slate-200">{m.label}</p>
            <p className="mt-1 text-[11px] text-slate-500">{m.desc}</p>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <FileInput_
          label="Dataset file"
          hint={`Accepted: ${ACCEPTED_FORMATS.join(", ")}. Max file size depends on tenant quota.`}
          icon={Database}
          accept={ACCEPTED_FORMATS.join(",")}
          value={datasetPath}
          onChange={onDatasetPathChange}
        />

        {inputMode === "model_aware" && (
          <>
            <FileInput_
              label="Model artifact"
              hint={`Accepted: ${ACCEPTED_MODELS.join(", ")}. Or enter an HTTP endpoint URL.`}
              icon={Cpu}
              accept={ACCEPTED_MODELS.join(",")}
              value={modelPath}
              onChange={onModelPathChange}
              optional
            />
            <FileInput_
              label="Prediction output CSV"
              hint="CSV with model predictions. Required for classification/regression/recommender metrics."
              icon={FileInput}
              accept=".csv"
              value={predictionPath}
              onChange={onPredictionPathChange}
              optional
            />
            <FileInput_
              label="Ground-truth CSV"
              hint="CSV with verified labels or interaction data. Required for precision/recall/nDCG."
              icon={FileInput}
              accept=".csv"
              value={groundTruthPath}
              onChange={onGroundTruthPathChange}
              optional
            />
          </>
        )}
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
        <Shield size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-medium text-amber-300">Data handling</p>
          <p className="text-[11px] text-slate-500">
            Files are stored in your tenant's secure storage and never transmitted externally.
            Raw personal data is not displayed by default. Entity identifiers are HMAC-pseudonymised.
          </p>
        </div>
      </div>
    </div>
  );
}
