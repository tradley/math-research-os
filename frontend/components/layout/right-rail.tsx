"use client";
import { useState } from "react";
import { Loader2, Zap, FlaskConical, ShieldQuestion, Code2, Lightbulb } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProject } from "@/lib/project-context";
import { reasoningApi, type ReasoningResult } from "@/lib/api";

type TaskType = "analyze" | "proof_plan" | "counterexample" | "formalize" | "reason";
const tasks: { key: TaskType; label: string; icon: typeof Zap }[] = [
  { key: "analyze", label: "Analyze", icon: Lightbulb },
  { key: "proof_plan", label: "Plan", icon: Zap },
  { key: "counterexample", label: "Stress", icon: ShieldQuestion },
  { key: "formalize", label: "Lean", icon: Code2 },
  { key: "reason", label: "Free", icon: FlaskConical },
];

export function RightRail() {
  const { token } = useAuth();
  const { activeProject } = useProject();
  const [prompt, setPrompt] = useState("");
  const [task, setTask] = useState<TaskType>("analyze");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReasoningResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    if (!prompt.trim() || !token) return;
    setLoading(true); setError(null); setResult(null);
    const pid = activeProject?.id || null;
    try {
      let res: ReasoningResult;
      if (task === "analyze") res = await reasoningApi.analyze(prompt, pid, token);
      else if (task === "proof_plan") res = await reasoningApi.proofPlan(prompt, pid, token);
      else if (task === "counterexample") res = await reasoningApi.counterexample(prompt, pid, token);
      else if (task === "formalize") res = await reasoningApi.formalize(prompt, pid, token);
      else res = await reasoningApi.reason(prompt, pid, token);
      setResult(res);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 14px", height: "100%", overflow: "hidden" }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--text-primary)", fontWeight: 400 }}>Mathematician AI</div>
        <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 3, lineHeight: 1.4 }}>
          {activeProject ? <>Context from <strong style={{ color: "var(--text-muted)" }}>{activeProject.title}</strong></> : "Select a project for context."}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", flexShrink: 0 }}>
        {tasks.map(t => {
          const Icon = t.icon; const on = task === t.key;
          return (
            <button key={t.key} onClick={() => setTask(t.key)} style={{
              display: "flex", gap: 4, alignItems: "center", padding: "5px 10px",
              borderRadius: "var(--radius-sm)", fontSize: 11, fontWeight: on ? 500 : 400,
              border: on ? "0.5px solid var(--accent-border)" : "0.5px solid var(--border-light)",
              background: on ? "var(--accent-dim)" : "var(--bg-raised)",
              color: on ? "var(--accent)" : "var(--text-muted)", cursor: "pointer",
            }}>
              <Icon size={11} /> {t.label}
            </button>
          );
        })}
      </div>
      <div style={{ flexShrink: 0 }}>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleRun(); }}
          placeholder="Paste a theorem or ask a question..."
          style={{
            width: "100%", height: 80, borderRadius: "var(--radius-md)",
            border: "0.5px solid var(--border-light)", padding: 10, fontSize: 12,
            resize: "vertical", background: "var(--bg-base)", color: "var(--text-body)",
            fontFamily: "var(--font-ui)", outline: "none", lineHeight: 1.5,
          }} />
        <button onClick={handleRun} disabled={loading || !prompt.trim()} style={{
          marginTop: 8, width: "100%", borderRadius: "var(--radius-md)", border: "none",
          background: loading ? "var(--text-faint)" : "var(--accent)",
          color: "var(--bg-base)", padding: "9px 14px", fontSize: 12, fontWeight: 500,
          cursor: loading ? "wait" : "pointer", opacity: !prompt.trim() ? 0.4 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          {loading && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
          {loading ? "Reasoning..." : "Run reasoning"}
        </button>
        <div style={{ fontSize: 10, color: "var(--text-ghost)", marginTop: 4, textAlign: "center" }}>Cmd + Enter</div>
      </div>
      <div style={{
        flex: 1, overflow: "auto", background: "var(--bg-base)",
        border: "0.5px solid var(--border)", borderRadius: "var(--radius-md)", padding: 12,
      }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", fontWeight: 500, marginBottom: 8 }}>Results</div>
        {error && <div style={{ padding: "6px 10px", borderRadius: "var(--radius-sm)", background: "var(--red-bg)", color: "var(--red)", fontSize: 11, marginBottom: 8 }}>{error}</div>}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-faint)" }}>
            <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Retrieving context...
          </div>
        ) : result ? (
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <span style={{ padding: "2px 7px", borderRadius: "var(--radius-sm)", fontSize: 10, fontWeight: 500, background: result.ok ? "var(--teal-bg)" : "var(--red-bg)", color: result.ok ? "var(--teal)" : "var(--red)" }}>{result.ok ? "ok" : "error"}</span>
              {result.provider && <span style={{ padding: "2px 7px", borderRadius: "var(--radius-sm)", fontSize: 10, background: "var(--bg-raised)", color: "var(--text-faint)" }}>{result.provider}</span>}
              {result.latency_ms != null && <span style={{ padding: "2px 7px", borderRadius: "var(--radius-sm)", fontSize: 10, background: "var(--bg-raised)", color: "var(--text-faint)" }}>{result.latency_ms}ms</span>}
            </div>
            {result.error ? <div style={{ fontSize: 12, color: "var(--red)" }}>{result.error}</div> : (
              <div style={{ fontSize: 12, lineHeight: 1.6, color: "var(--text-body)" }}>
                {Object.entries(result.result || {}).map(([k, v]) => (
                  <div key={k} style={{ marginBottom: 6 }}>
                    <div style={{ fontWeight: 500, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)", marginBottom: 2 }}>{k.replace(/_/g, " ")}</div>
                    {Array.isArray(v) ? <ul style={{ margin: 0, paddingLeft: 14 }}>{(v as unknown[]).map((x, i) => <li key={i}>{typeof x === "object" ? JSON.stringify(x) : String(x)}</li>)}</ul>
                    : typeof v === "object" && v !== null ? <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 11, background: "var(--bg-raised)", padding: 8, borderRadius: "var(--radius-sm)", fontFamily: "var(--font-mono)", color: "var(--text-body)" }}>{JSON.stringify(v, null, 2)}</pre>
                    : <div>{String(v)}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : <div style={{ fontSize: 12, color: "var(--text-faint)", fontStyle: "italic" }}>Enter a theorem above. Results with provenance appear here.</div>}
      </div>
    </div>
  );
}
