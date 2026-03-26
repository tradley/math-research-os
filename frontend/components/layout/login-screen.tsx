"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export function LoginScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(""); setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password, displayName);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: "var(--radius-md)",
    border: "0.5px solid var(--border-light)", background: "var(--bg-base)",
    fontSize: 13, color: "var(--text-primary)", outline: "none",
  };

  return (
    <div style={{ height: "100vh", display: "grid", placeItems: "center", background: "var(--bg-base)" }}>
      <div style={{ width: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-faint)", fontWeight: 500 }}>Research platform</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 300, letterSpacing: "-0.03em", color: "var(--text-primary)", marginTop: 4 }}>Math Research OS</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>
            {mode === "login" ? "Sign in to continue" : "Create your account"}
          </div>
        </div>
        <div className="surface" style={{ padding: 24 }}>
          {error && <div style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", background: "var(--red-bg)", color: "var(--red)", fontSize: 12, marginBottom: 14 }}>{error}</div>}
          <div style={{ display: "grid", gap: 12 }}>
            {mode === "register" && (
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--text-faint)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Display name</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Dr. Euler" style={inp} />
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--text-faint)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="researcher@university.edu" style={inp} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--text-faint)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} style={inp} />
            </div>
            <button onClick={handleSubmit} disabled={loading || !email || !password} style={{
              marginTop: 4, width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)",
              border: "none", background: "var(--accent)", color: "var(--bg-base)",
              fontSize: 13, fontWeight: 500, cursor: loading ? "wait" : "pointer",
              opacity: (!email || !password) ? 0.4 : 1,
            }}>
              {loading ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "var(--text-faint)" }}>
          {mode === "login" ? (
            <>No account? <button onClick={() => { setMode("register"); setError(""); }} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 500, fontSize: 12 }}>Register</button></>
          ) : (
            <>Have an account? <button onClick={() => { setMode("login"); setError(""); }} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 500, fontSize: 12 }}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
}
