from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str = ""

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserRead(BaseModel):
    id: str
    email: str
    display_name: str
    role: str
    created_at: datetime
    class Config:
        from_attributes = True


# ── Projects ─────────────────────────────────────────
class ProjectCreate(BaseModel):
    title: str
    description: str = ""
    field: str = ""
    tags: list[str] = []

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    field: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[list[str]] = None

class ProjectRead(BaseModel):
    id: str
    owner_id: str
    title: str
    description: str
    field: str
    status: str
    tags: Any
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# ── Math Objects ─────────────────────────────────────
class MathObjectCreate(BaseModel):
    project_id: str
    object_type: str
    title: str
    statement_text: str = ""
    latex_statement: str = ""
    status: str = "draft"
    metadata_: dict[str, Any] = {}

class MathObjectUpdate(BaseModel):
    object_type: Optional[str] = None
    title: Optional[str] = None
    statement_text: Optional[str] = None
    latex_statement: Optional[str] = None
    status: Optional[str] = None
    metadata_: Optional[dict[str, Any]] = None

class MathObjectRead(BaseModel):
    id: str
    project_id: str
    object_type: str
    title: str
    statement_text: str
    latex_statement: str
    status: str
    metadata_: dict[str, Any]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# ── Proof States ─────────────────────────────────────
class ProofStateCreate(BaseModel):
    project_id: str
    math_object_id: Optional[str] = None
    status: str = "draft"
    strategy: str = ""
    steps: list[dict[str, Any]] = []
    human_notes: str = ""

class ProofStateUpdate(BaseModel):
    status: Optional[str] = None
    strategy: Optional[str] = None
    steps: Optional[list[dict[str, Any]]] = None
    human_notes: Optional[str] = None

class ProofStateRead(BaseModel):
    id: str
    project_id: str
    math_object_id: Optional[str]
    status: str
    strategy: str
    steps: Any
    ai_output: Any
    human_notes: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# ── Notebooks ────────────────────────────────────────
class NotebookCreate(BaseModel):
    project_id: str
    title: str = "Untitled Notebook"
    blocks: list[dict[str, Any]] = []

class NotebookUpdate(BaseModel):
    title: Optional[str] = None
    blocks: Optional[list[dict[str, Any]]] = None

class NotebookRead(BaseModel):
    id: str
    project_id: str
    title: str
    blocks: Any
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# ── Graph ────────────────────────────────────────────
class GraphEdgeCreate(BaseModel):
    source_id: str
    target_id: str
    relation: str
    label: str = ""

class GraphEdgeRead(BaseModel):
    id: str
    source_id: str
    target_id: str
    relation: str
    label: str
    created_at: datetime
    class Config:
        from_attributes = True


# ── AI Runs ──────────────────────────────────────────
class AIRunRead(BaseModel):
    id: str
    project_id: Optional[str]
    user_id: Optional[str]
    provider: str
    model: str
    task_type: str
    output_text: str
    error: Optional[str]
    latency_ms: int
    prompt_tokens: int
    completion_tokens: int
    created_at: datetime
    class Config:
        from_attributes = True


# ── AI Reasoning requests ────────────────────────────
class ReasoningRequest(BaseModel):
    prompt: str
    context: dict[str, Any] = {}
    provider: Optional[str] = None  # None = use default from config
    mode: str = "heuristic"

class TheoremRequest(BaseModel):
    theorem: str
    project_id: Optional[str] = None
    context: dict = {}

class StatementRequest(BaseModel):
    statement: str
    project_id: Optional[str] = None
    context: dict = {}

class ProofAdvanceRequest(BaseModel):
    proof_id: str
    user_step: str
