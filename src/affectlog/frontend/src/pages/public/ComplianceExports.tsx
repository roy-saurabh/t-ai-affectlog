import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, ArrowRight, Code2, CheckCircle2, ExternalLink, Share2 } from "lucide-react";
import { PublicHeader } from "../../components/public/PublicHeader";
import { PublicFooter } from "../../components/public/PublicFooter";
import { GridBackground, GlowOrb } from "../../design-system/primitives/GridBackground";
import { ComplianceGraphVisual } from "../../design-system/visuals/ComplianceGraphVisual";
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

const ARTIFACTS = [
  { label: "Standard Operating Procedure (SOP)", desc: "Human-readable audit narrative with findings, risk flags, and recommendations.", color: "#67E8F9" },
  { label: "Dataset Data Card",                   desc: "JSON-LD structured dataset metadata following established card schemas.",         color: "#86EFAC" },
  { label: "Model Card",                          desc: "Behavioral documentation for registered models with explanation artifacts.",      color: "#C4B5FD" },
  { label: "Privacy Report",                      desc: "PII findings, pseudonymisation decisions, and residual risk assessment.",        color: "#93C5FD" },
  { label: "Field Inventory",                     desc: "Schema manifest: field names, types, sparsity, and PII classification.",         color: "#67E8F9" },
  { label: "Audit Manifest",                      desc: "Signed record of what was analyzed, when, with which recipe and outputs.",       color: "#86EFAC" },
  { label: "JSON-LD Compliance Graph",            desc: "Machine-readable evidence graph linking dataset, fields, controls, metrics.",    color: "#FCD34D" },
  { label: "Dashboard Export Payload",            desc: "Structured JSON for visualization and reporting in the assessment console.",     color: "#A7F3D0" },
];

function Hero() {
  return (
    <section
      className="relative min-h-[76vh] flex items-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #070B1A 0%, #0B1224 100%)" }}
    >
      <GridBackground />
      <GlowOrb color="green" size={600} x="80%" y="25%" opacity={0.4} />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 lg:px-10 py-20 w-full">
        <div className="max-w-3xl">
          <FadeUp delay={0.04}>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
              style={{ color: "#86EFAC", background: "rgba(134,239,172,0.08)", border: "1px solid rgba(134,239,172,0.22)" }}
            >
              <FileText size={11} />
              Compliance Exports
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1
              className="font-bold text-white mb-5 leading-tight tracking-tight"
              style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)", letterSpacing: "-0.03em" }}
            >
              Turn assessments into structured evidence
            </h1>
          </FadeUp>
          <FadeUp delay={0.17}>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Generate SOPs, field inventories, privacy reports, data cards, model cards,
              audit manifests, and JSON-LD compliance graphs for human review and
              machine-readable exchange.
            </p>
          </FadeUp>
          <FadeUp delay={0.23}>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-semibold text-white rounded-xl px-6 py-3.5 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #059669, #0891b2)", boxShadow: "0 6px 20px rgba(134,239,172,0.25)" }}
              >
                View Export Catalog <ArrowRight size={17} />
              </Link>
              <Link
                to="/openapi"
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white px-5 py-3.5 text-sm transition-colors"
              >
                API Reference <ArrowRight size={12} />
              </Link>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function ArtifactStack() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#070B1A" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Export artifact stack</h2>
            <p className="text-lg text-slate-400">Eight artifact types generated by the assessment pipeline.</p>
          </div>
        </FadeUp>

        <div className="grid sm:grid-cols-2 gap-4">
          {ARTIFACTS.map((a, i) => (
            <FadeUp key={a.label} delay={i * 0.04}>
              <div
                className="flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(203,213,225,0.10)" }}
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: a.color }} />
                <div>
                  <h3 className="font-semibold text-slate-200 text-sm mb-1">{a.label}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{a.desc}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function JSONLDSection() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#0B1224" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <FadeUp>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
              style={{ color: "#FCD34D", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.20)" }}
            >
              <Code2 size={11} />
              JSON-LD compliance graph
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">
              Machine-readable compliance evidence
            </h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              AffectLog's JSON-LD compliance graph links dataset metadata, field inventory,
              processing activity, control records, computed metrics, risk findings, and audit
              artifacts into a single interoperable evidence structure.
            </p>
            <div className="space-y-2.5 mb-8">
              {["Dataset", "DataField", "ProcessingActivity", "Control", "Metric", "RiskFinding", "Artifact"].map((node) => (
                <div key={node} className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="w-2 h-2 rounded-full" style={{ background: "#FCD34D" }} />
                  <span className="font-mono text-xs text-fbbf24">{node}</span>
                  <span className="text-slate-500">node type</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/openapi"
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white px-5 py-2.5 border rounded-xl transition-all hover:bg-white/[0.04]"
                style={{ borderColor: "rgba(203,213,225,0.18)" }}
              >
                API Reference <ArrowRight size={12} />
              </Link>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div
              className="rounded-2xl p-6 border"
              style={{ background: "rgba(11,16,32,0.7)", borderColor: "rgba(245,158,11,0.18)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">JSON-LD graph structure</p>
              <ComplianceGraphVisual />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function Limitations() {
  return (
    <section className="py-20 md:py-24" style={{ background: "#070B1A" }}>
      <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
        <FadeUp>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">What outputs do not claim</h2>
          <p className="text-slate-500 mb-6 leading-relaxed">Compliance evidence documents assessment, not certification.</p>
          <div className="grid sm:grid-cols-2 gap-3 text-left">
            {[
              "Not a GDPR compliance certificate",
              "Not a regulatory approval",
              "Not a legal opinion on AI Act conformity",
              "Not a security penetration test result",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-slate-500 p-3 rounded-xl border" style={{ borderColor: "rgba(203,213,225,0.09)", background: "rgba(255,255,255,0.02)" }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 bg-slate-600" />
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
          headline="Generate audit-ready evidence"
          subline="Run an assessment and download structured SOPs, data cards, and JSON-LD compliance graphs."
          primary={{ label: "View Export Catalog",    to: "/login" }}
          secondary={{ label: "Compliance Mapping",  href: "https://github.com/Prometheus-X-association/t-ai-affectlog/blob/main/docs/compliance-mapping.md" }}
          tertiary={{ label: "Request Access",        to: "/request-access" }}
        />
      </div>
    </section>
  );
}

export default function ComplianceExports() {
  return (
    <div style={{ background: "#070B1A", color: "#F8FAFC", minHeight: "100vh" }}>
      <PublicHeader />
      <main id="main-content">
        <Hero />
        <ArtifactStack />
        <JSONLDSection />
        <Limitations />
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
