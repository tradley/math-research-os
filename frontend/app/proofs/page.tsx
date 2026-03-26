"use client";
import { useEffect, useState } from "react";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeader } from "@/components/ui/section-header";
import { useAuth } from "@/lib/auth-context";
import { useProject } from "@/lib/project-context";
import { proofsApi, objectsApi, type ProofState, type MathObject } from "@/lib/api";

const ss: Record<string, { bg: string; c: string }> = {
  verified: { bg: "var(--teal-bg)", c: "var(--teal)" }, in_progress: { bg: "var(--blue-bg)", c: "var(--blue)" },
  heuristic_complete: { bg: "var(--blue-bg)", c: "var(--blue)" }, draft: { bg: "var(--amber-bg)", c: "var(--amber)" },
  rejected: { bg: "var(--red-bg)", c: "var(--red)" },
};

export default function ProofStudioPage() {
  const { token } = useAuth();
  const { activeProject } = useProject();
  const [proofs, setProofs] = useState<ProofState[]>([]);
  const [objects, setObjects] = useState<MathObject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !activeProject) return;
    setLoading(true);
    Promise.all([proofsApi.list(activeProject.id, token).catch(() => []), objectsApi.list(activeProject.id, token).catch(() => [])])
      .then(([p, o]) => { setProofs(p); setObjects(o); }).finally(() => setLoading(false));
  }, [token, activeProject]);

  const theorems = objects.filter(o => o.object_type === "theorem");
  const conjectures = objects.filter(o => o.object_type === "conjecture");

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionHeader eyebrow="Reasoning workbench" title="Proof studio" description="Plan, test, refine, and formalize proofs." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <MetricCard variant="amber" title="Open proofs" value={String(proofs.length).padStart(2, "0")} detail={`${proofs.filter(p => p.status === "draft").length} draft`} />
        <MetricCard variant="teal" title="Theorems" value={String(theorems.length).padStart(2, "0")} detail={`${theorems.filter(t => t.status === "verified").length} verified`} />
        <MetricCard variant="purple" title="Conjectures" value={String(conjectures.length).padStart(2, "0")} detail={`${conjectures.filter(c => c.status === "draft").length} open`} />
        <MetricCard variant="blue" title="Coverage" value={theorems.length ? `${Math.round((proofs.length / Math.max(theorems.length, 1)) * 100)}%` : "\u2014"} detail="proofs / theorems" />
      </div>
      {proofs.length > 0 ? (
        <div style={{ display: "grid", gap: 10 }}>
          {proofs.map(proof => {
            const s = ss[proof.status] || ss.draft;
            return (
              <div key={proof.id} style={{ background: "var(--bg-surface)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "16px 18px", borderLeft: `2px solid ${s.c}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ padding: "3px 9px", borderRadius: 12, fontSize: 10, fontWeight: 500, background: s.bg, color: s.c }}>{proof.status}</span>
                  <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{Array.isArray(proof.steps) ? proof.steps.length : 0} steps</span>
                </div>
                {proof.strategy && <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--text-primary)", fontWeight: 400, marginBottom: 4 }}>{proof.strategy}</div>}
                {proof.human_notes && <div style={{ fontSize: 12, color: "var(--text-faint)", fontStyle: "italic" }}>{proof.human_notes}</div>}
              </div>
            );
          })}
        </div>
      ) : !loading && activeProject ? (
        <div style={{ background: "var(--bg-surface)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 36, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 300, color: "var(--text-primary)" }}>No proofs yet</div>
          <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 8 }}>Create proof states via the API.</div>
        </div>
      ) : null}
    </div>
  );
}
