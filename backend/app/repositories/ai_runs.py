from sqlalchemy.orm import Session

from app.models.ai_run import AIRun


class AIRunRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> AIRun:
        run = AIRun(**data)
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)
        return run

    def get(self, run_id: str) -> AIRun | None:
        return self.db.query(AIRun).filter(AIRun.id == run_id).first()

    def list_for_project(self, project_id: str, limit: int = 50) -> list[AIRun]:
        return (
            self.db.query(AIRun)
            .filter(AIRun.project_id == project_id)
            .order_by(AIRun.created_at.desc())
            .limit(limit)
            .all()
        )

    def list_for_user(self, user_id: str, limit: int = 50) -> list[AIRun]:
        return (
            self.db.query(AIRun)
            .filter(AIRun.user_id == user_id)
            .order_by(AIRun.created_at.desc())
            .limit(limit)
            .all()
        )
