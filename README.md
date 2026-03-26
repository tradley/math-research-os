# Math Research OS

A research-grade mathematics platform with Proof Studio, theorem-aware AI reasoning, Knowledge Graph, Research Notebook, and full AI observability.

## Architecture

```
math-research-os/
├── backend/                  FastAPI + SQLAlchemy + Alembic + Celery
│   ├── app/
│   │   ├── api/routes/       auth, projects, objects, proofs, notebooks,
│   │   │                     graph, ai, math_ai, ai_runs, tasks
│   │   ├── core/             config, database session, auth (JWT), logging
│   │   ├── db/               SQLAlchemy engine + session factory
│   │   ├── models/           User, Project, MathObject, ProofState,
│   │   │                     Notebook, GraphEdge, AIRun
│   │   ├── repositories/     data-access layer (no DB logic in routes)
│   │   ├── schemas/          Pydantic request/response validation
│   │   ├── services/
│   │   │   ├── ai/providers/ base, openai, anthropic, stub
│   │   │   ├── ai/factory    provider factory + safe_generate with retry
│   │   │   ├── math_reasoning service orchestration layer
│   │   │   └── retrieval     context retrieval before AI calls
│   │   └── workers/          Celery background tasks
│   └── migrations/           Alembic
├── frontend/                 Next.js 15 + Tailwind v4
│   ├── app/                  dashboard, workspace, proofs, graph pages
│   ├── components/           layout (auth-gated), ui, workspace, Graph
│   └── lib/                  typed API client, auth context, project context
└── docker-compose.yml        Postgres + Redis + backend + frontend + celery worker
```

## What's implemented

### Backend (production architecture)
- **Repository pattern** — all DB logic isolated from routes
- **Service layer** — `MathReasoningService` orchestrates retrieval → provider → persist
- **AI provider abstraction** — `BaseAIProvider` interface with OpenAI, Anthropic, and Stub implementations
- **Provider factory** with `safe_generate` retry/backoff wrapper
- **Retrieval service** — related objects, prior proofs, graph neighbors injected into prompts
- **AI run logging** — every provider call stored in `ai_runs` table with latency, tokens, model, error
- **Background jobs** — Celery tasks for long-running proof planning and analysis
- **JWT auth** with bcrypt password hashing
- **JSON structured logging** via python-json-logger
- **Alembic** migrations configured

### Frontend (fully wired)
- **Auth gate** — login/register screen, JWT stored in localStorage
- **Auth context** — token + user state available everywhere
- **Project context** — active project selection, auto-stats refresh
- **Live sidebar** — project picker, create new project, live object/proof/conjecture counts
- **Live topbar** — page-aware title, user display, logout
- **Live dashboard** — real metrics from API, recent objects list
- **Live Proof Studio** — proof branches from API with status badges
- **Live Knowledge Graph** — SVG rendering of nodes + edges from API
- **Reasoning panel** (right rail) — 5 task types (Analyze, Plan Proof, Stress Test, Formalize, Free Reason), live results with provenance metadata

## Quick Start

```bash
cp .env.example .env          # configure API keys if desired
docker compose up --build      # starts postgres, redis, backend, frontend, celery
```

- **Frontend:** http://localhost:3000
- **API docs:** http://localhost:8000/docs
- **Health:** http://localhost:8000/health

Register a user, create a project, and start reasoning.

## API Endpoints

### Auth
`POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me`

### Projects
`GET/POST /api/projects/` · `GET/PATCH/DELETE /api/projects/{id}` · `GET /api/projects/{id}/stats`

### Math Objects
`GET/POST /api/projects/{id}/objects` · `GET/PATCH/DELETE /api/objects/{id}`

### Proofs
`GET/POST /api/projects/{id}/proofs` · `GET/PATCH/DELETE /api/proofs/{id}`

### Notebooks
`GET/POST /api/projects/{id}/notebooks` · `GET/PATCH/DELETE /api/notebooks/{id}`

### Knowledge Graph
`GET /api/projects/{id}/graph` · `GET/POST /api/projects/{id}/graph/edges` · `DELETE /api/graph/edges/{id}`

### AI Reasoning (sync)
`POST /api/ai/explain` · `POST /api/ai/reason`

### Math AI (sync + async)
`POST /api/math-ai/analyze-statement` · `POST /api/math-ai/proof-plan` · `POST /api/math-ai/counterexample` · `POST /api/math-ai/formalize`

Async variants: `POST /api/math-ai/analyze-statement/async` · `POST /api/math-ai/proof-plan/async`

### Observability
`GET /api/ai-runs/me` · `GET /api/projects/{id}/ai-runs` · `GET /api/ai-runs/{id}`

### Background Tasks
`GET /api/tasks/{task_id}` — poll Celery task status
