from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.ai_runs import AIRunRepository
from app.repositories.projects import ProjectRepository
from app.schemas import AIRunRead

router = APIRouter()


@router.get("/projects/{project_id}/ai-runs", response_model=list[AIRunRead])
def list_project_runs(project_id: str, limit: int = 50, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not ProjectRepository(db).get_owned(project_id, user.id):
        raise HTTPException(404, "Project not found")
    return AIRunRepository(db).list_for_project(project_id, limit)


@router.get("/ai-runs/me", response_model=list[AIRunRead])
def list_my_runs(limit: int = 50, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AIRunRepository(db).list_for_user(user.id, limit)


@router.get("/ai-runs/{run_id}", response_model=AIRunRead)
def get_run(run_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    run = AIRunRepository(db).get(run_id)
    if not run:
        raise HTTPException(404, "AI run not found")
    if run.user_id != user.id:
        raise HTTPException(403, "Not your run")
    return run
