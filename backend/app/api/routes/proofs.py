from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.proofs import ProofStateRepository
from app.repositories.projects import ProjectRepository
from app.schemas import ProofStateCreate, ProofStateRead, ProofStateUpdate

router = APIRouter()


def _verify_project(project_id: str, user: User, db: Session):
    if not ProjectRepository(db).get_owned(project_id, user.id):
        raise HTTPException(404, "Project not found")


@router.get("/projects/{project_id}/proofs", response_model=list[ProofStateRead])
def list_proofs(project_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _verify_project(project_id, user, db)
    return ProofStateRepository(db).list_for_project(project_id)


@router.post("/projects/{project_id}/proofs", response_model=ProofStateRead, status_code=201)
def create_proof(project_id: str, body: ProofStateCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _verify_project(project_id, user, db)
    data = body.model_dump()
    data["project_id"] = project_id
    return ProofStateRepository(db).create(data)


@router.get("/proofs/{proof_id}", response_model=ProofStateRead)
def get_proof(proof_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    proof = ProofStateRepository(db).get(proof_id)
    if not proof:
        raise HTTPException(404, "Proof state not found")
    _verify_project(proof.project_id, user, db)
    return proof


@router.patch("/proofs/{proof_id}", response_model=ProofStateRead)
def update_proof(proof_id: str, body: ProofStateUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = ProofStateRepository(db)
    proof = repo.get(proof_id)
    if not proof:
        raise HTTPException(404, "Proof state not found")
    _verify_project(proof.project_id, user, db)
    return repo.update(proof_id, body.model_dump(exclude_unset=True))


@router.delete("/proofs/{proof_id}", status_code=204)
def delete_proof(proof_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = ProofStateRepository(db)
    proof = repo.get(proof_id)
    if not proof:
        raise HTTPException(404, "Proof state not found")
    _verify_project(proof.project_id, user, db)
    repo.delete(proof_id)
