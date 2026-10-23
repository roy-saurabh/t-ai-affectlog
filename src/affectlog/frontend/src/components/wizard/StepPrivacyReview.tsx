import React from "react";
import { type LucideIcon, Shield, AlertTriangle, Lock, Eye, EyeOff } from "lucide-react";
import type { InspectInputResponse } from "../../api/wizard";

interface PrivacySettings {
  pseudonymise_entities: boolean;
  redact_free_text: boolean;
  suppress_timestamps: boolean;
  raw_export_disabled: boolean;
  privacy_acknowledged: boolean;
}

interface StepPrivacyReviewProps {
  inspection: InspectInputResponse | null;
  privacySettings: PrivacySettings;
  onSettingChange: (key: keyof PrivacySettings, value: boolean) => void;
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  value,
  onChange,
  enforced,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  enforced?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
      <Icon size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-300">{label}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
        {enforced && (
          <p className="text-[10px] text-slate-600 mt-1">Enforced by default — cannot be disabled.</p>
        )}
      </div>
      <button
        type="button"
        disabled={enforced}
        onClick={() => !enforced && onChange(!value)}
        className={`flex-shrink-0 h-5 w-9 rounded-full transition-colors ${
          value ? "bg-indigo-600" : "bg-slate-700"
        } ${enforced ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        role="switch"
        aria-checked={value}
      >
        <span
          className={`block h-4 w-4 mx-0.5 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function StepPrivacyReview({
  inspection,
  privacySettings,
  onSettingChange,
}: StepPrivacyReviewProps) {
  const piiFields = inspection?.field_inventory.filter((f) => f.pii_flag) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white">Privacy Review</h2>
        <p className="mt-1 text-xs text-slate-500">
          Review and confirm privacy controls before any analysis runs. These settings are enforced
          server-side and logged to the audit manifest.
        </p>
      </div>

      {piiFields.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-amber-400" />
            <p className="text-xs font-medium text-amber-300">
              {piiFields.length} likely identifier field{piiFields.length > 1 ? "s" : ""} detected
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {piiFields.map((f) => (
              <span key={f.name} className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-400">
                {f.name}
              </span>
            ))}
          </div>
          <p className="mt-2.5 text-[11px] text-slate-500">
            These fields will be HMAC-pseudonymised before any analysis. Raw values are never stored or displayed.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-xs font-medium text-slate-400">Privacy controls</p>
        <ToggleRow
          icon={Shield}
          label="Pseudonymise entity identifiers"
          description="Apply HMAC pseudonymisation to all entity/user identifier fields before analysis."
          value={privacySettings.pseudonymise_entities}
          onChange={(v) => onSettingChange("pseudonymise_entities", v)}
          enforced
        />
        <ToggleRow
          icon={EyeOff}
          label="Redact free-text fields"
          description="Suppress free-text fields that may contain personal information."
          value={privacySettings.redact_free_text}
          onChange={(v) => onSettingChange("redact_free_text", v)}
        />
        <ToggleRow
          icon={Lock}
          label="Suppress timestamp precision"
          description="Round timestamps to day-level to reduce temporal linkage risk."
          value={privacySettings.suppress_timestamps}
          onChange={(v) => onSettingChange("suppress_timestamps", v)}
        />
        <ToggleRow
          icon={Eye}
          label="Disable raw identifier export"
          description="Block any export that would include raw identifier fields. Enabled by default."
          value={privacySettings.raw_export_disabled}
          onChange={(v) => onSettingChange("raw_export_disabled", v)}
          enforced
        />
      </div>

      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
        <label className="grid grid-cols-[auto_1fr] items-start gap-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={privacySettings.privacy_acknowledged}
            onChange={(e) => onSettingChange("privacy_acknowledged", e.target.checked)}
            className="row-span-2 mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-xs font-medium text-slate-300">Privacy acknowledgement</span>
          <span className="mt-1 text-[11px] text-slate-500">
            I confirm that the uploaded dataset complies with applicable data protection regulations,
            that appropriate consents or legal bases are in place, and that I understand the privacy
            controls described above.
          </span>
        </label>
      </div>
    </div>
  );
}
