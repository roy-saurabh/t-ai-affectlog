import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicApi } from "../../api/auth";
import { ApiError } from "../../api/client";
import { PublicHeader } from "../../components/public/PublicHeader";
import { PublicFooter } from "../../components/public/PublicFooter";

const ACCESS_PROFILES = [
  "Data Steward",
  "Auditor",
  "Researcher",
  "Model Developer",
  "Developer Contributor",
  "Project Maintainer",
  "Viewer",
  "Other",
];

export default function Register() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    organization: "",
    role_description: "",
    requested_access_profile: "Viewer",
    reason_for_access: "",
    agreed_to_coc: false,
    agreed_to_data_governance: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.agreed_to_coc || !form.agreed_to_data_governance) {
      setError("You must agree to both the Code of Conduct and Data Governance Policy.");
      return;
    }
    setLoading(true);
    try {
      await publicApi.register(form);
      navigate("/awaiting-approval");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <PublicHeader />
      <main className="flex-1 px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/img/affectlog360_logo_dark.svg" alt="AffectLog" className="h-9 mx-auto mb-5 opacity-90 hover:opacity-100 transition-opacity" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Request Access</h1>
          <p className="text-slate-400 text-sm mt-1">AffectLog Trustworthy AI Assessment Platform</p>
          <p className="text-slate-500 text-xs mt-2">Access is reviewed and approved by administrators.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name *</label>
              <input required value={form.full_name} onChange={field("full_name")} type="text"
                className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-white rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address *</label>
              <input required value={form.email} onChange={field("email")} type="email"
                className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-white rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Organisation</label>
            <input value={form.organization} onChange={field("organization")} type="text"
              className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-white rounded-lg px-4 py-3 text-sm outline-none"
              placeholder="University / Institution / Company" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Your role</label>
              <input value={form.role_description} onChange={field("role_description")} type="text"
                className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-white rounded-lg px-4 py-3 text-sm outline-none"
                placeholder="Researcher / Data Engineer / …" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Requested access profile</label>
              <select value={form.requested_access_profile} onChange={field("requested_access_profile")}
                className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-white rounded-lg px-4 py-3 text-sm outline-none">
                {ACCESS_PROFILES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Reason for access</label>
            <textarea rows={4} value={form.reason_for_access} onChange={field("reason_for_access")}
              className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-white rounded-lg px-4 py-3 text-sm outline-none resize-none"
              placeholder="Briefly describe your intended use of the platform and the data you plan to assess…" />
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Agreements required</p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.agreed_to_coc} onChange={(e) => setForm((f) => ({ ...f, agreed_to_coc: e.target.checked }))}
                className="mt-0.5 flex-shrink-0 accent-indigo-500" />
              <span className="text-sm text-slate-300">
                I agree to the{" "}
                <a href="https://github.com/Prometheus-X-association/t-ai-affectlog/blob/main/CODE_OF_CONDUCT.md"
                  target="_blank" rel="noopener" className="text-indigo-400 hover:underline">Code of Conduct</a>.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.agreed_to_data_governance} onChange={(e) => setForm((f) => ({ ...f, agreed_to_data_governance: e.target.checked }))}
                className="mt-0.5 flex-shrink-0 accent-indigo-500" />
              <span className="text-sm text-slate-300">
                I agree to the{" "}
                <a href="https://github.com/Prometheus-X-association/t-ai-affectlog/blob/main/docs/data-governance.md"
                  target="_blank" rel="noopener" className="text-indigo-400 hover:underline">Data Governance Policy</a>{" "}
                and understand that raw personal data must not be uploaded without lawful basis.
              </span>
            </label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors">
            {loading ? "Submitting…" : "Submit Registration Request"}
          </button>

          <p className="text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
          </p>
        </form>
      </div>
      </main>
      <PublicFooter />
    </div>
  );
}
