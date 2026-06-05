import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-semibold select-none transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "focus-visible:ring-offset-[#070B1A]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        /* Pastel gradient — primary action */
        primary: [
          "text-[#08111F] font-semibold rounded-[14px]",
          "shadow-btn-primary hover:shadow-[0_6px_28px_rgba(147,197,253,0.42),0_4px_12px_rgba(147,197,253,0.30)]",
          "focus-visible:ring-sky-300/60",
        ].join(" "),
        /* Glass outline — secondary */
        secondary: [
          "text-[#D8E0EE] hover:text-[#F8FAFC] border rounded-[14px]",
          "backdrop-blur-[12px]",
          "focus-visible:ring-white/20",
        ].join(" "),
        /* Pastel violet gradient */
        violet: [
          "text-[#08111F] font-semibold rounded-[14px]",
          "focus-visible:ring-violet-300/60",
        ].join(" "),
        /* Pastel green gradient */
        green: [
          "text-[#08111F] font-semibold rounded-[14px]",
          "focus-visible:ring-emerald-300/60",
        ].join(" "),
        /* Pastel cyan */
        cyan: [
          "text-[#08111F] font-semibold rounded-[14px]",
          "focus-visible:ring-cyan-300/60",
        ].join(" "),
        /* Transparent ghost */
        ghost: [
          "text-[#8391A8] hover:text-[#D8E0EE] hover:bg-[rgba(203,213,225,0.06)] rounded-xl",
          "focus-visible:ring-white/20",
        ].join(" "),
        /* Subtle outline */
        outline: [
          "text-[#AEBBD0] hover:text-[#F8FAFC] border rounded-xl",
          "hover:bg-[rgba(255,255,255,0.04)]",
          "focus-visible:ring-white/20",
        ].join(" "),
        /* Danger — pastel red */
        danger: [
          "text-[#08111F] font-semibold rounded-[14px]",
          "focus-visible:ring-rose-300/60",
        ].join(" "),
        /* Text link style */
        link: [
          "text-[#93C5FD] hover:text-[#67E8F9] underline-offset-4 hover:underline p-0 h-auto",
          "focus-visible:ring-sky-300/40",
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

const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, #93C5FD 0%, #67E8F9 60%, #A7F3D0 100%)",
    boxShadow: "0 4px 20px rgba(147,197,253,0.32), 0 2px 8px rgba(147,197,253,0.22)",
  },
  violet: {
    background: "linear-gradient(135deg, #C4B5FD 0%, #D8B4FE 100%)",
    boxShadow: "0 4px 20px rgba(196,181,253,0.30)",
  },
  green: {
    background: "linear-gradient(135deg, #86EFAC 0%, #5EEAD4 100%)",
    boxShadow: "0 4px 20px rgba(134,239,172,0.28)",
  },
  cyan: {
    background: "linear-gradient(135deg, #67E8F9 0%, #93C5FD 100%)",
    boxShadow: "0 4px 20px rgba(103,232,249,0.28)",
  },
  danger: {
    background: "linear-gradient(135deg, #FCA5A5 0%, #FDA4AF 100%)",
    boxShadow: "0 4px 20px rgba(252,165,165,0.28)",
  },
  secondary: {
    background: "rgba(15,23,42,0.56)",
    borderColor: "rgba(203,213,225,0.22)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.24)",
  },
  outline: {
    borderColor: "rgba(203,213,225,0.18)",
    background: "transparent",
  },
};

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
    const variantStyle = variant ? (VARIANT_STYLES[variant] ?? {}) : {};
    const inlineStyle: React.CSSProperties = { ...variantStyle, ...style };

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

/* ── Link-style button (anchor) ─────────────────────────────────── */
interface LinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    ButtonVariants {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    { className, variant = "primary", size = "md", fullWidth, leftIcon, rightIcon, children, style, ...props },
    ref
  ) => {
    const variantStyle = variant ? (VARIANT_STYLES[variant] ?? {}) : {};
    const inlineStyle: React.CSSProperties = { ...variantStyle, ...style };

    return (
      <a
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, fullWidth }),
          "cursor-pointer no-underline",
          className
        )}
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
