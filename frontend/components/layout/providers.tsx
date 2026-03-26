"use client";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ProjectProvider } from "@/lib/project-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { RightRail } from "@/components/layout/right-rail";
import { LoginScreen } from "@/components/layout/login-screen";
import type { ReactNode } from "react";

function AppShell({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "grid", placeItems: "center", background: "var(--bg-base)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 300, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>Math Research OS</div>
          <div style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 8 }}>Loading workspace...</div>
        </div>
      </div>
    );
  }

  if (!token) return <LoginScreen />;

  return (
    <ProjectProvider>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 300px", gridTemplateRows: "52px 1fr", height: "100vh", overflow: "hidden" }}>
        <div style={{ gridRow: "1 / span 2", borderRight: "0.5px solid var(--border)", background: "var(--bg-surface)" }}>
          <Sidebar />
        </div>
        <div style={{ borderBottom: "0.5px solid var(--border)", background: "var(--bg-base)" }}>
          <Topbar />
        </div>
        <div style={{ gridRow: "1 / span 2", borderLeft: "0.5px solid var(--border)", background: "var(--bg-surface)" }}>
          <RightRail />
        </div>
        <main style={{ overflow: "auto", background: "var(--bg-base)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 28px" }}>{children}</div>
        </main>
      </div>
    </ProjectProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider><AppShell>{children}</AppShell></AuthProvider>;
}
