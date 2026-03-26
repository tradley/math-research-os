from fastapi import APIRouter
from app.api.routes import auth, projects, objects, proofs, notebooks, graph, ai, math_ai, ai_runs, tasks

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(objects.router, tags=["objects"])
api_router.include_router(proofs.router, tags=["proofs"])
api_router.include_router(notebooks.router, tags=["notebooks"])
api_router.include_router(graph.router, tags=["graph"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(math_ai.router)
api_router.include_router(ai_runs.router, tags=["ai-runs"])
api_router.include_router(tasks.router, tags=["tasks"])
