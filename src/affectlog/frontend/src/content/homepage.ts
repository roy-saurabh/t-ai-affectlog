/**
 * Homepage content — all public copy as typed objects.
 * Edit this file to change homepage text without touching components.
 */

export const hero = {
  title: "Open Trustworthy AI Assessment for Education and Skills Data Spaces",
  subtitle:
    "AffectLog helps teams inspect datasets, assess model behaviour, detect privacy and representation risks, and generate audit-ready metadata without exposing raw personal data.",
  primaryCta: { label: "Launch the Assessment Console", href: "/login" },
  secondaryCta: {
    label: "Contribute on GitHub",
    href: "https://github.com/Prometheus-X-association/t-ai-affectlog",
    external: true,
  },
  tertiaryCta: {
    label: "Read the Technical Documentation",
    href: "https://prometheus-x-association.github.io/docs/t-ai/",
    external: true,
  },
} as const;

export const trustBadges = [
  "Open Source",
  "Privacy-by-Default",
  "OpenAPI 3.1",
  "xAPI-ready",
  "JSON-LD Exports",
  "Dataset + Model Assessment",
  "Prometheus-X Ecosystem",
] as const;

export const problem = {
  heading: "Secure sharing is not enough",
  paragraphs: [
    "Education and skills AI systems increasingly rely on behavioural traces, recommendation logs, model artefacts, and data-space exchanges. As these systems grow more consequential, so does the need to understand what they are doing — and why.",
    "Secure data sharing alone is not sufficient. Institutions also need explainability, privacy-preserving profiling, bias and concentration diagnostics, and audit-ready evidence that documents how data was handled and what risks were identified.",
    "AffectLog provides a repeatable, open-source workflow for these needs — from raw dataset ingestion through PII detection, pseudonymisation, xAPI normalisation, statistical profiling, fairness diagnostics, model explanation, and machine-readable compliance exports.",
  ],
} as const;

export interface Capability {
  title: string;
  description: string;
  icon: string;
}

export const capabilities: Capability[] = [
  {
    title: "Dataset Audit",
    description:
      "End-to-end dataset inspection: schema validation, completeness, temporal density, and quality scoring.",
    icon: "Database",
  },
  {
    title: "xAPI Harmonisation",
    description:
      "Normalize heterogeneous learning activity records to validated xAPI statement format with verb mapping.",
    icon: "Layers",
  },
  {
    title: "PII and Privacy Risk Profiling",
    description:
      "Detect direct and quasi-identifiers, score re-identification risk, and apply configurable pseudonymisation.",
    icon: "ShieldCheck",
  },
  {
    title: "Fairness and Concentration Metrics",
    description:
      "Compute Gini coefficient, Coverage@K, dominance ratios, long-tail analysis, and representation indicators.",
    icon: "BarChart2",
  },
  {
    title: "Model Explanation",
    description:
      "Feature importance, permutation importance, and SHAP-based explanations for scikit-learn, ONNX, PyTorch, and HTTP models.",
    icon: "Cpu",
  },
  {
    title: "Compliance Metadata",
    description:
      "Map findings to GDPR articles and EU AI Act Annex IV requirements. Generate machine-readable JSON-LD compliance graphs.",
    icon: "FileText",
  },
  {
    title: "Data and Model Cards",
    description:
      "Generate structured data cards and model cards documenting provenance, schema, privacy decisions, and quality.",
    icon: "ClipboardList",
  },
  {
    title: "JSON-LD Audit Graphs",
    description:
      "Export full audit provenance as W3C PROV-compatible JSON-LD, suitable for data-space metadata exchange.",
    icon: "Share2",
  },
  {
    title: "OpenAPI Integration",
    description:
      "Fully OpenAPI 3.1 documented REST API. Integrates with any data-space connector or PDC-compatible system.",
    icon: "Code2",
  },
  {
    title: "Data-Space Connector Readiness",
    description:
      "Metadata-only outputs for authorised sharing. ODRL policy scaffolds and PDC mock integration included.",
    icon: "Link2",
  },
];

export const workflowSteps = [
  "Ingest CSV / JSON / JSONL / Parquet",
  "Validate schema and column types",
  "Scrub and pseudonymise identifiers",
  "Normalise xAPI verbs and activity structures",
  "Profile data quality and temporal patterns",
  "Compute concentration, coverage, sparsity, entropy, and representation indicators",
  "Attach model adapters where available",
  "Generate dashboards, SOPs, cards, and compliance graph exports",
  "Share metadata-only outputs with authorised systems",
] as const;

export interface UseCase {
  title: string;
  description: string;
}

