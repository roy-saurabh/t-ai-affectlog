import React, { useEffect, useState } from "react";
import { adminApi, PendingRegistration } from "../../api/admin";
import { CheckCircle2, XCircle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

const ROLES = ["Viewer", "Researcher", "Data Steward", "Auditor", "Model Developer", "Developer Contributor", "Project Maintainer", "Admin"];
const WORKSPACES = ["default", "demo", "maskott-tactileo", "inokufu-becomino", "public-samples"];

function RegistrationRow({ reg, onAction }: { reg: PendingRegistration; onAction: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [role, setRole] = useState("Viewer");
  const [workspace, setWorkspace] = useState("default");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const approve = async () => {
    setLoading(true);
    try {
      const res = await adminApi.approveRegistration(reg.id, { role_name: role, workspace_slug: workspace, admin_notes: notes });
      if (res.dev_activation_token) setDevToken(res.dev_activation_token);
      onAction();
    } finally { setLoading(false); }
  };

  const reject = async () => {
    setLoading(true);
    try { await adminApi.rejectRegistration(reg.id, { admin_notes: notes }); onAction(); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden mb-3">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((x) => !x)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((x) => !x);
          }
        }}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm">{reg.full_name}</p>
          <p className="text-slate-400 text-xs">{reg.email} · {reg.organization ?? "—"}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{new Date(reg.created_at).toLocaleDateString()}</span>
          {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-700 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
            <div><span className="text-slate-500">Role described:</span> {reg.role_description ?? "—"}</div>
            <div><span className="text-slate-500">Requested profile:</span> {reg.requested_access_profile ?? "—"}</div>
            <div className="md:col-span-2"><span className="text-slate-500">Reason:</span> {reg.reason_for_access ?? "—"}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Assign role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-xs">
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Assign workspace</label>
              <select value={workspace} onChange={(e) => setWorkspace(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-xs">
                {WORKSPACES.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Admin notes (optional)</label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-xs resize-none" />
          </div>

          {devToken && (
            <div className="bg-amber-950/50 border border-amber-700 rounded p-3 text-xs text-amber-300">
              <p className="font-bold mb-1">DEV MODE — Activation token (shown once):</p>
              <code className="break-all">{devToken}</code>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={approve} disabled={loading}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
              <CheckCircle2 size={13} /> Approve
            </button>
            <button onClick={reject} disabled={loading}
              className="flex items-center gap-1.5 bg-red-800 hover:bg-red-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
              <XCircle size={13} /> Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PendingRegistrations() {
  const [regs, setRegs] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.getPendingRegistrations("pending")
      .then(setRegs)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Pending Registrations</h1>
          <p className="text-slate-400 text-sm mt-0.5">{regs.length} awaiting review</p>
        </div>
        <button onClick={load} className="text-xs text-indigo-400 hover:text-indigo-300 border border-slate-700 px-3 py-1.5 rounded-lg">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500 text-sm">Loading…</div>
      ) : regs.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <HelpCircle size={32} className="mx-auto mb-3 opacity-40" />
          No pending registrations.
        </div>
      ) : (
        <div>{regs.map((r) => <RegistrationRow key={r.id} reg={r} onAction={load} />)}</div>
      )}
    </div>
  );
}
