from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.graph_notebooks import GraphEdgeRepository
from app.repositories.projects import ProjectRepository
from app.schemas import GraphEdgeCreate, GraphEdgeRead

router = APIRouter()


def _verify(project_id: str, user: User, db: Session):
    if not ProjectRepository(db).get_owned(project_id, user.id):
        raise HTTPException(404, "Project not found")


@router.get("/projects/{project_id}/graph")
def get_full_graph(project_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _verify(project_id, user, db)
    return GraphEdgeRepository(db).get_full_graph(project_id)


@router.get("/projects/{project_id}/graph/edges", response_model=list[GraphEdgeRead])
def list_edges(project_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _verify(project_id, user, db)
    return GraphEdgeRepository(db).list_for_project(project_id)


@router.post("/projects/{project_id}/graph/edges", response_model=GraphEdgeRead, status_code=201)
def create_edge(project_id: str, body: GraphEdgeCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _verify(project_id, user, db)
    return GraphEdgeRepository(db).create(body.model_dump())


@router.delete("/graph/edges/{edge_id}", status_code=204)
def delete_edge(edge_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not GraphEdgeRepository(db).delete(edge_id):
        raise HTTPException(404, "Edge not found")
