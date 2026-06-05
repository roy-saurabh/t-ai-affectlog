import React from "react";
import { cn } from "../cn";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  bg?: "dark" | "darker" | "raised" | "transparent";
  size?: "sm" | "md" | "lg" | "xl";
  container?: "tight" | "normal" | "wide" | "none";
  as?: React.ElementType;
}

const bgMap = {
  dark:        { background: "#050814" },
  darker:      { background: "#030712" },
  raised:      { background: "#080D1F" },
  transparent: {},
} as const;

const sizeMap = {
  sm: "py-16 md:py-20 lg:py-24",
  md: "py-20 md:py-24 lg:py-28",
  lg: "py-24 md:py-28 lg:py-32",
  xl: "py-28 md:py-32 lg:py-40",
} as const;

const containerMap = {
  tight:  "max-w-4xl mx-auto px-5 md:px-6",
  normal: "max-w-6xl mx-auto px-5 md:px-8",
  wide:   "max-w-7xl mx-auto px-5 md:px-8 lg:px-10",
  none:   "",
} as const;

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({
    className,
    bg = "dark",
    size = "lg",
    container = "wide",
    as: Tag = "section",
    children,
    style,
    ...props
  }, ref) => {
    return (
      <Tag
        ref={ref}
        className={cn("relative overflow-hidden", sizeMap[size], className)}
        style={{ ...bgMap[bg], ...style }}
        {...props}
      >
        {container !== "none" ? (
          <div className={containerMap[container]}>{children}</div>
        ) : (
          children
        )}
      </Tag>
    );
  }
);

Section.displayName = "Section";

// ── Container standalone ──────────────────────────────────────────────────
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "tight" | "normal" | "wide" | "full";
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "wide", children, ...props }, ref) => {
    const sizeClass = {
      tight:  "max-w-4xl mx-auto px-5 md:px-6",
      normal: "max-w-6xl mx-auto px-5 md:px-8",
      wide:   "max-w-7xl mx-auto px-5 md:px-8 lg:px-10",
      full:   "w-full mx-auto px-5 md:px-8 lg:px-12",
    }[size];

    return (
      <div ref={ref} className={cn(sizeClass, className)} {...props}>
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";
