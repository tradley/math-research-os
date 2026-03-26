const v: Record<string, { bg: string; c: string }> = {
  verified: { bg: "var(--teal-bg)", c: "var(--teal)" },
  heuristic: { bg: "var(--blue-bg)", c: "var(--blue)" },
  in_progress: { bg: "var(--blue-bg)", c: "var(--blue)" },
  draft: { bg: "var(--amber-bg)", c: "var(--amber)" },
  risk: { bg: "var(--red-bg)", c: "var(--red)" },
  rejected: { bg: "var(--red-bg)", c: "var(--red)" },
};
export function StatusBadge({ label, variant = "heuristic" }: { label: string; variant?: string }) {
  const s = v[variant] || v.heuristic;
  return <span style={{ display: "inline-flex", padding: "3px 9px", borderRadius: 12, fontSize: 10, fontWeight: 500, background: s.bg, color: s.c, whiteSpace: "nowrap" }}>{label}</span>;
}
