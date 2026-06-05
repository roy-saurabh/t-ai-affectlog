import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Github, ChevronDown, ArrowRight,
  Database, ShieldCheck, Cpu, BarChart3, FileText, Wand2,
  Server, Cloud, Lock, Code2, Package,
  Globe, Network, Share2,
  BookOpen, Map, GitBranch, BookMarked, Wrench,
  ClipboardList, ExternalLink,
} from "lucide-react";
import { cn } from "../cn";

// ── Mega menu data ──────────────────────────────────────────────────────────
const NAV_MENUS = [
  {
    label: "Product",
    key:   "product",
    items: [
      { label: "Overview",          to: "/product",             icon: Globe,       desc: "Platform capabilities at a glance" },
      { label: "Guided Assessment", to: "/guided-assessment",   icon: Wand2,       desc: "Step-by-step wizard with guardrails" },
      { label: "Dataset Audit",     to: "/dataset-audit",       icon: Database,    desc: "Profiling, PII scan, xAPI metrics" },
      { label: "Model Assessment",  to: "/model-assessment",    icon: Cpu,         desc: "Adapters, explanations, model cards" },
      { label: "Compliance Exports",to: "/compliance-exports",  icon: FileText,    desc: "SOPs, data cards, JSON-LD graphs" },
    ],
  },
  {
    label: "Platform",
    key:   "platform",
    items: [
      { label: "Community Edition", to: "/community",    icon: Server,       desc: "Self-hosted open-source core" },
      { label: "Managed Cloud",     to: "/cloud",        icon: Cloud,        desc: "AffectLog-operated infrastructure" },
      { label: "Security",          to: "/security",     icon: ShieldCheck,  desc: "RBAC, pseudonymisation, audit logs" },
      { label: "OpenAPI",           to: "/openapi",      icon: Code2,        desc: "OpenAPI-first automation workflows" },
      { label: "Pricing",           to: "/pricing",      icon: BarChart3,    desc: "Community, Managed, Private tenant" },
    ],
  },
  {
    label: "Ecosystem",
    key:   "ecosystem",
    items: [
      { label: "Prometheus-X BB04", to: "/ecosystem",    icon: Network,    desc: "Trustworthy AI assessment building block" },
      { label: "EDGE-Skills",       href: "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/how-to-participate/org-details/883807838/project/101123471/program/43152860/details",
                                    icon: Globe,         desc: "EU Digital Europe programme (grant 101123471)" },
    ],
  },
  {
    label: "Developers",
    key:   "developers",
    items: [
      { label: "GitHub",            href: "https://github.com/Prometheus-X-association/t-ai-affectlog",          icon: Github,      desc: "Source code and issues" },
      { label: "Contributor Guide", href: "https://github.com/Prometheus-X-association/t-ai-affectlog/blob/main/CONTRIBUTING.md",
                                                                                                    icon: GitBranch,   desc: "How to add recipes and adapters" },
      { label: "API Reference",     to: "/openapi",                                                 icon: BookOpen,    desc: "OpenAPI spec, endpoint contracts" },
      { label: "Recipes",           to: "/developers",                                              icon: Package,     desc: "Reusable assessment pipeline specs" },
      { label: "Model Adapters",    href: "https://github.com/Prometheus-X-association/t-ai-affectlog/blob/main/CONTRIBUTING.md",
                                                                                                    icon: Wrench,      desc: "Adapter interface for ML frameworks" },
    ],
  },
  {
    label: "Resources",
    key:   "resources",
    items: [
      { label: "Documentation",    to: "/docs",          icon: BookMarked,   desc: "Guides, APIs, architecture" },
      { label: "Self-host",        to: "/self-host",     icon: Server,       desc: "Docker Compose deployment" },
      { label: "Ecosystem",        to: "/ecosystem",     icon: ClipboardList,desc: "Prometheus-X, EDGE-Skills, data spaces" },
      { label: "Security Policy",  to: "/security",      icon: Lock,         desc: "Disclosure and access controls" },
    ],
  },
];

