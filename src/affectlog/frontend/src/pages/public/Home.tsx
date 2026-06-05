import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, ExternalLink, Github,
  Server, Cloud, Database, ShieldCheck, BarChart2,
  Cpu, FileText, Share2, Code2, Lock, Layers,
  Terminal, Package, FlaskConical, Eye, Network,
  ClipboardList, Globe, Fingerprint, Activity,
} from "lucide-react";
import { PublicHeader } from "../../components/public/PublicHeader";
import { PublicFooter } from "../../components/public/PublicFooter";
import { HeroDataSpaceVisual } from "../../design-system/visuals/HeroDataSpaceVisual";
import { EcosystemLifecycleVisual } from "../../design-system/visuals/EcosystemLifecycleVisual";
import { DatasetToModelPipeline } from "../../components/visuals/DatasetToModelPipeline";
import { XapiEventStream } from "../../components/visuals/XapiEventStream";
import { FairnessMetricRadar } from "../../components/visuals/FairnessMetricRadar";
import { AuditArtifactStack } from "../../components/visuals/AuditArtifactStack";
import { CTABand } from "../../design-system/primitives/CTAGroup";
import { GridBackground, GlowOrb } from "../../design-system/primitives/GridBackground";

// ── Framer Motion helpers ──────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── TRUST BAR ITEMS ────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: Server,      label: "Open-source Core",       color: "#67E8F9" },
  { icon: ShieldCheck, label: "Privacy-by-default",      color: "#86EFAC" },
  { icon: Code2,       label: "OpenAPI-first",           color: "#93C5FD" },
  { icon: Activity,    label: "xAPI-ready",              color: "#C4B5FD" },
  { icon: FileText,    label: "JSON-LD Outputs",         color: "#5EEAD4" },
  { icon: Cloud,       label: "Managed by AffectLog",    color: "#D8B4FE" },
  { icon: Globe,       label: "Prometheus-X BB04",       color: "#FCD34D" },
];

