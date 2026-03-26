"use client";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useProject } from "@/lib/project-context";
import { graphApi, type GraphData } from "@/lib/api";

const tc: Record<string, { fill: string; stroke: string }> = {
  theorem: { fill: "#0f2e20", stroke: "#5dcaa5" }, lemma: { fill: "#15203a", stroke: "#6c9cfc" },
  definition: { fill: "#2a2010", stroke: "#ef9f27" }, conjecture: { fill: "#221c36", stroke: "#7f77dd" },
  axiom: { fill: "#2e1414", stroke: "#e24b4a" },
};
const fb = { fill: "#1a1c25", stroke: "#565a66" };

export default function GraphView() {
  const { token } = useAuth();
  const { activeProject } = useProject();
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !activeProject) return;
    setLoading(true);
    graphApi.full(activeProject.id, token).then(setGraph).catch(() => setGraph(null)).finally(() => setLoading(false));
  }, [token, activeProject]);

  const pos = useMemo(() => {
    if (!graph?.nodes.length) return {};
    const p: Record<string, { x: number; y: number }> = {};
    const cx = 340, cy = 280, r = 200;
    graph.nodes.forEach((n, i) => { const a = (2 * Math.PI * i) / graph.nodes.length - Math.PI / 2; p[n.id] = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }; });
    return p;
  }, [graph]);

  if (loading) return <div style={{ height: "100%", display: "grid", placeItems: "center", fontSize: 12, color: "var(--text-faint)" }}>Loading graph...</div>;
  if (!graph?.nodes.length) return (
    <div className="subtle-grid" style={{ height: "100%", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 300, color: "var(--text-primary)" }}>Empty graph</div>
        <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 6, maxWidth: 240 }}>Create objects and edges to visualize.</div>
      </div>
    </div>
  );

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <svg width="100%" height="100%" viewBox="0 0 680 560">
        <defs><marker id="ah" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><path d="M0,0 L7,2.5 L0,5" fill="#252830" /></marker></defs>
        {graph.edges.map(e => { const f = pos[e.source], t = pos[e.target]; if (!f || !t) return null; return <g key={e.id}><line x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke="#252830" strokeWidth={1} markerEnd="url(#ah)" /><text x={(f.x+t.x)/2} y={(f.y+t.y)/2-5} textAnchor="middle" fontSize={9} fill="#565a66" fontFamily="var(--font-ui)">{e.relation}</text></g>; })}
        {graph.nodes.map(n => { const p = pos[n.id]; if (!p) return null; const c = tc[n.object_type] || fb; return <g key={n.id}><circle cx={p.x} cy={p.y} r={20} fill={c.fill} stroke={c.stroke} strokeWidth={1.2} /><text x={p.x} y={p.y+1} textAnchor="middle" dominantBaseline="middle" fontSize={9} fontWeight={500} fill={c.stroke} fontFamily="var(--font-ui)">{n.object_type.slice(0,3).toUpperCase()}</text><text x={p.x} y={p.y+32} textAnchor="middle" fontSize={10} fill="#c8cad0" fontFamily="var(--font-display)">{n.title.length > 20 ? n.title.slice(0,20)+"\u2026" : n.title}</text></g>; })}
      </svg>
      <div style={{ position: "absolute", bottom: 10, left: 12, display: "flex", gap: 8 }}>
        {Object.entries(tc).map(([t, c]) => <div key={t} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "var(--text-faint)" }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: c.stroke }} />{t}</div>)}
      </div>
    </div>
  );
}
