import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Database, ShieldCheck, BarChart2, Cpu,
  FileText, Code2, Layers, Activity, Eye, Share2, Lock,
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

const LAYERS = [
  { icon: Database,   label: "Data Layer",          desc: "CSV, JSON, Parquet, xAPI event traces. Schema validation and format detection.", color: "#67E8F9" },
  { icon: ShieldCheck,label: "Privacy Layer",        desc: "GDPR PII scanning, quasi-identifier detection, actor pseudonymisation.",         color: "#86EFAC" },
  { icon: Activity,   label: "Profiling Layer",      desc: "Completeness, sparsity, temporal density, format and range validation.",         color: "#C4B5FD" },
  { icon: BarChart2,  label: "Metrics Layer",        desc: "Gini, Coverage@K, dominance ratio, entropy, representation index.",              color: "#93C5FD" },
  { icon: Eye,        label: "Explainability Layer", desc: "Feature importance, local/global explanations, model card generation.",          color: "#C4B5FD" },
  { icon: FileText,   label: "Compliance Layer",     desc: "AI Act Annex IV, GDPR Article 30, structured evidence records.",                 color: "#67E8F9" },
  { icon: Share2,     label: "Export Layer",         desc: "SOPs, data cards, model cards, JSON-LD graphs, dashboard payloads.",             color: "#86EFAC" },
];

function Hero() {
  return (
    <section
      className="relative min-h-[76vh] flex items-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #070B1A 0%, #0B1224 100%)" }}
    >
      <GridBackground />
      <GlowOrb color="cyan" size={600} x="75%" y="30%" opacity={0.45} />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 lg:px-10 py-20 w-full">
        <div className="max-w-3xl">
          <FadeUp delay={0.04}>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
              style={{ color: "#67E8F9", background: "rgba(103,232,249,0.08)", border: "1px solid rgba(103,232,249,0.22)" }}
            >
              Platform Overview
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1
              className="font-bold text-white mb-5 leading-tight tracking-tight"
              style={{ fontSize: "clamp(2.6rem, 5vw, 4rem)", letterSpacing: "-0.03em" }}
            >
              From raw educational traces to structured audit evidence
            </h1>
          </FadeUp>
          <FadeUp delay={0.17}>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              AffectLog turns heterogeneous xAPI-style logs, tabular datasets, model artifacts,
              and assessment recipes into interpretable metrics, privacy reports, dashboards,
              SOPs, and machine-readable compliance graphs.
            </p>
          </FadeUp>
          <FadeUp delay={0.23}>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/guided-assessment"
                className="inline-flex items-center gap-2 font-semibold text-white rounded-xl px-6 py-3.5 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #93C5FD 0%, #67E8F9 60%, #A7F3D0 100%)", boxShadow: "0 6px 20px rgba(103,232,249,0.28)" }}
              >
                Launch Guided Assessment <ArrowRight size={17} />
              </Link>
              <Link
                to="/dataset-audit"
                className="inline-flex items-center gap-2 font-semibold text-slate-200 rounded-xl px-6 py-3.5 border transition-all hover:bg-white/[0.06]"
                style={{ borderColor: "rgba(203,213,225,0.22)", background: "rgba(255,255,255,0.04)" }}
              >
                Dataset Audit <ArrowRight size={15} />
              </Link>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function AssessmentStack() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#070B1A" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Seven-layer assessment stack
            </h2>
            <p className="text-lg text-slate-400">
              Each layer processes, transforms, or enriches the dataset on its way to structured evidence.
            </p>
          </div>
        </FadeUp>

        <div className="max-w-3xl mx-auto space-y-3">
          {LAYERS.map((layer, i) => {
            const Icon = layer.icon;
            return (
              <FadeUp key={layer.label} delay={i * 0.05}>
                <div
                  className="flex items-start gap-5 p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-px"
                  style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(203,213,225,0.10)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${layer.color}14` }}
                  >
                    <Icon size={16} style={{ color: layer.color }} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-200">{layer.label}</h3>
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded"
                        style={{ background: `${layer.color}12`, color: layer.color }}
                      >
                        Layer {i + 1}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">{layer.desc}</p>
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

function SupportedFormats() {
  const formats = {
    input: ["CSV (any schema)", "JSON arrays", "Apache Parquet", "xAPI statement streams", "Becomino template traces"],
    adapters: ["scikit-learn estimators", "Hugging Face models", "SHAP-compatible models", "Custom API endpoints"],
    outputs: ["SOPs (Markdown + PDF)", "Data Cards (JSON-LD)", "Model Cards (JSON-LD)", "Compliance Graphs", "Dashboard payload (JSON)", "Field inventory (CSV)"],
  };

  return (
    <section className="py-24 md:py-28" style={{ background: "#0B1224" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Supported formats and outputs
            </h2>
          </div>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Input Formats",    items: formats.input,    color: "#67E8F9" },
            { title: "Model Adapters",   items: formats.adapters, color: "#C4B5FD" },
            { title: "Output Artifacts", items: formats.outputs,  color: "#86EFAC" },
          ].map((col, i) => (
            <FadeUp key={col.title} delay={i * 0.08}>
              <div
                className="rounded-2xl p-6 border h-full"
                style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(203,213,225,0.10)" }}
              >
                <h3 className="font-bold text-white mb-4" style={{ color: col.color }}>{col.title}</h3>
                <ul className="space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: col.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function Guardrails() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#070B1A" }}>
      <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
        <FadeUp>
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
            style={{ color: "#FCD34D", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.20)" }}
          >
            <Lock size={11} />
            Guardrails and limitations
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">
            What outputs do not claim
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            AffectLog is designed for transparent, privacy-preserving assessment. The platform
            generates structured evidence — not endorsements, certifications, or legal opinions.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            {[
              "Outputs are not legal GDPR compliance certificates",
              "Model cards are descriptive, not fairness certifications",
              "Privacy reports flag risks but cannot guarantee compliance",
              "Metrics describe distribution, not regulatory approval",
              "Explanations reflect model behavior, not intent or ground truth",
              "Audit manifests document assessment, not validation outcomes",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2.5 text-sm text-slate-400 p-3 rounded-xl"
                style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.12)" }}
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: "#FCD34D" }} />
                {item}
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
          headline="Explore the platform"
          subline="Run a guided assessment, view the dataset audit workflow, or request a managed environment."
          primary={{ label: "Launch Guided Assessment", to: "/guided-assessment" }}
          secondary={{ label: "Dataset Audit",          to: "/dataset-audit" }}
          tertiary={{ label: "Request Access",           to: "/request-access" }}
        />
      </div>
    </section>
  );
}

export default function Product() {
  return (
    <div style={{ background: "#070B1A", color: "#F8FAFC", minHeight: "100vh" }}>
      <PublicHeader />
      <main id="main-content">
        <Hero />
        <AssessmentStack />
        <SupportedFormats />
        <Guardrails />
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
