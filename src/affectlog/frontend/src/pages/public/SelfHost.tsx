import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Server, CheckCircle2, ArrowRight, ExternalLink, Terminal, AlertTriangle } from "lucide-react";
import { PublicHeader } from "../../components/public/PublicHeader";
import { PublicFooter } from "../../components/public/PublicFooter";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.45 },
};
function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return <motion.div {...fadeUp} transition={{ duration: 0.45, delay }} className={className}>{children}</motion.div>;
}

const PREREQUISITES = [
  "Docker Engine 24+ and Docker Compose v2",
  "4 GB RAM minimum (8 GB recommended for 1M-row processing)",
  "PostgreSQL 15 (managed via Docker Compose)",
  "Redis 7 (managed via Docker Compose)",
  "SMTP credentials (Gmail app password supported)",
  "Domain name (optional for production)",
];

const PROD_CHECKLIST = [
  { item: "Set SECRET_KEY to a 64-char random value", critical: true },
  { item: "Set ALLOWED_ORIGINS to your domain only", critical: true },
  { item: "Configure production SMTP credentials", critical: true },
  { item: "Set PUBLIC_REGISTRATION_ENABLED=false unless intentional", critical: true },
  { item: "Set ENVIRONMENT=production", critical: false },
  { item: "Configure TLS / reverse proxy (nginx config provided)", critical: false },
  { item: "Set database password in docker-compose.override.yml", critical: true },
  { item: "Run make create-admin before exposing publicly", critical: false },
  { item: "Review SECURITY.md before production deployment", critical: false },
];

