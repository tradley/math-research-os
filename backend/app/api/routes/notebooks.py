from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.graph_notebooks import NotebookRepository
from app.repositories.projects import ProjectRepository
from app.schemas import NotebookCreate, NotebookRead, NotebookUpdate

router = APIRouter()


def _verify(project_id: str, user: User, db: Session):
    if not ProjectRepository(db).get_owned(project_id, user.id):
        raise HTTPException(404, "Project not found")


@router.get("/projects/{project_id}/notebooks", response_model=list[NotebookRead])
def list_notebooks(project_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _verify(project_id, user, db)
    return NotebookRepository(db).list_for_project(project_id)


@router.post("/projects/{project_id}/notebooks", response_model=NotebookRead, status_code=201)
def create_notebook(project_id: str, body: NotebookCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _verify(project_id, user, db)
    data = body.model_dump()
    data["project_id"] = project_id
    return NotebookRepository(db).create(data)


@router.get("/notebooks/{notebook_id}", response_model=NotebookRead)
def get_notebook(notebook_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = NotebookRepository(db)
    nb = repo.get(notebook_id)
    if not nb:
        raise HTTPException(404, "Notebook not found")
    _verify(nb.project_id, user, db)
    return nb


@router.patch("/notebooks/{notebook_id}", response_model=NotebookRead)
def update_notebook(notebook_id: str, body: NotebookUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = NotebookRepository(db)
    nb = repo.get(notebook_id)
    if not nb:
        raise HTTPException(404, "Notebook not found")
    _verify(nb.project_id, user, db)
    return repo.update(notebook_id, body.model_dump(exclude_unset=True))


@router.delete("/notebooks/{notebook_id}", status_code=204)
def delete_notebook(notebook_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = NotebookRepository(db)
    nb = repo.get(notebook_id)
    if not nb:
        raise HTTPException(404, "Notebook not found")
    _verify(nb.project_id, user, db)
    repo.delete(notebook_id)
