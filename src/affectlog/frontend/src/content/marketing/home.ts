export const HOME = {
  meta: {
    title: "AffectLog — Trustworthy AI Assessment for Education Data Spaces",
    description:
      "Inspect datasets, evaluate model behaviour, detect privacy and representation risks, and generate audit-ready evidence through open, privacy-preserving workflows.",
    ogImage: "/img/og/home.png",
  },
  hero: {
    eyebrow: "Open-source core · AffectLog-managed option · Data-space ready",
    headline: "Trustworthy AI assessment for education and skills data spaces",
    subheadline:
      "Inspect datasets, evaluate model behaviour, detect privacy and representation risks, and generate audit-ready evidence through open, privacy-preserving workflows.",
    ctas: {
      primary:   { label: "Request Managed Access", to: "/request-access" },
      secondary: { label: "Deploy Community Edition", to: "/community" },
      tertiary:  { label: "Explore the Platform", to: "/product" },
    },
    trustBadges: [
      "Open-source core",
      "Privacy-by-default",
      "OpenAPI-first",
      "xAPI-ready",
      "JSON-LD outputs",
      "Managed by AffectLog",
      "Prometheus-X BB04",
    ],
  },
  midCta: {
    label: "Run a guided assessment with guardrails",
    to: "/guided-assessment",
  },
  finalCta: {
    headline: "Start with the open-source core or request managed operations",
    subline:
      "Self-host the Community Edition or request an AffectLog-managed environment for hosted operations, onboarding, monitoring, and support.",
    primary:   { label: "Request Managed Access", to: "/request-access" },
    secondary: { label: "Deploy Community Edition", to: "/community" },
    tertiary:  { label: "Read Documentation", to: "/docs" },
  },
} as const;
