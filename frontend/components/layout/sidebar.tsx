"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Sigma, Network, ScrollText, FlaskConical, Shield, Plus, ChevronDown } from "lucide-react";
import { useProject } from "@/lib/project-context";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/workspace", label: "Workspace", icon: ScrollText },
  { href: "/proofs", label: "Proof studio", icon: Sigma },
  { href: "/graph", label: "Knowledge graph", icon: Network },
  { href: "/papers", label: "Papers", icon: FlaskConical },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const { projects, activeProject, stats, loading, setActiveProject, createProject } = useProject();
  const [showPicker, setShowPicker] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  async function handleCreate() {
    if (!newTitle.trim()) return;
    await createProject(newTitle.trim());
    setNewTitle(""); setShowCreate(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "20px 14px" }}>
      <div style={{ marginBottom: 24, padding: "0 6px" }}>
        <div style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>Research OS</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 300, color: "var(--text-primary)", marginTop: 2, letterSpacing: "-0.02em" }}>Math Research OS</div>
      </div>

      <nav style={{ display: "grid", gap: 1 }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", gap: 10, alignItems: "center", padding: "9px 12px",
              borderRadius: "var(--radius-md)", fontSize: 13,
              color: active ? "var(--text-primary)" : "var(--text-muted)",
              background: active ? "var(--bg-hover)" : "transparent",
              fontWeight: active ? 500 : 400, transition: "all 0.12s",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "var(--accent)" : "transparent", flexShrink: 0 }} />
              <Icon size={15} style={{ opacity: active ? 1 : 0.5 }} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{
        marginTop: "auto", background: "var(--bg-raised)", border: "0.5px solid var(--border-light)",
        borderRadius: "var(--radius-lg)", padding: "12px 14px", position: "relative",
      }}>
        {loading ? (
          <div style={{ fontSize: 12, color: "var(--text-faint)" }}>Loading...</div>
        ) : activeProject ? (
          <>
            <button onClick={() => setShowPicker(!showPicker)} style={{
              display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
              cursor: "pointer", padding: 0, width: "100%", textAlign: "left", color: "inherit",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", fontWeight: 500 }}>Active project</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 400, marginTop: 3, color: "var(--text-primary)" }}>{activeProject.title}</div>
                {stats && (
                  <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 11, color: "var(--text-faint)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--teal)" }} />{stats.objects}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--amber)" }} />{stats.proofs}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--purple)" }} />{stats.open_conjectures}</span>
                  </div>
                )}
              </div>
              <ChevronDown size={12} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
            </button>
            {showPicker && (
              <div style={{
                position: "absolute", bottom: "100%", left: 0, right: 0, marginBottom: 8,
                background: "var(--bg-surface)", border: "0.5px solid var(--border-light)",
                borderRadius: "var(--radius-lg)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                padding: 6, zIndex: 50,
              }}>
                {projects.map(p => (
                  <button key={p.id} onClick={() => { setActiveProject(p); setShowPicker(false); }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", background: p.id === activeProject.id ? "var(--bg-raised)" : "transparent", fontSize: 12, color: "var(--text-body)" }}>
                    <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{p.status}</div>
                  </button>
                ))}
                <button onClick={() => { setShowPicker(false); setShowCreate(true); }}
                  style={{ display: "flex", gap: 5, alignItems: "center", width: "100%", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", background: "transparent", fontSize: 12, color: "var(--accent)", marginTop: 2, borderTop: "0.5px solid var(--border)" }}>
                  <Plus size={12} /> New project
                </button>
              </div>
            )}
          </>
        ) : (
          <button onClick={() => setShowCreate(true)} style={{ display: "flex", gap: 5, alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>
            <Plus size={12} /> Create first project
          </button>
        )}
        {showCreate && (
          <div style={{ position: "absolute", bottom: "100%", left: 0, right: 0, marginBottom: 8, background: "var(--bg-surface)", border: "0.5px solid var(--border-light)", borderRadius: "var(--radius-lg)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", padding: 14, zIndex: 50 }}>
            <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 10, color: "var(--text-primary)" }}>New project</div>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreate()} placeholder="Project title..." autoFocus
              style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--radius-md)", border: "0.5px solid var(--border-light)", background: "var(--bg-base)", fontSize: 12, marginBottom: 10, outline: "none", color: "var(--text-primary)" }} />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "8px 10px", borderRadius: "var(--radius-md)", border: "0.5px solid var(--border-light)", background: "transparent", cursor: "pointer", fontSize: 12, color: "var(--text-muted)" }}>Cancel</button>
              <button onClick={handleCreate} style={{ flex: 1, padding: "8px 10px", borderRadius: "var(--radius-md)", border: "none", background: "var(--accent)", color: "var(--bg-base)", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>Create</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
