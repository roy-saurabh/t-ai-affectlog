import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl",
    "transition-all duration-200 select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "focus-visible:ring-offset-[#050814]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "text-white bg-[#2563EB] hover:bg-[#1d4ed8]",
          "shadow-btn-primary hover:shadow-glow-blue",
          "focus-visible:ring-blue-500/60",
        ].join(" "),
        cyan: [
          "text-white",
          "focus-visible:ring-cyan-400/60",
        ].join(" "),
        violet: [
          "text-white",
          "focus-visible:ring-violet-500/60",
        ].join(" "),
        green: [
          "text-white",
          "focus-visible:ring-emerald-500/60",
        ].join(" "),
        outline: [
          "text-slate-200 border",
          "focus-visible:ring-white/20",
        ].join(" "),
        ghost: [
          "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]",
          "focus-visible:ring-white/20",
        ].join(" "),
        secondary: [
          "bg-slate-700/80 hover:bg-slate-700 text-slate-200 border border-slate-600/50",
          "focus-visible:ring-slate-500/40",
        ].join(" "),
        link: [
          "text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline p-0 h-auto",
          "focus-visible:ring-cyan-400/40",
        ].join(" "),
      },
      size: {
        xs: "text-xs px-3 py-1.5 h-8 gap-1.5",
        sm: "text-sm px-4 py-2 h-9",
        md: "text-sm px-5 py-2.5 h-10",
        lg: "text-base px-6 py-3 h-12",
        xl: "text-base px-8 py-4 h-14",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const inlineStyle: React.CSSProperties = { ...style };

    if (variant === "cyan") {
      inlineStyle.background =
        "linear-gradient(135deg, #06b6d4, #0ea5e9)";
      inlineStyle.boxShadow =
        "0 4px 14px rgba(34,211,238,0.25), 0 2px 6px rgba(34,211,238,0.15)";
    }
    if (variant === "violet") {
      inlineStyle.background =
        "linear-gradient(135deg, #7c3aed, #6d28d9)";
      inlineStyle.boxShadow =
        "0 4px 14px rgba(139,92,246,0.25), 0 2px 6px rgba(139,92,246,0.15)";
    }
    if (variant === "green") {
      inlineStyle.background =
        "linear-gradient(135deg, #059669, #0891b2)";
      inlineStyle.boxShadow =
        "0 4px 14px rgba(16,185,129,0.25), 0 2px 6px rgba(16,185,129,0.15)";
    }
    if (variant === "outline") {
      inlineStyle.borderColor = "rgba(148,163,184,0.20)";
      inlineStyle.background  = "rgba(255,255,255,0.04)";
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || loading}
        style={inlineStyle}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          leftIcon && <span aria-hidden="true">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

// ── Link-style button (anchor) ────────────────────────────────────────────
interface LinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    ButtonVariants {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, leftIcon, rightIcon, children, style, ...props }, ref) => {
    const inlineStyle: React.CSSProperties = { ...style };
    if (variant === "cyan") {
      inlineStyle.background = "linear-gradient(135deg, #06b6d4, #0ea5e9)";
      inlineStyle.boxShadow  = "0 4px 14px rgba(34,211,238,0.25)";
    }
    if (variant === "violet") {
      inlineStyle.background = "linear-gradient(135deg, #7c3aed, #6d28d9)";
      inlineStyle.boxShadow  = "0 4px 14px rgba(139,92,246,0.25)";
    }
    if (variant === "outline") {
      inlineStyle.borderColor = "rgba(148,163,184,0.20)";
      inlineStyle.background  = "rgba(255,255,255,0.04)";
    }

    return (
      <a
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), "cursor-pointer no-underline", className)}
        style={inlineStyle}
        {...props}
      >
        {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
        {children}
        {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </a>
    );
  }
);

LinkButton.displayName = "LinkButton";
