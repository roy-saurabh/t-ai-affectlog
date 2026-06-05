import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Cpu, ArrowRight, BarChart2, FileText, AlertTriangle, Code2, ExternalLink } from "lucide-react";
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

const ADAPTERS = [
  { label: "scikit-learn estimators",  desc: "Supports feature_importances_, coef_, and SHAP-compatible models.", color: "#67E8F9" },
  { label: "Hugging Face models",      desc: "Classification heads with dataset-compatible feature mappings.",     color: "#C4B5FD" },
  { label: "SHAP-compatible models",   desc: "Any model supporting SHAP TreeExplainer or LinearExplainer.",       color: "#93C5FD" },
  { label: "Custom API endpoints",     desc: "HTTP-based model APIs with JSON schema contracts.",                  color: "#86EFAC" },
];

function Hero() {
  return (
    <section
      className="relative min-h-[76vh] flex items-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #070B1A 0%, #111A31 100%)" }}
    >
      <GridBackground />
      <GlowOrb color="violet" size={600} x="80%" y="25%" opacity={0.4} />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 lg:px-10 py-20 w-full">
        <div className="max-w-3xl">
          <FadeUp delay={0.04}>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
              style={{ color: "#C4B5FD", background: "rgba(196,181,253,0.08)", border: "1px solid rgba(196,181,253,0.22)" }}
            >
              <Cpu size={11} />
              Model Assessment
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1
              className="font-bold text-white mb-5 leading-tight tracking-tight"
              style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)", letterSpacing: "-0.03em" }}
            >
              Explain compatible models in their dataset context
            </h1>
          </FadeUp>
          <FadeUp delay={0.17}>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Attach model artifacts or endpoints, check dataset-model interface assumptions,
              generate feature importance, local explanations, model cards, and comparison outputs
              where the supplied model supports them.
            </p>
          </FadeUp>
          <FadeUp delay={0.23}>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-semibold text-white rounded-xl px-6 py-3.5 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #C4B5FD 0%, #D8B4FE 100%)", boxShadow: "0 6px 20px rgba(196,181,253,0.28)" }}
              >
                Register a Model <ArrowRight size={17} />
              </Link>
              <a
                href={`${GITHUB}/blob/main/CONTRIBUTING.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white px-5 py-3.5 text-sm transition-colors"
              >
                Add an Adapter <ExternalLink size={12} />
              </a>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function AdaptersSection() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#070B1A" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">Supported model adapters</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              AffectLog uses a pluggable adapter architecture. Each adapter implements a common
              interface for feature extraction, explanation generation, and model card output.
            </p>

            <div className="space-y-3">
              {ADAPTERS.map((a) => (
                <div
                  key={a.label}
                  className="flex items-start gap-4 p-4 rounded-xl border"
                  style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(203,213,225,0.10)" }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: a.color }} />
                  <div>
                    <p className="font-semibold text-slate-200 text-sm mb-0.5">{a.label}</p>
                    <p className="text-slate-500 text-xs leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <a
                href={`${GITHUB}/blob/main/CONTRIBUTING.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#C4B5FD] transition-colors"
              >
                Add a model adapter <ExternalLink size={12} />
              </a>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div
              className="rounded-2xl p-6 border"
              style={{ background: "rgba(11,16,32,0.7)", borderColor: "rgba(196,181,253,0.20)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">What explanations require</p>
              <div className="space-y-3">
                {[
                  { label: "Compatible model adapter",       required: true,  color: "#C4B5FD" },
                  { label: "Matching feature schema",        required: true,  color: "#C4B5FD" },
                  { label: "Minimum feature count",          required: true,  color: "#C4B5FD" },
                  { label: "Non-zero training sample count", required: true,  color: "#C4B5FD" },
                  { label: "Model artifact or endpoint",     required: true,  color: "#C4B5FD" },
                  { label: "SHAP or coef_ support",          required: false, color: "#64748b" },
                ].map((req) => (
                  <div key={req.label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{req.label}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: req.required ? "rgba(196,181,253,0.12)" : "rgba(100,116,139,0.12)",
                        color: req.required ? "#C4B5FD" : "#64748b",
                        border: `1px solid ${req.required ? "rgba(196,181,253,0.25)" : "rgba(100,116,139,0.20)"}`,
                      }}
                    >
                      {req.required ? "Required" : "Optional"}
                    </span>
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

function Guardrails() {
  return (
    <section className="py-24 md:py-28" style={{ background: "#0B1224" }}>
      <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
        <FadeUp>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.20)" }}>
            <AlertTriangle size={20} className="text-amber-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">
            When explanations are unavailable
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            Model explanations are only generated when all prerequisites are met. The wizard
            communicates clearly when an explanation cannot be produced and why, rather than
            generating misleading partial output.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            {[
              "No explanation generated if adapter is incompatible",
              "Model card marked incomplete if feature schema mismatches",
              "Comparison requires two registered models on the same dataset",
              "Local explanation requires sample-level access in the dataset",
              "Feature importance gracefully degrades to summary only",
              "All guardrail blocks are explained to the user",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2.5 text-sm text-slate-400 p-3 rounded-xl"
                style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.12)" }}
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: "#FCD34D" }} />
                {item}
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
    <section className="py-20 md:py-24" style={{ background: "#070B1A" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">
        <CTABand
          headline="Assess your model in its dataset context"
          subline="Register a model adapter and run the assessment pipeline alongside your dataset audit."
          primary={{ label: "Register a Model",       to: "/login" }}
          secondary={{ label: "View Model Adapters",  href: `${GITHUB}/blob/main/docs/model-adapters.md` }}
          tertiary={{ label: "Contribute an Adapter", href: `${GITHUB}/blob/main/CONTRIBUTING.md` }}
        />
      </div>
    </section>
  );
}

export default function ModelAssessmentPage() {
  return (
    <div style={{ background: "#070B1A", color: "#F8FAFC", minHeight: "100vh" }}>
      <PublicHeader />
      <main id="main-content">
        <Hero />
        <AdaptersSection />
        <Guardrails />
        <FinalCTA />
      </main>
      <PublicFooter />
    </div>
  );
}