export const useCases: UseCase[] = [
  {
    title: "Tactileo / Teacher Interaction Traces",
    description:
      "Ingest and pseudonymise teacher platform activity logs, normalise to xAPI, and profile access patterns.",
  },
  {
    title: "Becomino / Anonymised Learner Logs",
    description:
      "Apply template inference to Becomino-style JSON exports and produce privacy-safe normalised JSONL.",
  },
  {
    title: "Recommendation-System Assessment",
    description:
      "Profile recommendation algorithm data: coverage, Gini, long-tail, and diversity metrics.",
  },
  {
    title: "Dataset Readiness Before AI Training",
    description:
      "Validate a dataset against schema expectations, detect completeness issues, and generate a data card.",
  },
  {
    title: "Post-Training Model Explanation",
    description:
      "Attach a trained model adapter and generate feature importance and explanation outputs.",
  },
  {
    title: "Audit Evidence Preparation",
    description:
      "Produce SOP documents, JSON-LD audit graphs, and compliance mapping exports for institutional review.",
  },
  {
    title: "Data-Space Metadata Exchange",
    description:
      "Export aggregate, pseudonymised metadata under ODRL policies for authorised cross-institutional sharing.",
  },
  {
    title: "Institutional AI Governance",
    description:
      "Document AI system provenance, dataset risk profile, and model behaviour for governance reporting.",
  },
];

export const ecosystem = {
  heading: "Part of the Prometheus-X Trustworthy AI Ecosystem",
  intro:
    "AffectLog is the reference implementation of the Prometheus-X BB04 Trustworthy AI Assessment building block, developed under the EU EDGE-Skills programme (grant 101123471).",
  docsUrl: "https://prometheus-x-association.github.io/docs/t-ai/",
  tools: [
    {
      name: "Prometheus-X BB04",
      affiliation: "Prometheus-X Association",
      role: "Trustworthy AI assessment building block specification",
      description:
        "Prometheus-X BB04 defines the interoperability specification for trustworthy AI assessment within European data spaces. AffectLog is its reference implementation, delivering operation-time dataset and model assessment aligned to BB04 outputs.",
      relation: "implements",
    },
    {
      name: "EDGE-Skills",
      affiliation: "EU Digital Europe Programme",
      role: "EU grant funding AffectLog development",
      description:
        "The EDGE-Skills project (grant agreement 101123471) from the Digital Europe Programme funds AffectLog's development. It targets trustworthy AI for education and skills data spaces, supporting EU AI Act and GDPR compliance requirements.",
      relation: "funded by",
    },
    {
      name: "AffectLog",
      affiliation: "Prometheus-X / EDGE-Skills",
      role: "Operation-time dataset and model assessment",
      description:
        "AffectLog covers operation-time audit workflows: dataset profiling, privacy-preserving assessment, explainability, and audit-ready metadata generation for education and skills data spaces.",
      relation: "this platform",
    },
  ],
} as const;

export const developerCta = {
  heading: "Build reusable assessment recipes with us",
  body: "AffectLog is open source. Developers, researchers, auditors, and data-space operators can contribute dataset recipes, model adapters, privacy controls, metrics, dashboards, and interoperability connectors.",
  buttons: [
    { label: "Read Contributor Guide", href: "/docs/contributing", external: false },
    {
      label: "Open GitHub Issues",
      href: "https://github.com/Prometheus-X-association/t-ai-affectlog/issues",
      external: true,
    },
    {
      label: "Create an Assessment Recipe",
      href: "https://github.com/Prometheus-X-association/t-ai-affectlog/blob/main/CONTRIBUTING.md#assessment-recipes",
      external: true,
    },
    {
      label: "Add a Model Adapter",
      href: "https://github.com/Prometheus-X-association/t-ai-affectlog/blob/main/CONTRIBUTING.md#model-adapters",
      external: true,
    },
    {
      label: "Review Security Policy",
      href: "https://github.com/Prometheus-X-association/t-ai-affectlog/blob/main/SECURITY.md",
      external: true,
    },
  ],
} as const;

export const finalCta = {
  heading: "Start a local privacy-preserving assessment",
  buttons: [
    { label: "Launch Console", href: "/login", external: false },
    { label: "Run with Docker", href: "/docs/deployment", external: false },
    { label: "API Reference", href: "/openapi", external: false },
    {
      label: "Contribute",
      href: "https://github.com/Prometheus-X-association/t-ai-affectlog",
      external: true,
    },
  ],
} as const;

export const euFooter = {
  projectName: "EDGE-Skills",
  fullName: "European Dataspace for Growth and Education – Skills",
  fundingStatement:
    "Co-funded by the European Union under the Digital Europe Programme. Views and opinions expressed are those of the author(s) only and do not necessarily reflect those of the European Union or the European Commission. Neither the European Union nor the European Commission can be held responsible for them.",
  acknowledgement:
    "Built in the context of the European Dataspace for Growth and Education – Skills. Part of the Prometheus-X Trustworthy AI Assessment building block ecosystem.",
  links: [
    {
      label: "Prometheus-X BB04",
      href: "https://prometheus-x.org/bb04-trustworthy-ai-assessment/",
    },
    {
      label: "Technical BB04 Docs",
      href: "https://prometheus-x-association.github.io/docs/t-ai/",
    },
    {
      label: "EDGE-Skills EU Project",
      href: "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/how-to-participate/org-details/883807838/project/101123471/program/43152860/details",
    },
    {
      label: "GitHub Repository",
      href: "https://github.com/Prometheus-X-association/t-ai-affectlog",
    },
    { label: "Prometheus-X", href: "https://prometheus-x.org/" },
  ],
} as const;
