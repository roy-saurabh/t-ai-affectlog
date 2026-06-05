import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Cloud, ArrowRight, CheckCircle2, Shield, BarChart2,
  Server, Lock, Users, Activity, Database, FileText, GitBranch,
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

function Hero() {
  return (
    <section
      className="relative min-h-[80vh] flex items-center overflow-hidden"
      style={{ background: "radial-gradient(circle at 20% 50%, rgba(196,181,253,0.15), transparent 40%), linear-gradient(180deg, #070B1A 0%, #111A31 100%)" }}
    >
      <GridBackground />
      <GlowOrb color="violet" size={700} x="80%" y="30%" opacity={0.5} />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 lg:px-10 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <FadeUp delay={0.04}>
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
                style={{ color: "#C4B5FD", background: "rgba(196,181,253,0.08)", border: "1px solid rgba(196,181,253,0.22)" }}
              >
                <Cloud size={11} />
                Managed by AffectLog
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h1
                className="font-bold text-white mb-5 leading-tight tracking-tight"
                style={{ fontSize: "clamp(2.6rem, 5vw, 4rem)", letterSpacing: "-0.03em" }}
              >
                Managed Trustworthy AI assessment, operated by AffectLog
              </h1>
            </FadeUp>

            <FadeUp delay={0.17}>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-[520px]">
                Use the same open-source core with hosted operations, tenant onboarding,
                RBAC, monitoring, backups, support workflows, and organization-ready governance.
              </p>
            </FadeUp>

            <FadeUp delay={0.23}>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/request-access"
                  className="inline-flex items-center gap-2 font-semibold text-white rounded-xl px-6 py-3.5 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #C4B5FD 0%, #D8B4FE 100%)", boxShadow: "0 6px 20px rgba(196,181,253,0.28)" }}
                >
                  Request Managed Access <ArrowRight size={17} />
                </Link>
                <Link
                  to="/community"
                  className="inline-flex items-center gap-2 font-semibold text-slate-200 rounded-xl px-6 py-3.5 border transition-all hover:bg-white/[0.06]"
                  style={{ borderColor: "rgba(203,213,225,0.22)", background: "rgba(255,255,255,0.04)" }}
                >
                  Compare Editions
                </Link>
              </div>
            </FadeUp>
          </div>

          {/* Features grid */}
          <FadeUp delay={0.2}>
            <div
              className="rounded-2xl p-6 border"
              style={{ background: "rgba(11,16,32,0.7)", borderColor: "rgba(196,181,253,0.20)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">Managed Edition includes</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Multi-tenant workspaces",    "#C4B5FD"],
                  ["Admin-approved onboarding",  "#86EFAC"],
                  ["Managed backups",            "#67E8F9"],
                  ["Platform monitoring",        "#93C5FD"],
                  ["Support & upgrade path",     "#C4B5FD"],
                  ["Managed email / SMTP",       "#86EFAC"],
                  ["Audit trail",                "#67E8F9"],
                  ["Usage metering",             "#93C5FD"],
                ].map(([label, color]) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-sm text-slate-300">{label}</span>
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

const WHY_MANAGED = [
  { icon: Cloud,     title: "No infrastructure to run",         desc: "We provision, operate, and upgrade the platform. Focus on assessments, not Kubernetes.", color: "#C4B5FD" },
  { icon: Users,     title: "Tenant isolation",                 desc: "Separate workspaces, credentials, and artifact storage per organization.",               color: "#67E8F9" },
  { icon: Shield,    title: "Admin-approved onboarding",        desc: "All user registrations require explicit admin approval before access is granted.",        color: "#86EFAC" },
  { icon: Activity,  title: "Monitoring and backups",           desc: "Automated health checks, artifact backups, and incident notification.",                  color: "#93C5FD" },
  { icon: Lock,      title: "Support access governance",        desc: "AffectLog staff access is auditable, scoped, and requires approval.",                   color: "#86EFAC" },
  { icon: GitBranch, title: "Managed upgrades",                 desc: "Platform updates are applied by AffectLog with no client-side disruption.",              color: "#C4B5FD" },
];

function WhyManaged() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#070B1A" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              All the workflows. None of the infrastructure.
            </h2>
            <p className="text-lg text-slate-400">
              Built on the same open-source core as Community Edition, operated by AffectLog.
            </p>
          </div>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_MANAGED.map((item, i) => {
            const Icon = item.icon;
            return (
              <FadeUp key={item.title} delay={i * 0.05}>
                <div
                  className="rounded-2xl p-6 border h-full transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(203,213,225,0.10)" }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${item.color}14` }}>
                    <Icon size={16} style={{ color: item.color }} aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-slate-200 mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function OnboardingFlow() {
  const steps = [
    { step: 1, title: "Submit access request",     desc: "Tell us about your organization, assessment needs, and data volume.",      color: "#C4B5FD" },
    { step: 2, title: "AffectLog review",          desc: "We review your request and security requirements within a business day.",  color: "#67E8F9" },
    { step: 3, title: "Tenant provisioned",        desc: "Dedicated workspace created with isolated storage and credentials.",       color: "#86EFAC" },
    { step: 4, title: "Admin approval flow active",desc: "Your admin can approve team members and manage workspace access.",        color: "#93C5FD" },
    { step: 5, title: "Start guided assessment",   desc: "Upload datasets, run the wizard, and generate your first audit artifacts.", color: "#C4B5FD" },
  ];

  return (
    <section className="py-24 md:py-28" style={{ background: "#0B1224" }}>
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Admin-controlled access, from day one
            </h2>
            <p className="text-slate-400">The onboarding process is intentionally gated and auditable.</p>
          </div>
        </FadeUp>

        <div className="space-y-0">
          {steps.map((s, i) => (
            <FadeUp key={s.step} delay={i * 0.06}>
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: `${s.color}14`, border: `1px solid ${s.color}40`, color: s.color }}
                  >
                    {s.step}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 my-1" style={{ background: `${s.color}20`, minHeight: "24px" }} />
                  )}
                </div>
                <div className="pt-1 pb-5">
                  <p className="font-semibold text-slate-200 mb-1">{s.title}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 md:py-24" style={{ background: "#070B1A" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <CTABand
          headline="Request a managed AffectLog environment"
          subline="Tell us about your organization and assessment needs. We'll review and provision a dedicated tenant for your team."
          primary={{ label: "Request Managed Access", to: "/request-access" }}
          secondary={{ label: "Compare Editions",     to: "/community" }}
          tertiary={{ label: "Read Security Model",   to: "/security" }}
        />
      </div>
    </section>
  );
}

export default function ManagedCloud() {
  return (
    <div style={{ background: "#070B1A", color: "#F8FAFC", minHeight: "100vh" }}>
      <PublicHeader />
      <main id="main-content">
        <Hero />
        <WhyManaged />
        <OnboardingFlow />
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
