from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.math_objects import MathObjectRepository
from app.repositories.projects import ProjectRepository
from app.schemas import MathObjectCreate, MathObjectRead, MathObjectUpdate

router = APIRouter()


def _verify_project(project_id: str, user: User, db: Session):
    if not ProjectRepository(db).get_owned(project_id, user.id):
        raise HTTPException(404, "Project not found")


@router.get("/projects/{project_id}/objects", response_model=list[MathObjectRead])
def list_objects(project_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _verify_project(project_id, user, db)
    return MathObjectRepository(db).list_for_project(project_id)


@router.post("/projects/{project_id}/objects", response_model=MathObjectRead, status_code=201)
def create_object(project_id: str, body: MathObjectCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _verify_project(project_id, user, db)
    data = body.model_dump()
    data["project_id"] = project_id
    return MathObjectRepository(db).create(data)


@router.get("/objects/{object_id}", response_model=MathObjectRead)
def get_object(object_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    obj = MathObjectRepository(db).get(object_id)
    if not obj:
        raise HTTPException(404, "Math object not found")
    _verify_project(obj.project_id, user, db)
    return obj


@router.patch("/objects/{object_id}", response_model=MathObjectRead)
def update_object(object_id: str, body: MathObjectUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = MathObjectRepository(db)
    obj = repo.get(object_id)
    if not obj:
        raise HTTPException(404, "Math object not found")
    _verify_project(obj.project_id, user, db)
    return repo.update(object_id, body.model_dump(exclude_unset=True))


@router.delete("/objects/{object_id}", status_code=204)
def delete_object(object_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = MathObjectRepository(db)
    obj = repo.get(object_id)
    if not obj:
        raise HTTPException(404, "Math object not found")
    _verify_project(obj.project_id, user, db)
    repo.delete(object_id)
