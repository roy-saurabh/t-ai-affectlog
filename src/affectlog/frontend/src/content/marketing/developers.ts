export const DEVELOPERS = {
  meta: {
    title: "AffectLog Developers — Build Reusable Assessment Infrastructure",
    description:
      "Contribute recipes, model adapters, metrics, connector bridges, visualizations, docs, tests, and OpenAPI contracts for trustworthy AI assessment.",
  },
  hero: {
    eyebrow: "Open-source contribution",
    headline: "Build reusable assessment infrastructure",
    subheadline:
      "Contribute recipes, model adapters, metrics, connector bridges, visualizations, docs, tests, and OpenAPI contracts for trustworthy AI assessment.",
    ctas: {
      primary:   { label: "Contribute on GitHub", href: "https://github.com/Prometheus-X-association/t-ai-affectlog" },
      secondary: { label: "Add a Dataset Recipe", to: "/developers" },
      tertiary:  { label: "Add a Model Adapter", to: "/developers" },
    },
  },
  contributions: [
    { label: "Dataset Recipe",    desc: "YAML-defined assessment pipeline for a new dataset format or xAPI profile.", emoji: "📋" },
    { label: "Model Adapter",     desc: "Plug in a new ML framework, model API, or ONNX artifact.", emoji: "🔌" },
    { label: "Fairness Metric",   desc: "Implement a new fairness, quality, or explainability measurement.", emoji: "📊" },
    { label: "Connector Bridge",  desc: "Integrate with a PDC or Prometheus-X data-space endpoint.", emoji: "🔗" },
    { label: "Visualization",     desc: "Add a chart type or improve an existing metric display.", emoji: "📈" },
    { label: "Synthetic Fixture", desc: "Provide test datasets for CI and community onboarding.", emoji: "🧪" },
    { label: "Security Review",   desc: "Audit code paths, dependency chains, or policy enforcement logic.", emoji: "🛡️" },
    { label: "OpenAPI Contract",  desc: "Verify endpoint contracts, schema correctness, and example responses.", emoji: "📄" },
  ],
  finalCta: {
    headline: "Every contribution makes the ecosystem stronger",
    primary:   { label: "View on GitHub", href: "https://github.com/Prometheus-X-association/t-ai-affectlog" },
    secondary: { label: "Read Contributor Guide", href: "https://github.com/Prometheus-X-association/t-ai-affectlog/blob/main/CONTRIBUTING.md" },
  },
} as const;
