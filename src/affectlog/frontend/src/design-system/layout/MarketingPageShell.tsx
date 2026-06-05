import React from "react";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

interface MarketingPageShellProps {
  children: React.ReactNode;
  darkBg?: boolean;
}

export function MarketingPageShell({ children, darkBg = true }: MarketingPageShellProps) {
  return (
    <div
      id="page-root"
      style={{ background: darkBg ? "#050814" : "#ffffff", color: darkBg ? "#F8FAFC" : "#0F172A", minHeight: "100vh" }}
    >
      <PublicHeader />
      <main id="main-content">{children}</main>
      <PublicFooter />
    </div>
  );
}
