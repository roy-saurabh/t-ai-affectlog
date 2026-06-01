import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Database, FlaskConical, ShieldCheck, Cpu, ChevronRight,
  Github, ExternalLink, Menu, X,
} from "lucide-react";
import clsx from "clsx";
import Home from "./pages/Home";
import Datasets from "./pages/Datasets";
import Audit from "./pages/Audit";
import Models from "./pages/Models";
import Compliance from "./pages/Compliance";
import { checkHealth } from "./api";

const NAV = [
  { to: "/",          label: "Overview",    icon: LayoutDashboard },
  { to: "/datasets",  label: "Datasets",    icon: Database },
  { to: "/audit",     label: "Audit",       icon: FlaskConical },
  { to: "/compliance",label: "Compliance",  icon: ShieldCheck },
  { to: "/models",    label: "Models",      icon: Cpu },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full w-60 z-30 flex flex-col",
          "bg-slate-900 border-r border-slate-700/50",
          "transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700/50">
          <img
            src="/img/affectlog360_logo_dark.svg"
            alt="AffectLog"
            className="h-8 w-auto flex-1 min-w-0 object-contain object-left"
          />
          <button className="flex-shrink-0 lg:hidden text-slate-500 hover:text-slate-300" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-xs text-slate-600 uppercase tracking-widest font-semibold">
            Analysis
          </p>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => clsx("nav-link", isActive && "active")}
              onClick={onClose}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-700/50 space-y-2">
          <a
            href="/docs"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ExternalLink size={12} />
            Swagger UI
          </a>
          <a
            href="https://github.com/roy-saurabh/edge_affectlog"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Github size={12} />
            GitHub
          </a>
          <p className="text-xs text-slate-700 pt-1">v0.2.0 · MIT · Prometheus-X</p>
        </div>
      </aside>
    </>
  );
}

function Topbar({ onMenuClick, health }: { onMenuClick: () => void; health: string }) {
  const loc = useLocation();
  const page = NAV.find((n) => (n.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(n.to)));

  return (
    <header className="h-14 flex items-center gap-4 px-6 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
      <button
        className="lg:hidden text-slate-400 hover:text-slate-200"
        onClick={onMenuClick}
      >
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="text-slate-300 font-medium">{page?.label ?? "ALT-AI"}</span>
        {page && page.to !== "/" && (
          <>
            <ChevronRight size={14} />
            <span className="text-slate-600">{page.label}</span>
          </>
        )}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className={clsx(
          "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
          health === "ok"
            ? "bg-emerald-900/40 text-emerald-400 border-emerald-700/40"
            : "bg-red-900/40 text-red-400 border-red-700/40",
        )}>
          <span className={clsx(
            "w-1.5 h-1.5 rounded-full",
            health === "ok" ? "bg-emerald-400 animate-pulse" : "bg-red-400",
          )} />
          {health === "ok" ? "API online" : health === "checking" ? "Checking…" : "API offline"}
        </div>
      </div>
    </header>
  );
}

function Layout() {
  const [sideOpen, setSideOpen] = useState(false);
  const [health, setHealth] = useState("checking");

  useEffect(() => {
    checkHealth()
      .then((h) => setHealth(h.status === "ok" ? "ok" : "error"))
      .catch(() => setHealth("error"));
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">
        <Topbar onMenuClick={() => setSideOpen(true)} health={health} />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/datasets" element={<Datasets />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/models" element={<Models />} />
            <Route path="/compliance" element={<Compliance />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
