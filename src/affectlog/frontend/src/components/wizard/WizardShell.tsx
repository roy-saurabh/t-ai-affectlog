import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

import { WizardProgress, WIZARD_STEPS } from "./WizardProgress";
import { ContextualHelpPanel } from "./ContextualHelpPanel";
import { WizardSummaryPanel } from "./WizardSummaryPanel";
import { StepInputSource, type InputMode } from "./StepInputSource";
import { StepFormatDetection } from "./StepFormatDetection";
import { StepSchemaMapping } from "./StepSchemaMapping";
import { StepPrivacyReview } from "./StepPrivacyReview";
import { StepModelContext, type ModelContext } from "./StepModelContext";
import { StepAnalysisScope } from "./StepAnalysisScope";
import { StepPlotSelection } from "./StepPlotSelection";
import { StepOutputContract } from "./StepOutputContract";
import { StepRunReview } from "./StepRunReview";
import { StepRunProgress } from "./StepRunProgress";
import { StepResultsGuidance } from "./StepResultsGuidance";

import {
  inspectInputs,
  recommendPlan,
  validatePlan,
  getOutputContract,
  runWizard,
  getRunResults,
  type InspectInputResponse,
  type RecommendResponse,
  type ValidatePlanResponse,
  type OutputContract,
  type WizardRunResponse,
  type WizardRunResultsResponse,
  type WizardPlan,
  type ValidationIssue,
} from "../../api/wizard";
import { getDefaultPlotsForFormat } from "../../content/plotCatalog";

const TOTAL_STEPS = 10;

interface PrivacySettings {
  pseudonymise_entities: boolean;
  redact_free_text: boolean;
  suppress_timestamps: boolean;
  raw_export_disabled: boolean;
  privacy_acknowledged: boolean;
}

