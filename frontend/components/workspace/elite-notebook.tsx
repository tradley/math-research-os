"use client";
export function EliteNotebook() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ background: "var(--bg-surface)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "12px 16px", display: "flex", gap: 6 }}>
        {["Text", "Math", "Code", "Conjecture"].map((item, i) => (
          <button key={item} style={{
            padding: "6px 12px", borderRadius: "var(--radius-sm)", fontSize: 12, cursor: "pointer",
            border: i === 0 ? "0.5px solid var(--accent-border)" : "0.5px solid var(--border-light)",
            background: i === 0 ? "var(--accent-dim)" : "var(--bg-raised)",
            color: i === 0 ? "var(--accent)" : "var(--text-muted)",
          }}>{item}</button>
        ))}
      </div>
      <div style={{ background: "var(--bg-surface)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "0.5px solid var(--border)" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", fontWeight: 500 }}>Research notebook</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 300, color: "var(--text-primary)", marginTop: 3 }}>Operator Theory Draft</div>
        </div>
        <div style={{ display: "grid", gap: 1, background: "var(--border)" }}>
          <div style={{ padding: "16px 18px", background: "var(--bg-surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", padding: "3px 9px", borderRadius: "var(--radius-sm)", background: "var(--amber-bg)", color: "var(--amber)" }}>def</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 300, color: "var(--text-primary)", lineHeight: 1.6 }}>
              Let <em>T : H → H</em> be a compact self-adjoint operator on a Hilbert space <em>H</em>.
            </div>
          </div>
          <div style={{ padding: "16px 18px", background: "var(--bg-surface)", borderLeft: "2px solid var(--purple)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", padding: "3px 9px", borderRadius: "var(--radius-sm)", background: "var(--purple-bg)", color: "var(--purple)" }}>conj</span>
              <span style={{ fontSize: 11, color: "var(--text-faint)" }}>open</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 300, color: "var(--text-muted)", lineHeight: 1.6, fontStyle: "italic" }}>
              The recursive spectral decomposition should still hold under a weaker compactness-like hypothesis in the bounded normal case.
            </div>
          </div>
          <div style={{ padding: "16px 18px", background: "var(--bg-surface)", borderLeft: "2px solid var(--teal)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", padding: "3px 9px", borderRadius: "var(--radius-sm)", background: "var(--teal-bg)", color: "var(--teal)" }}>thm</span>
              <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 12, background: "var(--teal-bg)", color: "var(--teal)" }}>verified</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 300, color: "var(--text-primary)", lineHeight: 1.6 }}>
              Every compact self-adjoint operator on a Hilbert space admits an orthonormal basis of eigenvectors.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
