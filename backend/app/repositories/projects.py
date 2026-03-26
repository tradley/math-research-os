from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.project import Project
from app.models.math_object import MathObject
from app.models.proof_state import ProofState


class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> Project:
        project = Project(**data)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def get(self, project_id: str) -> Project | None:
        return self.db.query(Project).filter(Project.id == project_id).first()

    def get_owned(self, project_id: str, owner_id: str) -> Project | None:
        return (
            self.db.query(Project)
            .filter(Project.id == project_id, Project.owner_id == owner_id)
            .first()
        )

    def list_for_user(self, owner_id: str) -> list[Project]:
        return (
            self.db.query(Project)
            .filter(Project.owner_id == owner_id)
            .order_by(Project.updated_at.desc())
            .all()
        )

    def update(self, project_id: str, data: dict) -> Project | None:
        project = self.get(project_id)
        if not project:
            return None
        for k, v in data.items():
            if v is not None:
                setattr(project, k, v)
        self.db.commit()
        self.db.refresh(project)
        return project

    def delete(self, project_id: str) -> bool:
        project = self.get(project_id)
        if not project:
            return False
        self.db.delete(project)
        self.db.commit()
        return True

    def stats(self, project_id: str) -> dict:
        objects = self.db.query(func.count()).select_from(MathObject).filter(MathObject.project_id == project_id).scalar()
        proofs = self.db.query(func.count()).select_from(ProofState).filter(ProofState.project_id == project_id).scalar()
        conjectures = (
            self.db.query(func.count()).select_from(MathObject)
            .filter(MathObject.project_id == project_id, MathObject.object_type == "conjecture")
            .scalar()
        )
        return {"objects": objects, "proofs": proofs, "open_conjectures": conjectures}
