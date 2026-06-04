import type { UserHints } from "../api/wizard";

interface PresetPrivacy {
  pseudonymise_entities: boolean;
  redact_free_text: boolean;
  suppress_timestamps: boolean;
  raw_export_disabled: boolean;
  privacy_acknowledged: boolean;
}

export interface WizardPreset {
  id: string;
  label: string;
  platform: string;
  schema: string;
  schemaLabel: string;
  datasetPath: string;
  inputMode: "dataset_only" | "model_aware";
  description: string;
  useCaseContext: string;
  tag: string;
  accent: "indigo" | "emerald";
  rowCount: string;
  format: string;
  privacySettings: PresetPrivacy;
  userHints: UserHints;
}

export const WIZARD_PRESETS: Record<string, WizardPreset> = {
  maskott: {
    id: "maskott",
    label: "Maskott / Tactileo",
    platform: "Maskott",
    schema: "maskott_csv_v1",
    schemaLabel: "maskott_csv_v1",
    datasetPath: "data/samples/maskott_csv_sample.csv",
    inputMode: "dataset_only",
    description:
      "CSV learning-activity log from Maskott's Tactileo LMS. Covers resource access, view contexts, session metadata, and anonymised learner identifiers.",
    useCaseContext:
      "EU AI Act readiness audit: schema validation, xAPI normalisation, PII scan, entity dominance, coverage, and full compliance export (JSON-LD, SOP, data card, PDC metadata).",
    tag: "Production · EDGE-Skills · EU AI Act",
    accent: "indigo",
    rowCount: "502 rows · 12 fields",
    format: "CSV",
    privacySettings: {
      pseudonymise_entities: true,
      redact_free_text: false,
      suppress_timestamps: false,
      raw_export_disabled: true,
      privacy_acknowledged: false,
    },
    userHints: {
      dataset_type: "maskott_csv_v1",
      platform: "Maskott/Tactileo",
      xapi_mode: true,
      timestamp_field: "AccessDate",
      entity_field: "EntityId",
      item_field: "ResourceId",
      session_field: "ActivitySessionId",
    },
  },

  becomino: {
    id: "becomino",
    label: "Inokufu / Becomino",
    platform: "Inokufu",
    schema: "becomino_json",
    schemaLabel: "becomino_json_v1",
    datasetPath: "data/samples/becomino_sample.json",
    inputMode: "dataset_only",
    description:
      "xAPI JSON statement bundle from Inokufu's Becomino catalogue. Pre-anonymised. Covers activity verbs, resource objects, session context, and duration results.",
    useCaseContext:
      "xAPI normalisation and template inference: verb distribution, coverage@K, co-occurrence network, JSON-LD compliance, and audit manifest — no pseudonymisation needed (already anonymised at source).",
    tag: "Production · Inokufu · xAPI",
    accent: "emerald",
    rowCount: "xAPI bundle · anonymised",
    format: "JSON",
    privacySettings: {
      pseudonymise_entities: false,
      redact_free_text: false,
      suppress_timestamps: false,
      raw_export_disabled: true,
      privacy_acknowledged: false,
    },
    userHints: {
      dataset_type: "becomino_json",
      platform: "Inokufu/Becomino",
      xapi_mode: true,
    },
  },
};
