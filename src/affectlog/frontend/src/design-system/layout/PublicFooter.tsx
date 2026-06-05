import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Github, ChevronDown, ArrowRight, Server, Cloud } from "lucide-react";
import { cn } from "../cn";

const GITHUB = "https://github.com/roy-saurabh/edge_affectlog";
const DOCS   = `${GITHUB}/blob/main/docs`;

const FOOTER_COLS = [
  {
    title: "Product",
    links: [
      { label: "Overview",           to: "/product" },
      { label: "Guided Assessment",  to: "/guided-assessment" },
      { label: "Dataset Audit",      to: "/dataset-audit" },
      { label: "Model Assessment",   to: "/model-assessment" },
      { label: "Compliance Exports", to: "/compliance-exports" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Community Edition", to: "/community" },
      { label: "Managed Cloud",     to: "/cloud" },
      { label: "Security",          to: "/security" },
      { label: "OpenAPI",           to: "/openapi" },
      { label: "Pricing",           to: "/pricing" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "GitHub",            href: GITHUB },
      { label: "Contributor Guide", href: `${GITHUB}/blob/main/CONTRIBUTING.md` },
      { label: "API Docs",          href: "/api/docs" },
      { label: "Assessment Recipes",to: "/developers" },
      { label: "Model Adapters",    href: `${DOCS}/model-adapters.md` },
    ],
  },
  {
    title: "Ecosystem",
    links: [
      { label: "Prometheus-X BB04",   to: "/ecosystem" },
      { label: "CARiSMA",             href: `${DOCS}/carisma-lola-interoperability.md` },
      { label: "LOLA",                href: `${DOCS}/carisma-lola-interoperability.md` },
      { label: "EDGE-Skills",         href: "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/how-to-participate/org-details/883807838/project/101123471/program/43152860/details" },
    ],
  },
  {
    title: "Documentation",
    links: [
      { label: "Docs Hub",         to: "/docs" },
      { label: "Self-host Guide",  to: "/self-host" },
      { label: "Architecture",     href: `${DOCS}/saas-architecture.md` },
      { label: "Security Model",   to: "/security" },
      { label: "Data Governance",  href: `${DOCS}/data-governance.md` },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "License (MIT)",    href: `${GITHUB}/blob/main/LICENSE` },
      { label: "Security Policy",  href: `${GITHUB}/blob/main/SECURITY.md` },
      { label: "Governance",       href: `${DOCS}/data-governance.md` },
      { label: "CITATION.cff",     href: `${GITHUB}/blob/main/CITATION.cff` },
      { label: "Disclosure",       to: "/security" },
    ],
  },
];

function FooterLink({ link }: { link: { label: string; to?: string; href?: string } }) {
  const cls =
    "text-sm text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:underline";
  if (link.to)
    return <Link to={link.to} className={cls}>{link.label}</Link>;
  const ext = link.href && !link.href.startsWith("/");
  return (
    <a
      href={link.href ?? "#"}
      target={ext ? "_blank" : undefined}
      rel={ext ? "noopener noreferrer" : undefined}
      className={cls}
    >
      {link.label}
      {ext && <ExternalLink size={10} className="opacity-30 flex-shrink-0" />}
    </a>
  );
}

