import React from "react";
import { Cpu, AlertCircle } from "lucide-react";

export type ModelContext = {
  model_path: string;
  adapter_type: string;
  task_type: string;
  feature_schema_available: boolean;
  has_probability_output: boolean;
  class_labels: string;
  model_card_available: boolean;
};

interface StepModelContextProps {
  hasModel: boolean;
  modelContext: ModelContext;
  onModelContextChange: (ctx: ModelContext) => void;
}

const ADAPTERS = [
  { id: "sklearn_adapter", label: "scikit-learn (.pkl / .joblib)" },
  { id: "onnx_adapter", label: "ONNX (.onnx)" },
  { id: "torch_adapter", label: "PyTorch (.pt / .pth)" },
  { id: "tensorflow_adapter", label: "TensorFlow / Keras (.h5 / .keras)" },
  { id: "http_adapter", label: "HTTP Model Endpoint (URL)" },
];

const TASKS = [
  { id: "classification", label: "Classification" },
  { id: "regression", label: "Regression" },
  { id: "ranking", label: "Ranking / Recommendation" },
  { id: "unknown", label: "Unknown" },
];

export function StepModelContext({
  hasModel,
  modelContext,
  onModelContextChange,
}: StepModelContextProps) {
  function update<K extends keyof ModelContext>(key: K, value: ModelContext[K]) {
    onModelContextChange({ ...modelContext, [key]: value });
  }

  if (!hasModel) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Model Context</h2>
          <p className="mt-1 text-xs text-slate-500">
            No model was uploaded in Step 1. This step is optional — skip it for dataset-only assessments.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 py-12 rounded-xl border border-slate-700/40 bg-slate-800/20">
          <Cpu size={24} className="text-slate-600" />
          <p className="text-sm text-slate-500">No model registered</p>
          <p className="text-xs text-slate-600 text-center max-w-xs">
            Model-aware analyses (SHAP, PDP, model card, comparison) are not available without a registered model.
            Return to Step 1 to upload a model artifact.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white">Model Context</h2>
        <p className="mt-1 text-xs text-slate-500">
          Confirm the model's adapter type and task to unlock explanation and performance analyses.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-400">Adapter type</span>
          <select
            value={modelContext.adapter_type}
            onChange={(e) => update("adapter_type", e.target.value)}
            className="rounded-xl border border-slate-700/50 bg-slate-800 px-3 py-2.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Auto-detect</option>
            {ADAPTERS.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-400">Model task</span>
          <select
            value={modelContext.task_type}
            onChange={(e) => update("task_type", e.target.value)}
            className="rounded-xl border border-slate-700/50 bg-slate-800 px-3 py-2.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
          >
            {TASKS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3">
        {[
          { key: "feature_schema_available" as const, label: "Feature schema is available", description: "Required for SHAP and local explanations." },
          { key: "has_probability_output" as const, label: "Model produces probability outputs", description: "Required for ROC, PR curve, and calibration plots." },
          { key: "model_card_available" as const, label: "Model card is available", description: "Pre-existing model documentation." },
        ].map(({ key, label, description }) => (
          <label key={key} className="grid grid-cols-[auto_1fr] items-start gap-x-3 cursor-pointer rounded-xl border border-slate-700/50 bg-slate-800/30 p-3 hover:border-slate-600/50 transition-colors">
            <input
              type="checkbox"
              checked={!!modelContext[key]}
              onChange={(e) => update(key, e.target.checked)}
              className="row-span-2 mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium text-slate-300">{label}</span>
            <span className="text-[11px] text-slate-500">{description}</span>
          </label>
        ))}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-slate-400">
          Class labels <span className="text-slate-600">(comma-separated, optional)</span>
        </span>
        <input
          type="text"
          value={modelContext.class_labels}
          onChange={(e) => update("class_labels", e.target.value)}
          placeholder="e.g. pass, fail, dropout"
          className="rounded-xl border border-slate-700/50 bg-slate-800 px-3 py-2.5 text-xs text-slate-300 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
        />
      </label>

      {!modelContext.feature_schema_available && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <AlertCircle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500">
            Without a feature schema, local explanation analyses (SHAP waterfall, partial dependence) will be blocked.
          </p>
        </div>
      )}
    </div>
  );
}
