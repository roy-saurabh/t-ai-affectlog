import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Network, BarChart2, Activity, Share2 } from "lucide-react";
import { PublicHeader } from "../../components/public/PublicHeader";
import { PublicFooter } from "../../components/public/PublicFooter";
import { GridBackground, GlowOrb } from "../../design-system/primitives/GridBackground";
import { EcosystemLifecycleVisual } from "../../design-system/visuals/EcosystemLifecycleVisual";
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

const TOOLS = [
  {
    name: "CARiSMA",
    phase: "Design-time",
    color: "#38bdf8",
    icon: Network,
    role: "AI risk & compliance analysis at design time",
    desc: "CARiSMA annotates model artefacts with compliance markers before deployment. It performs model-level security, risk, and regulatory compliance analysis, producing structured evidence that downstream tools — including AffectLog — can reference.",
    links: [
      { label: "Interoperability Guide", href: "https://github.com/roy-saurabh/edge_affectlog/blob/main/docs/carisma-lola-interoperability.md" },
    ],
  },
  {
    name: "LOLA",
    phase: "Evaluation scenario",
    color: "#a78bfa",
    icon: BarChart2,
    role: "Scenario-based algorithm evaluation",
    desc: "LOLA provides scenario-based evaluation using educational datasets. It bridges the gap between design-time compliance constraints and operation-time behavioral evidence, linking evaluation scenarios to assessment workflows.",
    links: [
      { label: "Interoperability Guide", href: "https://github.com/roy-saurabh/edge_affectlog/blob/main/docs/carisma-lola-interoperability.md" },
    ],
  },
  {
    name: "AffectLog",
    phase: "Operation-time",
    color: "#22d3ee",
    icon: Activity,
    role: "Dataset & model assessment at operation time",
    desc: "AffectLog handles operation-time assessment: profiling real datasets, evaluating model behaviour in its training data context, generating privacy reports, fairness metrics, and audit-ready structured evidence for regulatory review.",
    highlight: true,
    links: [
      { label: "Platform Overview", to: "/product" },
      { label: "Dataset Audit",    to: "/dataset-audit" },
    ],
  },
];

function Hero() {
  return (
    <section
      className="relative min-h-[72vh] flex items-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #050814 0%, #080D1F 100%)" }}
    >
      <GridBackground />
      <GlowOrb color="cyan" size={600} x="75%" y="25%" opacity={0.4} />
      <GlowOrb color="violet" size={400} x="20%" y="60%" opacity={0.3} />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 lg:px-10 py-20 w-full">
        <div className="max-w-3xl">
          <FadeUp delay={0.04}>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
              style={{ color: "#22d3ee", background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.22)" }}
            >
              <Network size={11} />
              Prometheus-X Building Block BB04
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1
              className="font-bold text-white mb-5 leading-tight tracking-tight"
              style={{ fontSize: "clamp(2.6rem, 5vw, 4rem)", letterSpacing: "-0.03em" }}
            >
              Part of the Trustworthy AI Assessment ecosystem
            </h1>
          </FadeUp>
          <FadeUp delay={0.17}>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              AffectLog complements design-time risk analysis and algorithm evaluation workflows
              with operation-time dataset and model assessment. CARiSMA, LOLA, and AffectLog form
              a complementary three-layer evidence pipeline.
            </p>
          </FadeUp>
          <FadeUp delay={0.23}>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://prometheus-x-association.github.io/docs/t-ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-white rounded-xl px-6 py-3.5 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #06b6d4, #0ea5e9)", boxShadow: "0 6px 20px rgba(34,211,238,0.28)" }}
              >
                BB04 Technical Docs <ExternalLink size={15} />
              </a>
              <Link
                to="/product"
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white px-5 py-3.5 text-sm transition-colors"
              >
                AffectLog Platform <ArrowRight size={13} />
              </Link>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function LifecycleSection() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#050814" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Complementary across the AI lifecycle
            </h2>
            <p className="text-lg text-slate-400">
              Each tool addresses a distinct phase of trustworthy AI assessment.
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div
            className="rounded-2xl p-6 md:p-8 border mb-12"
            style={{ background: "rgba(11,16,32,0.7)", borderColor: "rgba(148,163,184,0.12)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">AI System Lifecycle</p>
            <EcosystemLifecycleVisual />
          </div>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-5">
          {TOOLS.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <FadeUp key={tool.name} delay={i * 0.08}>
                <div
                  className="rounded-2xl p-7 h-full border transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: tool.highlight ? `${tool.color}07` : "rgba(255,255,255,0.025)",
                    borderColor: tool.highlight ? `${tool.color}30` : "rgba(148,163,184,0.10)",
                  }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${tool.color}14` }}>
                        <Icon size={16} style={{ color: tool.color }} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{tool.name}</h3>
                        <p className="text-xs text-slate-500">{tool.phase}</p>
                      </div>
                    </div>
                    {tool.highlight && (
                      <span
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: `${tool.color}12`, color: tool.color, border: `1px solid ${tool.color}30` }}
                      >
                        this platform
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold mb-3" style={{ color: tool.color }}>{tool.role}</p>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">{tool.desc}</p>

                  <div className="space-y-2">
                    {tool.links.map((link) => (
                      "to" in link ? (
                        <Link
                          key={link.label}
                          to={link.to!}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          {link.label} <ArrowRight size={10} />
                        </Link>
                      ) : (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          {link.label} <ExternalLink size={10} />
                        </a>
                      )
                    ))}
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

function PDCInteroperability() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#080D1F" }}>
      <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
        <FadeUp>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">
            PDC and metadata interoperability
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            AffectLog produces structured JSON-LD outputs designed for interoperability with
            Personal Data Cloud (PDC) consent flows, CARiSMA compliance markers, and LOLA
            evaluation scenario metadata. All output schemas are documented and versioned.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              { label: "JSON-LD compliance graphs",  desc: "Machine-readable compliance evidence",      color: "#22d3ee" },
              { label: "Dataset data cards",         desc: "Standardized dataset metadata format",      color: "#a78bfa" },
              { label: "Model cards",                desc: "Model behavioral documentation",            color: "#38bdf8" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-4 border"
                style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(148,163,184,0.10)" }}
              >
                <div className="w-1.5 h-1.5 rounded-full mb-3" style={{ background: item.color }} />
                <h3 className="font-semibold text-slate-200 text-sm mb-1">{item.label}</h3>
                <p className="text-slate-500 text-xs">{item.desc}</p>
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
    <section className="py-20 md:py-24" style={{ background: "#050814" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <CTABand
          headline="Explore AffectLog's role in the ecosystem"
          subline="View the technical interoperability guide or read the Prometheus-X BB04 specification."
          primary={{ label: "Explore Product",          to: "/product" }}
          secondary={{ label: "View Integration Guide", href: "https://github.com/roy-saurabh/edge_affectlog/blob/main/docs/carisma-lola-interoperability.md" }}
          tertiary={{ label: "BB04 Technical Docs",     href: "https://prometheus-x-association.github.io/docs/t-ai/" }}
        />
      </div>
    </section>
  );
}

export default function EcosystemPage() {
  return (
    <div style={{ background: "#050814", color: "#F8FAFC", minHeight: "100vh" }}>
      <PublicHeader />
      <main id="main-content">
        <Hero />
        <LifecycleSection />
        <PDCInteroperability />
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
