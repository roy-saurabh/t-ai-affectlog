import React, { useState } from "react";
import { Link } from "react-router-dom";
import { publicApi } from "../../api/auth";
import { PublicHeader } from "../../components/public/PublicHeader";
import { PublicFooter } from "../../components/public/PublicFooter";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await publicApi.requestPasswordReset(email).catch(() => {});
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/">
              <img src="/img/affectlog360_logo_dark.svg" alt="AffectLog" className="h-9 mx-auto mb-5 opacity-90 hover:opacity-100 transition-opacity" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Reset password</h1>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8">
            {sent ? (
              <div className="text-center">
                <p className="text-slate-300 mb-4">
                  If that email address exists in our system, a password reset link has been sent. Check your inbox.
                </p>
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 text-sm">Back to login</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-slate-400 text-sm">Enter your email and we'll send a reset link if your account exists.</p>
                <div>
                  <label htmlFor="forgot-password-email" className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                  <input id="forgot-password-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-white rounded-lg px-4 py-3 text-sm outline-none" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors">
                  {loading ? "Sending…" : "Send reset link"}
                </button>
                <p className="text-center text-xs text-slate-500">
                  <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Back to login</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
