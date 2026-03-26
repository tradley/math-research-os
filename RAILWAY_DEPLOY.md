# Deploy Math Research OS on Railway

## Prerequisites
- A Railway account (https://railway.app)
- Railway CLI installed: `npm install -g @railway/cli`
- This repo pushed to GitHub

## Step 1: Create a Railway project

```bash
railway login
railway init
```

Or create a new project at https://railway.app/new

## Step 2: Add infrastructure services

In the Railway dashboard, add these services to your project:

1. **PostgreSQL** — click "Add Service" → "Database" → "PostgreSQL"
2. **Redis** — click "Add Service" → "Database" → "Redis"

Railway auto-provisions these and injects `DATABASE_URL` and `REDIS_URL` as environment variables.

## Step 3: Deploy the backend

1. Click "Add Service" → "GitHub Repo" → select your repo
2. Set **Root Directory** to `backend`
3. Set **Start Command** to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add these environment variables (Settings → Variables):

```
DATABASE_URL        → (auto-linked from Postgres service)
REDIS_URL           → (auto-linked from Redis service)
JWT_SECRET          → (generate: openssl rand -hex 32)
AI_PROVIDER         → openai    (or anthropic)
OPENAI_API_KEY      → sk-...    (if using OpenAI)
ANTHROPIC_API_KEY   → sk-ant-.. (if using Anthropic)
CELERY_BROKER_URL   → (same as REDIS_URL)
CELERY_RESULT_BACKEND → (same as REDIS_URL)
```

5. Click "Deploy" — Railway auto-detects Python and builds

## Step 4: Deploy the frontend

1. Click "Add Service" → "GitHub Repo" → select the same repo
2. Set **Root Directory** to `frontend`
3. Add this environment variable:

```
NEXT_PUBLIC_API_BASE → https://your-backend-service.up.railway.app
```

(Copy the backend's public URL from its service settings → Networking → Public URL)

4. Click "Deploy" — Railway auto-detects Next.js and builds

## Step 5: (Optional) Deploy Celery worker

For background AI jobs:

1. Click "Add Service" → "GitHub Repo" → select the same repo
2. Set **Root Directory** to `backend`
3. Set **Start Command** to `celery -A app.workers.tasks worker --loglevel=info --concurrency=2`
4. Link the same DATABASE_URL, REDIS_URL, and AI provider variables
5. **Disable** the public domain (workers don't need HTTP)

## Step 6: Connect the services

In the backend service → Variables tab, click "Add Reference" to link:
- `DATABASE_URL` from the PostgreSQL service
- `REDIS_URL` from the Redis service

Railway handles this via service references — no manual copying needed.

## Step 7: Set the frontend URL on the backend

Once both are deployed:
1. Copy the frontend's public URL
2. In the backend service → Variables, add:
   ```
   FRONTEND_URL → https://your-frontend-service.up.railway.app
   ```

## Step 8: Generate public URLs

For each service (backend + frontend):
1. Go to Settings → Networking
2. Click "Generate Domain" to get a `*.up.railway.app` URL

## Verify

- Frontend: `https://your-frontend.up.railway.app` → login screen
- Backend API docs: `https://your-backend.up.railway.app/docs`
- Health check: `https://your-backend.up.railway.app/health`

## Cost estimate

Railway's free tier includes $5/month of usage. For a typical Math Research OS deployment:
- PostgreSQL: ~$1-3/month
- Redis: ~$1/month  
- Backend: ~$2-5/month
- Frontend: ~$2-3/month
- Celery worker: ~$2-5/month (only if enabled)

Total: roughly $8-17/month for a fully running stack.

## Troubleshooting

**Backend won't start**: Check that DATABASE_URL is linked from the Postgres service. Railway's format is `postgresql://...` — the app auto-converts it.

**Frontend shows network errors**: Verify NEXT_PUBLIC_API_BASE points to the backend's public Railway URL (with https://).

**AI reasoning returns stubs**: Set OPENAI_API_KEY or ANTHROPIC_API_KEY in the backend service variables.
