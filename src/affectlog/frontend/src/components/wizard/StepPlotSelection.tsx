import React from "react";
import { PLOT_CATALOG, getDefaultPlotsForFormat } from "../../content/plotCatalog";
import { PlotPreviewCard } from "./PlotPreviewCard";

interface StepPlotSelectionProps {
  detectedFormat: string;
  selectedAnalyses: string[];
  selectedPlots: string[];
  onTogglePlot: (plotId: string) => void;
  hasPredictions: boolean;
  hasGroundTruth: boolean;
  hasModel: boolean;
  hasGroupField: boolean;
  hasProbabilityOutput: boolean;
}

export function StepPlotSelection({
  detectedFormat,
  selectedAnalyses,
  selectedPlots,
  onTogglePlot,
  hasPredictions,
  hasGroundTruth,
  hasModel,
  hasGroupField,
  hasProbabilityOutput,
}: StepPlotSelectionProps) {
  const analysisSet = new Set(selectedAnalyses);

  function isAvailable(plot: typeof PLOT_CATALOG[0]): boolean {
    if (plot.compatibleFormats.length > 0 && !plot.compatibleFormats.includes(detectedFormat)) return false;
    if (plot.requiresModel && !hasModel) return false;
    if (plot.requiresPredictions && !hasPredictions) return false;
    if (plot.requiresGroundTruth && !hasGroundTruth) return false;
    if (plot.requiresGroupField && !hasGroupField) return false;
    if (plot.requiresProbabilityOutput && !hasProbabilityOutput) return false;
    if (plot.requiredAnalyses.length > 0 && !plot.requiredAnalyses.some((a) => analysisSet.has(a))) return false;
    return true;
  }

  const available = PLOT_CATALOG.filter(isAvailable);
  const unavailable = PLOT_CATALOG.filter((p) => !isAvailable(p));
  const defaults = new Set(getDefaultPlotsForFormat(detectedFormat));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white">Plot Selection</h2>
        <p className="mt-1 text-xs text-slate-500">
          Choose which visualisations to generate. Only plots valid for the selected analyses are available.
          Defaults have been pre-selected for your dataset type.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          <span className="text-white font-medium">{selectedPlots.length}</span> of {available.length} available plots selected
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              const defaultIds = available.filter((p) => defaults.has(p.id)).map((p) => p.id);
              defaultIds.forEach((id) => { if (!selectedPlots.includes(id)) onTogglePlot(id); });
            }}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Use defaults
          </button>
          <button
            type="button"
            onClick={() => available.forEach((p) => { if (!selectedPlots.includes(p.id)) onTogglePlot(p.id); })}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Select all
          </button>
        </div>
      </div>

      {available.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-emerald-400">Available plots ({available.length})</p>
          <div className="grid grid-cols-2 gap-2">
            {available.map((plot) => (
              <PlotPreviewCard
                key={plot.id}
                plot={plot}
                selected={selectedPlots.includes(plot.id)}
                available={true}
                onToggle={onTogglePlot}
              />
            ))}
          </div>
        </div>
      )}

      {unavailable.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-600">Unavailable ({unavailable.length})</p>
          <div className="grid grid-cols-2 gap-2">
            {unavailable.slice(0, 6).map((plot) => (
              <PlotPreviewCard
                key={plot.id}
                plot={plot}
                selected={false}
                available={false}
                onToggle={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
