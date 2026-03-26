from sqlalchemy.orm import Session

from app.models.math_object import MathObject


class MathObjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> MathObject:
        obj = MathObject(**data)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get(self, object_id: str) -> MathObject | None:
        return self.db.query(MathObject).filter(MathObject.id == object_id).first()

    def list_for_project(self, project_id: str) -> list[MathObject]:
        return (
            self.db.query(MathObject)
            .filter(MathObject.project_id == project_id)
            .order_by(MathObject.created_at.desc())
            .all()
        )

    def update(self, object_id: str, data: dict) -> MathObject | None:
        obj = self.get(object_id)
        if not obj:
            return None
        for k, v in data.items():
            if v is not None:
                setattr(obj, k, v)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, object_id: str) -> bool:
        obj = self.get(object_id)
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True

    def search_by_statement(self, project_id: str, query: str, limit: int = 10) -> list[MathObject]:
        """Simple text search for retrieval. Upgrade to pgvector later."""
        return (
            self.db.query(MathObject)
            .filter(MathObject.project_id == project_id)
            .filter(MathObject.statement_text.ilike(f"%{query[:80]}%"))
            .limit(limit)
            .all()
        )
