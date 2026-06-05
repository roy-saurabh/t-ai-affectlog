import React from "react";
import { Link, NavLink } from "react-router-dom";
import { X, LogOut, Settings, ChevronRight } from "lucide-react";
import { cn } from "../cn";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: string | number;
}

interface ConsoleSidebarProps {
  nav: NavItem[];
  open: boolean;
  onClose: () => void;
  variant?: "app" | "admin";
}

export function ConsoleSidebar({ nav, open, onClose, variant = "app" }: ConsoleSidebarProps) {
  const { user, logout } = useAuth();
  const isAdmin =
    user?.is_superadmin || user?.roles.some((r) => ["Super Admin", "Admin"].includes(r));

  const accentColor  = variant === "admin" ? "#a78bfa" : "#22d3ee";
  const accentBg     = variant === "admin" ? "rgba(139,92,246,0.09)" : "rgba(34,211,238,0.09)";
  const accentBorder = variant === "admin" ? "rgba(139,92,246,0.22)" : "rgba(34,211,238,0.22)";

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[220px] z-30 flex flex-col",
          "border-r transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
        style={{
          background: "#0B1020",
          borderColor: "rgba(148,163,184,0.10)",
        }}
        aria-label="Console navigation"
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 h-14 flex-shrink-0 border-b"
          style={{ borderColor: "rgba(148,163,184,0.08)" }}
        >
          <Link
            to="/"
            className="flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 rounded"
          >
            <img
              src="/img/affectlog360_logo_dark.svg"
              alt="AffectLog"
              className="h-6 object-contain object-left"
            />
          </Link>

          {variant === "admin" && (
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0"
              style={{ background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}
            >
              Admin
            </span>
          )}

          <button
            className="flex-shrink-0 lg:hidden text-slate-500 hover:text-slate-300 p-1"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto" aria-label="Console links">
          {nav.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                )
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: accentBg,
                      color: accentColor,
                      border: `1px solid ${accentBorder}`,
                    }
                  : undefined
              }
              onClick={onClose}
            >
              <Icon size={15} className="flex-shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {badge !== undefined && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                  style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
                >
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="px-2 py-3 border-t flex-shrink-0 space-y-0.5"
          style={{ borderColor: "rgba(148,163,184,0.08)" }}
        >
          {isAdmin && variant !== "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-violet-400/[0.09] text-violet-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                )
              }
            >
              <Settings size={15} />
              <span>Admin Panel</span>
            </NavLink>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-all duration-150"
          >
            <LogOut size={15} />
            Sign out
          </button>

          {/* User chip */}
          {user && (
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(148,163,184,0.09)" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: accentBg, color: accentColor }}
              >
                {(user.full_name ?? user.email ?? "?")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-300 truncate">{user.full_name ?? user.email}</p>
                <p className="text-xs text-slate-600 truncate">{user.roles?.[0] ?? "Member"}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
