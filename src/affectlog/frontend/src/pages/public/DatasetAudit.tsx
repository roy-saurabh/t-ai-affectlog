import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Database, ArrowRight, ShieldCheck, BarChart2, Activity,
  Eye, FileText, Lock, Fingerprint,
} from "lucide-react";
import { PublicHeader } from "../../components/public/PublicHeader";
import { PublicFooter } from "../../components/public/PublicFooter";
import { GridBackground, GlowOrb } from "../../design-system/primitives/GridBackground";
import { CTABand } from "../../design-system/primitives/CTAGroup";

function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >{children}</motion.div>
  );
}

const METRICS = [
  { label: "Gini coefficient",        desc: "Measures distribution inequality across actors or activities.",     color: "#67E8F9" },
  { label: "Coverage@K",              desc: "Share of actors accounting for the top K% of activity volume.",    color: "#93C5FD" },
  { label: "Sparsity",                desc: "Proportion of expected field values that are absent.",             color: "#C4B5FD" },
  { label: "Entropy",                 desc: "Diversity of activity types in the xAPI event stream.",            color: "#86EFAC" },
  { label: "Dominance ratio",         desc: "Ratio of activity volume: top actor vs. median actor.",           color: "#67E8F9" },
  { label: "Temporal density",        desc: "Event frequency distribution over time.",                          color: "#93C5FD" },
  { label: "Representation index",    desc: "Composite score for dataset completeness and diversity.",          color: "#C4B5FD" },
  { label: "Long-tail share",         desc: "Proportion of actors with very low activity counts.",              color: "#FCD34D" },
];

function Hero() {
  return (
    <section
      className="relative min-h-[76vh] flex items-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #070B1A 0%, #0B1224 100%)" }}
    >
      <GridBackground />
      <GlowOrb color="cyan" size={600} x="80%" y="25%" opacity={0.4} />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 lg:px-10 py-20 w-full">
        <div className="max-w-3xl">
          <FadeUp delay={0.04}>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
              style={{ color: "#67E8F9", background: "rgba(103,232,249,0.08)", border: "1px solid rgba(103,232,249,0.22)" }}
            >
              <Database size={11} />
              Dataset Audit
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1
              className="font-bold text-white mb-5 leading-tight tracking-tight"
              style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)", letterSpacing: "-0.03em" }}
            >
              Profile educational datasets before they shape AI behaviour
            </h1>
          </FadeUp>
          <FadeUp delay={0.17}>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Validate schema, detect identifiers, harmonize xAPI events, quantify sparsity and
              concentration, and generate dataset-level audit evidence without exposing raw personal data.
            </p>
          </FadeUp>
          <FadeUp delay={0.23}>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-semibold text-white rounded-xl px-6 py-3.5 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #93C5FD 0%, #67E8F9 60%, #A7F3D0 100%)", boxShadow: "0 6px 20px rgba(103,232,249,0.28)" }}
              >
                Run Dataset Audit <ArrowRight size={17} />
              </Link>
              <Link
                to="/guided-assessment"
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white px-5 py-3.5 text-sm transition-colors"
              >
                Guided Assessment <ArrowRight size={13} />
              </Link>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function AuditWorkflow() {
  const steps = [
    { icon: Database,    title: "Upload or connect",   desc: "CSV, JSON, Parquet, or xAPI stream. No raw data retained.", color: "#67E8F9" },
    { icon: Eye,         title: "Schema validation",   desc: "Field detection, type inference, completeness audit.",       color: "#93C5FD" },
    { icon: Fingerprint, title: "PII scan",            desc: "GDPR field mapping, regex patterns, quasi-identifier flags.", color: "#86EFAC" },
    { icon: Activity,    title: "xAPI normalization",  desc: "Verb canonicalization, actor pseudonymisation.",             color: "#C4B5FD" },
    { icon: BarChart2,   title: "Metrics computation", desc: "Gini, Coverage@K, sparsity, entropy, dominance.",           color: "#67E8F9" },
    { icon: FileText,    title: "Artifact generation", desc: "Data card, SOP, field inventory, JSON-LD graph.",            color: "#86EFAC" },
  ];

  return (
    <section className="py-24 md:py-28" style={{ background: "#070B1A" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">xAPI trace workflow</h2>
            <p className="text-lg text-slate-400">From raw event stream to structured audit evidence.</p>
          </div>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <FadeUp key={s.title} delay={i * 0.05}>
                <div
                  className="flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(203,213,225,0.10)" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{ background: `${s.color}14`, border: `1px solid ${s.color}30`, color: s.color }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={13} style={{ color: s.color }} aria-hidden="true" />
                      <h3 className="font-semibold text-slate-200 text-sm">{s.title}</h3>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MetricsGallery() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#0B1224" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Fairness & quality metrics</h2>
            <p className="text-lg text-slate-400">Eight computed metrics that quantify dataset quality and representation.</p>
          </div>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {METRICS.map((m, i) => (
            <FadeUp key={m.label} delay={i * 0.04}>
              <div
                className="rounded-2xl p-5 border h-full"
                style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(203,213,225,0.10)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                  <h3 className="font-semibold text-slate-200 text-sm">{m.label}</h3>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">{m.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function OutputArtifacts() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#070B1A" }}>
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Output artifacts</h2>
            <p className="text-slate-400">Every dataset audit produces the following structured outputs.</p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Standard Operating Procedure (SOP)", desc: "Audit narrative with findings, risk flags, and recommendations.", color: "#67E8F9" },
              { label: "Dataset Data Card",                   desc: "JSON-LD structured dataset metadata for interoperability.",       color: "#86EFAC" },
              { label: "Field Inventory",                     desc: "Schema, types, sparsity, and PII status for every field.",       color: "#C4B5FD" },
              { label: "Privacy Report",                      desc: "PII findings, pseudonymisation decisions, residual risks.",      color: "#93C5FD" },
              { label: "Metrics Dashboard Payload",           desc: "JSON output for visualization in the assessment console.",       color: "#67E8F9" },
              { label: "JSON-LD Compliance Graph",            desc: "Machine-readable evidence graph for downstream tools.",          color: "#86EFAC" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 p-4 rounded-xl border"
                style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(203,213,225,0.10)" }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: item.color }} />
                <div>
                  <h3 className="font-semibold text-slate-200 text-sm mb-1">{item.label}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 md:py-24" style={{ background: "#0B1224" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <CTABand
          headline="Profile your first educational dataset"
          subline="Upload a dataset in the guided wizard or run the assessment API directly."
          primary={{ label: "Start Dataset Audit",   to: "/login" }}
          secondary={{ label: "Guided Assessment",   to: "/guided-assessment" }}
          tertiary={{ label: "View OpenAPI Spec",    to: "/openapi" }}
        />
      </div>
    </section>
  );
}

export default function DatasetAuditPage() {
  return (
    <div style={{ background: "#070B1A", color: "#F8FAFC", minHeight: "100vh" }}>
      <PublicHeader />
      <main id="main-content">
        <Hero />
        <AuditWorkflow />
        <MetricsGallery />
        <OutputArtifacts />
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
