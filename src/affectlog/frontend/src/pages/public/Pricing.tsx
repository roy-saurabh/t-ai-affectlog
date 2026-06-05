import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Server, Cloud, Building2, Globe } from "lucide-react";
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

const TIERS = [
  {
    name: "Community Edition",
    icon: Server,
    price: "Free",
    priceNote: "Open source · MIT License",
    color: "#67E8F9",
    cta: { label: "Deploy Community Edition", to: "/community" },
    features: [
      "Full dataset audit pipeline",
      "xAPI normalization",
      "PII scanning & pseudonymisation",
      "Fairness & concentration metrics",
      "Model adapters & explainability",
      "Assessment recipes (YAML)",
      "OpenAPI backend",
      "RBAC + admin approval",
      "Docker Compose deployment",
      "Self-hosted data control",
      "Community GitHub support",
    ],
    excluded: [
      "Managed infrastructure",
      "Hosted backups",
      "Multi-tenant provisioning",
      "Support SLA",
    ],
  },
  {
    name: "Managed Cloud",
    icon: Cloud,
    price: "Contact",
    priceNote: "Hosted by AffectLog",
    color: "#C4B5FD",
    highlight: true,
    cta: { label: "Request Managed Access", to: "/request-access" },
    features: [
      "All Community Edition features",
      "AffectLog-operated infrastructure",
      "Multi-tenant workspace provisioning",
      "Admin-approved user onboarding",
      "Managed backups & artifact storage",
      "Platform monitoring & health checks",
      "Managed email & SMTP",
      "Usage metering & quotas",
      "Support & upgrade path",
      "Platform-level audit trail",
    ],
    badge: "Recommended",
  },
  {
    name: "Private Tenant",
    icon: Building2,
    price: "Configure",
    priceNote: "Dedicated deployment",
    color: "#93C5FD",
    cta: { label: "Talk to AffectLog", to: "/request-access" },
    features: [
      "All Managed Cloud features",
      "Single-organization tenant",
      "Custom domain",
      "Isolated artifact storage",
      "Custom data retention policy",
      "Dedicated support channel",
    ],
  },
  {
    name: "BYOC / On-prem",
    icon: Globe,
    price: "Configure",
    priceNote: "Bring-your-own-cloud",
    color: "#86EFAC",
    cta: { label: "Talk to AffectLog", to: "/request-access" },
    features: [
      "Community Edition core",
      "AffectLog deployment support",
      "Cloud provider of your choice",
      "On-premise institutional support",
      "Custom SLA and governance",
      "Annual support agreement",
    ],
  },
];

