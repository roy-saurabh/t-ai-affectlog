import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Code2, ArrowRight, ExternalLink, Terminal, Lock, Activity, Database, Cpu, FileText, Share2 } from "lucide-react";
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

const API_CATEGORIES = [
  { icon: Terminal,  label: "Wizard APIs",          desc: "Plan assessment, validate schema, check scope, generate output contract.",       color: "#22d3ee" },
  { icon: Database,  label: "Dataset APIs",          desc: "Upload, validate, run profile, compute metrics, get field inventory.",           color: "#38bdf8" },
  { icon: Cpu,       label: "Model APIs",            desc: "Register adapter, run explanation, generate model card, compare models.",        color: "#a78bfa" },
  { icon: FileText,  label: "Compliance APIs",       desc: "Generate SOPs, data cards, JSON-LD graphs, audit manifests, and reports.",      color: "#10b981" },
  { icon: Share2,    label: "Interoperability APIs", desc: "Export metadata for CARiSMA, LOLA, and PDC connector integrations.",            color: "#6366f1" },
  { icon: Lock,      label: "Admin APIs",            desc: "User management, RBAC, pending registrations, system health, audit log.",       color: "#fbbf24" },
];

function Hero() {
  return (
    <section
      className="relative min-h-[76vh] flex items-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #050814 0%, #080D1F 100%)" }}
    >
      <GridBackground />
      <GlowOrb color="cyan" size={600} x="80%" y="25%" opacity={0.4} />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 lg:px-10 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <FadeUp delay={0.04}>
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
                style={{ color: "#22d3ee", background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.22)" }}
              >
                <Code2 size={11} />
                OpenAPI-first
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1
                className="font-bold text-white mb-5 leading-tight tracking-tight"
                style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)", letterSpacing: "-0.03em" }}
              >
                OpenAPI-first assessment workflows
              </h1>
            </FadeUp>
            <FadeUp delay={0.17}>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-[520px]">
                Automate dataset validation, wizard planning, audit execution, model explanations,
                compliance exports, and interoperability metadata through documented APIs.
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
                  View OpenAPI Spec <ExternalLink size={15} />
                </a>
                <a
                  href="/api/openapi.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-slate-200 rounded-xl px-6 py-3.5 border transition-all hover:bg-white/[0.06]"
                  style={{ borderColor: "rgba(148,163,184,0.22)", background: "rgba(255,255,255,0.04)" }}
                >
                  Download openapi.json <ExternalLink size={14} />
                </a>
              </div>
            </FadeUp>
          </div>

          {/* API example */}
          <FadeUp delay={0.25}>
            <CodeBlock
              label="Quick API call"
              lines={[
                { text: "# Run dataset validation", color: "#475569" },
                { text: "curl -X POST http://localhost:8000/v1/datasets/validate \\", color: "#22d3ee" },
                { text: '  -H "Authorization: Bearer $TOKEN" \\', color: "#94a3b8" },
                { text: '  -F "file=@dataset.csv" \\', color: "#34d399" },
                { text: '  -F "recipe=generic_csv"', color: "#34d399" },
                { text: "", color: "#475569" },
                { text: "# Response", color: "#475569" },
                { text: '{"status": "valid", "fields": 24, "rows": 98432,', color: "#a78bfa" },
                { text: ' "pii_flags": 2, "recipe_match": true}', color: "#a78bfa" },
              ]}
            />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function APICategories() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#050814" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Six API categories</h2>
            <p className="text-lg text-slate-400">All workflows are accessible via versioned, documented REST endpoints.</p>
          </div>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {API_CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <FadeUp key={cat.label} delay={i * 0.05}>
                <div
                  className="rounded-2xl p-6 border h-full transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(148,163,184,0.10)" }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${cat.color}14` }}>
                      <Icon size={15} style={{ color: cat.color }} aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-white text-sm">{cat.label}</h3>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{cat.desc}</p>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AuthSection() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#080D1F" }}>
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <FadeUp>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Authentication</h2>
              <p className="text-slate-400 mb-6 leading-relaxed">
                All API endpoints require a Bearer token. Obtain a token via the{" "}
                <code className="text-cyan-400 bg-cyan-950/30 px-1.5 py-0.5 rounded text-sm font-mono">/api/auth/login</code>{" "}
                endpoint with your admin-approved credentials.
              </p>
              <div className="space-y-3">
                {[
                  { label: "POST /api/auth/login",          desc: "Obtain access token" },
                  { label: "POST /api/auth/refresh",        desc: "Refresh token" },
                  { label: "GET  /api/auth/me",             desc: "Current user profile" },
                ].map((ep) => (
                  <div key={ep.label} className="flex items-center gap-3 text-sm">
                    <code className="font-mono text-xs text-cyan-400 bg-cyan-950/20 px-2 py-1 rounded border border-cyan-800/20 flex-shrink-0">
                      {ep.label}
                    </code>
                    <span className="text-slate-500">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Try locally</h2>
              <p className="text-slate-400 mb-4">After running Docker Compose, the interactive docs are available at:</p>
              <div
                className="rounded-xl p-4 border font-mono text-sm"
                style={{ background: "rgba(0,0,0,0.5)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <p className="text-cyan-400">http://localhost:8000/api/docs</p>
                <p className="text-slate-500 text-xs mt-2">Swagger UI with live try-it panel</p>
              </div>
              <div
                className="rounded-xl p-4 border font-mono text-sm mt-3"
                style={{ background: "rgba(0,0,0,0.5)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <p className="text-cyan-400">http://localhost:8000/api/openapi.json</p>
                <p className="text-slate-500 text-xs mt-2">OpenAPI 3.1 JSON schema</p>
              </div>
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
          headline="Automate your assessment workflows"
          subline="All platform capabilities are available via documented, versioned OpenAPI endpoints."
          primary={{ label: "View OpenAPI Spec",     href: "/api/docs" }}
          secondary={{ label: "Read Integration Guide", href: "https://github.com/roy-saurabh/edge_affectlog/blob/main/docs/design-document.md" }}
          tertiary={{ label: "Try Locally",          to: "/self-host" }}
        />
      </div>
    </section>
  );
}

export default function OpenAPIPage() {
  return (
    <div style={{ background: "#050814", color: "#F8FAFC", minHeight: "100vh" }}>
      <PublicHeader />
      <main id="main-content">
        <Hero />
        <APICategories />
        <AuthSection />
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
