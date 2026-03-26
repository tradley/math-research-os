from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.projects import ProjectRepository
from app.schemas import ProjectCreate, ProjectRead, ProjectUpdate

router = APIRouter()


@router.get("/", response_model=list[ProjectRead])
def list_projects(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ProjectRepository(db).list_for_user(user.id)


@router.post("/", response_model=ProjectRead, status_code=201)
def create_project(body: ProjectCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = body.model_dump()
    data["owner_id"] = user.id
    return ProjectRepository(db).create(data)


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = ProjectRepository(db).get_owned(project_id, user.id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(project_id: str, body: ProjectUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = ProjectRepository(db)
    if not repo.get_owned(project_id, user.id):
        raise HTTPException(404, "Project not found")
    result = repo.update(project_id, body.model_dump(exclude_unset=True))
    return result


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = ProjectRepository(db)
    if not repo.get_owned(project_id, user.id):
        raise HTTPException(404, "Project not found")
    repo.delete(project_id)


@router.get("/{project_id}/stats")
def project_stats(project_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = ProjectRepository(db)
    if not repo.get_owned(project_id, user.id):
        raise HTTPException(404, "Project not found")
    return repo.stats(project_id)
