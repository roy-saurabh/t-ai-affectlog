import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wand2, ArrowRight, CheckCircle2, AlertTriangle, Lock,
  Database, ShieldCheck, BarChart2, FileText, Cpu,
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

const WIZARD_STEPS = [
  { step: 1, title: "Input source",     desc: "Upload or connect a dataset. Format auto-detected.", color: "#67E8F9", icon: Database },
  { step: 2, title: "Format detection", desc: "Schema inference, field type detection, Becomino matching.", color: "#93C5FD", icon: Database },
  { step: 3, title: "Schema mapping",   desc: "Map fields to xAPI schema. Flag missing or ambiguous fields.", color: "#C4B5FD", icon: ShieldCheck },
  { step: 4, title: "Privacy review",   desc: "PII scan results, risk flags, pseudonymisation decisions.", color: "#86EFAC", icon: Lock },
  { step: 5, title: "Analysis scope",   desc: "Guardrails determine which analyses are valid for this dataset.", color: "#67E8F9", icon: BarChart2 },
  { step: 6, title: "Plot selection",   desc: "Select from available visualizations for valid analyses only.", color: "#93C5FD", icon: BarChart2 },
  { step: 7, title: "Output contract",  desc: "Review the exact artifacts and metrics that will be generated.", color: "#C4B5FD", icon: FileText },
  { step: 8, title: "Run & review",     desc: "Async audit run. Results, findings, and artifact stack.", color: "#86EFAC", icon: Wand2 },
];

function Hero() {
  return (
    <section
      className="relative min-h-[76vh] flex items-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #070B1A 0%, #0B1224 100%)" }}
    >
      <GridBackground />
      <GlowOrb color="cyan" size={600} x="80%" y="25%" opacity={0.4} />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 lg:px-10 py-20 w-full">
        <div className="max-w-3xl">
          <FadeUp delay={0.04}>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
              style={{ color: "#67E8F9", background: "rgba(103,232,249,0.08)", border: "1px solid rgba(103,232,249,0.22)" }}
            >
              <Wand2 size={11} />
              Guided Assessment Wizard
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1
              className="font-bold text-white mb-5 leading-tight tracking-tight"
              style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)", letterSpacing: "-0.03em" }}
            >
              Client-safe guided assessments, not guesswork
            </h1>
          </FadeUp>
          <FadeUp delay={0.17}>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              The wizard detects formats, validates schema, explains what is in scope, blocks
              invalid analyses, and shows only plots that the backend can actually compute.
            </p>
          </FadeUp>
          <FadeUp delay={0.23}>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-semibold text-white rounded-xl px-6 py-3.5 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #93C5FD 0%, #67E8F9 60%, #A7F3D0 100%)", boxShadow: "0 6px 20px rgba(103,232,249,0.28)" }}
              >
                Start Guided Assessment <ArrowRight size={17} />
              </Link>
              <Link
                to="/dataset-audit"
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white px-5 py-3.5 text-sm transition-colors"
              >
                View Dataset Audit <ArrowRight size={13} />
              </Link>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function WizardSteps() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#070B1A" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Eight-step guided workflow
            </h2>
            <p className="text-lg text-slate-400">
              Each step validates the previous one. Guardrails prevent analysis attempts that would fail.
            </p>
          </div>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WIZARD_STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <FadeUp key={s.step} delay={i * 0.04}>
                <div
                  className="rounded-2xl p-5 border h-full transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(203,213,225,0.10)" }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ background: `${s.color}14`, border: `1px solid ${s.color}30`, color: s.color }}
                    >
                      {s.step}
                    </div>
                    <h3 className="font-semibold text-slate-200 text-sm">{s.title}</h3>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhyGuided() {
  const reasons = [
    { icon: AlertTriangle, color: "#FCD34D", title: "Guardrails by default", desc: "The wizard blocks analyses that require fields not present in the uploaded dataset." },
    { icon: Lock,          color: "#86EFAC", title: "Privacy review step",   desc: "PII scan results and pseudonymisation decisions are reviewed before analysis proceeds." },
    { icon: FileText,      color: "#67E8F9", title: "Output contract",       desc: "You see exactly what artifacts will be generated before the run starts." },
    { icon: Cpu,           color: "#C4B5FD", title: "Contextual help",       desc: "Every step includes explanations of what is being analyzed and why it matters." },
  ];

  return (
    <section className="py-24 md:py-28" style={{ background: "#0B1224" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <FadeUp>
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Why guided analysis matters
            </h2>
            <p className="text-lg text-slate-400">
              Unguided analysis tools let users run invalid analyses and produce misleading results.
            </p>
          </div>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <FadeUp key={r.title} delay={i * 0.06}>
                <div
                  className="rounded-2xl p-6 border h-full"
                  style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(203,213,225,0.10)" }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${r.color}14` }}>
                    <Icon size={16} style={{ color: r.color }} aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-slate-200 mb-2">{r.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{r.desc}</p>
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
    <section className="py-20 md:py-24" style={{ background: "#070B1A" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <CTABand
          headline="Run your first guided assessment"
          subline="Sign in to the console and upload a dataset to start the guided wizard. Synthetic demo datasets are available."
          primary={{ label: "Start Guided Assessment", to: "/login" }}
          secondary={{ label: "Dataset Audit",         to: "/dataset-audit" }}
          tertiary={{ label: "Request Managed Access", to: "/request-access" }}
        />
      </div>
    </section>
  );
}

export default function GuidedAssessment() {
  return (
    <div style={{ background: "#070B1A", color: "#F8FAFC", minHeight: "100vh" }}>
      <PublicHeader />
      <main id="main-content">
        <Hero />
        <WizardSteps />
        <WhyGuided />
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
