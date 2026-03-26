from sqlalchemy.orm import Session

from app.models.proof_state import ProofState


class ProofStateRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> ProofState:
        proof = ProofState(**data)
        self.db.add(proof)
        self.db.commit()
        self.db.refresh(proof)
        return proof

    def get(self, proof_id: str) -> ProofState | None:
        return self.db.query(ProofState).filter(ProofState.id == proof_id).first()

    def list_for_project(self, project_id: str) -> list[ProofState]:
        return (
            self.db.query(ProofState)
            .filter(ProofState.project_id == project_id)
            .order_by(ProofState.updated_at.desc())
            .all()
        )

    def list_for_object(self, math_object_id: str) -> list[ProofState]:
        return (
            self.db.query(ProofState)
            .filter(ProofState.math_object_id == math_object_id)
            .order_by(ProofState.updated_at.desc())
            .all()
        )

    def update(self, proof_id: str, data: dict) -> ProofState | None:
        proof = self.get(proof_id)
        if not proof:
            return None
        for k, v in data.items():
            if v is not None:
                setattr(proof, k, v)
        self.db.commit()
        self.db.refresh(proof)
        return proof

    def delete(self, proof_id: str) -> bool:
        proof = self.get(proof_id)
        if not proof:
            return False
        self.db.delete(proof)
        self.db.commit()
        return True
