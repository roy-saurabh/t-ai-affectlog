/**
 * Wizard API client — wraps all /v1/wizard and /v1/capabilities endpoints.
 */

const BASE = (import.meta as { env: { VITE_API_BASE_URL?: string } }).env.VITE_API_BASE_URL ?? "";

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => r.statusText);
    throw new Error(detail || `${r.status} ${r.statusText}`);
  }
  return r.json();
}

// ── Types ────────────────────────────────────────────────────────────────

export interface UserHints {
  dataset_type?: string;
  platform?: string;
  task_type?: string;
  target_field?: string;
  prediction_field?: string;
  group_fields?: string[];
  timestamp_field?: string;
  entity_field?: string;
  item_field?: string;
  session_field?: string;
  xapi_mode?: boolean;
  recommender_mode?: boolean;
}

export interface InspectInputRequest {
  dataset_path?: string;
  dataset_reference?: string;
  model_path?: string;
  model_reference?: string;
  prediction_path?: string;
  ground_truth_path?: string;
  user_hints?: UserHints;
}

export interface FieldInventoryEntry {
  name: string;
  inferred_type: string;
  cardinality?: number;
  missing_rate?: number;
  sample_values: string[];
  pii_flag: boolean;
  likely_roles: string[];
}

export interface InspectInputResponse {
  detected_format?: string;
  detected_format_label?: string;
  format_confidence: number;
  row_count_estimate?: number;
  file_size_bytes?: number;
  field_inventory: FieldInventoryEntry[];
  xapi_compatibility_score?: number;
  becomino_template_match_score?: number;
  maskott_schema_match_score?: number;
  missing_required_fields: string[];
  detected_model_type?: string;
  model_adapter_compatibility?: string;
  risk_warnings: string[];
  recommended_next_step: string;
  is_supported: boolean;
  unsupported_reason?: string;
  pre_mapped_fields: Record<string, string>;
}

export interface ScopeItem {
  id: string;
  label: string;
  status: "available" | "conditional" | "out_of_scope";
  description: string;
  why: string;
  required_inputs: string[];
  expected_outputs: string[];
  backend_route: string;
  runtime_category: string;
  sensitivity_level: string;
}

export interface RecommendRequest {
  inspection_result: InspectInputResponse;
  purpose: string;
  field_mappings: Record<string, string>;
  has_model: boolean;
  has_predictions: boolean;
  has_ground_truth: boolean;
  has_group_field: boolean;
  has_probability_output: boolean;
  user_hints?: UserHints;
}

export interface RecommendResponse {
  recommended_recipe: string;
  valid_analyses: ScopeItem[];
  invalid_analyses: ScopeItem[];
  conditional_analyses: ScopeItem[];
  valid_plots: ScopeItem[];
  invalid_plots: ScopeItem[];
  required_missing_inputs: string[];
  optional_recommended_inputs: string[];
  privacy_controls: string[];
  expected_artifacts: string[];
  runtime_estimate_seconds?: number;
  memory_estimate_mb?: number;
  limitations: string[];
  assumptions: string[];
  scope_summary: string;
}

export interface WizardPlan {
  detected_format: string;
  field_mappings: Record<string, string>;
  field_types: Record<string, string>;
  selected_analyses: string[];
  selected_plots: string[];
  selected_exports: string[];
  privacy_settings: Record<string, unknown>;
  inputs: Record<string, unknown>;
  purpose: string;
  model_context: Record<string, unknown>;
}

export interface ValidationIssue {
  severity: "block" | "warn" | "info";
  rule_id: string;
  title: string;
  message: string;
  remediation: string;
  affected_step?: number;
}

export interface ValidatePlanResponse {
  status: "pass" | "warn" | "fail";
  issues: ValidationIssue[];
  blocking_count: number;
  warning_count: number;
  info_count: number;
}

export interface OutputContractArtifact {
  filename: string;
  format: string;
  description: string;
  privacy_level: string;
  required_analysis?: string;
}

export interface OutputContract {
  dataset_summary: string;
  model_summary?: string;
  selected_recipe: string;
  field_mappings: Record<string, string>;
  privacy_settings: Record<string, unknown>;
  selected_analyses: string[];
  selected_plots: string[];
  expected_artifacts: OutputContractArtifact[];
  limitations: string[];
  assumptions: string[];
  scope_summary: string;
  requires_confirmation: boolean;
  confirmation_text: string;
}

export interface WizardRunResponse {
  wizard_run_id: string;
  status: string;
  plan_summary: Record<string, unknown>;
  created_at: string;
}

export interface WizardRunStatusResponse {
  wizard_run_id: string;
  status: string;
  current_stage?: string;
  stages_completed: string[];
  rows_processed?: number;
  warnings: string[];
  errors: string[];
  progress_pct?: number;
}

export interface WizardRunResultsResponse {
  wizard_run_id: string;
  status: string;
  what_was_analyzed: string[];
  what_was_not_analyzed: string[];
  key_findings: string[];
  recommended_next_actions: string[];
  artifacts: OutputContractArtifact[];
  selected_plots: string[];
  developer_extension_suggestions: string[];
}

// ── API functions ────────────────────────────────────────────────────────

export const inspectInputs = (req: InspectInputRequest) =>
  post<InspectInputResponse>("/v1/wizard/inspect-inputs", req);

export const recommendPlan = (req: RecommendRequest) =>
  post<RecommendResponse>("/v1/wizard/recommend", req);

export const validatePlan = (plan: WizardPlan) =>
  post<ValidatePlanResponse>("/v1/wizard/validate-plan", plan);

export const getOutputContract = (plan: WizardPlan) =>
  post<OutputContract>("/v1/wizard/output-contract", plan);

export const runWizard = (plan: WizardPlan) =>
  post<WizardRunResponse>("/v1/wizard/run", { plan, output_contract_confirmed: true });

export const getRunStatus = (runId: string) =>
  get<WizardRunStatusResponse>(`/v1/wizard/runs/${runId}`);

export const getRunProgress = (runId: string) =>
  get<WizardRunStatusResponse>(`/v1/wizard/runs/${runId}/progress`);

export const getRunResults = (runId: string) =>
  get<WizardRunResultsResponse>(`/v1/wizard/runs/${runId}/results`);

export const listRuns = () => get<{ runs: WizardRunResponse[] }>("/v1/wizard/runs");

export const getCapabilities = () => get<Record<string, unknown>>("/v1/capabilities");

export const fetchArtifactJson = <T = Record<string, unknown>>(runId: string, filename: string) =>
  get<T>(`/v1/wizard/runs/${runId}/artifacts/${filename}`);

export const getStepHelp = (step: number) =>
  get<Record<string, string>>(`/v1/wizard/help/step/${step}`);

export const getAnalysisHelpApi = (analysisId: string) =>
  get<Record<string, string>>(`/v1/wizard/help/analysis/${analysisId}`);
