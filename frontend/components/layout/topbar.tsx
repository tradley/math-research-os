"use client";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProject } from "@/lib/project-context";

const meta: Record<string, [string, string]> = {
  "/dashboard": ["Overview", "Research dashboard"],
  "/workspace": ["Notebook", "Research workspace"],
  "/proofs": ["Reasoning workbench", "Proof studio"],
  "/graph": ["Dependency intelligence", "Knowledge graph"],
  "/papers": ["Publication", "Papers"],
  "/admin": ["Platform", "Admin"],
};

export function Topbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { activeProject } = useProject();
  const [eyebrow, title] = meta[pathname] || ["Workspace", "Math Research OS"];

  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
      <div>
        <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>{eyebrow}</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--text-primary)", fontWeight: 300, marginTop: 1 }}>{title}</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {activeProject && (
          <div style={{ padding: "5px 12px", borderRadius: "var(--radius-sm)", fontSize: 11, color: "var(--text-muted)", border: "0.5px solid var(--border-light)", background: "var(--bg-surface)" }}>
            {activeProject.title}
          </div>
        )}
        <div style={{ padding: "5px 12px", borderRadius: "var(--radius-sm)", fontSize: 11, border: "0.5px solid var(--border-light)", background: "var(--bg-surface)", display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)" }}>
          <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--bg-hover)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--accent)", fontWeight: 500 }}>
            {(user?.display_name || user?.email || "U")[0].toUpperCase()}
          </span>
          <span style={{ fontWeight: 500 }}>{user?.display_name || user?.email?.split("@")[0] || "User"}</span>
          <button onClick={logout} title="Sign out" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0, color: "var(--text-faint)" }}>
            <LogOut size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