// ── HERO ───────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className="relative min-h-[92vh] flex items-center overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 20% 18%, rgba(103,232,249,0.24), transparent 28%), radial-gradient(circle at 80% 10%, rgba(196,181,253,0.20), transparent 28%), radial-gradient(circle at 52% 80%, rgba(134,239,172,0.12), transparent 32%), linear-gradient(160deg, #030712 0%, #070B1A 45%, #0B1224 100%)",
      }}
    >
      <GridBackground />
      <GlowOrb color="cyan" size={680} x="14%" y="40%" opacity={0.55} />
      <GlowOrb color="violet" size={520} x="84%" y="18%" opacity={0.50} />
      <GlowOrb color="green" size={420} x="52%" y="85%" opacity={0.35} />

      <div className="relative max-w-[1400px] mx-auto px-5 md:px-8 lg:px-10 py-20 md:py-28 w-full">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── Left copy ───────────────────────────────────── */}
          <div>
            <FadeUp delay={0.04}>
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
                style={{
                  color: "#67E8F9",
                  background: "rgba(103,232,249,0.09)",
                  border: "1px solid rgba(103,232,249,0.24)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#67E8F9" }} aria-hidden="true" />
                Open-source core · AffectLog-managed option · Data-space ready
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h1
                className="font-bold text-[#F8FAFC] mb-6 leading-[1.07]"
                style={{ fontSize: "clamp(2.6rem, 5vw, 4.25rem)", letterSpacing: "-0.035em" }}
              >
                Trustworthy AI assessment{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #93C5FD 0%, #67E8F9 45%, #C4B5FD 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  for education and skills data spaces
                </span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.17}>
              <p className="text-lg md:text-xl mb-8 leading-relaxed max-w-[560px]" style={{ color: "#AEBBD0" }}>
                Inspect datasets, evaluate model behaviour, detect privacy and representation
                risks, and generate audit-ready evidence through open, privacy-preserving workflows.
              </p>
            </FadeUp>

            <FadeUp delay={0.23}>
              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  to="/request-access"
                  className="inline-flex items-center gap-2 font-semibold rounded-[14px] px-6 py-3.5 text-base transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #93C5FD 0%, #67E8F9 60%, #A7F3D0 100%)",
                    boxShadow: "0 5px 22px rgba(147,197,253,0.32), 0 2px 8px rgba(147,197,253,0.20)",
                    color: "#08111F",
                  }}
                >
                  Request Managed Access <ArrowRight size={17} />
                </Link>
                <Link
                  to="/community"
                  className="inline-flex items-center gap-2 font-semibold rounded-[14px] px-6 py-3.5 text-base border transition-all duration-200 hover:bg-white/[0.05]"
                  style={{
                    borderColor: "rgba(203,213,225,0.22)",
                    background: "rgba(15,23,42,0.56)",
                    color: "#D8E0EE",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <Server size={16} style={{ color: "#8391A8" }} />
                  Deploy Community Edition
                </Link>
                <Link
                  to="/product"
                  className="inline-flex items-center gap-1.5 px-3 py-3.5 text-sm transition-colors"
                  style={{ color: "#8391A8" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#67E8F9")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#8391A8")}
                >
                  Explore the Platform <ArrowRight size={13} />
                </Link>
              </div>
            </FadeUp>

            {/* Trust badges */}
            <FadeUp delay={0.3}>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Platform properties">
                {TRUST_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border"
                      style={{
                        color: "#8391A8",
                        borderColor: "rgba(203,213,225,0.14)",
                        background: "rgba(15,23,42,0.40)",
                      }}
                      role="listitem"
                    >
                      <Icon size={11} style={{ color: item.color }} aria-hidden="true" />
                      {item.label}
                    </span>
                  );
                })}
              </div>
            </FadeUp>
          </div>

          {/* ── Right visual ────────────────────────────────── */}
          <FadeUp delay={0.28} className="hidden lg:block">
            <div
              className="rounded-2xl p-5 border"
              style={{
                background: "rgba(11,16,32,0.7)",
                borderColor: "rgba(203,213,225,0.13)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#475569" }}
                >
                  Assessment Pipeline
                </span>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(103,232,249,0.10)",
                    color: "#67E8F9",
                    border: "1px solid rgba(103,232,249,0.22)",
                  }}
                >
                  live demo
                </span>
              </div>
              <HeroDataSpaceVisual />
              <div
                className="mt-4 pt-4 grid grid-cols-3 gap-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                {[
                  { v: "1M+",     l: "rows processed" },
                  { v: "GDPR",    l: "PII scan" },
                  { v: "JSON-LD", l: "artifacts" },
                ].map((m) => (
                  <div key={m.l} className="text-center">
                    <div className="text-sm font-bold font-mono text-pastel-cyan">{m.v}</div>
                    <div className="text-xs text-slate-600">{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ── TRUST BAR ──────────────────────────────────────────────────────────────
function TrustBar() {
  return (
    <section
      className="py-6 border-y overflow-hidden"
      style={{
        background: "#0B1224",
        borderColor: "rgba(203,213,225,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TRUST_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.label}>
                <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <Icon size={13} style={{ color: item.color }} aria-hidden="true" />
                  {item.label}
                </span>
                {i < TRUST_ITEMS.length - 1 && (
                  <span
                    className="hidden sm:block w-px h-4"
                    style={{ background: "rgba(203,213,225,0.15)" }}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── PROBLEM STATEMENT ──────────────────────────────────────────────────────
function ProblemSection() {
  const points = [
    { icon: Database,     title: "Dataset quality is invisible without structured profiling", color: "#67E8F9" },
    { icon: Fingerprint,  title: "Privacy risks survive when identifiers are undetected",    color: "#86EFAC" },
    { icon: Network,      title: "Representation gaps compound when bias is unmeasured",     color: "#C4B5FD" },
    { icon: FileText,     title: "Audit evidence must be machine-readable for real utility", color: "#93C5FD" },
    { icon: Share2,       title: "Interoperability fails without structured metadata",        color: "#A7F3D0" },
  ];

  return (
    <section
      className="py-24 md:py-28 lg:py-32"
      style={{ background: "#070B1A" }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <FadeUp>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
              style={{
                color: "#C4B5FD",
                background: "rgba(196,181,253,0.10)",
                border: "1px solid rgba(196,181,253,0.24)",
              }}
            >
              The assessment gap
            </div>
            <h2
              className="font-bold text-white mb-5 leading-tight tracking-tight"
              style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", letterSpacing: "-0.025em" }}
            >
              AI assessment cannot stop at model accuracy
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              Production AI systems in education depend on datasets that were never designed
              for algorithmic use. Without structured profiling, privacy scanning, representation
              measurement, and machine-readable audit evidence, responsible deployment is impossible
              to verify and difficult to defend.
            </p>
          </FadeUp>

          <div className="space-y-3">
            {points.map((pt, i) => {
              const Icon = pt.icon;
              return (
                <FadeUp key={pt.title} delay={i * 0.06}>
                  <div
                    className="flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 hover:border-opacity-40"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      borderColor: "rgba(203,213,225,0.10)",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${pt.color}15` }}
                    >
                      <Icon size={16} style={{ color: pt.color }} aria-hidden="true" />
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{pt.title}</p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CAPABILITY GRID ────────────────────────────────────────────────────────
const CAPS = [
  { icon: Database,     title: "Dataset Structure",       desc: "Ingest CSV, JSON, Parquet. Validate schema. Detect field types and completeness.",     color: "#67E8F9" },
  { icon: ShieldCheck,  title: "PII & Quasi-Identifiers", desc: "GDPR-aware scanning. Regex and NLP-based detection. Automatic pseudonymisation.",     color: "#86EFAC" },
  { icon: BarChart2,    title: "Fairness Metrics",        desc: "Gini coefficient, Coverage@K, dominance ratio, representation index, entropy.",        color: "#C4B5FD" },
  { icon: FlaskConical, title: "xAPI Event Semantics",    desc: "Verb canonicalization, activity type mapping, Becomino template inference.",           color: "#5EEAD4" },
  { icon: Eye,          title: "Sparsity & Missingness",  desc: "Field-level sparsity heatmap. Temporal density and event gap analysis.",               color: "#93C5FD" },
  { icon: Cpu,          title: "Model Explainability",    desc: "Feature importance, prediction explanations, model card generation, comparison.",       color: "#D8B4FE" },
  { icon: Lock,         title: "Privacy-by-default",      desc: "No raw dataset stored. Metadata-only outputs. Pseudonymised field inventory.",         color: "#86EFAC" },
  { icon: FileText,     title: "Audit Artifacts",         desc: "SOP report, Data Card, JSON-LD compliance graph, dashboard export payload.",           color: "#67E8F9" },
  { icon: Share2,       title: "Connector-ready",         desc: "OpenAPI-first service. PDC and Prometheus-X data-space protocol interoperability.",     color: "#93C5FD" },
  { icon: Layers,       title: "Assessment Recipes",      desc: "YAML-defined reusable pipeline specs. Inokufu, Maskott, generic templates.",           color: "#C4B5FD" },
  { icon: Network,      title: "Concentration Analysis",  desc: "Long-tail activity patterns. Temporal concentration. Dominance curves.",               color: "#5EEAD4" },
  { icon: ClipboardList,title: "Compliance Metadata",     desc: "AI Act Annex IV fields, GDPR Article 30, JSON-LD structured evidence graph.",         color: "#A7F3D0" },
];

function CapabilityGrid() {
  return (
    <section
      className="py-24 md:py-28 lg:py-32"
      style={{ background: "#0B1224" }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <h2
              className="font-bold text-white mb-5 tracking-tight"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", letterSpacing: "-0.025em" }}
            >
              What AffectLog assesses
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              A complete assessment pipeline — from raw trace ingestion to audit-ready compliance evidence.
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CAPS.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <FadeUp key={cap.title} delay={i * 0.03}>
                <div
                  className="rounded-xl p-5 h-full transition-all duration-200 border cursor-default group"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    borderColor: "rgba(203,213,225,0.10)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = `${cap.color}35`;
                    el.style.background  = `${cap.color}07`;
                    el.style.transform   = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = "rgba(203,213,225,0.10)";
                    el.style.background  = "rgba(255,255,255,0.025)";
                    el.style.transform   = "translateY(0)";
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${cap.color}14` }}
                  >
                    <Icon size={15} style={{ color: cap.color }} aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-slate-200 text-sm mb-1.5">{cap.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{cap.desc}</p>
                </div>
              </FadeUp>
            );
          })}
        </div>

        <FadeUp delay={0.2}>
          <div className="text-center mt-10">
            <Link
              to="/product"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-pastel-cyan transition-colors"
            >
              View full platform capabilities <ArrowRight size={13} />
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── WORKFLOW ───────────────────────────────────────────────────────────────
const WORKFLOW_STEPS = [
  { step: "Upload or connect dataset",   detail: "CSV, JSON, Parquet via API or file upload. No raw data retained beyond the session." },
  { step: "Validate schema",             detail: "Field detection, type inference, mandatory-field audit. Becomino template matching." },
  { step: "Scan identifiers",            detail: "GDPR field mapping, regex PII patterns, quasi-identifier flagging." },
  { step: "Normalize to xAPI",           detail: "Verb canonicalization, activity type mapping, actor pseudonymisation." },
  { step: "Profile quality",             detail: "Sparsity, missingness, temporal density, long-tail and concentration analysis." },
  { step: "Compute metrics",             detail: "Gini, Coverage@K, dominance ratio, entropy, representation index." },
  { step: "Attach model (optional)",     detail: "Connect via model adapter. Feature importance, SHAP values, model comparison." },
  { step: "Generate audit artifacts",    detail: "SOP report, Data Card, Model Card, field inventory, JSON-LD graph." },
  { step: "Export metadata only",        detail: "Privacy-preserving dashboard payload. No raw records in any export." },
];

const STEP_COLORS = ["#67E8F9","#93C5FD","#86EFAC","#C4B5FD","#5EEAD4","#93C5FD","#D8B4FE","#86EFAC","#67E8F9"];

function WorkflowSection() {
  return (
    <section
      className="py-24 md:py-28 lg:py-32"
      style={{ background: "#070B1A" }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <FadeUp>
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
                style={{
                  color: "#67E8F9",
                  background: "rgba(103,232,249,0.08)",
                  border: "1px solid rgba(103,232,249,0.20)",
                }}
              >
                Assessment workflow
              </div>
              <h2
                className="font-bold text-white mb-4 tracking-tight"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", letterSpacing: "-0.025em" }}
              >
                From raw trace to audit evidence
              </h2>
              <p className="text-slate-400 mb-10 leading-relaxed">
                A repeatable, privacy-preserving pipeline from raw data to shareable structured evidence.
              </p>
            </FadeUp>

            <div className="space-y-0">
              {WORKFLOW_STEPS.map((s, i) => (
                <FadeUp key={i} delay={i * 0.04}>
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: `${STEP_COLORS[i]}14`,
                          border: `1px solid ${STEP_COLORS[i]}40`,
                          color: STEP_COLORS[i],
                        }}
                      >
                        {i + 1}
                      </div>
                      {i < WORKFLOW_STEPS.length - 1 && (
                        <div
                          className="w-px flex-1 my-1"
                          style={{ background: `${STEP_COLORS[i]}20`, minHeight: "20px" }}
                        />
                      )}
                    </div>
                    <div className="pt-0.5 pb-4">
                      <p className="font-medium text-slate-200 text-sm">{s.step}</p>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{s.detail}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          {/* xAPI stream visual */}
          <FadeUp delay={0.2} className="lg:sticky lg:top-20">
            <div
              className="rounded-2xl p-6 border"
              style={{
                background: "rgba(11,16,32,0.7)",
                borderColor: "rgba(203,213,225,0.12)",
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  xAPI Event Stream
                </span>
              </div>
              <XapiEventStream />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ── EDITION SPLIT ──────────────────────────────────────────────────────────
function EditionSplit() {
  return (
    <section
      className="py-24 md:py-28 lg:py-32"
      style={{ background: "#0B1224" }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2
              className="font-bold text-white mb-4 tracking-tight"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", letterSpacing: "-0.025em" }}
            >
              One platform, two ways to run
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              The managed edition is built on the same open-source core, with AffectLog-operated
              infrastructure, support, and optional enterprise services.
            </p>
          </div>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Community */}
          <FadeUp delay={0.08}>
            <div
              className="rounded-2xl p-8 h-full flex flex-col border transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "rgba(103,232,249,0.04)",
                borderColor: "rgba(103,232,249,0.22)",
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(103,232,249,0.10)" }}
                >
                  <Server size={18} className="text-pastel-cyan" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">Community Edition</h3>
                  <span className="text-xs text-pastel-cyan font-medium">Open Source · MIT License</span>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-8">
                {[
                  "Self-hosted, local or on-premise",
                  "Full dataset audit workflows",
                  "Docker Compose deployment",
                  "PostgreSQL + Redis + local storage",
                  "Developer recipes & model adapters",
                  "OpenAPI-first backend",
                  "RBAC + admin-approved registration",
                  "Synthetic sample datasets included",
                  "No AffectLog Cloud dependency",
                  "Community support via GitHub",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 size={14} className="text-pastel-cyan mt-0.5 flex-shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/community"
                className="inline-flex items-center justify-center gap-2 font-semibold text-white rounded-xl px-6 py-3 border transition-all hover:text-pastel-cyan/[0.08]"
                style={{ borderColor: "rgba(103,232,249,0.35)" }}
              >
                Deploy Community Edition <ArrowRight size={15} />
              </Link>
            </div>
          </FadeUp>

          {/* Managed */}
          <FadeUp delay={0.16}>
            <div
              className="rounded-2xl p-8 h-full flex flex-col border relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "rgba(196,181,253,0.05)",
                borderColor: "rgba(196,181,253,0.28)",
              }}
            >
              <GlowOrb color="violet" size={300} x="110%" y="-20%" opacity={0.4} />
              <div className="relative flex items-center gap-3 mb-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(196,181,253,0.12)" }}
                >
                  <Cloud size={18} className="text-pastel-violet" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">Managed Edition</h3>
                  <span className="text-xs text-pastel-violet font-medium">Hosted &amp; operated by AffectLog</span>
                </div>
              </div>
              <ul className="relative space-y-2.5 flex-1 mb-8">
                {[
                  "Hosted and operated by AffectLog",
                  "Multi-tenant workspace provisioning",
                  "Admin-approved organization onboarding",
                  "Managed backups and monitoring",
                  "Platform-level RBAC and audit logs",
                  "Managed email and notifications",
                  "Usage metering and quotas",
                  "Support and upgrade path",
                  "Optional private tenant deployment",
                  "Optional bring-your-own-cloud",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 size={14} className="text-pastel-violet mt-0.5 flex-shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/request-access"
                className="relative inline-flex items-center justify-center gap-2 font-semibold text-white rounded-xl px-6 py-3 transition-all hover:-translate-y-px"
                style={{
                  background: "linear-gradient(135deg, #C4B5FD 0%, #D8B4FE 100%)",
                  boxShadow: "0 4px 20px rgba(196,181,253,0.30)",
                  color: "#08111F",
                }}
              >
                Request Managed Access <ArrowRight size={15} />
              </Link>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ── ECOSYSTEM ──────────────────────────────────────────────────────────────
const ECOSYSTEM_TOOLS = [
  {
    name: "Prometheus-X BB04",
    affil: "Data-space building block",
    role: "Trustworthy AI assessment specification",
    phase: "Data-space layer",
    color: "#93C5FD",
    desc: "Prometheus-X BB04 defines the interoperability specification for trustworthy AI assessment within European data spaces. AffectLog is the reference implementation.",
  },
  {
    name: "EDGE-Skills",
    affil: "EU Digital Europe programme",
    role: "EU grant funding AffectLog (grant 101123471)",
    phase: "EU programme",
    color: "#C4B5FD",
    desc: "The EDGE-Skills project funds AffectLog's development under the Digital Europe Programme, targeting trustworthy AI for education and skills data spaces.",
  },
  {
    name: "AffectLog",
    affil: "This platform",
    role: "Operation-time dataset & model assessment",
    phase: "Operation-time",
    color: "#67E8F9",
    highlight: true,
    desc: "Dataset profiling, model explainability, fairness metrics, privacy scanning, and audit-ready evidence generation at operation time.",
  },
];

function EcosystemSection() {
  return (
    <section
      className="py-24 md:py-28 lg:py-32"
      style={{ background: "#070B1A" }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2
              className="font-bold text-white mb-4 tracking-tight"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", letterSpacing: "-0.025em" }}
            >
              Prometheus-X Trustworthy AI Ecosystem
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              AffectLog is the reference implementation of Prometheus-X BB04, developed under the EU EDGE-Skills programme.
            </p>
          </div>
        </FadeUp>

        {/* Lifecycle visual */}
        <FadeUp delay={0.1}>
          <div
            className="rounded-2xl p-6 border mb-10"
            style={{
              background: "rgba(11,16,32,0.7)",
              borderColor: "rgba(203,213,225,0.12)",
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                AI System Lifecycle
              </span>
            </div>
            <EcosystemLifecycleVisual />
          </div>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-5">
          {ECOSYSTEM_TOOLS.map((tool, i) => (
            <FadeUp key={tool.name} delay={i * 0.08}>
              <div
                className="rounded-2xl p-6 h-full border transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: tool.highlight ? `${tool.color}07` : "rgba(255,255,255,0.025)",
                  borderColor: tool.highlight ? `${tool.color}32` : "rgba(203,213,225,0.10)",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{tool.name}</h3>
                    <p className="text-xs text-slate-500">{tool.affil}</p>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ml-2"
                    style={{
                      color: tool.color,
                      borderColor: `${tool.color}40`,
                      background: `${tool.color}10`,
                    }}
                  >
                    {tool.highlight ? "this platform" : tool.phase}
                  </span>
                </div>
                <p className="text-xs font-semibold mb-2.5" style={{ color: tool.color }}>
                  {tool.role}
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">{tool.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.3}>
          <div className="text-center mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/ecosystem"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-pastel-cyan transition-colors"
            >
              Ecosystem overview <ArrowRight size={13} />
            </Link>
            <a
              href="https://prometheus-x-association.github.io/docs/t-ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              BB04 Technical Docs <ExternalLink size={12} />
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── DEVELOPER SECTION ─────────────────────────────────────────────────────
const DEV_CONTRIB = [
  { icon: Package,      label: "Add a dataset recipe",   desc: "YAML-defined assessment pipeline for a new dataset format." },
  { icon: Cpu,          label: "Add a model adapter",    desc: "Plug in a new ML framework or model API." },
  { icon: BarChart2,    label: "Contribute a metric",    desc: "Implement a fairness, quality, or explainability metric." },
  { icon: Share2,       label: "Add a connector bridge", desc: "Integrate with a PDC or Prometheus-X data-space endpoint." },
  { icon: Eye,          label: "Improve visualizations", desc: "Add chart types or improve existing metric displays." },
  { icon: FileText,     label: "Add synthetic fixtures", desc: "Provide test datasets for CI and community onboarding." },
  { icon: ShieldCheck,  label: "Review security",        desc: "Audit code paths, dependencies, or policy enforcement." },
  { icon: Code2,        label: "Validate OpenAPI",       desc: "Verify endpoint contracts and schema correctness." },
];

function DeveloperSection() {
  return (
    <section
      className="py-24 md:py-28 lg:py-32"
      style={{ background: "#0B1224" }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2
              className="font-bold text-white mb-4 tracking-tight"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", letterSpacing: "-0.025em" }}
            >
              Build reusable assessment infrastructure
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              Every recipe, adapter, metric, and connector makes the platform stronger for
              universities, auditors, and AI providers across the ecosystem.
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {DEV_CONTRIB.map((c, i) => {
            const Icon = c.icon;
            return (
              <FadeUp key={c.label} delay={i * 0.035}>
                <a
                  href="https://github.com/Prometheus-X-association/t-ai-affectlog/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl p-4 border transition-all duration-200 group hover:-translate-y-0.5"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    borderColor: "rgba(203,213,225,0.10)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = "rgba(103,232,249,0.25)";
                    el.style.background  = "rgba(103,232,249,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = "rgba(203,213,225,0.10)";
                    el.style.background  = "rgba(255,255,255,0.025)";
                  }}
                >
                  <Icon size={16} className="text-slate-500 group-hover:text-pastel-cyan mb-2.5 transition-colors" aria-hidden="true" />
                  <p className="text-sm font-medium text-slate-300 mb-1 leading-tight">{c.label}</p>
                  <p className="text-xs text-slate-600">{c.desc}</p>
                </a>
              </FadeUp>
            );
          })}
        </div>

        <FadeUp delay={0.25}>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/Prometheus-X-association/t-ai-affectlog"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-white px-6 py-3 rounded-xl border transition-all hover:bg-white/[0.06]"
              style={{ borderColor: "rgba(203,213,225,0.18)", background: "rgba(255,255,255,0.04)" }}
            >
              <Github size={15} /> View on GitHub
            </a>
            <Link
              to="/developers"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white px-6 py-3 rounded-xl hover:bg-white/[0.04] transition-all"
            >
              Developer Hub <ArrowRight size={14} />
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── FINAL CTA ──────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section
      className="py-20 md:py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "#070B1A" }}
    >
      <GlowOrb color="cyan" size={600} x="50%" y="80%" opacity={0.4} />
      <div className="relative max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <CTABand
          headline="Run your first trustworthy AI assessment"
          subline="Self-host the open-source core or request an AffectLog-managed environment for hosted operations, onboarding, monitoring, and support."
          primary={{ label: "Request Managed Access", to: "/request-access" }}
          secondary={{ label: "Start self-hosted",    to: "/community" }}
          tertiary={{ label: "Read Docs",              to: "/docs" }}
        />
      </div>
    </section>
  );
}

// ── PAGE ASSEMBLY ──────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div style={{ background: "#070B1A", color: "#F8FAFC", minHeight: "100vh" }}>
      <PublicHeader />
      <main id="main-content">
        <Hero />
        <TrustBar />
        <ProblemSection />
        <CapabilityGrid />
        <WorkflowSection />
        <EditionSplit />
        <EcosystemSection />
        <DeveloperSection />
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
