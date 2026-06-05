/** AffectLog dark pastel color tokens — single source of truth */
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
  /* backward compat */
  bg: {
    950: "#070B1A",
    900: "#0B1224",
    850: "#111A31",
    800: "#151F38",
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
  border: {
    subtle:     "rgba(203,213,225,0.10)",
    default:    "rgba(203,213,225,0.16)",
    strong:     "rgba(203,213,225,0.28)",
    glowBlue:   "rgba(125,211,252,0.34)",
    glowViolet: "rgba(196,181,253,0.34)",
    glowGreen:  "rgba(134,239,172,0.30)",
  },
  semantic: {
    privacy:        "#86EFAC",
    security:       "#5EEAD4",
    explainability: "#C4B5FD",
    model:          "#D8B4FE",
    data:           "#93C5FD",
    xapi:           "#67E8F9",
    compliance:     "#A7F3D0",
    warning:        "#FCD34D",
    risk:           "#FCA5A5",
    success:        "#86EFAC",
    neutral:        "#8391A8",
  },
} as const;

export type PastelColor  = keyof typeof colors.pastel;
export type SemanticColor = keyof typeof colors.semantic;
