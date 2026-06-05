/** Dark pastel design tokens — v3 */

export const colors = {
  ink: {
    1000: "#030712",
    975:  "#050816",
    950:  "#070B1A",
    925:  "#091022",
    900:  "#0B1224",
    875:  "#0E162B",
    850:  "#111A31",
    800:  "#151F38",
    750:  "#1B2743",
  },
  surface: {
    0:   "#ffffff",
    50:  "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
  },
  pastel: {
    blue:   "#93C5FD",
    cyan:   "#67E8F9",
    teal:   "#5EEAD4",
    green:  "#86EFAC",
    mint:   "#A7F3D0",
    violet: "#C4B5FD",
    purple: "#D8B4FE",
    pink:   "#F9A8D4",
    rose:   "#FDA4AF",
    amber:  "#FCD34D",
    orange: "#FDBA74",
    red:    "#FCA5A5",
  },
  text: {
    primary:   "#F8FAFC",
    secondary: "#D8E0EE",
    tertiary:  "#AEBBD0",
    muted:     "#8391A8",
    soft:      "#6F7D96",
    inverse:   "#08111F",
  },
  /* Legacy aliases for backward-compat */
  navy: {
    950: "#030712",
    900: "#050c1a",
    800: "#0a1628",
    700: "#0f2040",
    600: "#152952",
  },
  cyan: {
    300: "#67E8F9",
    400: "#67E8F9",
    500: "#06b6d4",
    600: "#0891b2",
  },
  electric: {
    400: "#93C5FD",
    500: "#0ea5e9",
    600: "#0284c7",
  },
  violet: {
    300: "#C4B5FD",
    400: "#C4B5FD",
    500: "#8b5cf6",
    600: "#7c3aed",
  },
  emerald: {
    400: "#86EFAC",
    500: "#86EFAC",
    600: "#059669",
  },
  amber: {
    400: "#FCD34D",
    500: "#f59e0b",
  },
  red: {
    400: "#FCA5A5",
    500: "#ef4444",
    600: "#dc2626",
  },
} as const;

export const typography = {
  scale: {
    displayXl: { size: "5.25rem",  lineHeight: "1.09", weight: "700", letterSpacing: "-0.055em" },
    displayLg: { size: "4.5rem",   lineHeight: "1.10", weight: "700", letterSpacing: "-0.050em" },
    hero:      { size: "4.25rem",  lineHeight: "1.07", weight: "700", letterSpacing: "-0.035em" },
    h1:        { size: "3.25rem",  lineHeight: "1.15", weight: "700", letterSpacing: "-0.035em" },
    h2:        { size: "2.625rem", lineHeight: "1.20", weight: "600", letterSpacing: "-0.030em" },
    h3:        { size: "2rem",     lineHeight: "1.25", weight: "600", letterSpacing: "-0.025em" },
    h4:        { size: "1.5rem",   lineHeight: "1.33", weight: "600", letterSpacing: "-0.015em" },
    bodyXl:    { size: "1.25rem",  lineHeight: "1.60", weight: "400" },
    bodyLg:    { size: "1.125rem", lineHeight: "1.67", weight: "400" },
    body:      { size: "1rem",     lineHeight: "1.625",weight: "400" },
    small:     { size: "0.875rem", lineHeight: "1.57", weight: "400" },
    caption:   { size: "0.75rem",  lineHeight: "1.50", weight: "400" },
    mono:      { size: "0.75rem",  lineHeight: "1.50", weight: "500", letterSpacing: "0.02em" },
  },
  fonts: {
    sans: '"InterVariable", "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "IBM Plex Mono", "Fira Code", ui-monospace, monospace',
  },
} as const;

export const spacing = {
  section: { sm: "5rem", md: "7rem", lg: "9rem" },
  container: { max: "90rem", pad: "1.25rem" },
} as const;

export const motion = {
  duration: { fast: 0.15, normal: 0.25, slow: 0.4, slower: 0.6 },
  ease: {
    out: [0.0, 0.0, 0.2, 1.0],
    in:  [0.4, 0.0, 1.0, 1.0],
    inOut: [0.4, 0.0, 0.2, 1.0],
    outExpo: [0.16, 1, 0.3, 1],
    spring: { type: "spring", stiffness: 260, damping: 20 },
  },
} as const;

export const shadows = {
  glow: {
    blue:   "0 0 64px rgba(147,197,253,0.18)",
    cyan:   "0 0 64px rgba(103,232,249,0.16)",
    violet: "0 0 64px rgba(196,181,253,0.16)",
    green:  "0 0 64px rgba(134,239,172,0.13)",
  },
  card: {
    sm: "0 4px 12px rgba(0,0,0,0.40), 0 2px 4px rgba(0,0,0,0.30)",
    md: "0 20px 70px rgba(0,0,0,0.34)",
    lg: "0 30px 120px rgba(0,0,0,0.46)",
  },
} as const;

export const gradients = {
  backgroundMain:
    "radial-gradient(circle at 15% 8%, rgba(147,197,253,0.18), transparent 28%), radial-gradient(circle at 82% 12%, rgba(196,181,253,0.16), transparent 26%), radial-gradient(circle at 48% 78%, rgba(94,234,212,0.10), transparent 36%), linear-gradient(180deg, #030712 0%, #070B1A 40%, #0B1224 100%)",
  heroAurora:
    "radial-gradient(circle at 20% 20%, rgba(103,232,249,0.26), transparent 30%), radial-gradient(circle at 78% 16%, rgba(216,180,254,0.22), transparent 30%), radial-gradient(circle at 58% 78%, rgba(134,239,172,0.14), transparent 35%), linear-gradient(135deg, #030712 0%, #080D1D 52%, #0D1328 100%)",
  primaryCta:
    "linear-gradient(135deg, #93C5FD 0%, #67E8F9 60%, #A7F3D0 100%)",
  violetCta:
    "linear-gradient(135deg, #C4B5FD 0%, #D8B4FE 100%)",
  pastelBorder:
    "linear-gradient(135deg, rgba(147,197,253,0.42), rgba(196,181,253,0.32), rgba(94,234,212,0.28))",
  cardGlass:
    "linear-gradient(180deg, rgba(17,25,45,0.82) 0%, rgba(10,15,32,0.72) 100%)",
  /* Legacy */
  hero: "radial-gradient(ellipse 100% 80% at 50% -10%, #0f1f3d 0%, #070B1A 70%)",
  heroAccent: "radial-gradient(ellipse 60% 40% at 70% 30%, rgba(103,232,249,0.06) 0%, transparent 70%)",
  cyanEdge: "linear-gradient(90deg, transparent, rgba(103,232,249,0.3), transparent)",
  violetEdge: "linear-gradient(90deg, transparent, rgba(196,181,253,0.3), transparent)",
} as const;