// ── Menu item ───────────────────────────────────────────────────────────────
function MegaMenuItem({ item }: { item: (typeof NAV_MENUS)[0]["items"][0] }) {
  const Icon = item.icon;
  const isExternal = !("to" in item) || !!item.href;
  const cls =
    "flex items-start gap-3 p-3 rounded-xl transition-all duration-150 hover:bg-white/[0.05] group";

  const content = (
    <>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "rgba(103,232,249,0.09)" }}
      >
        <Icon size={14} style={{ color: "#67E8F9" }} />
      </div>
      <div>
        <div className="text-sm font-medium text-[#D8E0EE] group-hover:text-[#F8FAFC] transition-colors flex items-center gap-1">
          {item.label}
          {isExternal && item.href && <ExternalLink size={10} className="opacity-40" />}
        </div>
        <div className="text-xs text-[#6F7D96] mt-0.5 leading-tight">{item.desc}</div>
      </div>
    </>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={cls}
      >
        {content}
      </a>
    );
  }
  return <Link to={(item as { to: string }).to} className={cls}>{content}</Link>;
}

// ── Dropdown menu ────────────────────────────────────────────────────────────
function MegaMenu({ menu, open }: { menu: (typeof NAV_MENUS)[0]; open: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.98 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
          style={{ width: 360 }}
          role="region"
          aria-label={`${menu.label} menu`}
        >
          <div
            className="rounded-2xl border p-2 shadow-card-xl overflow-hidden"
            style={{
              background: "rgba(7,11,26,0.97)",
              backdropFilter: "blur(24px)",
              borderColor: "rgba(203,213,225,0.14)",
            }}
          >
            <div className="space-y-0.5">
              {menu.items.map((item) => (
                <MegaMenuItem key={item.label} item={item} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Mobile nav item ──────────────────────────────────────────────────────────
function MobileNavSection({ menu, onClose }: { menu: (typeof NAV_MENUS)[0]; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-slate-300 rounded-xl hover:bg-white/[0.05] transition-all"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {menu.label}
        <ChevronDown
          size={14}
          className={cn("text-slate-500 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="py-1 pl-4 space-y-0.5">
              {menu.items.map((item) => {
                if (item.href) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
                      onClick={onClose}
                    >
                      {item.label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    to={(item as { to: string }).to}
                    className="block px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main header ──────────────────────────────────────────────────────────────
export function PublicHeader() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setActiveMenu(null);
  }, [location.pathname]);

  // Prevent scroll when mobile menu open
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  function openMenu(key: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveMenu(key);
  }

  function scheduleClose() {
    timerRef.current = setTimeout(() => setActiveMenu(null), 120);
  }

  return (
    <>
      {/* Skip to content */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "backdrop-blur-xl border-b"
            : "bg-transparent"
        )}
        style={
          scrolled
            ? {
                background: "rgba(7,11,26,0.94)",
                borderColor: "rgba(203,213,225,0.10)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.40)",
              }
            : undefined
        }
        role="banner"
      >
        {/* Desktop — 72px */}
        <div className="max-w-[1400px] mx-auto px-6 hidden lg:flex items-center h-[72px] gap-6">
          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 rounded-lg"
            aria-label="AffectLog home"
          >
            <img
              src="/img/affectlog360_logo_dark.svg"
              alt="AffectLog"
              className="h-8 object-contain"
              width={120}
              height={32}
            />
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1 flex-1" aria-label="Main navigation">
            {NAV_MENUS.map((menu) => (
              <div
                key={menu.key}
                className="relative"
                onMouseEnter={() => openMenu(menu.key)}
                onMouseLeave={scheduleClose}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                    activeMenu === menu.key
                      ? "text-white bg-white/[0.07]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  )}
                  aria-expanded={activeMenu === menu.key}
                  aria-haspopup="true"
                  id={`nav-${menu.key}`}
                >
                  {menu.label}
                  <ChevronDown
                    size={12}
                    className={cn(
                      "transition-transform duration-200",
                      activeMenu === menu.key && "rotate-180"
                    )}
                  />
                </button>
                <MegaMenu menu={menu} open={activeMenu === menu.key} />
              </div>
            ))}
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="https://github.com/Prometheus-X-association/t-ai-affectlog"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-[#8391A8] hover:text-[#D8E0EE] transition-colors px-2 py-1.5 rounded-lg hover:bg-white/[0.04]"
              aria-label="AffectLog on GitHub"
            >
              <Github size={15} />
              <span className="hidden xl:inline font-medium">GitHub</span>
            </a>

            <div
              className="w-px h-5"
              style={{ background: "rgba(203,213,225,0.15)" }}
              aria-hidden="true"
            />

            <Link
              to="/login"
              className="text-sm font-medium text-[#8391A8] hover:text-[#D8E0EE] transition-colors px-3 py-2 rounded-xl hover:bg-white/[0.04]"
            >
              Sign in
            </Link>

            <Link
              to="/self-host"
              className="text-sm font-medium text-[#D8E0EE] hover:text-[#F8FAFC] transition-all px-4 py-2 rounded-xl border hover:bg-white/[0.05]"
              style={{ borderColor: "rgba(203,213,225,0.18)" }}
            >
              Self-host
            </Link>

            <Link
              to="/request-access"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-px"
              style={{
                background: "linear-gradient(135deg, #93C5FD 0%, #67E8F9 60%, #A7F3D0 100%)",
                boxShadow: "0 4px 16px rgba(147,197,253,0.30)",
                color: "#08111F",
              }}
            >
              Request Access
            </Link>
          </div>
        </div>

        {/* Tablet / Mobile — 64px */}
        <div className="lg:hidden flex items-center h-16 px-5 justify-between gap-4">
          <Link
            to="/"
            className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 rounded"
            aria-label="AffectLog home"
          >
            <img
              src="/img/affectlog360_logo_dark.svg"
              alt="AffectLog"
              className="h-7 object-contain"
            />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/request-access"
              className="text-xs font-semibold text-white px-3.5 py-2 rounded-xl hidden xs:flex items-center gap-1"
              style={{ background: "linear-gradient(135deg, #93C5FD 0%, #67E8F9 60%, #A7F3D0 100%)" }}
            >
              Get Access
            </Link>

            <button
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />

            <motion.nav
              id="mobile-menu"
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-50 lg:hidden flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              aria-label="Mobile navigation"
              style={{ background: "#0B1224" }}
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-5 h-16 flex-shrink-0 border-b"
                style={{ borderColor: "rgba(203,213,225,0.10)" }}
              >
                <Link to="/" onClick={() => setMenuOpen(false)}>
                  <img src="/img/affectlog360_logo_dark.svg" alt="AffectLog" className="h-7 object-contain" />
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Nav links */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {NAV_MENUS.map((menu) => (
                  <MobileNavSection key={menu.key} menu={menu} onClose={() => setMenuOpen(false)} />
                ))}
              </div>

              {/* CTA footer */}
              <div
                className="px-4 py-5 flex flex-col gap-3 border-t flex-shrink-0"
                style={{ borderColor: "rgba(203,213,225,0.10)" }}
              >
                <Link
                  to="/request-access"
                  className="flex items-center justify-center gap-2 font-semibold text-white py-3 rounded-xl text-sm transition-all"
                  style={{ background: "linear-gradient(135deg, #93C5FD 0%, #67E8F9 60%, #A7F3D0 100%)", boxShadow: "0 4px 16px rgba(147,197,253,0.30)", color: "#08111F" }}
                  onClick={() => setMenuOpen(false)}
                >
                  Request Managed Access <ArrowRight size={14} />
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/self-host"
                    className="flex items-center justify-center gap-1.5 font-medium text-slate-200 py-2.5 rounded-xl text-sm border"
                    style={{ borderColor: "rgba(203,213,225,0.20)", background: "rgba(255,255,255,0.04)" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Server size={13} /> Self-host
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center justify-center font-medium text-slate-300 py-2.5 rounded-xl text-sm border"
                    style={{ borderColor: "rgba(203,213,225,0.14)", background: "rgba(255,255,255,0.03)" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Header spacer */}
      <div className="h-16 lg:h-[72px]" aria-hidden="true" />
    </>
  );
}
