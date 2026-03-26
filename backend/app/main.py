import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.session import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Math Research OS — research-grade mathematics platform.",
    lifespan=lifespan,
)

# CORS: allow frontend URL from env, plus common local origins
frontend_url = os.getenv("FRONTEND_URL", "")
origins = ["http://localhost:3000", "http://frontend:3000"]
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"name": settings.app_name, "version": "0.1.0", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "ok", "service": settings.app_name}


app.include_router(api_router, prefix="/api")
