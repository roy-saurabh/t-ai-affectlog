import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { publicApi } from "../../api/auth";
import { ApiError } from "../../api/client";
import { PublicHeader } from "../../components/public/PublicHeader";
import { PublicFooter } from "../../components/public/PublicFooter";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 12) { setError("Password must be at least 12 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await publicApi.confirmPasswordReset({ token, new_password: newPassword, confirm_password: confirmPassword });
      navigate("/login?reset=1");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-bold text-white">Set new password</h1>
          </div>
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-2xl p-8 space-y-5">
            {error && <div className="bg-red-950/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <div>
              <label htmlFor="reset-password" className="block text-sm font-medium text-slate-300 mb-1.5">New password (min 12 chars)</label>
              <input id="reset-password" type="password" required minLength={12} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-white rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
            <div>
              <label htmlFor="reset-password-confirm" className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password</label>
              <input id="reset-password-confirm" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-white rounded-lg px-4 py-3 text-sm outline-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors">
              {loading ? "Saving…" : "Set new password"}
            </button>
            <p className="text-center text-xs text-slate-500">
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Back to login</Link>
            </p>
          </form>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
