import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, ArrowRight, ExternalLink, Server, Shield,
  Users, Code2, BookMarked, Cpu, Activity, Wrench,
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

const GITHUB = "https://github.com/roy-saurabh/edge_affectlog";
const DOCS   = `${GITHUB}/blob/main/docs`;

const QUICKSTART_PATHS = [
  {
    icon: Activity,
    title: "Auditor",
    color: "#22d3ee",
    steps: [
      "Start with Dataset Audit",
      "Run PII and privacy scan",
      "Review fairness metrics",
      "Generate SOP and data card",
      "Export JSON-LD compliance graph",
    ],
    cta: { label: "Start Dataset Audit", to: "/dataset-audit" },
  },
  {
    icon: Shield,
    title: "Data Steward",
    color: "#10b981",
    steps: [
      "Review field inventory",
      "Check PII and quasi-identifiers",
      "Validate xAPI schema",
      "Generate privacy report",
      "Export pseudonymised metadata",
    ],
    cta: { label: "View Security Model", to: "/security" },
  },
  {
    icon: Cpu,
    title: "Model Developer",
    color: "#a78bfa",
    steps: [
      "Register model adapter",
      "Check dataset-model interface",
      "Generate feature importance",
      "Create model card",
      "Export comparison report",
    ],
    cta: { label: "Model Assessment", to: "/model-assessment" },
  },
  {
    icon: Server,
    title: "Admin / Operator",
    color: "#38bdf8",
    steps: [
      "Deploy with Docker Compose",
      "Bootstrap admin account",
      "Configure SMTP and RBAC",
      "Approve user registrations",
      "Monitor audit log",
    ],
    cta: { label: "Self-host Guide", to: "/self-host" },
  },
  {
    icon: Code2,
    title: "Developer / Contributor",
    color: "#6366f1",
    steps: [
      "Clone and run locally",
      "Run existing tests",
      "Add a recipe or adapter",
      "Validate OpenAPI contract",
      "Open a pull request",
    ],
    cta: { label: "Developer Hub", to: "/developers" },
  },
  {
    icon: BookMarked,
    title: "Managed Operator",
    color: "#fbbf24",
    steps: [
      "Request managed access",
      "Tenant provisioned by AffectLog",
      "Approve team members",
      "Monitor platform health",
      "Review usage metrics",
    ],
    cta: { label: "Request Access", to: "/request-access" },
  },
];

const DOC_CARDS = [
  { icon: BookOpen,   title: "Product Guide",         desc: "Platform overview, assessment stack, and workflow documentation.",     href: `${DOCS}/design-document.md`,      color: "#22d3ee" },
  { icon: Code2,      title: "API Reference",          desc: "Interactive OpenAPI docs, endpoint contracts, and authentication.",     href: "/api/docs",                       color: "#38bdf8" },
  { icon: Wrench,     title: "Self-host Guide",        desc: "Docker Compose, admin bootstrap, SMTP setup, security hardening.",     to: "/self-host",                        color: "#a78bfa" },
  { icon: BookMarked, title: "Assessment Recipes",     desc: "YAML pipeline specs, supported formats, and contribution guide.",      href: `${DOCS}/assessment-recipes.md`,   color: "#10b981" },
  { icon: Shield,     title: "Security Architecture",  desc: "RBAC model, pseudonymisation, audit log, and disclosure policy.",      to: "/security",                         color: "#10b981" },
  { icon: Server,     title: "SaaS Architecture",      desc: "Multi-tenant model, tenant isolation, and managed operations.",        href: `${DOCS}/saas-architecture.md`,    color: "#6366f1" },
  { icon: Activity,   title: "Interoperability",       desc: "CARiSMA, LOLA, PDC metadata bridges, JSON-LD output schemas.",         href: `${DOCS}/carisma-lola-interoperability.md`, color: "#fbbf24" },
  { icon: Cpu,        title: "Model Adapters",         desc: "Adapter interface, supported frameworks, contribution instructions.",   href: `${DOCS}/model-adapters.md`,       color: "#a78bfa" },
];

