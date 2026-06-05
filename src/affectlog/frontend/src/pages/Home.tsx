import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FlaskConical, Database, ShieldCheck, Cpu, ArrowRight, TrendingUp,
  Wand2, Activity, BarChart2, CheckCircle2, AlertTriangle, Clock,
  FileText, Package, PlayCircle,
} from "lucide-react";
import { checkHealth, listRuns, type RunEntry } from "../api";
import { MetricCard } from "../design-system/primitives/MetricCard";
import { useAuth } from "../auth/AuthProvider";

// ── Quick action card ─────────────────────────────────────────────────────
function QuickAction({
  icon: Icon,
  title,
  desc,
  to,
  color,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  to: string;
  color: string;
}) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => nav(to)}
      className="text-left p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 group w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
      style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(148,163,184,0.12)" }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = `${color}35`;
        el.style.background = `${color}07`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = "rgba(148,163,184,0.12)";
        el.style.background = "rgba(255,255,255,0.025)";
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${color}18` }}
      >
        <Icon size={18} style={{ color }} aria-hidden="true" />
      </div>
      <div className="font-semibold text-slate-200 mb-1 group-hover:text-white transition-colors text-sm">
        {title}
      </div>
      <div className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
        {desc}
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }}>
        Open <ArrowRight size={11} />
      </div>
    </button>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    completed: { label: "completed", bg: "rgba(16,185,129,0.12)", color: "#34d399" },
    running:   { label: "running",   bg: "rgba(34,211,238,0.12)", color: "#22d3ee" },
    failed:    { label: "failed",    bg: "rgba(239,68,68,0.12)",  color: "#f87171" },
    pending:   { label: "pending",   bg: "rgba(245,158,11,0.12)", color: "#fbbf24" },
  };
  const s = map[status] ?? { label: status, bg: "rgba(148,163,184,0.10)", color: "#94a3b8" };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}
    >
      {s.label}
    </span>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────
export default function AppDashboard() {
  const { user } = useAuth();
  const [health, setHealth] = useState<{ status: string; version?: string } | null>(null);
  const [runs,   setRuns]   = useState<RunEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      checkHealth().catch(() => ({ status: "error" })),
      listRuns().catch(() => ({ runs: [] })),
    ]).then(([h, r]) => {
      setHealth(h as { status: string; version?: string });
      setRuns((r as { runs: RunEntry[] }).runs.slice(0, 8));
      setLoading(false);
    });
  }, []);

  const completedRuns = runs.filter((r) => r.status === "completed").length;
  const failedRuns    = runs.filter((r) => r.status === "failed").length;
  const runningRuns   = runs.filter((r) => r.status === "running").length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-7 pb-10">

      {/* ── Header row ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
            {greeting}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-slate-400 text-sm">
            Trustworthy AI Assessment Console · AffectLog
          </p>
        </div>
        <Link
          to="/app/wizard"
          className="hidden sm:inline-flex items-center gap-2 font-semibold text-white text-sm px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #06b6d4, #0ea5e9)", boxShadow: "0 4px 14px rgba(34,211,238,0.25)" }}
        >
          <Wand2 size={15} /> New Assessment
        </Link>
      </div>

      {/* ── Status cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="API Status"
          value={health?.status === "ok" ? "Online" : health ? "Error" : "—"}
          sub={health?.version ? `v${health.version}` : "connecting"}
          icon={Activity}
          accent={health?.status === "ok" ? "green" : health?.status === "error" ? "red" : "cyan"}
          loading={loading}
        />
        <MetricCard
          label="Audit Runs"
          value={loading ? "—" : String(runs.length)}
          sub={`${completedRuns} completed`}
          icon={FlaskConical}
          accent="cyan"
          loading={loading}
        />
        <MetricCard
          label="Active Jobs"
          value={loading ? "—" : String(runningRuns)}
          sub={runningRuns > 0 ? "in progress" : "idle"}
          icon={PlayCircle}
          accent={runningRuns > 0 ? "amber" : "cyan"}
          loading={loading}
        />
        <MetricCard
          label="Warnings"
          value={loading ? "—" : String(failedRuns)}
          sub={failedRuns > 0 ? "failed runs" : "no failures"}
          icon={AlertTriangle}
          accent={failedRuns > 0 ? "red" : "green"}
          loading={loading}
        />
      </div>

      {/* ── Quick actions ───────────────────────────────────────────── */}
      <div>
        <h2
          className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4"
          id="quick-actions-heading"
        >
          Quick Actions
        </h2>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          aria-labelledby="quick-actions-heading"
        >
          <QuickAction
            icon={Wand2}
            title="Guided Assessment"
            desc="Step-by-step wizard with guardrails and output contract."
            to="/app/wizard"
            color="#22d3ee"
          />
          <QuickAction
            icon={Database}
            title="Dataset Audit"
            desc="Validate schema, scan PII, compute fairness metrics."
            to="/app/datasets"
            color="#38bdf8"
          />
          <QuickAction
            icon={ShieldCheck}
            title="Compliance"
            desc="Export SOPs, JSON-LD graphs, and audit manifests."
            to="/app/compliance"
            color="#10b981"
          />
          <QuickAction
            icon={Cpu}
            title="Model Assessment"
            desc="Register adapters, generate explanations and model cards."
            to="/app/models"
            color="#a78bfa"
          />
        </div>
      </div>

      {/* ── Recent runs ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
            Recent Audit Runs
          </h2>
          <Link
            to="/app/audit"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            Run new audit <ArrowRight size={11} />
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border" style={{ background: "rgba(11,16,32,0.8)", borderColor: "rgba(148,163,184,0.12)" }}>
            <div className="space-y-px p-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          </div>
        ) : runs.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center border border-dashed"
            style={{ borderColor: "rgba(148,163,184,0.15)", background: "rgba(255,255,255,0.015)" }}
          >
            <TrendingUp
              size={28}
              className="mx-auto mb-3"
              style={{ color: "#334155" }}
              aria-hidden="true"
            />
            <p className="text-slate-500 text-sm mb-1">No audit runs yet</p>
            <p className="text-slate-600 text-xs mb-5">
              Upload a dataset and run the guided assessment wizard to get started.
            </p>
            <Link
              to="/app/wizard"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Wand2 size={12} /> Start guided assessment <ArrowRight size={11} />
            </Link>
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden border"
            style={{ borderColor: "rgba(148,163,184,0.12)" }}
          >
            <table className="w-full text-sm" aria-label="Recent audit runs">
              <thead>
                <tr style={{ background: "rgba(11,16,32,0.8)" }}>
                  {["Run ID", "Recipe", "Status", "Artifacts", ""].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {runs.map((r, i) => (
                  <tr
                    key={r.run_id}
                    className="border-t transition-colors hover:bg-white/[0.02]"
                    style={{ borderColor: "rgba(148,163,184,0.07)" }}
                  >
                    <td className="px-4 py-3">
                      <code className="text-cyan-400 text-xs font-mono">{r.run_id.slice(0, 16)}…</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-400 text-xs font-mono">{r.recipe || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-500 text-xs">
                        {Array.isArray(r.artifacts) ? r.artifacts.length : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to="/app/audit"
                        className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
                        aria-label={`View run ${r.run_id}`}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Capability summary ──────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Platform Capabilities
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: Database,    label: "Dataset Audit",    to: "/app/datasets",   color: "#22d3ee" },
            { icon: ShieldCheck, label: "Privacy Scan",     to: "/app/audit",      color: "#10b981" },
            { icon: BarChart2,   label: "Fairness Metrics", to: "/app/audit",      color: "#a78bfa" },
            { icon: Cpu,         label: "Model Adapters",   to: "/app/models",     color: "#38bdf8" },
            { icon: FileText,    label: "Exports",          to: "/app/compliance", color: "#22d3ee" },
            { icon: Package,     label: "Recipes",          to: "/app/wizard",     color: "#fbbf24" },
          ].map((cap) => {
            const Icon = cap.icon;
            return (
              <Link
                key={cap.label}
                to={cap.to}
                className="flex flex-col items-center gap-2.5 p-4 rounded-xl border text-center transition-all duration-200 hover:-translate-y-0.5 group"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(148,163,184,0.10)" }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = `${cap.color}30`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = "rgba(148,163,184,0.10)";
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${cap.color}14` }}
                >
                  <Icon size={14} style={{ color: cap.color }} aria-hidden="true" />
                </div>
                <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors leading-tight">
                  {cap.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
