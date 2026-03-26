const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type FetchOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

export async function api<T = unknown>(path: string, opts: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;

  const res = await fetch(`${API_BASE}/api${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `API error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Types ────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  field: string;
  status: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectStats {
  objects: number;
  proofs: number;
  open_conjectures: number;
}

export interface MathObject {
  id: string;
  project_id: string;
  object_type: string;
  title: string;
  statement_text: string;
  latex_statement: string;
  status: string;
  created_at: string;
}

export interface ProofState {
  id: string;
  project_id: string;
  math_object_id: string | null;
  status: string;
  strategy: string;
  steps: Record<string, unknown>[];
  ai_output: Record<string, unknown>;
  human_notes: string;
  created_at: string;
}

export interface ReasoningResult {
  ok: boolean;
  task_type: string;
  result?: Record<string, unknown>;
  error?: string;
  ai_run_id: string;
  provider?: string;
  latency_ms?: number;
}

export interface GraphData {
  nodes: { id: string; object_type: string; title: string; status: string; statement_text: string }[];
  edges: { id: string; source: string; target: string; relation: string; label: string }[];
}

// ── Typed API helpers ────────────────────────────────

export const authApi = {
  register: (email: string, password: string, display_name: string, token?: string | null) =>
    api<{ access_token: string }>("/auth/register", { method: "POST", body: { email, password, display_name }, token }),
  login: (email: string, password: string) =>
    api<{ access_token: string }>("/auth/login", { method: "POST", body: { email, password } }),
  me: (token: string) =>
    api<User>("/auth/me", { token }),
};

export const projectsApi = {
  list: (token: string) =>
    api<Project[]>("/projects/", { token }),
  get: (id: string, token: string) =>
    api<Project>(`/projects/${id}`, { token }),
  create: (data: { title: string; description?: string; field?: string }, token: string) =>
    api<Project>("/projects/", { method: "POST", body: data, token }),
  stats: (id: string, token: string) =>
    api<ProjectStats>(`/projects/${id}/stats`, { token }),
};

export const objectsApi = {
  list: (projectId: string, token: string) =>
    api<MathObject[]>(`/projects/${projectId}/objects`, { token }),
  create: (projectId: string, data: Record<string, unknown>, token: string) =>
    api<MathObject>(`/projects/${projectId}/objects`, { method: "POST", body: data, token }),
};

export const proofsApi = {
  list: (projectId: string, token: string) =>
    api<ProofState[]>(`/projects/${projectId}/proofs`, { token }),
};

export const graphApi = {
  full: (projectId: string, token: string) =>
    api<GraphData>(`/projects/${projectId}/graph`, { token }),
};

export const reasoningApi = {
  analyze: (theorem: string, projectId: string | null, token: string) =>
    api<ReasoningResult>("/math-ai/analyze-statement", { method: "POST", body: { theorem, project_id: projectId }, token }),
  proofPlan: (theorem: string, projectId: string | null, token: string) =>
    api<ReasoningResult>("/math-ai/proof-plan", { method: "POST", body: { theorem, project_id: projectId }, token }),
  counterexample: (statement: string, projectId: string | null, token: string) =>
    api<ReasoningResult>("/math-ai/counterexample", { method: "POST", body: { statement, project_id: projectId }, token }),
  formalize: (theorem: string, projectId: string | null, token: string) =>
    api<ReasoningResult>("/math-ai/formalize", { method: "POST", body: { theorem, project_id: projectId }, token }),
  explain: (text: string, token: string) =>
    api<ReasoningResult>("/ai/explain", { method: "POST", body: { text }, token }),
  reason: (prompt: string, projectId: string | null, token: string) =>
    api<ReasoningResult>("/ai/reason", { method: "POST", body: { prompt, project_id: projectId }, token }),
};