// ── Mobile accordion col ─────────────────────────────────────────────────
function FooterAccordion({ col }: { col: (typeof FOOTER_COLS)[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "rgba(148,163,184,0.10)" }}>
      <button
        className="flex items-center justify-between w-full py-3.5 text-left text-sm font-semibold text-slate-400 uppercase tracking-widest"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {col.title}
        <ChevronDown
          size={14}
          className={cn("transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      <AnimateWrapper open={open}>
        <ul className="pb-4 space-y-2.5">
          {col.links.map((link) => (
            <li key={link.label}>
              <FooterLink link={link} />
            </li>
          ))}
        </ul>
      </AnimateWrapper>
    </div>
  );
}

function AnimateWrapper({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden transition-all duration-300"
      style={{ maxHeight: open ? "400px" : "0", opacity: open ? 1 : 0 }}
    >
      {children}
    </div>
  );
}

// ── Main footer ───────────────────────────────────────────────────────────
export function PublicFooter() {
  return (
    <footer
      style={{ background: "#050814", borderTop: "1px solid rgba(148,163,184,0.09)" }}
      aria-label="Site footer"
    >
      {/* ── CTA Band ───────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "#080D1F", borderBottom: "1px solid rgba(148,163,184,0.09)" }}
      >
        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
          aria-hidden="true"
        />
        {/* Glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-40 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(34,211,238,0.07) 0%, transparent 70%)" }}
          aria-hidden="true"
        />

        <div className="relative max-w-4xl mx-auto px-6 py-14 md:py-20 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
            Start a privacy-preserving AI assessment workflow
          </h2>
          <p className="text-slate-400 mb-8 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Self-host the open-source core or request an AffectLog-managed environment for hosted operations,
            onboarding, monitoring, and support.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/request-access"
              className="inline-flex items-center gap-2 font-semibold text-white px-6 py-3 rounded-xl transition-all duration-200 hover:-translate-y-px"
              style={{
                background: "linear-gradient(135deg, #06b6d4, #0ea5e9)",
                boxShadow: "0 4px 14px rgba(34,211,238,0.25)",
              }}
            >
              Request Managed Access <ArrowRight size={15} />
            </Link>
            <Link
              to="/self-host"
              className="inline-flex items-center gap-2 font-semibold text-slate-200 px-6 py-3 rounded-xl border transition-all duration-200 hover:bg-white/[0.06] hover:border-slate-400/40"
              style={{ borderColor: "rgba(148,163,184,0.22)", background: "rgba(255,255,255,0.04)" }}
            >
              <Server size={15} /> Deploy Community Edition
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white px-5 py-3 text-sm rounded-xl hover:bg-white/[0.04] transition-all"
            >
              View Documentation <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main footer body ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-14">

        {/* Brand row */}
        <div className="flex flex-col md:flex-row md:items-start gap-8 mb-10">
          <div className="flex-shrink-0 max-w-xs">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group" aria-label="AffectLog">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #22d3ee, #0ea5e9)" }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="3" fill="white" opacity="0.9" />
                  <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.2" strokeOpacity="0.4" />
                </svg>
              </div>
              <span className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">AffectLog</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              Open-source and managed Trustworthy AI assessment for education and skills data spaces.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <a
                href={GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Github size={14} /> GitHub
              </a>
              <a
                href="/api/docs"
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                API Docs
              </a>
            </div>
          </div>

          {/* EU funding note */}
          <div className="md:ml-auto max-w-sm">
            <p className="text-xs text-slate-600 leading-relaxed">
              This project has received funding from the Digital Europe Programme under the EDGE-Skills
              project (grant agreement 101123471). Views expressed are those of the authors and do not
              necessarily reflect those of the European Commission.
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              <a
                href="https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/how-to-participate/org-details/883807838/project/101123471/program/43152860/details"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1"
              >
                EDGE-Skills <ExternalLink size={9} />
              </a>
              <span className="text-slate-700" aria-hidden="true">·</span>
              <a
                href="https://prometheus-x.org/bb04-trustworthy-ai-assessment/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1"
              >
                Prometheus-X BB04 <ExternalLink size={9} />
              </a>
              <span className="text-slate-700" aria-hidden="true">·</span>
              <span className="text-xs text-slate-600">Prometheus-X BB04</span>
            </div>
          </div>
        </div>

        {/* Accent line */}
        <div className="accent-line-trust mb-10" role="separator" />

        {/* Link columns — desktop */}
        <nav className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-8 mb-12" aria-label="Footer links">
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Link columns — mobile accordion */}
        <nav className="md:hidden mb-8 divide-y-0" aria-label="Footer links mobile">
          {FOOTER_COLS.map((col) => (
            <FooterAccordion key={col.title} col={col} />
          ))}
        </nav>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600"
          style={{ borderTop: "1px solid rgba(148,163,184,0.07)" }}
        >
          <p>
            AffectLog Community Edition is released under the{" "}
            <a
              href={`${GITHUB}/blob/main/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-400 underline underline-offset-2"
            >
              MIT License
            </a>
            .{" "}
            Managed Edition services may include proprietary operational components.
          </p>
          <p className="flex-shrink-0 text-slate-700">
            Raw datasets never committed · Synthetic samples provided
          </p>
        </div>
      </div>
    </footer>
  );
}
