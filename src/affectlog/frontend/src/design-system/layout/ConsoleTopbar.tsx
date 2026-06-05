import React from "react";
import { Link } from "react-router-dom";
import { Menu, Bell, BookOpen, ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "../cn";

interface Breadcrumb { label: string; to?: string; }

interface ConsoleTopbarProps {
  onMenuOpen: () => void;
  breadcrumbs?: Breadcrumb[];
  title?: string;
  actions?: React.ReactNode;
}

export function ConsoleTopbar({ onMenuOpen, breadcrumbs, title, actions }: ConsoleTopbarProps) {
  return (
    <header
      className="flex items-center gap-3 px-4 md:px-6 h-14 flex-shrink-0 border-b sticky top-0 z-20"
      style={{
        background: "rgba(11,16,32,0.95)",
        borderColor: "rgba(203,213,225,0.09)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuOpen}
        className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb / title */}
      <div className="flex-1 flex items-center gap-1.5 overflow-hidden min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm overflow-hidden">
            {breadcrumbs.map((bc, i) => (
              <React.Fragment key={bc.label}>
                {i > 0 && (
                  <ChevronRight size={12} className="text-slate-600 flex-shrink-0" aria-hidden="true" />
                )}
                {bc.to && i < breadcrumbs.length - 1 ? (
                  <Link
                    to={bc.to}
                    className="text-slate-500 hover:text-slate-300 transition-colors truncate"
                  >
                    {bc.label}
                  </Link>
                ) : (
                  <span className={cn("truncate", i === breadcrumbs.length - 1 ? "text-slate-200 font-medium" : "text-slate-500")}>
                    {bc.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : title ? (
          <h1 className="text-sm font-semibold text-slate-200 truncate">{title}</h1>
        ) : null}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}

        <a
          href="/api/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/[0.05]"
        >
          <BookOpen size={13} />
          <span>API</span>
          <ExternalLink size={10} />
        </a>

        <button
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
          aria-label="Notifications"
        >
          <Bell size={15} />
        </button>
      </div>
    </header>
  );
}
