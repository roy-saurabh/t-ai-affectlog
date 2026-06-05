import React, { useState } from "react";
import { ConsoleSidebar, type NavItem } from "./ConsoleSidebar";
import { ConsoleTopbar } from "./ConsoleTopbar";

interface ConsoleShellProps {
  nav: NavItem[];
  children: React.ReactNode;
  variant?: "app" | "admin";
  breadcrumbs?: { label: string; to?: string }[];
  title?: string;
  topbarActions?: React.ReactNode;
}

export function ConsoleShell({
  nav,
  children,
  variant = "app",
  breadcrumbs,
  title,
  topbarActions,
}: ConsoleShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "#080D1F", color: "#F8FAFC" }}
    >
      <ConsoleSidebar
        nav={nav}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        variant={variant}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col lg:ml-[220px] min-w-0">
        <ConsoleTopbar
          onMenuOpen={() => setMenuOpen(true)}
          breadcrumbs={breadcrumbs}
          title={title}
          actions={topbarActions}
        />

        <main id="main-content" className="flex-1 p-5 md:p-6 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
