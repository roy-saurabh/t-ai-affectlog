import React, { useEffect, useState } from "react";
import { Database, CheckCircle2, XCircle, FileText, RefreshCw, HardDrive } from "lucide-react";
import { listDatasets, validateDataset, DataFile } from "../api";

function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function Datasets() {
  const [files, setFiles] = useState<DataFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");
  const [schema, setSchema] = useState("maskott_csv_v1");
  const [result, setResult] = useState<{
    valid: boolean; missing_columns: string[]; extra_columns: string[]; error?: string;
  } | null>(null);
  const [validating, setValidating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const d = await listDatasets();
      setFiles(d.files);
    } catch {
      setFiles([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleValidate(path: string) {
    setSelected(path);
    setResult(null);
    setValidating(true);
    try {
      const r = await validateDataset(path, schema);
      setResult(r);
    } catch (e) {
      setResult({ valid: false, missing_columns: [], extra_columns: [], error: String(e) });
    }
    setValidating(false);
  }

  const csvFiles = files.filter((f) => f.format === "csv");
  const jsonlFiles = files.filter((f) => f.format !== "csv");

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Datasets</h1>
          <p className="text-slate-400 text-sm">Validate and ingest CSV or xAPI JSONL files for the audit pipeline.</p>
        </div>
        <button onClick={load} className="btn-ghost" disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Schema selector */}
      <div className="card flex items-center gap-4 flex-wrap">
        <div>
          <label htmlFor="dataset-schema" className="stat-label block mb-1">Validation Schema</label>
          <select id="dataset-schema" className="select" value={schema} onChange={(e) => setSchema(e.target.value)}>
            <option value="maskott_csv_v1">maskott_csv_v1 — Maskott/Tactileo teacher activity</option>
          </select>
        </div>
        <div className="text-xs text-slate-600 max-w-sm">
          Schema defines required columns. Validate before running the audit pipeline.
        </div>
      </div>

      {/* CSV files */}
      <div>
        <h2 className="section-title flex items-center gap-2">
          <FileText size={16} className="text-sky-400" /> CSV Files
          <span className="text-xs text-slate-600 font-normal">({csvFiles.length})</span>
        </h2>
        {loading && (
          <div className="card py-10 text-center text-slate-500 text-sm">Loading files…</div>
        )}
        {!loading && csvFiles.length === 0 && (
          <div className="card border-dashed border-slate-600 py-10 text-center">
            <Database size={28} className="mx-auto text-slate-600 mb-2" />
            <p className="text-slate-500 text-sm">No CSV files found.</p>
            <p className="text-slate-600 text-xs mt-1">
              Place files in <code className="text-slate-500">data/samples/</code> or <code className="text-slate-500">data/raw/</code>
            </p>
          </div>
        )}
        {!loading && csvFiles.length > 0 && (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">File</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Location</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Size</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {csvFiles.map((f) => (
                  <tr
                    key={f.path}
                    className={`hover:bg-slate-700/20 transition-colors ${selected === f.path ? "bg-indigo-900/10" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{f.name}</div>
                      <div className="text-xs text-slate-600 font-mono mt-0.5 truncate max-w-xs">{f.path}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={f.location === "raw" ? "badge-warn" : "badge-info"}>
                        {f.location}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      <div className="flex items-center gap-1">
                        <HardDrive size={12} /> {fmt(f.size_bytes)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleValidate(f.path)}
                        disabled={validating}
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        {validating && selected === f.path ? "Validating…" : "Validate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSONL/JSON files */}
      {jsonlFiles.length > 0 && (
        <div>
          <h2 className="section-title flex items-center gap-2">
            <FileText size={16} className="text-violet-400" /> xAPI / JSON Files
            <span className="text-xs text-slate-600 font-normal">({jsonlFiles.length})</span>
          </h2>
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">File</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Format</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wider">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {jsonlFiles.map((f) => (
                  <tr key={f.path} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{f.name}</div>
                      <div className="text-xs text-slate-600 font-mono mt-0.5 truncate max-w-xs">{f.path}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge-info">{f.format}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{fmt(f.size_bytes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual path input */}
      <div className="card">
        <h3 className="font-semibold text-slate-200 mb-3">Validate Custom Path</h3>
        <div className="flex gap-3 flex-wrap">
          <input
            className="input flex-1 min-w-48"
            placeholder="data/raw/maskott/EdgeSkills-MaskottRecom-Visualisations.csv"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          />
          <button
            onClick={() => handleValidate(selected)}
            disabled={validating || !selected}
            className="btn-primary"
          >
            {validating ? "Validating…" : "Validate"}
          </button>
        </div>
      </div>

      {/* Validation result */}
      {result && (
        <div className={`card border ${result.valid ? "border-emerald-700/50" : "border-red-700/50"}`}>
          <div className="flex items-center gap-3 mb-3">
            {result.valid
              ? <CheckCircle2 size={20} className="text-emerald-400" />
              : <XCircle size={20} className="text-red-400" />}
            <div>
              <div className={`font-semibold ${result.valid ? "text-emerald-400" : "text-red-400"}`}>
                {result.valid ? "Schema valid" : "Schema invalid"}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">{selected}</div>
            </div>
          </div>
          {result.error && (
            <div className="text-sm text-red-400 bg-red-900/20 rounded-lg p-3 font-mono text-xs">{result.error}</div>
          )}
          {result.missing_columns.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-slate-500 mb-1">Missing columns:</p>
              <div className="flex flex-wrap gap-1">
                {result.missing_columns.map((c) => (
                  <span key={c} className="badge-err">{c}</span>
                ))}
              </div>
            </div>
          )}
          {result.extra_columns.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-slate-500 mb-1">Extra columns (OK):</p>
              <div className="flex flex-wrap gap-1">
                {result.extra_columns.map((c) => (
                  <span key={c} className="badge-warn">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
