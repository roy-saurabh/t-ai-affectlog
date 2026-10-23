import React from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { getStepHelp, type StepHelp } from "../../content/wizardHelp";

interface ContextualHelpPanelProps {
  step: number;
}

function HelpSection({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-slate-700/50 last:border-0">
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{title}</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <p className="px-4 pb-3 text-xs text-slate-500 leading-relaxed">{content}</p>
      )}
    </div>
  );
}

export function ContextualHelpPanel({ step }: ContextualHelpPanelProps) {
  const help: StepHelp | undefined = getStepHelp(step);

  if (!help) {
    return (
      <aside className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <HelpCircle size={14} />
          <span className="text-xs font-medium">Contextual Help</span>
        </div>
        <p className="text-xs text-slate-600">No help available for this step.</p>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-slate-300 px-4 pt-4 pb-2">
        <HelpCircle size={14} className="text-indigo-400 flex-shrink-0" />
        <span className="text-xs font-semibold">Help: {help.title}</span>
      </div>
      <p className="px-4 pb-3 text-xs text-slate-400 leading-relaxed border-b border-slate-700/50">
        {help.shortHelp}
      </p>
      <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 overflow-hidden">
        <HelpSection title="Why this matters" content={help.whyItMatters} />
        <HelpSection title="Required inputs" content={help.requiredInputs} />
        <HelpSection title="Privacy implications" content={help.privacyImplications} />
        <HelpSection title="Expected outputs" content={help.expectedOutputs} />
        <HelpSection title="Common mistakes" content={help.commonMistakes} />
        <HelpSection title="Developer extension path" content={help.developerExtensionPath} />
      </div>
    </aside>
  );
}
