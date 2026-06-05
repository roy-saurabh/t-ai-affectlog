import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Lock, CheckCircle2, ArrowRight, ExternalLink,
  Eye, Key, AlertTriangle, Fingerprint, FileText, Server,
  Users, Activity, ShieldCheck,
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

function Hero() {
  return (
    <section
      className="relative min-h-[72vh] flex items-center overflow-hidden"
      style={{ background: "radial-gradient(circle at 20% 50%, rgba(16,185,129,0.10), transparent 40%), linear-gradient(180deg, #050814 0%, #080D1F 100%)" }}
    >
      <GridBackground />
      <GlowOrb color="green" size={600} x="80%" y="30%" opacity={0.45} />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 lg:px-10 py-20 w-full">
        <div className="max-w-3xl">
          <FadeUp delay={0.04}>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
              style={{ color: "#10b981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.22)" }}
            >
              <Shield size={11} />
              Privacy-first architecture
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1
              className="font-bold text-white mb-5 leading-tight tracking-tight"
              style={{ fontSize: "clamp(2.6rem, 5vw, 4rem)", letterSpacing: "-0.03em" }}
            >
              Privacy-first assessment infrastructure
            </h1>
          </FadeUp>

          <FadeUp delay={0.17}>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Designed around admin-approved access, RBAC, tenant boundaries, pseudonymisation,
              audit logs, raw-export guardrails, and secure artifact handling.
            </p>
          </FadeUp>

          <FadeUp delay={0.23}>
            <div className="flex flex-wrap gap-3">
              <a
                href={`${GITHUB}/blob/main/SECURITY.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-white rounded-xl px-6 py-3.5 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #059669, #0891b2)", boxShadow: "0 6px 20px rgba(16,185,129,0.25)" }}
              >
                Read Security Policy <ExternalLink size={15} />
              </a>
              <Link
                to="/request-access"
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white px-5 py-3.5 text-sm transition-colors"
              >
                Request Security Review <ArrowRight size={13} />
              </Link>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

const SECURITY_PILLARS = [
  {
    icon: Key,
    title: "Authentication",
    color: "#22d3ee",
    items: [
      "Email + password with bcrypt hashing",
      "MFA-ready architecture",
      "Email verification before activation",
      "Admin-approved registration workflow",
      "Secure password reset with expiring tokens",
      "Session invalidation on logout",
    ],
  },
  {
    icon: Users,
    title: "RBAC",
    color: "#a78bfa",
    items: [
      "Role-based access: Super Admin, Admin, Reviewer, Viewer",
      "Granular permission matrices per resource",
      "Tenant-scoped roles in managed edition",
      "Admin-only user management",
      "Principle of least privilege by default",
      "Role assignment requires admin approval",
    ],
  },
  {
    icon: Fingerprint,
    title: "Pseudonymisation",
    color: "#10b981",
    items: [
      "Actor IDs replaced with HMAC-hashed pseudonyms",
      "Configurable hash salt per deployment",
      "Original identifiers never stored in artifact outputs",
      "Pseudonymisation applied at normalization step",
      "Field-level suppression for high-risk PII",
      "Re-identification risk flags in privacy report",
    ],
  },
  {
    icon: Activity,
    title: "Audit Logging",
    color: "#38bdf8",
    items: [
      "All admin actions logged with timestamp and actor",
      "User registration, approval, and role changes logged",
      "Audit log retention configurable",
      "Read-only admin audit log view",
      "Immutable log entries once written",
      "Export audit log as CSV",
    ],
  },
  {
    icon: FileText,
    title: "Artifact Security",
    color: "#fbbf24",
    items: [
      "No raw dataset bytes in any export payload",
      "Artifact access scoped to workspace",
      "Artifact storage isolated per tenant (managed)",
      "Download audit trail for sensitive artifacts",
      "SOPs and JSON-LD graphs are metadata-only",
      "Artifact deletion respects tenant scope",
    ],
  },
  {
    icon: Eye,
    title: "Support Access Controls",
    color: "#f87171",
    items: [
      "AffectLog staff access to tenant data requires approval",
      "Support access sessions are logged and auditable",
      "No persistent staff access to tenant workspaces",
      "Access requests expire after defined period",
      "Client can revoke support access at any time",
      "All support actions visible in audit log",
    ],
  },
];

function SecurityPillars() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#050814" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Security model</h2>
            <p className="text-lg text-slate-400">Six layers of privacy and access protection across every deployment.</p>
          </div>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SECURITY_PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <FadeUp key={pillar.title} delay={i * 0.05}>
                <div
                  className="rounded-2xl p-6 border h-full"
                  style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(148,163,184,0.10)" }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${pillar.color}14` }}>
                      <Icon size={15} style={{ color: pillar.color }} aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-white">{pillar.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {pillar.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                        <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" style={{ color: pillar.color }} aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PrivacyByDefault() {
  const transforms = [
    { from: "Raw actor identifier", to: "HMAC-SHA256 pseudonym", color: "#22d3ee" },
    { from: "Personal name field",  to: "Suppressed / redacted",  color: "#10b981" },
    { from: "Email address",        to: "Flagged PII, excluded",  color: "#f87171" },
    { from: "Aggregate counts",     to: "Exported as metric only",color: "#a78bfa" },
  ];

  return (
    <section className="py-24 md:py-28" style={{ background: "#080D1F" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <FadeUp>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
              style={{ color: "#10b981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.20)" }}
            >
              Privacy-by-default
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">
              Raw data never leaves. Metadata only.
            </h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              AffectLog's output model is privacy-preserving by design. No raw records
              appear in any export, API response, or artifact. Only aggregate metrics,
              pseudonymised schemas, and structured compliance metadata are produced.
            </p>
            <div className="space-y-3">
              {[
                "No raw dataset bytes in SOPs or JSON-LD outputs",
                "No actor identifiers in any exported artifact",
                "PII fields flagged, suppressed, or pseudonymised",
                "Dataset never retained beyond the processing session (Community)",
                "Artifacts are metadata manifests, not data extracts",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div
              className="rounded-2xl p-6 border"
              style={{ background: "rgba(11,16,32,0.7)", borderColor: "rgba(16,185,129,0.18)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">Privacy transformation</p>
              <div className="space-y-3">
                {transforms.map((t) => (
                  <div key={t.from} className="flex items-center gap-3">
                    <div
                      className="flex-1 px-3 py-2.5 rounded-lg text-xs font-mono text-slate-400"
                      style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }}
                    >
                      {t.from}
                    </div>
                    <ArrowRight size={13} className="text-slate-600 flex-shrink-0" />
                    <div
                      className="flex-1 px-3 py-2.5 rounded-lg text-xs font-mono"
                      style={{ background: `${t.color}0a`, border: `1px solid ${t.color}25`, color: t.color }}
                    >
                      {t.to}
                    </div>
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

function Disclosure() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#050814" }}>
      <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
        <FadeUp>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.20)" }}>
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Responsible disclosure</h2>
          <p className="text-slate-400 mb-6 leading-relaxed max-w-2xl mx-auto">
            If you discover a security vulnerability, please report it via GitHub Security Advisories.
            Do not file a public issue. We will acknowledge reports within 48 hours and work to
            resolve confirmed vulnerabilities within a reasonable timeframe.
          </p>
          <a
            href={`${GITHUB}/security/advisories/new`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-semibold text-white px-6 py-3 rounded-xl transition-all hover:-translate-y-px"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
          >
            <AlertTriangle size={15} /> Report a vulnerability <ExternalLink size={13} />
          </a>
        </FadeUp>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 md:py-24" style={{ background: "#080D1F" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <CTABand
          headline="Questions about the security model?"
          subline="Request a security review, read the full security policy, or explore RBAC documentation before requesting access."
          primary={{ label: "Request Managed Access",  to: "/request-access" }}
          secondary={{ label: "Read Security Policy", href: `${GITHUB}/blob/main/SECURITY.md` }}
          tertiary={{ label: "Review RBAC Model",     href: `${GITHUB}/blob/main/docs/rbac-model.md` }}
        />
      </div>
    </section>
  );
}

export default function SecurityPage() {
  return (
    <div style={{ background: "#050814", color: "#F8FAFC", minHeight: "100vh" }}>
      <PublicHeader />
      <main id="main-content">
        <Hero />
        <SecurityPillars />
        <PrivacyByDefault />
        <Disclosure />
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
