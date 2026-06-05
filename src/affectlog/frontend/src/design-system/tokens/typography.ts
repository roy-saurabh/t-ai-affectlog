export const typography = {
  scale: {
    displayXl: { size: "5rem",    lineHeight: "5.5rem",  letterSpacing: "-0.04em",  weight: "700" },
    displayLg: { size: "4rem",    lineHeight: "4.5rem",  letterSpacing: "-0.035em", weight: "700" },
    h1:        { size: "3.5rem",  lineHeight: "4rem",    letterSpacing: "-0.03em",  weight: "700" },
    h2:        { size: "2.75rem", lineHeight: "3.25rem", letterSpacing: "-0.025em", weight: "600" },
    h3:        { size: "2rem",    lineHeight: "2.5rem",  letterSpacing: "-0.02em",  weight: "600" },
    h4:        { size: "1.5rem",  lineHeight: "2rem",    letterSpacing: "-0.01em",  weight: "600" },
    bodyLg:    { size: "1.125rem",lineHeight: "1.875rem", weight: "400" },
    body:      { size: "1rem",    lineHeight: "1.625rem", weight: "400" },
    small:     { size: "0.875rem",lineHeight: "1.375rem", weight: "400" },
    caption:   { size: "0.75rem", lineHeight: "1.125rem", weight: "400" },
  },
  fonts: {
    sans: '"InterVariable", "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "IBM Plex Mono", "Fira Code", ui-monospace, monospace',
  },
  // Tailwind class shortcuts
  classes: {
    displayXl: "text-display-xl font-bold tracking-tighter",
    displayLg: "text-display-lg font-bold tracking-tight",
    h1:        "text-h1 font-bold tracking-tight",
    h2:        "text-h2 font-semibold tracking-tight",
    h3:        "text-h3 font-semibold",
    h4:        "text-h4 font-semibold",
    bodyLg:    "text-body-lg leading-relaxed",
    body:      "text-body leading-relaxed",
    small:     "text-small",
    caption:   "text-caption",
  },
} as const;