export default function SelfHost() {
  return (
    <div style={{ background: "#030712", color: "#f1f5f9", minHeight: "100vh" }}>
      <PublicHeader />
      <main>
        {/* Hero */}
        <section className="py-20 px-6 text-center" style={{ background: "radial-gradient(ellipse 70% 40% at 50% -10%, #0a1628 0%, #030712 60%)" }}>
          <div className="max-w-3xl mx-auto">
            <FadeUp>
              <div className="inline-flex items-center gap-2 text-xs text-cyan-400 border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5 rounded-full mb-6">
                <Server size={12} />
                Self-host guide
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Deploy Community Edition</h1>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                Run the complete Trustworthy AI assessment platform locally or on your own infrastructure.
                Datasets remain under your institutional control.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://github.com/roy-saurabh/edge_affectlog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-white rounded-xl px-6 py-3 border border-white/10 hover:border-cyan-400/30 hover:bg-cyan-400/[0.05] transition-all"
                >
                  View on GitHub <ExternalLink size={14} />
                </a>
                <a
                  href="/docs"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white px-6 py-3 rounded-xl hover:bg-white/[0.04] transition-all"
                >
                  API reference <ArrowRight size={14} />
                </a>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* Prerequisites */}
        <section className="py-16 px-6" style={{ background: "#050c1a" }}>
          <div className="max-w-4xl mx-auto">
            <FadeUp>
              <h2 className="text-2xl font-bold text-white mb-6">Prerequisites</h2>
            </FadeUp>
            <FadeUp delay={0.08}>
              <div className="grid sm:grid-cols-2 gap-3">
                {PREREQUISITES.map((p) => (
                  <div key={p} className="flex items-start gap-2.5 p-3 rounded-lg border border-white/[0.05] bg-white/[0.02]">
                    <CheckCircle2 size={13} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{p}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </section>

        {/* Step-by-step */}
        <section className="py-16 px-6" style={{ background: "#030712" }}>
          <div className="max-w-4xl mx-auto">
            <FadeUp>
              <div className="flex items-center gap-2 mb-6">
                <Terminal size={16} className="text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Step-by-step deployment</h2>
              </div>
            </FadeUp>
            {[
              {
                step: 1, title: "Clone and configure",
                code: [
                  { c: "#22d3ee", t: "git clone https://github.com/roy-saurabh/edge_affectlog" },
                  { c: "#22d3ee", t: "cd t-ai-affectlog" },
                  { c: "#94a3b8", t: "cp .env.example .env" },
                  { c: "#64748b", t: "# Edit .env: set SECRET_KEY, SMTP settings, ALLOWED_ORIGINS" },
                ],
              },
              {
                step: 2, title: "Start services",
                code: [
                  { c: "#34d399", t: "docker compose up -d" },
                  { c: "#64748b", t: "# Services: api, worker, postgres, redis, frontend, nginx" },
                  { c: "#94a3b8", t: "docker compose ps   # verify all running" },
                ],
              },
              {
                step: 3, title: "Initialise",
                code: [
                  { c: "#a78bfa", t: "make seed           # load RBAC roles and permissions" },
                  { c: "#a78bfa", t: "make create-admin   # create first superadmin user" },
                ],
              },
              {
                step: 4, title: "Test with synthetic data (optional)",
                code: [
                  { c: "#fbbf24", t: "make synthetic-1m   # generate 1M-row CSV sample" },
                  { c: "#fbbf24", t: "make benchmark      # run throughput benchmark" },
                ],
              },
              {
                step: 5, title: "Open",
                code: [
                  { c: "#64748b", t: "# → http://localhost:3000  (frontend)" },
                  { c: "#64748b", t: "# → http://localhost:8000/docs  (API)" },
                ],
              },
            ].map(({ step, title, code }) => (
              <FadeUp key={step} delay={step * 0.06}>
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.3)", color: "#22d3ee" }}
                    >
                      {step}
                    </div>
                    <h3 className="font-semibold text-slate-200">{title}</h3>
                  </div>
                  <div
                    className="rounded-xl p-4 font-mono text-sm ml-10"
                    style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    {code.map(({ c, t }, i) => (
                      <div key={i} className="py-0.5 flex gap-3">
                        <span className="text-slate-700 select-none">$</span>
                        <span style={{ color: c }}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* Production checklist */}
        <section className="py-16 px-6" style={{ background: "#050c1a" }}>
          <div className="max-w-4xl mx-auto">
            <FadeUp>
              <h2 className="text-2xl font-bold text-white mb-6">Production deployment checklist</h2>
            </FadeUp>
            <FadeUp delay={0.08}>
              <div className="space-y-2">
                {PROD_CHECKLIST.map((item) => (
                  <div key={item.item} className="flex items-start gap-3 p-3 rounded-lg border border-white/[0.05] bg-white/[0.02]">
                    {item.critical ? (
                      <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-sm text-slate-300">{item.item}</span>
                    {item.critical && (
                      <span className="ml-auto text-xs text-amber-500 flex-shrink-0">required</span>
                    )}
                  </div>
                ))}
              </div>
            </FadeUp>
            <FadeUp delay={0.15}>
              <p className="text-sm text-slate-500 mt-4">
                Review{" "}
                <a
                  href="https://github.com/roy-saurabh/edge_affectlog/blob/main/SECURITY.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  SECURITY.md
                </a>{" "}
                before deploying to production.
              </p>
            </FadeUp>
          </div>
        </section>

        {/* Prefer managed? */}
        <section className="py-12 px-6" style={{ background: "#030712" }}>
          <div className="max-w-4xl mx-auto">
            <FadeUp>
              <div
                className="rounded-2xl p-6 border flex flex-col sm:flex-row items-start sm:items-center gap-6"
                style={{ background: "rgba(167,139,250,0.04)", borderColor: "rgba(167,139,250,0.2)" }}
              >
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">Prefer not to manage infrastructure?</h3>
                  <p className="text-sm text-slate-400">
                    AffectLog Managed Edition handles hosting, backups, monitoring, and support.
                    Built on the same open-source core.
                  </p>
                </div>
                <Link
                  to="/request-access"
                  className="flex-shrink-0 inline-flex items-center gap-2 font-semibold text-white rounded-xl px-5 py-2.5 transition-all"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
                >
                  Request managed access <ArrowRight size={15} />
                </Link>
              </div>
            </FadeUp>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
