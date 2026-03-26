from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas import TheoremRequest, StatementRequest, ProofAdvanceRequest
from app.services.math_reasoning import MathReasoningService

router = APIRouter(prefix="/math-ai", tags=["math-ai"])


@router.post("/analyze-statement")
def analyze_statement(payload: TheoremRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = MathReasoningService(db)
    return service.analyze_statement(payload.theorem, payload.project_id, user.id)


@router.post("/proof-plan")
def proof_plan(payload: TheoremRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = MathReasoningService(db)
    return service.generate_proof_plan(payload.theorem, payload.project_id, user.id)


@router.post("/counterexample")
def counterexample(payload: StatementRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = MathReasoningService(db)
    return service.search_counterexamples(payload.statement, payload.project_id, user.id)


@router.post("/formalize")
def formalize(payload: TheoremRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = MathReasoningService(db)
    return service.formalize_to_lean(payload.theorem, payload.project_id, user.id)


@router.post("/analyze-statement/async")
def analyze_async(payload: TheoremRequest, user: User = Depends(get_current_user)):
    """Queue analysis as a background job. Returns task_id for polling."""
    from app.workers.tasks import analyze_statement_task
    task = analyze_statement_task.delay(payload.project_id or "", payload.theorem, user.id)
    return {"task_id": task.id, "status": "queued"}


@router.post("/proof-plan/async")
def proof_plan_async(payload: TheoremRequest, user: User = Depends(get_current_user)):
    """Queue proof planning as a background job."""
    from app.workers.tasks import generate_proof_plan_task
    task = generate_proof_plan_task.delay(payload.project_id or "", payload.theorem, user.id)
    return {"task_id": task.id, "status": "queued"}
