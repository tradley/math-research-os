"use client";
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import GraphView from "@/components/Graph/GraphView";
import { useAuth } from "@/lib/auth-context";
import { useProject } from "@/lib/project-context";
import { graphApi, type GraphData } from "@/lib/api";

export default function GraphPage() {
  const { token } = useAuth();
  const { activeProject } = useProject();
  const [graph, setGraph] = useState<GraphData | null>(null);
  useEffect(() => { if (token && activeProject) graphApi.full(activeProject.id, token).then(setGraph).catch(() => {}); }, [token, activeProject]);

  const nodeTypes = graph ? [...new Set(graph.nodes.map(n => n.object_type))] : [];
  const relations = graph ? [...new Set(graph.edges.map(e => e.relation))] : [];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionHeader eyebrow="Dependency intelligence" title="Knowledge graph" description="Theorem dependencies, proof branches, and paper links." />
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 12 }}>
        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <div style={{ background: "var(--bg-surface)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>Nodes</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 300, color: "var(--text-primary)", marginTop: 4 }}>{graph?.nodes.length ?? 0}</div>
            {nodeTypes.length > 0 && <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{nodeTypes.join(", ")}</div>}
          </div>
          <div style={{ background: "var(--bg-surface)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>Edges</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 300, color: "var(--text-primary)", marginTop: 4 }}>{graph?.edges.length ?? 0}</div>
            {relations.length > 0 && <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{relations.join(", ")}</div>}
          </div>
        </div>
        <div style={{ background: "var(--bg-surface)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", height: 560, overflow: "hidden" }}>
          <GraphView />
        </div>
      </div>
    </div>
  );
}
