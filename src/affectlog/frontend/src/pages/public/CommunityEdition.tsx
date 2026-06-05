import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Github, Server, CheckCircle2, Lock, Shield,
  Package, Code2, Terminal, Users, GitBranch, Cpu,
  Database, ExternalLink,
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
      <GlowOrb color="cyan" size={600} x="80%" y="30%" opacity={0.5} />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 lg:px-10 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <FadeUp delay={0.04}>
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
                style={{ color: "#22d3ee", background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.22)" }}
              >
                <Server size={11} aria-hidden="true" />
                Open Source · MIT License
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h1
                className="font-bold text-white mb-5 leading-tight tracking-tight"
                style={{ fontSize: "clamp(2.6rem, 5vw, 4rem)", letterSpacing: "-0.03em" }}
              >
                Self-host the open-source core
              </h1>
            </FadeUp>

            <FadeUp delay={0.17}>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-[520px]">
                Run AffectLog locally or on institutional infrastructure. Keep datasets under your
                control while using the same core assessment workflows as the managed edition.
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
                  <Github size={16} /> View GitHub
                </a>
                <Link
                  to="/self-host"
                  className="inline-flex items-center gap-2 font-semibold text-slate-200 rounded-xl px-6 py-3.5 border transition-all hover:bg-white/[0.06]"
                  style={{ borderColor: "rgba(148,163,184,0.22)", background: "rgba(255,255,255,0.04)" }}
                >
                  Self-host Guide <ArrowRight size={15} />
                </Link>
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.25}>
            <CodeBlock
              label="Quick start"
              lines={[
                { text: "# Clone and run locally" },
                { text: `git clone ${GITHUB}`, color: "#22d3ee" },
                { text: "cd edge_affectlog",   color: "#22d3ee" },
                { text: "docker compose up",   color: "#34d399" },
                { text: "make seed && make create-admin", color: "#a78bfa" },
                { text: "# Generate 1M-row synthetic dataset", color: "#475569" },
                { text: "make synthetic-1m",   color: "#22d3ee" },
                { text: "# Open http://localhost:3000", color: "#475569" },
              ]}
            />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

const INCLUDED = [
  { icon: Database,  label: "Dataset Audit Engine",    desc: "Full pipeline: schema validation, xAPI normalization, PII scan, metrics.", color: "#22d3ee" },
  { icon: Shield,    label: "Privacy Defaults",        desc: "No raw datasets stored. Pseudonymisation. Metadata-only exports.",         color: "#10b981" },
  { icon: Cpu,       label: "Model Adapters",          desc: "Pluggable model interface. Feature importance, model cards.",              color: "#a78bfa" },
  { icon: Package,   label: "Assessment Recipes",      desc: "YAML-defined pipeline specs. Inokufu, Maskott, generic templates.",        color: "#38bdf8" },
  { icon: Code2,     label: "OpenAPI Backend",         desc: "All workflows exposed via OpenAPI 3.1. Machine-readable contracts.",       color: "#6366f1" },
  { icon: Lock,      label: "RBAC + Admin Onboarding", desc: "Admin-approved registrations. Role-based access. Audit log.",             color: "#10b981" },
  { icon: Terminal,  label: "Docker Compose",          desc: "PostgreSQL, Redis, local artifact storage. Single command startup.",       color: "#22d3ee" },
  { icon: Users,     label: "Community Support",       desc: "GitHub issues, discussions, contributor guide, and recipes.",             color: "#fbbf24" },
];