export function WizardShell() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Step 1 state
  const [datasetPath, setDatasetPath] = useState("");
  const [modelPath, setModelPath] = useState("");
  const [predictionPath, setPredictionPath] = useState("");
  const [groundTruthPath, setGroundTruthPath] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("dataset_only");

  // Step 2 state
  const [inspection, setInspection] = useState<InspectInputResponse | null>(null);
  const [inspecting, setInspecting] = useState(false);

  // Step 3 state
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});

  // Step 4 state
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    pseudonymise_entities: true,
    redact_free_text: false,
    suppress_timestamps: false,
    raw_export_disabled: true,
    privacy_acknowledged: false,
  });

  // Step 5 state
  const [modelContext, setModelContext] = useState<ModelContext>({
    model_path: "",
    adapter_type: "",
    task_type: "unknown",
    feature_schema_available: false,
    has_probability_output: false,
    class_labels: "",
    model_card_available: false,
  });

  // Step 6 state
  const [recommendation, setRecommendation] = useState<RecommendResponse | null>(null);
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);

  // Step 7 state
  const [selectedPlots, setSelectedPlots] = useState<string[]>([]);

  // Step 8 state
  const [outputContract, setOutputContract] = useState<OutputContract | null>(null);
  const [validationResult, setValidationResult] = useState<ValidatePlanResponse | null>(null);
  const [contractConfirmed, setContractConfirmed] = useState(false);

  // Step 9 state
  const [runResponse, setRunResponse] = useState<WizardRunResponse | null>(null);
  const [running, setRunning] = useState(false);

  // Step 10 state
  const [runResults, setRunResults] = useState<WizardRunResultsResponse | null>(null);

  const hasModel = inputMode === "model_aware" && !!modelPath;
  const hasPredictions = inputMode === "model_aware" && !!predictionPath;
  const hasGroundTruth = inputMode === "model_aware" && !!groundTruthPath;
  const hasGroupField = !!fieldMappings.group_field;
  const hasProbabilityOutput = modelContext.has_probability_output;

  function buildPlan(): WizardPlan {
    return {
      detected_format: inspection?.detected_format ?? "generic_csv_tabular",
      field_mappings: fieldMappings,
      field_types: Object.fromEntries(
        (inspection?.field_inventory ?? []).map((f) => [f.name, f.inferred_type]),
      ),
      selected_analyses: selectedAnalyses,
      selected_plots: selectedPlots,
      selected_exports: ["metrics_json", "metrics_csv", "sop_markdown", "audit_manifest_json", "data_card_json"],
      privacy_settings: privacySettings as unknown as Record<string, unknown>,
      inputs: {
        dataset_path: datasetPath,
        model_path: modelPath || undefined,
        prediction_path: predictionPath || undefined,
        ground_truth_path: groundTruthPath || undefined,
        has_probability_output: hasProbabilityOutput,
      },
      purpose: "full_audit",
      model_context: hasModel ? (modelContext as unknown as Record<string, unknown>) : {},
    };
  }

  async function handleInspect() {
    if (!datasetPath) return;
    setInspecting(true);
    try {
      const result = await inspectInputs({
        dataset_path: datasetPath,
        model_path: modelPath || undefined,
        prediction_path: predictionPath || undefined,
        ground_truth_path: groundTruthPath || undefined,
        user_hints: { xapi_mode: false },
      });
      setInspection(result);
      if (result.pre_mapped_fields) setFieldMappings(result.pre_mapped_fields);
      setCompletedSteps((prev) => new Set([...prev, 1]));
    } finally {
      setInspecting(false);
    }
  }

  async function handleGetRecommendation() {
    if (!inspection) return;
    const rec = await recommendPlan({
      inspection_result: inspection,
      purpose: "full_audit",
      field_mappings: fieldMappings,
      has_model: hasModel,
      has_predictions: hasPredictions,
      has_ground_truth: hasGroundTruth,
      has_group_field: hasGroupField,
      has_probability_output: hasProbabilityOutput,
    });
    setRecommendation(rec);
    const validIds = rec.valid_analyses.map((a) => a.id);
    setSelectedAnalyses(validIds);
    setSelectedPlots(getDefaultPlotsForFormat(inspection.detected_format ?? "generic_csv_tabular"));
  }

  async function handleBuildContract() {
    const plan = buildPlan();
    const [validation, contract] = await Promise.all([
      validatePlan(plan),
      getOutputContract(plan),
    ]);
    setValidationResult(validation);
    setOutputContract(contract);
  }

  async function handleRun() {
    setRunning(true);
    try {
      const response = await runWizard(buildPlan());
      setRunResponse(response);
      // Stay on step 9 — StepRunProgress polls and calls handleRunComplete when done
    } catch (e) {
      console.error("Run failed:", e);
    } finally {
      setRunning(false);
    }
  }

  async function handleRunComplete() {
    if (!runResponse) return;
    const results = await getRunResults(runResponse.wizard_run_id);
    setRunResults(results);
    setCompletedSteps((prev) => new Set([...prev, 9]));
    advanceStep();
  }

  function advanceStep() {
    setCompletedSteps((prev) => new Set([...prev, step]));
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  async function handleContinue() {
    if (step === 1) {
      await handleInspect();
      advanceStep();
    } else if (step === 2) {
      advanceStep();
    } else if (step === 3) {
      advanceStep();
    } else if (step === 4) {
      if (!privacySettings.privacy_acknowledged) return;
      advanceStep();
    } else if (step === 5) {
      await handleGetRecommendation();
      advanceStep();
    } else if (step === 6) {
      advanceStep();
    } else if (step === 7) {
      await handleBuildContract();
      advanceStep();
    } else if (step === 8) {
      if (!contractConfirmed) return;
      advanceStep();
    } else if (step === 9) {
      // Run handled separately
    }
  }

  function canContinue(): boolean {
    switch (step) {
      case 1: return !!datasetPath;
      case 2: return !!inspection?.is_supported;
      case 3: return true;
      case 4: return privacySettings.privacy_acknowledged;
      case 5: return true;
      case 6: return selectedAnalyses.length > 0;
      case 7: return true;
      case 8: return contractConfirmed && (validationResult?.status !== "fail");
      default: return false;
    }
  }

  const showContinue = step < 9;

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left nav */}
      <div className="w-52 flex-shrink-0 border-r border-slate-700/50 bg-slate-900/60 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-700/50">
          <p className="text-xs font-bold text-white">Guided Assessment</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Analysis Wizard</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <WizardProgress
            currentStep={step}
            completedSteps={completedSteps}
            onStepClick={(s) => completedSteps.has(s) && setStep(s)}
          />
        </div>
        <div className="px-4 py-3 border-t border-slate-700/50">
          <WizardSummaryPanel plan={buildPlan()} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
          {step === 1 && (
            <StepInputSource
              datasetPath={datasetPath}
              onDatasetPathChange={setDatasetPath}
              modelPath={modelPath}
              onModelPathChange={setModelPath}
              predictionPath={predictionPath}
              onPredictionPathChange={setPredictionPath}
              groundTruthPath={groundTruthPath}
              onGroundTruthPathChange={setGroundTruthPath}
              inputMode={inputMode}
              onInputModeChange={setInputMode}
            />
          )}
          {step === 2 && (
            <StepFormatDetection
              inspection={inspection}
              loading={inspecting}
              onRetry={handleInspect}
              onFormatOverride={(fmt) => {
                if (inspection) setInspection({ ...inspection, detected_format: fmt });
              }}
            />
          )}
          {step === 3 && (
            <StepSchemaMapping
              inspection={inspection}
              mappings={fieldMappings}
              onMapField={(role, field) => setFieldMappings((prev) => ({ ...prev, [role]: field }))}
            />
          )}
          {step === 4 && (
            <StepPrivacyReview
              inspection={inspection}
              privacySettings={privacySettings}
              onSettingChange={(key, value) => setPrivacySettings((prev) => ({ ...prev, [key]: value }))}
            />
          )}
          {step === 5 && (
            <StepModelContext
              hasModel={hasModel}
              modelContext={modelContext}
              onModelContextChange={setModelContext}
            />
          )}
          {step === 6 && (
            <StepAnalysisScope
              recommendation={recommendation}
              selectedAnalyses={selectedAnalyses}
              onToggleAnalysis={(id) =>
                setSelectedAnalyses((prev) =>
                  prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
                )
              }
            />
          )}
          {step === 7 && (
            <StepPlotSelection
              detectedFormat={inspection?.detected_format ?? "generic_csv_tabular"}
              selectedAnalyses={selectedAnalyses}
              selectedPlots={selectedPlots}
              onTogglePlot={(id) =>
                setSelectedPlots((prev) =>
                  prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
                )
              }
              hasPredictions={hasPredictions}
              hasGroundTruth={hasGroundTruth}
              hasModel={hasModel}
              hasGroupField={hasGroupField}
              hasProbabilityOutput={hasProbabilityOutput}
            />
          )}
          {step === 8 && (
            <StepOutputContract
              contract={outputContract}
              validationIssues={validationResult?.issues ?? []}
              confirmed={contractConfirmed}
              onConfirm={setContractConfirmed}
              runtimeEstimate={recommendation?.runtime_estimate_seconds}
              memoryEstimate={recommendation?.memory_estimate_mb}
            />
          )}
          {step === 9 && (
            <StepRunReview
              plan={buildPlan()}
              validationPassed={validationResult?.status !== "fail"}
              onRun={handleRun}
              running={running}
            />
          )}
          {step === 9 && runResponse && (
            <div className="mt-6">
              <StepRunProgress
                runId={runResponse.wizard_run_id}
                onComplete={handleRunComplete}
              />
            </div>
          )}
          {step === 10 && (
            <StepResultsGuidance
              results={runResults}
              runId={runResponse?.wizard_run_id ?? ""}
            />
          )}
        </div>

        {/* Sticky bottom action bar */}
        <div className="sticky bottom-0 border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-sm px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/app")}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={12} />
              Exit wizard
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Save size={12} />
              Save draft
            </button>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-600">
              Step {step} of {TOTAL_STEPS}
            </p>
            {step > 1 && step < 10 && (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(s - 1, 1))}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700/50 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:border-slate-600 transition-all"
              >
                <ChevronLeft size={12} />
                Back
              </button>
            )}
            {showContinue && (
              <button
                type="button"
                disabled={!canContinue()}
                onClick={handleContinue}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
                <ChevronRight size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right help panel */}
      <div className="w-64 flex-shrink-0 border-l border-slate-700/50 bg-slate-900/40 overflow-y-auto">
        <ContextualHelpPanel step={step} />
      </div>
    </div>
  );
}
