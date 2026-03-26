"use client";
import { useEffect, useState } from "react";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeader } from "@/components/ui/section-header";
import { useAuth } from "@/lib/auth-context";
import { useProject } from "@/lib/project-context";
import { objectsApi, proofsApi, type MathObject, type ProofState } from "@/lib/api";

const typeBadge: Record<string, { bg: string; c: string }> = {
  theorem: { bg: "var(--teal-bg)", c: "var(--teal)" },
  conjecture: { bg: "var(--purple-bg)", c: "var(--purple)" },
  lemma: { bg: "var(--blue-bg)", c: "var(--blue)" },
  definition: { bg: "var(--amber-bg)", c: "var(--amber)" },
};
const statusStyle: Record<string, { bg: string; c: string }> = {
  verified: { bg: "var(--teal-bg)", c: "var(--teal)" },
  draft: { bg: "var(--amber-bg)", c: "var(--amber)" },
  heuristic: { bg: "var(--blue-bg)", c: "var(--blue)" },
};

export default function DashboardPage() {
  const { token } = useAuth();
  const { activeProject, stats, projects } = useProject();
  const [objects, setObjects] = useState<MathObject[]>([]);
  const [proofs, setProofs] = useState<ProofState[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !activeProject) return;
    setLoading(true);
    Promise.all([objectsApi.list(activeProject.id, token).catch(() => []), proofsApi.list(activeProject.id, token).catch(() => [])])
      .then(([o, p]) => { setObjects(o); setProofs(p); }).finally(() => setLoading(false));
  }, [token, activeProject]);

  const conjectures = objects.filter(o => o.object_type === "conjecture");
  const theorems = objects.filter(o => o.object_type === "theorem");

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionHeader eyebrow="Overview" title="Research dashboard"
        description={activeProject ? `Live data from "${activeProject.title}"` : "Create a project to begin."} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <MetricCard variant="blue" title="Projects" value={String(projects.length).padStart(2, "0")} detail={`${projects.filter(p => p.status === "active").length} active`} />
        <MetricCard variant="teal" title="Objects" value={stats ? String(stats.objects).padStart(2, "0") : "\u2014"} detail={`${theorems.length} thm, ${conjectures.length} conj`} />
        <MetricCard variant="amber" title="Proofs" value={stats ? String(stats.proofs).padStart(2, "0") : "\u2014"} detail={`${proofs.filter(p => p.status === "draft").length} draft`} />
        <MetricCard variant="purple" title="Conjectures" value={stats ? String(stats.open_conjectures).padStart(2, "0") : "\u2014"} detail={conjectures.length > 0 ? `${conjectures.filter(c => c.status === "draft").length} open` : "none yet"} />
      </div>
      {objects.length > 0 && (
        <div style={{ background: "var(--bg-surface)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", borderBottom: "0.5px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--text-primary)", fontWeight: 400 }}>Recent math objects</span>
            <span style={{ fontSize: 11, color: "var(--text-faint)", background: "var(--bg-raised)", padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>{objects.length} total</span>
          </div>
          {objects.slice(0, 8).map((obj, i) => {
            const tb = typeBadge[obj.object_type] || { bg: "var(--bg-raised)", c: "var(--text-faint)" };
            const ss = statusStyle[obj.status] || statusStyle.draft;
            return (
              <div key={obj.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: i < Math.min(objects.length, 8) - 1 ? "0.5px solid var(--bg-raised)" : "none", transition: "background 0.1s", cursor: "default" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-raised)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <span style={{ fontSize: 10, fontWeight: 500, padding: "3px 9px", borderRadius: "var(--radius-sm)", textTransform: "uppercase", letterSpacing: "0.04em", background: tb.bg, color: tb.c, whiteSpace: "nowrap" }}>{obj.object_type.slice(0, 4)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--text-primary)", fontWeight: 400 }}>{obj.title}</div>
                  {obj.statement_text && <div style={{ fontFamily: "var(--font-display)", fontSize: 12, fontStyle: "italic", color: "var(--text-faint)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{obj.statement_text}</div>}
                </div>
                <span style={{ fontSize: 10, fontWeight: 500, padding: "3px 9px", borderRadius: 12, background: ss.bg, color: ss.c, whiteSpace: "nowrap" }}>{obj.status}</span>
              </div>
            );
          })}
        </div>
      )}
      {!loading && activeProject && objects.length === 0 && (
        <div style={{ background: "var(--bg-surface)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 36, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 300, color: "var(--text-primary)" }}>No objects yet</div>
          <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 8 }}>Create math objects via the API to populate your dashboard.</div>
        </div>
      )}
    </div>
  );
}