function WhatIsIncluded() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#050814" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Everything in Community Edition
            </h2>
            <p className="text-lg text-slate-400">
              The full assessment workflow. No cloud dependency. Complete self-hosted control.
            </p>
          </div>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INCLUDED.map((item, i) => {
            const Icon = item.icon;
            return (
              <FadeUp key={item.label} delay={i * 0.04}>
                <div
                  className="rounded-2xl p-5 border h-full transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(148,163,184,0.10)" }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${item.color}14` }}>
                    <Icon size={16} style={{ color: item.color }} aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-slate-200 text-sm mb-2">{item.label}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ComparisonTable() {
  const rows = [
    { feature: "Dataset audit workflows",         community: true,               managed: true  },
    { feature: "xAPI normalization",              community: true,               managed: true  },
    { feature: "PII scanning & pseudonymisation", community: true,               managed: true  },
    { feature: "Fairness metrics",                community: true,               managed: true  },
    { feature: "Model adapters & explanations",   community: true,               managed: true  },
    { feature: "OpenAPI endpoints",               community: true,               managed: true  },
    { feature: "Docker Compose deployment",       community: true,               managed: false },
    { feature: "Self-hosted data control",        community: true,               managed: false },
    { feature: "Managed hosting & backups",       community: false,              managed: true  },
    { feature: "Multi-tenant workspaces",         community: false,              managed: true  },
    { feature: "Admin onboarding",                community: "Local admin",      managed: "AffectLog" },
    { feature: "Monitoring",                      community: "Self-managed",     managed: "AffectLog" },
    { feature: "Support SLA",                     community: "Community",        managed: "AffectLog" },
  ];

  return (
    <section className="py-24 md:py-28" style={{ background: "#080D1F" }}>
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Community vs Managed</h2>
            <p className="text-slate-400">Same open-source core. Different operational models.</p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(148,163,184,0.12)" }}>
            <div
              className="grid grid-cols-3 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400"
              style={{ background: "rgba(11,16,32,0.8)" }}
            >
              <div>Feature</div>
              <div className="text-center text-cyan-400">Community</div>
              <div className="text-center text-violet-400">Managed Cloud</div>
            </div>
            {rows.map((row, i) => (
              <div
                key={row.feature}
                className="grid grid-cols-3 px-5 py-3.5 text-sm border-t"
                style={{ borderColor: "rgba(148,163,184,0.07)", background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}
              >
                <div className="text-slate-300">{row.feature}</div>
                <div className="text-center">
                  {row.community === true   ? <CheckCircle2 size={15} className="text-cyan-400 mx-auto" />
                   : row.community === false ? <span className="text-slate-600">—</span>
                   : <span className="text-xs text-slate-400">{String(row.community)}</span>}
                </div>
                <div className="text-center">
                  {row.managed === true   ? <CheckCircle2 size={15} className="text-violet-400 mx-auto" />
                   : row.managed === false ? <span className="text-slate-600">—</span>
                   : <span className="text-xs text-violet-400">{String(row.managed)}</span>}
                </div>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function ContributionSection() {
  const paths = [
    { icon: Package,    label: "Dataset Recipes",      desc: "YAML-defined pipeline configurations for new data formats.", href: `${GITHUB}/blob/main/CONTRIBUTING.md` },
    { icon: Cpu,        label: "Model Adapters",       desc: "Integrate new ML frameworks or model serving endpoints.",     href: `${GITHUB}/blob/main/CONTRIBUTING.md` },
    { icon: Code2,      label: "Metrics & Plots",      desc: "Add fairness, quality, or explainability measurements.",      href: `${GITHUB}/blob/main/CONTRIBUTING.md` },
    { icon: GitBranch,  label: "Connector Bridges",    desc: "PDC, CARiSMA, LOLA, and data-space interoperability.",        href: `${GITHUB}/blob/main/CONTRIBUTING.md` },
  ];

  return (
    <section className="py-24 md:py-28" style={{ background: "#050814" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <FadeUp>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
              style={{ color: "#22d3ee", background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.20)" }}
            >
              <Github size={11} />
              Open-source governance
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">
              Deploy locally. Contribute openly.
            </h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Community Edition is designed for institutions where datasets remain under local
              control. Universities, research labs, EdTechs, and auditors can run the full
              assessment workflow without any dependency on AffectLog Cloud.
            </p>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Raw datasets are never included in the public repository. Synthetic examples and
              schemas are provided for testing and contribution.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-white px-5 py-2.5 rounded-xl border transition-all hover:bg-white/[0.06]"
                style={{ borderColor: "rgba(148,163,184,0.18)", background: "rgba(255,255,255,0.04)" }}
              >
                <Github size={14} /> View GitHub
              </a>
              <a
                href={`${GITHUB}/blob/main/CONTRIBUTING.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 px-5 py-2.5 transition-colors"
              >
                Contributor Guide <ExternalLink size={12} />
              </a>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-2 gap-4">
            {paths.map((p, i) => {
              const Icon = p.icon;
              return (
                <FadeUp key={p.label} delay={i * 0.06}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5 group"
                    style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(148,163,184,0.10)" }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.borderColor = "rgba(34,211,238,0.25)";
                      el.style.background  = "rgba(34,211,238,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.borderColor = "rgba(148,163,184,0.10)";
                      el.style.background  = "rgba(255,255,255,0.025)";
                    }}
                  >
                    <Icon size={16} className="text-slate-500 group-hover:text-cyan-400 mb-3 transition-colors" aria-hidden="true" />
                    <h3 className="font-semibold text-slate-200 text-sm mb-1.5">{p.label}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed">{p.desc}</p>
                  </a>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 md:py-24" style={{ background: "#080D1F" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <CTABand
          headline="Ready to self-host?"
          subline="Clone the repository, run Docker Compose, and start your first assessment in minutes. Data stays on your infrastructure."
          primary={{ label: "View GitHub Repository", href: GITHUB }}
          secondary={{ label: "Read Self-host Guide", to: "/self-host" }}
          tertiary={{ label: "Explore Managed Cloud", to: "/cloud" }}
        />
      </div>
    </section>
  );
}

export default function CommunityEdition() {
  return (
    <div style={{ background: "#050814", color: "#F8FAFC", minHeight: "100vh" }}>
      <PublicHeader />
      <main id="main-content">
        <Hero />
        <WhatIsIncluded />
        <ComparisonTable />
        <ContributionSection />
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
