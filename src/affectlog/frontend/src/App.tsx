import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  LayoutDashboard, Database, FlaskConical, ShieldCheck, Cpu,
  Users, ClipboardList, Shield, Mail, Activity, Wand2,
} from "lucide-react";
import { AuthProvider } from "./auth/AuthProvider";
import { RequireAuth, RequireAdmin } from "./auth/RequireAuth";
import { ConsoleShell } from "./design-system/layout/ConsoleShell";
import type { NavItem } from "./design-system/layout/ConsoleSidebar";

// ── Public pages ───────────────────────────────────────────────────────────
const PublicHome          = lazy(() => import("./pages/public/Home"));
const ProductPage         = lazy(() => import("./pages/public/Product"));
const GuidedAssessmentPage= lazy(() => import("./pages/public/GuidedAssessment"));
const DatasetAuditPage    = lazy(() => import("./pages/public/DatasetAudit"));
const ModelAssessmentPage = lazy(() => import("./pages/public/ModelAssessment"));
const ComplianceExportsPage = lazy(() => import("./pages/public/ComplianceExports"));
const EcosystemPage       = lazy(() => import("./pages/public/Ecosystem"));
const OpenAPIPage         = lazy(() => import("./pages/public/OpenAPI"));
const DocsPage            = lazy(() => import("./pages/public/Docs"));
const CommunityEdition    = lazy(() => import("./pages/public/CommunityEdition"));
const ManagedCloud        = lazy(() => import("./pages/public/ManagedCloud"));
const PricingPage         = lazy(() => import("./pages/public/Pricing"));
const SelfHost            = lazy(() => import("./pages/public/SelfHost"));
const DevelopersPage      = lazy(() => import("./pages/public/Developers"));
const RequestAccess       = lazy(() => import("./pages/public/RequestAccess"));
const SecurityPage        = lazy(() => import("./pages/public/Security"));
const Login               = lazy(() => import("./pages/public/Login"));
const Register            = lazy(() => import("./pages/public/Register"));
const AwaitingApproval    = lazy(() => import("./pages/public/AwaitingApproval"));
const Activation          = lazy(() => import("./pages/public/Activation"));
const ForgotPassword      = lazy(() => import("./pages/public/ForgotPassword"));
const ResetPassword       = lazy(() => import("./pages/public/ResetPassword"));

// ── Authenticated app pages ────────────────────────────────────────────────
const AppHome       = lazy(() => import("./pages/Home"));
const AnalysisWizard= lazy(() => import("./pages/app/AnalysisWizard"));
const Datasets      = lazy(() => import("./pages/Datasets"));
const Audit         = lazy(() => import("./pages/Audit"));
const Models        = lazy(() => import("./pages/Models"));
const Compliance    = lazy(() => import("./pages/Compliance"));

// ── Admin pages ────────────────────────────────────────────────────────────
const AdminDashboard      = lazy(() => import("./pages/admin/AdminDashboard"));
const PendingRegistrations= lazy(() => import("./pages/admin/PendingRegistrations"));
const AdminUsers          = lazy(() => import("./pages/admin/Users"));
const AuditLogPage        = lazy(() => import("./pages/admin/AuditLog"));

// ── Suspense spinner ───────────────────────────────────────────────────────
function Spinner() {
  return (
    <div
      className="flex-1 flex items-center justify-center min-h-screen"
      style={{ background: "#050814" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl"
          style={{
            background: "rgba(34,211,238,0.15)",
            border: "1px solid rgba(34,211,238,0.30)",
            animation: "pulseGlow 1.5s ease-in-out infinite",
          }}
        />
        <p className="text-xs text-slate-600 font-mono">Loading…</p>
      </div>
    </div>
  );
}

// ── App navigation ─────────────────────────────────────────────────────────
const APP_NAV: NavItem[] = [
  { to: "/app",            label: "Overview",          icon: LayoutDashboard, end: true },
  { to: "/app/wizard",     label: "Guided Assessment", icon: Wand2 },
  { to: "/app/datasets",   label: "Datasets",          icon: Database },
  { to: "/app/audit",      label: "Audit",             icon: FlaskConical },
  { to: "/app/compliance", label: "Compliance",        icon: ShieldCheck },
  { to: "/app/models",     label: "Models",            icon: Cpu },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin",                        label: "Dashboard",     icon: LayoutDashboard, end: true },
  { to: "/admin/pending-registrations",  label: "Registrations", icon: ClipboardList },
  { to: "/admin/users",                  label: "Users",         icon: Users },
  { to: "/admin/audit-log",              label: "Audit Log",     icon: Shield },
  { to: "/admin/email",                  label: "Email",         icon: Mail },
  { to: "/admin/system",                 label: "System",        icon: Activity },
];

// ── Admin stub pages ───────────────────────────────────────────────────────
function AdminEmail() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Email Settings</h1>
      <p className="text-slate-400 text-sm">Configure SMTP and test email templates via the API.</p>
      <a
        href="/api/docs#tag/admin"
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
      >
        Open API docs ↗
      </a>
    </div>
  );
}

