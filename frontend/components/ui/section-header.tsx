export function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", fontWeight: 500 }}>{eyebrow}</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, letterSpacing: "-0.02em", margin: "4px 0 0", color: "var(--text-primary)" }}>{title}</h2>
      {description && <p style={{ maxWidth: 500, fontSize: 13, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>{description}</p>}
    </div>
  );
}
