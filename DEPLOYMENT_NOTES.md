# Deployment Notes

## Local Docker
```bash
cp .env.example .env
docker compose up --build
```

## Frontend Hosting
- Vercel is a strong fit for the Next.js frontend.
- Set `NEXT_PUBLIC_API_BASE` to the public backend URL.

## Backend Hosting
- Railway, Render, Fly.io, or a VPS/container host can run the FastAPI API.
- Required environment variables:
  - `DATABASE_URL` (async Postgres via psycopg)
  - `REDIS_URL`
  - `JWT_SECRET` (generate a real secret for production)
  - `ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY`

## Database
- Start local with Docker Postgres.
- Move to managed Postgres (Neon, Supabase, RDS) before production.
- Run Alembic migrations in production instead of auto-create:
  ```bash
  cd backend && alembic revision --autogenerate -m "initial" && alembic upgrade head
  ```

## Production Hardening Checklist
- [x] Real auth (JWT + bcrypt)
- [x] Persistent DB models + Alembic migrations
- [x] AI provider abstraction with provenance
- [ ] Redis-backed job queue for long reasoning tasks
- [ ] Rate limiting (slowapi or similar)
- [ ] Structured logging and observability
- [ ] HTTPS / TLS termination
- [ ] Real secret management (Vault, AWS SSM, etc.)
- [ ] Stripe integration for billing
- [ ] Role-based access control enforcement