function AdminSystem() {
  const [health, setHealth] = React.useState<Record<string, unknown> | null>(null);
  React.useEffect(() => {
    import("./api/admin")
      .then(({ adminApi }) => adminApi.getSystemHealth().then(setHealth).catch(() => {}));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">System Health</h1>
      {health ? (
        <pre
          className="rounded-2xl p-4 text-xs overflow-auto text-slate-300"
          style={{ background: "rgba(11,16,32,0.8)", border: "1px solid rgba(148,163,184,0.12)" }}
        >
          {JSON.stringify(health, null, 2)}
        </pre>
      ) : (
        <p className="text-slate-500 text-sm">Loading…</p>
      )}
    </div>
  );
}

// ── AppShell wrapper (uses new ConsoleShell) ───────────────────────────────
function AppShellWrapper({ nav, children, variant = "app" }: { nav: NavItem[]; children: React.ReactNode; variant?: "app" | "admin" }) {
  return (
    <ConsoleShell nav={nav} variant={variant}>
      {children}
    </ConsoleShell>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Spinner />}>
          <Routes>
            {/* ── Public marketing pages ─────────────────────────────── */}
            <Route path="/"                    element={<PublicHome />} />
            <Route path="/product"             element={<ProductPage />} />
            <Route path="/guided-assessment"   element={<GuidedAssessmentPage />} />
            <Route path="/dataset-audit"       element={<DatasetAuditPage />} />
            <Route path="/model-assessment"    element={<ModelAssessmentPage />} />
            <Route path="/compliance-exports"  element={<ComplianceExportsPage />} />
            <Route path="/ecosystem"           element={<EcosystemPage />} />
            <Route path="/openapi"             element={<OpenAPIPage />} />
            <Route path="/docs"                element={<DocsPage />} />
            <Route path="/community"           element={<CommunityEdition />} />
            <Route path="/cloud"               element={<ManagedCloud />} />
            <Route path="/pricing"             element={<PricingPage />} />
            <Route path="/self-host"           element={<SelfHost />} />
            <Route path="/developers"          element={<DevelopersPage />} />
            <Route path="/request-access"      element={<RequestAccess />} />
            <Route path="/security"            element={<SecurityPage />} />

            {/* ── Auth pages ─────────────────────────────────────────── */}
            <Route path="/login"            element={<Login />} />
            <Route path="/register"         element={<Register />} />
            <Route path="/awaiting-approval"element={<AwaitingApproval />} />
            <Route path="/activate"         element={<Activation />} />
            <Route path="/forgot-password"  element={<ForgotPassword />} />
            <Route path="/reset-password"   element={<ResetPassword />} />

            {/* ── Authenticated app routes ───────────────────────────── */}
            <Route path="/app" element={
              <RequireAuth>
                <AppShellWrapper nav={APP_NAV}><AppHome /></AppShellWrapper>
              </RequireAuth>
            } />
            <Route path="/app/wizard/*" element={
              <RequireAuth>
                <AppShellWrapper nav={APP_NAV}><AnalysisWizard /></AppShellWrapper>
              </RequireAuth>
            } />
            <Route path="/app/datasets" element={
              <RequireAuth>
                <AppShellWrapper nav={APP_NAV}><Datasets /></AppShellWrapper>
              </RequireAuth>
            } />
            <Route path="/app/audit" element={
              <RequireAuth>
                <AppShellWrapper nav={APP_NAV}><Audit /></AppShellWrapper>
              </RequireAuth>
            } />
            <Route path="/app/compliance" element={
              <RequireAuth>
                <AppShellWrapper nav={APP_NAV}><Compliance /></AppShellWrapper>
              </RequireAuth>
            } />
            <Route path="/app/models" element={
              <RequireAuth>
                <AppShellWrapper nav={APP_NAV}><Models /></AppShellWrapper>
              </RequireAuth>
            } />

            {/* ── Admin routes ───────────────────────────────────────── */}
            <Route path="/admin" element={
              <RequireAdmin>
                <AppShellWrapper nav={ADMIN_NAV} variant="admin"><AdminDashboard /></AppShellWrapper>
              </RequireAdmin>
            } />
            <Route path="/admin/pending-registrations" element={
              <RequireAdmin>
                <AppShellWrapper nav={ADMIN_NAV} variant="admin"><PendingRegistrations /></AppShellWrapper>
              </RequireAdmin>
            } />
            <Route path="/admin/users" element={
              <RequireAdmin>
                <AppShellWrapper nav={ADMIN_NAV} variant="admin"><AdminUsers /></AppShellWrapper>
              </RequireAdmin>
            } />
            <Route path="/admin/audit-log" element={
              <RequireAdmin>
                <AppShellWrapper nav={ADMIN_NAV} variant="admin"><AuditLogPage /></AppShellWrapper>
              </RequireAdmin>
            } />
            <Route path="/admin/email" element={
              <RequireAdmin>
                <AppShellWrapper nav={ADMIN_NAV} variant="admin"><AdminEmail /></AppShellWrapper>
              </RequireAdmin>
            } />
            <Route path="/admin/system" element={
              <RequireAdmin>
                <AppShellWrapper nav={ADMIN_NAV} variant="admin"><AdminSystem /></AppShellWrapper>
              </RequireAdmin>
            } />

            {/* ── Fallback ────────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
