import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Cloud, Server, ChevronRight, Loader2 } from "lucide-react";
import { PublicHeader } from "../../components/public/PublicHeader";
import { PublicFooter } from "../../components/public/PublicFooter";
import { GridBackground, GlowOrb } from "../../design-system/primitives/GridBackground";

function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >{children}</motion.div>
  );
}

type Step = "deployment" | "organization" | "requirements" | "done";

const STEPS: { id: Step; label: string }[] = [
  { id: "deployment",   label: "Deployment" },
  { id: "organization", label: "Organization" },
  { id: "requirements", label: "Requirements" },
];

interface FormData {
  deployment: "managed" | "self-host" | "private" | "byoc" | "";
  orgName: string;
  orgType: string;
  role: string;
  dataVolume: string;
  useCase: string;
  securityRequirements: string;
  message: string;
  consent: boolean;
}

const INIT: FormData = {
  deployment: "",
  orgName: "",
  orgType: "",
  role: "",
  dataVolume: "",
  useCase: "",
  securityRequirements: "",
  message: "",
  consent: false,
};

const inputCls = "input";
const labelCls = "block text-sm font-medium text-slate-300 mb-2";

export default function RequestAccess() {
  const [step, setStep]     = useState<Step>("deployment");
  const [form, setForm]     = useState<FormData>(INIT);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep("done");
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div style={{ background: "#050814", color: "#F8FAFC", minHeight: "100vh" }}>
      <PublicHeader />
      <main id="main-content">
        <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: "#050814" }}>
          <GridBackground opacity={0.6} />
          <GlowOrb color="violet" size={500} x="80%" y="20%" opacity={0.35} />

          <div className="relative max-w-2xl mx-auto px-5 md:px-6">

            {step !== "done" && (
              <>
                {/* Header */}
                <FadeUp>
                  <div
                    className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
                    style={{ color: "#a78bfa", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.22)" }}
                  >
                    <Cloud size={11} />
                    Managed Edition
                  </div>
                  <h1
                    className="font-bold text-white mb-3 tracking-tight"
                    style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em" }}
                  >
                    Request an AffectLog-managed environment
                  </h1>
                  <p className="text-slate-400 mb-8 leading-relaxed">
                    Tell us about your organization, assessment needs, and deployment preferences.
                    We'll review and get back to you within one business day.
                  </p>
                </FadeUp>

                {/* Step indicator */}
                <FadeUp delay={0.06}>
                  <div className="flex items-center gap-2 mb-8">
                    {STEPS.map((s, i) => (
                      <React.Fragment key={s.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                            style={{
                              background: i < stepIndex ? "#22d3ee" : i === stepIndex ? "rgba(34,211,238,0.15)" : "rgba(148,163,184,0.10)",
                              border: i === stepIndex ? "1px solid #22d3ee" : i < stepIndex ? "none" : "1px solid rgba(148,163,184,0.20)",
                              color: i <= stepIndex ? "#22d3ee" : "#475569",
                            }}
                          >
                            {i < stepIndex ? <CheckCircle2 size={12} /> : i + 1}
                          </div>
                          <span className={`text-xs font-medium ${i === stepIndex ? "text-slate-200" : "text-slate-600"}`}>
                            {s.label}
                          </span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <ChevronRight size={12} className="text-slate-700 flex-shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </FadeUp>
              </>
            )}

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* ── Step 1: Deployment ──────────────────────── */}
                {step === "deployment" && (
                  <motion.div
                    key="deployment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="rounded-2xl p-6 md:p-8 border mb-6"
                      style={{ background: "rgba(11,16,32,0.8)", borderColor: "rgba(148,163,184,0.14)" }}
                    >
                      <h2 className="text-lg font-bold text-white mb-2">Deployment preference</h2>
                      <p className="text-slate-500 text-sm mb-6">How would you like to run AffectLog?</p>

                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          { id: "managed",   icon: Cloud,   label: "Managed Cloud",       desc: "AffectLog operates everything",    color: "#a78bfa" },
                          { id: "self-host", icon: Server,  label: "Community Edition",    desc: "Self-hosted open-source",          color: "#22d3ee" },
                          { id: "private",   icon: Cloud,   label: "Private Tenant",       desc: "Dedicated managed instance",       color: "#38bdf8" },
                          { id: "byoc",      icon: Server,  label: "BYOC / On-premise",    desc: "Your cloud, AffectLog support",    color: "#10b981" },
                        ].map((opt) => {
                          const Icon = opt.icon;
                          const active = form.deployment === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => update("deployment", opt.id as FormData["deployment"])}
                              className="flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200"
                              style={{
                                background: active ? `${opt.color}10` : "rgba(255,255,255,0.025)",
                                borderColor: active ? opt.color : "rgba(148,163,184,0.15)",
                              }}
                              aria-pressed={active}
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ background: `${opt.color}14` }}
                              >
                                <Icon size={14} style={{ color: opt.color }} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-200">{opt.label}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={!form.deployment}
                        onClick={() => setStep("organization")}
                        className="inline-flex items-center gap-2 font-semibold text-white px-6 py-3 rounded-xl transition-all disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg, #06b6d4, #0ea5e9)", boxShadow: "0 4px 14px rgba(34,211,238,0.25)" }}
                      >
                        Continue <ArrowRight size={15} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2: Organization ────────────────────── */}
                {step === "organization" && (
                  <motion.div
                    key="organization"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="rounded-2xl p-6 md:p-8 border mb-6"
                      style={{ background: "rgba(11,16,32,0.8)", borderColor: "rgba(148,163,184,0.14)" }}
                    >
                      <h2 className="text-lg font-bold text-white mb-2">Organization details</h2>
                      <p className="text-slate-500 text-sm mb-6">Tell us about who you are and your role.</p>

                      <div className="space-y-5">
                        <div>
                          <label htmlFor="orgName" className={labelCls}>Organization name <span className="text-red-400">*</span></label>
                          <input
                            id="orgName"
                            type="text"
                            required
                            value={form.orgName}
                            onChange={(e) => update("orgName", e.target.value)}
                            placeholder="University of Example / AcmeTech Ltd."
                            className={inputCls}
                          />
                        </div>

                        <div>
                          <label htmlFor="orgType" className={labelCls}>Organization type</label>
                          <select
                            id="orgType"
                            value={form.orgType}
                            onChange={(e) => update("orgType", e.target.value)}
                            className="select w-full"
                          >
                            <option value="">Select type</option>
                            <option value="university">University / Academic</option>
                            <option value="public">Public sector / Government</option>
                            <option value="edtech">EdTech company</option>
                            <option value="aivendor">AI model vendor</option>
                            <option value="auditor">Auditor / Consultancy</option>
                            <option value="research">Research institution</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="role" className={labelCls}>Your role <span className="text-red-400">*</span></label>
                          <input
                            id="role"
                            type="text"
                            required
                            value={form.role}
                            onChange={(e) => update("role", e.target.value)}
                            placeholder="Data Steward / AI Compliance Lead / CTO"
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setStep("deployment")}
                        className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/[0.04]"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        disabled={!form.orgName || !form.role}
                        onClick={() => setStep("requirements")}
                        className="inline-flex items-center gap-2 font-semibold text-white px-6 py-3 rounded-xl transition-all disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg, #06b6d4, #0ea5e9)", boxShadow: "0 4px 14px rgba(34,211,238,0.25)" }}
                      >
                        Continue <ArrowRight size={15} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 3: Requirements ─────────────────────── */}
                {step === "requirements" && (
                  <motion.div
                    key="requirements"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="rounded-2xl p-6 md:p-8 border mb-6"
                      style={{ background: "rgba(11,16,32,0.8)", borderColor: "rgba(148,163,184,0.14)" }}
                    >
                      <h2 className="text-lg font-bold text-white mb-2">Assessment requirements</h2>
                      <p className="text-slate-500 text-sm mb-6">Help us understand your scale and security needs.</p>

                      <div className="space-y-5">
                        <div>
                          <label htmlFor="dataVolume" className={labelCls}>Expected data volume</label>
                          <select
                            id="dataVolume"
                            value={form.dataVolume}
                            onChange={(e) => update("dataVolume", e.target.value)}
                            className="select w-full"
                          >
                            <option value="">Select range</option>
                            <option value="small">Under 100K rows per dataset</option>
                            <option value="medium">100K – 1M rows</option>
                            <option value="large">1M – 10M rows</option>
                            <option value="xlarge">10M+ rows</option>
                            <option value="unknown">Not yet determined</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="useCase" className={labelCls}>Primary use case</label>
                          <select
                            id="useCase"
                            value={form.useCase}
                            onChange={(e) => update("useCase", e.target.value)}
                            className="select w-full"
                          >
                            <option value="">Select use case</option>
                            <option value="compliance">Regulatory compliance / AI Act</option>
                            <option value="audit">Third-party audit</option>
                            <option value="research">Research and evaluation</option>
                            <option value="procurement">AI procurement due diligence</option>
                            <option value="internal">Internal governance</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="securityRequirements" className={labelCls}>Security or compliance requirements</label>
                          <textarea
                            id="securityRequirements"
                            rows={3}
                            value={form.securityRequirements}
                            onChange={(e) => update("securityRequirements", e.target.value)}
                            placeholder="GDPR, ISO 27001, institutional DPA, specific data residency..."
                            className="textarea"
                          />
                        </div>

                        <div>
                          <label htmlFor="message" className={labelCls}>Additional context (optional)</label>
                          <textarea
                            id="message"
                            rows={4}
                            value={form.message}
                            onChange={(e) => update("message", e.target.value)}
                            placeholder="Describe your assessment workflow, timeline, or specific questions."
                            className="textarea"
                          />
                        </div>

                        <div>
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.consent}
                              onChange={(e) => update("consent", e.target.checked)}
                              className="mt-1 w-4 h-4 rounded"
                              style={{ accentColor: "#22d3ee" }}
                              aria-required="true"
                            />
                            <span className="text-sm text-slate-400">
                              I understand that AffectLog will use this information only to respond to
                              this access request. No data is shared with third parties.
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setStep("organization")}
                        className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/[0.04]"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={!form.consent || loading}
                        className="inline-flex items-center gap-2 font-semibold text-white px-6 py-3 rounded-xl transition-all disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 14px rgba(139,92,246,0.25)" }}
                      >
                        {loading ? <><Loader2 size={15} className="animate-spin" /> Submitting…</> : <>Submit Request <ArrowRight size={15} /></>}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── Success ────────────────────────────────────── */}
                {step === "done" && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-10"
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                      style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.30)" }}
                    >
                      <CheckCircle2 size={28} className="text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Request submitted</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed max-w-md mx-auto">
                      We've received your request and will review it within one business day.
                      Check your email for confirmation and next steps.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <Link
                        to="/"
                        className="inline-flex items-center gap-2 font-semibold text-white px-6 py-3 rounded-xl transition-all"
                        style={{ background: "linear-gradient(135deg, #06b6d4, #0ea5e9)" }}
                      >
                        Return home
                      </Link>
                      <Link
                        to="/community"
                        className="inline-flex items-center gap-2 font-medium text-slate-300 px-6 py-3 rounded-xl border transition-all hover:bg-white/[0.05]"
                        style={{ borderColor: "rgba(148,163,184,0.20)" }}
                      >
                        <Server size={14} /> Try Community Edition
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {step !== "done" && (
              <FadeUp delay={0.15}>
                <div
                  className="mt-8 p-4 rounded-xl border text-sm text-slate-500 text-center"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(148,163,184,0.10)" }}
                >
                  Prefer to self-host?{" "}
                  <Link to="/community" className="text-cyan-400 hover:text-cyan-300">
                    Community Edition is free and open-source
                  </Link>
                </div>
              </FadeUp>
            )}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
