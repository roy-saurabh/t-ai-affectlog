import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authApi } from "../../api/auth";
import { useAuth } from "../../auth/AuthProvider";
import { ApiError } from "../../api/client";
import { PublicHeader } from "../../components/public/PublicHeader";
import { PublicFooter } from "../../components/public/PublicFooter";
import { safeInternalDestination } from "../../security/safeNavigation";

const DEFAULT_DESTINATION = "/app";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // The pre-login location is replayed from router state. Treat it as untrusted
  // and constrain it to a path on this origin (CWE-601).
  const priorLocation = (
    location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null
  )?.from;
  const from = safeInternalDestination(
    priorLocation
      ? `${priorLocation.pathname ?? ""}${priorLocation.search ?? ""}${priorLocation.hash ?? ""}`
      : undefined,
    DEFAULT_DESTINATION,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      await refresh();
      if (res.must_change_password) {
        navigate("/app/settings?change_password=1");
      } else {
        navigate(from);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed.");
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
            <h1 className="text-2xl font-bold text-white">Sign in to AffectLog</h1>
            <p className="text-slate-400 text-sm mt-1">Trustworthy AI Assessment Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-2xl p-8 space-y-5">
            {error && (
              <div className="bg-red-950/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
                placeholder="you@organisation.eu"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-center text-xs text-slate-500">
              No account?{" "}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Request access
              </Link>
            </p>
          </form>

          <p className="text-center text-xs text-slate-600 mt-6">
            Access is admin-approved. All sessions are secured and audited.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
