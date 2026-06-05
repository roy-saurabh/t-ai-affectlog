export const PRODUCT = {
  meta: {
    title: "AffectLog Platform — From Raw Traces to Structured Audit Evidence",
    description:
      "AffectLog turns heterogeneous datasets, xAPI-style logs, model artifacts, and assessment recipes into interpretable metrics, privacy reports, dashboards, SOPs, and machine-readable compliance graphs.",
  },
  hero: {
    eyebrow: "Full assessment pipeline",
    headline: "From raw educational traces to structured audit evidence",
    subheadline:
      "AffectLog turns heterogeneous datasets, xAPI-style logs, model artifacts, and assessment recipes into interpretable metrics, privacy reports, dashboards, SOPs, and machine-readable compliance graphs.",
    ctas: {
      primary:   { label: "Launch Guided Assessment", to: "/guided-assessment" },
      secondary: { label: "View Architecture", to: "/docs" },
      tertiary:  { label: "Request Managed Access", to: "/request-access" },
    },
  },
  finalCta: {
    headline: "See the platform in action",
    primary:   { label: "Run Guided Assessment", to: "/guided-assessment" },
    secondary: { label: "Request Managed Access", to: "/request-access" },
    tertiary:  { label: "View OpenAPI", href: "/api/docs" },
  },
} as const;