function Hero() {
  return (
    <section
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #070B1A 0%, #0B1224 100%)" }}
    >
      <GridBackground />
      <GlowOrb color="violet" size={600} x="75%" y="30%" opacity={0.35} />

      <div className="relative max-w-3xl mx-auto px-5 md:px-8 text-center">
        <FadeUp>
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
            style={{ color: "#C4B5FD", background: "rgba(196,181,253,0.08)", border: "1px solid rgba(196,181,253,0.22)" }}
          >
            Pricing & Editions
          </div>
          <h1
            className="font-bold text-white mb-5 leading-tight tracking-tight"
            style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)", letterSpacing: "-0.03em" }}
          >
            Choose how you want to run AffectLog
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Self-host the open-source core, use AffectLog-managed cloud, request a private
            tenant, or deploy with institutional support.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

function PricingTiers() {
  return (
    <section className="py-12 md:py-16" style={{ background: "#0B1224" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {TIERS.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <FadeUp key={tier.name} delay={i * 0.06}>
                <div
                  className="rounded-2xl p-6 h-full flex flex-col border relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: tier.highlight ? `${tier.color}05` : "rgba(255,255,255,0.025)",
                    borderColor: tier.highlight ? `${tier.color}30` : "rgba(203,213,225,0.10)",
                  }}
                >
                  {tier.badge && (
                    <div
                      className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: `${tier.color}15`, color: tier.color, border: `1px solid ${tier.color}30` }}
                    >
                      {tier.badge}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${tier.color}14` }}>
                      <Icon size={16} style={{ color: tier.color }} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{tier.name}</h3>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="text-3xl font-bold text-white" style={{ color: tier.color }}>{tier.price}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{tier.priceNote}</div>
                  </div>

                  <ul className="space-y-2 flex-1 mb-6">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" style={{ color: tier.color }} />
                        {f}
                      </li>
                    ))}
                    {tier.excluded?.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 flex-shrink-0 w-3">—</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={tier.cta.to}
                    className="inline-flex items-center justify-center gap-2 font-semibold text-white rounded-xl px-4 py-2.5 text-sm transition-all border"
                    style={{
                      background: tier.highlight
                        ? `linear-gradient(135deg, #C4B5FD 0%, #D8B4FE 100%)`
                        : "rgba(255,255,255,0.04)",
                      borderColor: tier.highlight ? "transparent" : `${tier.color}35`,
                      boxShadow: tier.highlight ? "0 4px 14px rgba(196,181,253,0.25)" : "none",
                    }}
                  >
                    {tier.cta.label} <ArrowRight size={13} />
                  </Link>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeatureComparison() {
  const categories = [
    {
      name: "Core Assessment",
      rows: [
        { label: "Dataset audit pipeline",        ce: true,  mc: true,  pt: true,  byoc: true  },
        { label: "xAPI normalization",             ce: true,  mc: true,  pt: true,  byoc: true  },
        { label: "PII scanning",                   ce: true,  mc: true,  pt: true,  byoc: true  },
        { label: "Fairness & concentration",       ce: true,  mc: true,  pt: true,  byoc: true  },
        { label: "Model adapters",                 ce: true,  mc: true,  pt: true,  byoc: true  },
        { label: "OpenAPI endpoints",              ce: true,  mc: true,  pt: true,  byoc: true  },
      ],
    },
    {
      name: "Deployment & Operations",
      rows: [
        { label: "Docker Compose self-hosted",     ce: true,  mc: false, pt: false, byoc: true  },
        { label: "Managed hosting",                ce: false, mc: true,  pt: true,  byoc: false },
        { label: "Managed backups",                ce: false, mc: true,  pt: true,  byoc: false },
        { label: "Platform monitoring",            ce: false, mc: true,  pt: true,  byoc: "Optional" },
        { label: "Custom domain",                  ce: false, mc: false, pt: true,  byoc: true  },
        { label: "Bring your own cloud",           ce: false, mc: false, pt: false, byoc: true  },
      ],
    },
    {
      name: "Support",
      rows: [
        { label: "Community GitHub support",       ce: true,  mc: true,  pt: true,  byoc: true  },
        { label: "AffectLog support SLA",          ce: false, mc: true,  pt: true,  byoc: "Annual" },
        { label: "Dedicated support channel",      ce: false, mc: false, pt: true,  byoc: "Annual" },
        { label: "Custom SLA",                     ce: false, mc: false, pt: "Possible", byoc: true },
      ],
    },
  ];

  const headers = ["Community", "Managed Cloud", "Private Tenant", "BYOC / On-prem"];
  const colors  = ["#67E8F9",  "#C4B5FD",       "#93C5FD",        "#86EFAC"];

  return (
    <section className="py-24 md:py-28" style={{ background: "#070B1A" }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Detailed comparison</h2>
            <p className="text-slate-400">All editions run the same open-source core.</p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(203,213,225,0.12)" }}>
            {/* Header */}
            <div className="grid grid-cols-5 px-5 py-3" style={{ background: "rgba(11,16,32,0.8)" }}>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Feature</div>
              {headers.map((h, i) => (
                <div key={h} className="text-center text-xs font-semibold uppercase tracking-widest" style={{ color: colors[i] }}>
                  {h.split(" ")[0]}
                </div>
              ))}
            </div>

            {categories.map((cat, ci) => (
              <div key={cat.name}>
                <div
                  className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-slate-500"
                  style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(203,213,225,0.07)" }}
                >
                  {cat.name}
                </div>
                {cat.rows.map((row, ri) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-5 px-5 py-3 text-sm border-t"
                    style={{
                      borderColor: "rgba(203,213,225,0.07)",
                      background: ri % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                    }}
                  >
                    <div className="text-slate-300">{row.label}</div>
                    {[row.ce, row.mc, row.pt, row.byoc].map((v, vi) => (
                      <div key={vi} className="text-center">
                        {v === true  ? <CheckCircle2 size={14} className="mx-auto" style={{ color: colors[vi] }} />
                         : v === false ? <span className="text-slate-700">—</span>
                         : <span className="text-xs" style={{ color: colors[vi] }}>{String(v)}</span>}
                      </div>
                    ))}
                  </div>
                ))}
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
          headline="Choose your deployment model"
          subline="All editions run the same assessment workflows. The difference is who operates the infrastructure."
          primary={{ label: "Request Managed Access", to: "/request-access" }}
          secondary={{ label: "Deploy Community Edition", to: "/community" }}
          tertiary={{ label: "Read Self-host Guide", to: "/self-host" }}
        />
      </div>
    </section>
  );
}

export default function PricingPage() {
  return (
    <div style={{ background: "#070B1A", color: "#F8FAFC", minHeight: "100vh" }}>
      <PublicHeader />
      <main id="main-content">
        <Hero />
        <PricingTiers />
        <FeatureComparison />
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