function Hero() {
  return (
    <section
      className="relative min-h-[68vh] flex items-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #050814 0%, #080D1F 100%)" }}
    >
      <GridBackground />
      <GlowOrb color="cyan" size={500} x="80%" y="25%" opacity={0.35} />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 lg:px-10 py-20 w-full">
        <div className="max-w-3xl">
          <FadeUp delay={0.04}>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
              style={{ color: "#22d3ee", background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.22)" }}
            >
              <BookOpen size={11} />
              Documentation
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1
              className="font-bold text-white mb-5 leading-tight tracking-tight"
              style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)", letterSpacing: "-0.03em" }}
            >
              Documentation for builders, auditors, and operators
            </h1>
          </FadeUp>
          <FadeUp delay={0.17}>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Explore product guides, API contracts, deployment instructions, assessment recipes,
              security architecture, and interoperability docs.
            </p>
          </FadeUp>
          <FadeUp delay={0.23}>
            <div className="flex flex-wrap gap-3">
              <a
                href="/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-white rounded-xl px-6 py-3.5 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #06b6d4, #0ea5e9)", boxShadow: "0 6px 20px rgba(34,211,238,0.28)" }}
              >
                Read API Docs <ExternalLink size={15} />
              </a>
              <Link
                to="/self-host"
                className="inline-flex items-center gap-2 font-semibold text-slate-200 rounded-xl px-6 py-3.5 border transition-all hover:bg-white/[0.06]"
                style={{ borderColor: "rgba(148,163,184,0.22)", background: "rgba(255,255,255,0.04)" }}
              >
                Start Self-hosting <ArrowRight size={15} />
              </Link>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function DocCards() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#050814" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Documentation hub
            </h2>
          </div>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DOC_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <FadeUp key={card.title} delay={i * 0.04}>
                {card.to ? (
                  <Link
                    to={card.to}
                    className="block rounded-2xl p-5 border h-full transition-all duration-200 hover:-translate-y-0.5 group"
                    style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(148,163,184,0.10)" }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: `${card.color}14` }}>
                      <Icon size={15} style={{ color: card.color }} />
                    </div>
                    <h3 className="font-semibold text-slate-200 text-sm mb-2">{card.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{card.desc}</p>
                  </Link>
                ) : (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl p-5 border h-full transition-all duration-200 hover:-translate-y-0.5 group"
                    style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(148,163,184,0.10)" }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: `${card.color}14` }}>
                      <Icon size={15} style={{ color: card.color }} />
                    </div>
                    <h3 className="font-semibold text-slate-200 text-sm mb-2 flex items-center gap-1.5">
                      {card.title}
                      <ExternalLink size={10} className="text-slate-600 flex-shrink-0" />
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{card.desc}</p>
                  </a>
                )}
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function QuickstartPaths() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#080D1F" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Quickstart paths by role
            </h2>
            <p className="text-lg text-slate-400">
              Start with the path most relevant to what you're trying to accomplish.
            </p>
          </div>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {QUICKSTART_PATHS.map((path, i) => {
            const Icon = path.icon;
            return (
              <FadeUp key={path.title} delay={i * 0.05}>
                <div
                  className="rounded-2xl p-6 border h-full flex flex-col"
                  style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(148,163,184,0.10)" }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${path.color}14` }}>
                      <Icon size={15} style={{ color: path.color }} />
                    </div>
                    <h3 className="font-bold text-white">{path.title}</h3>
                  </div>

                  <ol className="space-y-2 flex-1 mb-5">
                    {path.steps.map((step, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm text-slate-400">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: `${path.color}12`, color: path.color }}
                        >
                          {j + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>

                  {"to" in path.cta ? (
                    <Link
                      to={path.cta.to as string}
                      className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                      style={{ color: path.color }}
                    >
                      {path.cta.label} <ArrowRight size={12} />
                    </Link>
                  ) : null}
                </div>
              </FadeUp>
            );
          })}
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
          headline="Can't find what you need?"
          subline="Open an issue on GitHub or browse the contributor guide. The docs are open-source and contributions are welcome."
          primary={{ label: "Open a GitHub Issue", href: `${GITHUB}/issues` }}
          secondary={{ label: "Contributor Guide",  href: `${GITHUB}/blob/main/CONTRIBUTING.md` }}
          tertiary={{ label: "API Docs",            href: "/api/docs" }}
        />
      </div>
    </section>
  );
}

export default function DocsPage() {
  return (
    <div style={{ background: "#050814", color: "#F8FAFC", minHeight: "100vh" }}>
      <PublicHeader />
      <main id="main-content">
        <Hero />
        <DocCards />
        <QuickstartPaths />
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
