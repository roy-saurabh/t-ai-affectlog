import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Github, Server } from "lucide-react";
import { cn } from "../cn";

interface CTAItem {
  label: string;
  to?: string;
  href?: string;
  variant?: "primary" | "cyan" | "violet" | "outline" | "ghost" | "github";
  icon?: React.ReactNode;
  external?: boolean;
}

interface CTAGroupProps {
  items: CTAItem[];
  align?: "left" | "center" | "right";
  size?: "sm" | "md" | "lg";
  className?: string;
  stack?: boolean;
}

const sizeMap = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

function variantStyles(variant: CTAItem["variant"] = "outline"): React.CSSProperties {
  if (variant === "primary")
    return { background: "#2563EB", color: "#fff", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" };
  if (variant === "cyan")
    return { background: "linear-gradient(135deg, #06b6d4, #0ea5e9)", color: "#fff", boxShadow: "0 4px 14px rgba(34,211,238,0.25)" };
  if (variant === "violet")
    return { background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", boxShadow: "0 4px 14px rgba(139,92,246,0.25)" };
  if (variant === "outline")
    return { background: "rgba(255,255,255,0.04)", borderColor: "rgba(148,163,184,0.22)", color: "#CBD5E1" };
  if (variant === "ghost")
    return { color: "#94a3b8" };
  if (variant === "github")
    return { background: "rgba(255,255,255,0.06)", borderColor: "rgba(148,163,184,0.18)", color: "#CBD5E1" };
  return {};
}

function CTAButton({ item, size }: { item: CTAItem; size: keyof typeof sizeMap }) {
  const cls = cn(
    "inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40",
    item.variant === "outline" && "border",
    item.variant === "ghost" && "hover:text-white hover:bg-white/[0.06]",
    item.variant === "github" && "border",
    sizeMap[size]
  );

  const style = variantStyles(item.variant);
  const icon = item.icon ? item.icon : item.variant === "github" ? <Github size={15} /> : null;

  if (item.href) {
    return (
      <a
        href={item.href}
        target={item.external !== false ? "_blank" : undefined}
        rel={item.external !== false ? "noopener noreferrer" : undefined}
        className={cls}
        style={style}
      >
        {icon}
        {item.label}
        {item.variant !== "ghost" && <ArrowRight size={14} aria-hidden="true" />}
      </a>
    );
  }

  return (
    <Link to={item.to ?? "/"} className={cls} style={style}>
      {icon}
      {item.label}
      {item.variant !== "ghost" && <ArrowRight size={14} aria-hidden="true" />}
    </Link>
  );
}

export function CTAGroup({ items, align = "left", size = "md", className, stack = false }: CTAGroupProps) {
  const alignMap = { left: "justify-start", center: "justify-center", right: "justify-end" };

  return (
    <div
      className={cn(
        "flex gap-3 flex-wrap",
        alignMap[align],
        stack && "flex-col sm:flex-row",
        className
      )}
    >
      {items.map((item) => (
        <CTAButton key={item.label} item={item} size={size} />
      ))}
    </div>
  );
}

// ── Standalone pre-configured CTA bands ──────────────────────────────────
interface HeroCTAProps {
  primary: { label: string; to?: string; href?: string };
  secondary?: { label: string; to?: string; href?: string };
  tertiary?: { label: string; to?: string; href?: string };
  align?: "left" | "center";
  className?: string;
}

export function HeroCTA({ primary, secondary, tertiary, align = "left", className }: HeroCTAProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-3",
        align === "center" && "justify-center",
        className
      )}
    >
      <Link
        to={primary.to ?? "/"}
        className="inline-flex items-center gap-2 font-semibold text-white rounded-xl px-6 py-3 text-base transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: "linear-gradient(135deg, #06b6d4, #0ea5e9)",
          boxShadow: "0 4px 14px rgba(34,211,238,0.30)",
        }}
      >
        {primary.label} <ArrowRight size={16} />
      </Link>

      {secondary && (
        <Link
          to={secondary.to ?? "/"}
          className="inline-flex items-center gap-2 font-semibold text-slate-200 rounded-xl px-6 py-3 text-base border transition-all duration-200 hover:bg-white/[0.06] hover:border-slate-400/40"
          style={{ borderColor: "rgba(148,163,184,0.22)", background: "rgba(255,255,255,0.04)" }}
        >
          <Server size={16} className="text-slate-400" />
          {secondary.label}
        </Link>
      )}

      {tertiary && (
        <Link
          to={tertiary.to ?? "/"}
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 px-3 py-3 text-sm transition-colors"
        >
          {tertiary.label} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

// ── CTABand — full-width section CTA ─────────────────────────────────────
interface CTABandProps {
  headline: string;
  subline: string;
  primary: { label: string; to?: string; href?: string };
  secondary?: { label: string; to?: string; href?: string };
  tertiary?: { label: string; to?: string; href?: string };
  className?: string;
}

export function CTABand({ headline, subline, primary, secondary, tertiary, className }: CTABandProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16", className)}
      style={{
        background:
          "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(5,8,20,0.9) 0%, #080D1F 60%), #080D1F",
        border: "1px solid rgba(148,163,184,0.12)",
      }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden="true"
      />
      {/* Glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-64 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(34,211,238,0.08) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
          {headline}
        </h2>
        <p className="text-slate-400 mb-8 text-base md:text-lg leading-relaxed">{subline}</p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to={primary.to ?? "/"}
            className="inline-flex items-center gap-2 font-semibold text-white rounded-xl px-6 py-3 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #06b6d4, #0ea5e9)", boxShadow: "0 4px 14px rgba(34,211,238,0.25)" }}
          >
            {primary.label} <ArrowRight size={16} />
          </Link>
          {secondary && (
            <Link
              to={secondary.to ?? "/"}
              className="inline-flex items-center gap-2 font-semibold text-slate-200 rounded-xl px-6 py-3 border transition-all duration-200 hover:bg-white/[0.06]"
              style={{ borderColor: "rgba(148,163,184,0.22)", background: "rgba(255,255,255,0.04)" }}
            >
              {secondary.label} <ArrowRight size={15} />
            </Link>
          )}
          {tertiary && (
            <Link
              to={tertiary.to ?? "/"}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white px-5 py-3 text-sm rounded-xl hover:bg-white/[0.04] transition-all"
            >
              {tertiary.label} <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
