type V = "blue" | "teal" | "amber" | "purple";
const colors: Record<V, string> = { blue: "var(--blue)", teal: "var(--teal)", amber: "var(--amber)", purple: "var(--purple)" };

export function MetricCard({ title, value, detail, variant = "blue" }: { title: string; value: string; detail: string; variant?: V }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "16px 18px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: colors[variant] }} />
      <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>{title}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 300, color: "var(--text-primary)", marginTop: 6, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{detail}</div>
    </div>
  );
}
