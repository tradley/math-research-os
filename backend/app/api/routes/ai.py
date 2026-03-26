from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Any
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.math_reasoning import MathReasoningService
from app.schemas import ReasoningRequest

router = APIRouter()


class ExplainIn(BaseModel):
    text: str
    context: dict | None = None


@router.post("/explain")
def explain(payload: ExplainIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = MathReasoningService(db)
    return service.explain(payload.text, user_id=user.id)


@router.post("/reason")
def reason(payload: ReasoningRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Full reasoning with retrieval, provider call, and AI run logging."""
    service = MathReasoningService(db)
    return service.reason(
        prompt=payload.prompt,
        project_id=payload.context.get("project_id") if payload.context else None,
        user_id=user.id,
        provider=payload.provider,
        mode=payload.mode,
    )
