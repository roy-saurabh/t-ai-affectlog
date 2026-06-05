export const SECURITY = {
  meta: {
    title: "AffectLog Security — Privacy-First Assessment Infrastructure",
    description:
      "Designed around admin-approved access, RBAC, tenant boundaries, pseudonymisation, audit logs, raw-export guardrails, and secure artifact handling.",
  },
  hero: {
    eyebrow: "Privacy-first architecture",
    headline: "Privacy-first assessment infrastructure",
    subheadline:
      "Designed around admin-approved access, RBAC, tenant boundaries, pseudonymisation, audit logs, raw-export guardrails, and secure artifact handling.",
    ctas: {
      primary:   { label: "Read Security Policy", to: "/security" },
      secondary: { label: "Review RBAC Model", to: "/docs" },
      tertiary:  { label: "Request Security Review", to: "/request-access" },
    },
  },
  principles: [
    { title: "Admin-approved onboarding",    desc: "No self-registration. Every workspace must be approved by a platform administrator before access is granted." },
    { title: "RBAC with tenant isolation",   desc: "Role-based access control enforced at every API endpoint. Tenants are fully isolated; cross-tenant data access is architecturally impossible." },
    { title: "Pseudonymisation by default",  desc: "PII fields are hashed with HMAC, redacted, or suppressed before any metric computation. Raw identifiers never leave the input layer." },
    { title: "No raw data in exports",       desc: "Every artifact — SOPs, data cards, JSON-LD graphs, dashboards — contains only aggregate or derived metadata. Raw records are never exported." },
    { title: "Immutable audit log",          desc: "Every administrative action, support access grant, and data export is logged in a tamper-evident audit trail." },
    { title: "Support access gated",         desc: "AffectLog support staff cannot access tenant data without explicit, time-limited grants visible in the audit log." },
  ],
  finalCta: {
    headline: "Privacy and security are not optional add-ons",
    primary:   { label: "Read Full Security Policy", to: "/docs" },
    secondary: { label: "Request Access", to: "/request-access" },
  },
} as const;
