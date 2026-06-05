import React from "react";
import { cn } from "../cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "outline";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  glow?: "cyan" | "violet" | "green" | "blue" | "none";
}

const paddingMap = {
  none: "",
  sm:   "p-4",
  md:   "p-5",
  lg:   "p-6 md:p-8",
} as const;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", hover = false, glow = "none", children, style, ...props }, ref) => {
    const glowStyles: Record<string, string> = {
      cyan:   "0 0 32px rgba(34,211,238,0.12), 0 0 64px rgba(34,211,238,0.05)",
      violet: "0 0 32px rgba(139,92,246,0.12), 0 0 64px rgba(139,92,246,0.05)",
      green:  "0 0 32px rgba(16,185,129,0.12), 0 0 64px rgba(16,185,129,0.05)",
      blue:   "0 0 32px rgba(37,99,235,0.15),  0 0 64px rgba(37,99,235,0.07)",
      none:   "",
    };

    const baseStyle: React.CSSProperties = {
      boxShadow: glow !== "none" ? glowStyles[glow] : undefined,
      ...style,
    };

    const variantClasses = {
      default: [
        "bg-slate-800/80 border border-slate-700/60 rounded-2xl",
        hover && "hover:border-slate-600/80 hover:bg-slate-800 transition-all duration-200",
      ],
      glass: [
        "rounded-2xl border backdrop-blur-[14px] transition-all duration-200",
        hover && "hover:border-cyan-400/25",
      ],
      elevated: [
        "rounded-2xl border transition-all duration-200",
        hover && "hover:-translate-y-0.5 hover:shadow-card-xl",
      ],
      outline: [
        "rounded-2xl border transition-all duration-200 bg-transparent",
        hover && "hover:bg-white/[0.03]",
      ],
    };

    const variantStyles: React.CSSProperties = {};
    if (variant === "glass") {
      variantStyles.background = "rgba(255,255,255,0.035)";
      variantStyles.borderColor = "rgba(148,163,184,0.12)";
    }
    if (variant === "elevated") {
      variantStyles.background = "rgba(11,16,32,0.85)";
      variantStyles.borderColor = "rgba(148,163,184,0.14)";
      variantStyles.boxShadow = "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)";
    }
    if (variant === "outline") {
      variantStyles.borderColor = "rgba(148,163,184,0.18)";
    }

    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant].filter(Boolean).join(" "),
          paddingMap[padding],
          className
        )}
        style={{ ...variantStyles, ...baseStyle }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// ── GlassCard shorthand ───────────────────────────────────────────────────
export const GlassCard = React.forwardRef<HTMLDivElement, Omit<CardProps, "variant">>(
  (props, ref) => <Card ref={ref} variant="glass" hover {...props} />
);
GlassCard.displayName = "GlassCard";
