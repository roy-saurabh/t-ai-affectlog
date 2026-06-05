import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Server, CheckCircle2, ArrowRight, ExternalLink, Terminal,
  Database, Lock, Shield, GitBranch, Package,
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
      className="relative min-h-[76vh] flex items-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #050814 0%, #080D1F 100%)" }}
    >
      <GridBackground />
      <GlowOrb color="cyan" size={500} x="80%" y="25%" opacity={0.4} />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 lg:px-10 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <FadeUp delay={0.04}>
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
                style={{ color: "#22d3ee", background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.22)" }}
              >
                <Server size={11} />
                Self-hosted deployment
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1
                className="font-bold text-white mb-5 leading-tight tracking-tight"
                style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)", letterSpacing: "-0.03em" }}
              >
                Deploy AffectLog where your data already lives
              </h1>
            </FadeUp>
            <FadeUp delay={0.17}>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-[520px]">
                Run the Community Edition with Docker Compose, PostgreSQL, Redis, local storage,
                and privacy-preserving defaults. Data stays under your control.
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
                  Start Self-hosting <ArrowRight size={17} />
                </a>
                <Link
                  to="/security"
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white px-5 py-3.5 text-sm transition-colors"
                >
                  Security Checklist <ArrowRight size={13} />
                </Link>
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.25}>
            <CodeBlock
              label="docker-compose.yml stack"
              lines={[
                { text: "services:", color: "#94a3b8" },
                { text: "  api:       # FastAPI backend",     color: "#22d3ee" },
                { text: "  worker:    # Celery async jobs",   color: "#a78bfa" },
                { text: "  frontend:  # React 18 + Vite",     color: "#38bdf8" },
                { text: "  postgres:  # PostgreSQL 15",       color: "#34d399" },
                { text: "  redis:     # Job queue + cache",   color: "#fbbf24" },
                { text: "  nginx:     # Reverse proxy",       color: "#94a3b8" },
                { text: "", color: "#475569" },
                { text: "# Single command startup:", color: "#475569" },
                { text: "docker compose up -d", color: "#22d3ee" },
              ]}
            />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

const REQUIREMENTS = [
  { label: "Docker Engine 24+",       icon: Terminal, color: "#22d3ee" },
  { label: "Docker Compose v2",       icon: Package,  color: "#22d3ee" },
  { label: "4 GB RAM minimum",        icon: Server,   color: "#38bdf8" },
  { label: "10 GB disk (data vol.)",  icon: Database, color: "#a78bfa" },
  { label: "PostgreSQL (bundled)",    icon: Database, color: "#34d399" },
  { label: "Redis (bundled)",         icon: GitBranch,color: "#fbbf24" },
  { label: "SMTP (optional)",         icon: Lock,     color: "#64748b" },
  { label: "Linux / macOS / WSL2",    icon: Terminal, color: "#22d3ee" },
];

function Requirements() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#050814" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">Requirements</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              AffectLog Community Edition runs on any machine with Docker Engine and Compose.
              PostgreSQL and Redis are bundled in the Compose stack — no separate installation required.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {REQUIREMENTS.map((req) => {
                const Icon = req.icon;
                return (
                  <div
                    key={req.label}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl border"
                    style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(148,163,184,0.10)" }}
                  >
                    <Icon size={13} style={{ color: req.color }} className="flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm text-slate-300">{req.label}</span>
                  </div>
                );
              })}
            </div>
          </FadeUp>

          <FadeUp delay={0.12}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">Quick setup</h2>
            <div className="space-y-4">
              {[
                { step: 1, title: "Clone repository",       cmd: "git clone https://github.com/roy-saurabh/edge_affectlog", color: "#22d3ee" },
                { step: 2, title: "Start services",         cmd: "docker compose up -d",                                     color: "#34d399" },
                { step: 3, title: "Create admin account",   cmd: "make create-admin",                                        color: "#a78bfa" },
                { step: 4, title: "Seed demo scenarios",    cmd: "make seed",                                                 color: "#38bdf8" },
                { step: 5, title: "Open in browser",        cmd: "http://localhost:3000",                                     color: "#22d3ee" },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: `${s.color}14`, border: `1px solid ${s.color}35`, color: s.color }}
                  >
                    {s.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200 mb-1">{s.title}</p>
                    <code
                      className="text-xs font-mono px-2 py-1 rounded"
                      style={{ background: "rgba(0,0,0,0.4)", color: s.color, border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      {s.cmd}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function SecurityHardening() {
  const checks = [
    "Change default admin credentials immediately",
    "Configure SMTP for real email verification",
    "Set strong SECRET_KEY environment variable",
    "Restrict network access to non-public ports",
    "Enable HTTPS with a reverse-proxy TLS certificate",
    "Review CORS settings for your domain",
    "Enable database backups for artifact data",
    "Monitor logs for failed login attempts",
  ];

  return (
    <section className="py-24 md:py-28" style={{ background: "#080D1F" }}>
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Security hardening checklist</h2>
            <p className="text-slate-400">Before exposing to the network or allowing non-admin users.</p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div
            className="rounded-2xl p-6 border"
            style={{ background: "rgba(11,16,32,0.8)", borderColor: "rgba(148,163,184,0.12)" }}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              {checks.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <Shield size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5" style={{ borderTop: "1px solid rgba(148,163,184,0.08)" }}>
              <a
                href={`${GITHUB}/blob/main/SECURITY.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Full security policy <ExternalLink size={12} />
              </a>
            </div>
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
          headline="Ready to deploy?"
          subline="Clone the repository and start your first assessment in under 10 minutes with Docker Compose."
          primary={{ label: "View GitHub Repository", href: GITHUB }}
          secondary={{ label: "Community Edition",    to: "/community" }}
          tertiary={{ label: "Request Managed Cloud", to: "/request-access" }}
        />
      </div>
    </section>
  );
}

export default function SelfHost() {
  return (
    <div style={{ background: "#050814", color: "#F8FAFC", minHeight: "100vh" }}>
      <PublicHeader />
      <main id="main-content">
        <Hero />
        <Requirements />
        <SecurityHardening />
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
