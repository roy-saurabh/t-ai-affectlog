import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Github, ArrowRight, Code2, Package, Cpu, BarChart2,
  Share2, Eye, FileText, ShieldCheck, Terminal, BookOpen,
  GitBranch, Wrench, ExternalLink,
} from "lucide-react";
import { PublicHeader } from "../../components/public/PublicHeader";
import { PublicFooter } from "../../components/public/PublicFooter";
import { GridBackground, GlowOrb } from "../../design-system/primitives/GridBackground";
import { CodeBlock } from "../../design-system/primitives/CodeBlock";
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

const GITHUB = "https://github.com/roy-saurabh/edge_affectlog";

function Hero() {
  return (
    <section
      className="relative min-h-[80vh] flex items-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #050814 0%, #080D1F 100%)" }}
    >
      <GridBackground />
      <GlowOrb color="cyan" size={600} x="75%" y="30%" opacity={0.45} />
      <GlowOrb color="violet" size={400} x="20%" y="70%" opacity={0.35} />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 lg:px-10 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <FadeUp delay={0.04}>
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
                style={{ color: "#22d3ee", background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.22)" }}
              >
                <Github size={11} />
                Open Source · Developer Hub
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h1
                className="font-bold text-white mb-5 leading-tight tracking-tight"
                style={{ fontSize: "clamp(2.6rem, 5vw, 4rem)", letterSpacing: "-0.03em" }}
              >
                Build reusable assessment infrastructure
              </h1>
            </FadeUp>

            <FadeUp delay={0.17}>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-[520px]">
                Contribute recipes, model adapters, metrics, connectors, visualizations, docs,
                tests, and OpenAPI contracts for trustworthy AI assessment.
              </p>
            </FadeUp>

            <FadeUp delay={0.23}>
              <div className="flex flex-wrap gap-3">
                <a
                  href={GITHUB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-white rounded-xl px-6 py-3.5 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #06b6d4, #0ea5e9)", boxShadow: "0 6px 20px rgba(34,211,238,0.28)" }}
                >
                  <Github size={16} /> Contribute on GitHub
                </a>
                <a
                  href={`${GITHUB}/blob/main/CONTRIBUTING.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-slate-200 rounded-xl px-6 py-3.5 border transition-all hover:bg-white/[0.06]"
                  style={{ borderColor: "rgba(148,163,184,0.22)", background: "rgba(255,255,255,0.04)" }}
                >
                  Contributor Guide <ExternalLink size={14} />
                </a>
              </div>
            </FadeUp>
          </div>

          {/* Dev quickstart */}
          <FadeUp delay={0.25}>
            <CodeBlock
              label="Developer quickstart"
              lines={[
                { text: "git clone https://github.com/roy-saurabh/edge_affectlog", color: "#22d3ee" },
                { text: "cd edge_affectlog && docker compose up", color: "#34d399" },
                { text: "# Run backend tests", color: "#475569" },
                { text: "make test", color: "#a78bfa" },
                { text: "# Generate 1M-row synthetic dataset", color: "#475569" },
                { text: "make synthetic-1m", color: "#22d3ee" },
                { text: "# Seed demo scenarios", color: "#475569" },
                { text: "make seed", color: "#34d399" },
                { text: "# Open API docs", color: "#475569" },
                { text: "# http://localhost:8000/api/docs", color: "#64748b" },
              ]}
            />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

const CONTRIBUTION_TYPES = [
  { icon: Package,     label: "Dataset Recipes",     desc: "YAML-defined assessment pipeline specs for new dataset formats or domains.",     color: "#22d3ee" },
  { icon: Cpu,         label: "Model Adapters",      desc: "Plug in new ML frameworks, model APIs, or local model serving endpoints.",        color: "#a78bfa" },
  { icon: BarChart2,   label: "Metrics & Analysis",  desc: "Fairness, quality, concentration, or explainability measurement implementations.", color: "#38bdf8" },
  { icon: Share2,      label: "Connector Bridges",   desc: "PDC consent flows, CARiSMA/LOLA metadata bridges, external model registries.",   color: "#10b981" },
  { icon: Eye,         label: "Visualizations",      desc: "Chart types, interactive displays, or improved metric visualizations.",           color: "#22d3ee" },
  { icon: FileText,    label: "Synthetic Fixtures",  desc: "Test datasets, schema examples, and scenario seeds for CI and onboarding.",       color: "#fbbf24" },
  { icon: ShieldCheck, label: "Security Review",     desc: "Code path audits, dependency scanning, or policy enforcement verification.",      color: "#f87171" },
  { icon: Code2,       label: "OpenAPI Validation",  desc: "Verify endpoint contracts, schema correctness, and response model coverage.",     color: "#6366f1" },
];

function ContributionTypes() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#050814" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Eight contribution paths
            </h2>
            <p className="text-lg text-slate-400">
              Every recipe, adapter, metric, and connector makes the platform stronger for
              universities, auditors, and AI providers across the ecosystem.
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CONTRIBUTION_TYPES.map((c, i) => {
            const Icon = c.icon;
            return (
              <FadeUp key={c.label} delay={i * 0.035}>
                <a
                  href={`${GITHUB}/blob/main/CONTRIBUTING.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl p-5 border transition-all duration-200 group hover:-translate-y-0.5"
                  style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(148,163,184,0.10)" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = `${c.color}35`;
                    el.style.background  = `${c.color}06`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = "rgba(148,163,184,0.10)";
                    el.style.background  = "rgba(255,255,255,0.025)";
                  }}
                >
                  <Icon size={15} className="mb-3 transition-colors" style={{ color: "#475569" }} aria-hidden="true" />
                  <h3 className="font-semibold text-slate-200 text-sm mb-1.5">{c.label}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">{c.desc}</p>
                </a>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ArchitectureGuide() {
  const rules = [
    { label: "No raw data in any output",       color: "#10b981" },
    { label: "Pseudonymise all actor IDs",      color: "#10b981" },
    { label: "Guardrails block invalid analysis",color: "#22d3ee" },
    { label: "Recipes are YAML-only, no secrets",color: "#22d3ee" },
    { label: "All tests run without real datasets",color: "#a78bfa" },
    { label: "OpenAPI spec updated with endpoints",color: "#38bdf8" },
    { label: "No TRL or D-numbered references",  color: "#fbbf24" },
  ];

  return (
    <section className="py-24 md:py-28" style={{ background: "#080D1F" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <FadeUp>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
              style={{ color: "#22d3ee", background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.20)" }}
            >
              Code quality rules
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">
              Standards every contribution must meet
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              AffectLog is a privacy-preserving, open-source platform. Every contribution must
              respect the data model, avoid revealing internal project language, and include tests
              that run without real dataset access.
            </p>

            <div className="space-y-2.5">
              {rules.map((rule) => (
                <div key={rule.label} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: rule.color }} />
                  <span className="text-sm text-slate-300">{rule.label}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div
              className="rounded-2xl p-6 border space-y-5"
              style={{ background: "rgba(11,16,32,0.7)", borderColor: "rgba(148,163,184,0.12)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Good first issues</p>
              {[
                { label: "Add a sparsity plot type",          tag: "visualization", color: "#22d3ee" },
                { label: "Write a generic CSV recipe",        tag: "recipe",        color: "#a78bfa" },
                { label: "Add Hugging Face model adapter",    tag: "adapter",       color: "#38bdf8" },
                { label: "Improve PII field detection rules", tag: "privacy",       color: "#10b981" },
                { label: "Document interoperability JSON-LD", tag: "docs",          color: "#fbbf24" },
              ].map((issue) => (
                <div key={issue.label} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-300">{issue.label}</span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: `${issue.color}12`, color: issue.color, border: `1px solid ${issue.color}25` }}
                  >
                    {issue.tag}
                  </span>
                </div>
              ))}
              <a
                href={`${GITHUB}/issues?q=is%3Aopen+label%3A%22good+first+issue%22`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors mt-2"
              >
                View all good first issues <ExternalLink size={12} />
              </a>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 md:py-24" style={{ background: "#050814" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <CTABand
          headline="Build assessment infrastructure with us"
          subline="Clone the repository, run the tests, and submit your first recipe or adapter. Every contribution is reviewed and credited."
          primary={{ label: "Contribute on GitHub",    href: GITHUB }}
          secondary={{ label: "Add a Dataset Recipe", href: `${GITHUB}/blob/main/CONTRIBUTING.md` }}
          tertiary={{ label: "Add a Model Adapter",   href: `${GITHUB}/blob/main/CONTRIBUTING.md` }}
        />
      </div>
    </section>
  );
}

export default function DevelopersPage() {
  return (
    <div style={{ background: "#050814", color: "#F8FAFC", minHeight: "100vh" }}>
      <PublicHeader />
      <main id="main-content">
        <Hero />
        <ContributionTypes />
        <ArchitectureGuide />
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
