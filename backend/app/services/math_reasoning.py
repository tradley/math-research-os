"""
Math reasoning service: the core orchestration layer.

Flow: Route → Service → Retrieval + Provider → Persist AIRun → Return

This service:
1. Builds context via MathRetrievalService
2. Composes structured prompts per task type
3. Calls the AI provider via safe_generate
4. Logs the run to ai_runs
5. Returns structured result
"""

import json
import logging

from sqlalchemy.orm import Session

from app.repositories.ai_runs import AIRunRepository
from app.services.ai.factory import get_ai_provider, safe_generate
from app.services.retrieval import MathRetrievalService

logger = logging.getLogger(__name__)

# ── System prompts per task type ──────────────────────

SYSTEM_PROMPTS = {
    "analyze": (
        "You are a careful mathematical research assistant.\n"
        "Analyze the given theorem statement.\n"
        "Return structured JSON with keys: explicit_assumptions (list), "
        "hidden_assumptions (list), goals (list), risks (list), "
        "candidate_proof_directions (list)."
    ),
    "proof_plan": (
        "You are a proof planning assistant.\n"
        "Given a theorem and related context, produce a step-by-step proof strategy.\n"
        "Return structured JSON with key proof_strategy: list of objects with "
        "step_number, title, rationale, required_lemmas, produces_subgoals, risk_notes."
    ),
    "counterexample": (
        "You are a mathematical stress-tester.\n"
        "Search for potential counterexamples or boundary cases for the given statement.\n"
        "Return structured JSON with keys: possible_counterexamples (list), "
        "weakened_hypotheses (list), boundary_regimes (list)."
    ),
    "formalize": (
        "You are a Lean 4 formalization assistant.\n"
        "Produce a Lean skeleton for the given theorem.\n"
        "Return structured JSON with keys: imports (list), signature_sketch (string), "
        "proof_sketch (string), notes (list)."
    ),
    "explain": (
        "You are a mathematical exposition assistant.\n"
        "Explain the given statement clearly and precisely.\n"
        "Return structured JSON with keys: summary (string), key_concepts (list), "
        "prerequisites (list)."
    ),
    "reason": (
        "You are a rigorous mathematical reasoning assistant.\n"
        "Respond with structured JSON: claim, justification, confidence (0-1), gaps (list)."
    ),
}


class MathReasoningService:
    def __init__(self, db: Session):
        self.db = db
        self.retrieval = MathRetrievalService(db)
        self.ai_run_repo = AIRunRepository(db)

    def _run(
        self,
        task_type: str,
        user_prompt: str,
        project_id: str | None = None,
        user_id: str | None = None,
        provider_name: str | None = None,
        object_id: str | None = None,
    ) -> dict:
        """Core execution: retrieve context → call provider → log run → return."""
        # 1. Build context
        context_text = ""
        if project_id:
            context_text = self.retrieval.build_context(project_id, user_prompt, object_id)

        # 2. Compose full prompt
        system_prompt = SYSTEM_PROMPTS.get(task_type, SYSTEM_PROMPTS["reason"])
        full_user_prompt = user_prompt
        if context_text:
            full_user_prompt = f"{user_prompt}\n\n--- Project Context ---\n{context_text}"

        # 3. Call provider
        provider = get_ai_provider(provider_name)
        result = safe_generate(provider, system_prompt, full_user_prompt)

        # 4. Log AI run
        run_data = {
            "project_id": project_id,
            "user_id": user_id,
            "provider": provider_name or "default",
            "model": result["response"].model if result["ok"] else "error",
            "task_type": task_type,
            "input_payload": {"system_prompt": system_prompt[:500], "user_prompt": user_prompt[:2000]},
            "output_text": result["response"].text if result["ok"] else "",
            "error": result.get("error"),
            "latency_ms": result.get("latency_ms", 0),
            "prompt_tokens": result["response"].prompt_tokens if result["ok"] else 0,
            "completion_tokens": result["response"].completion_tokens if result["ok"] else 0,
        }
        ai_run = self.ai_run_repo.create(run_data)

        # 5. Return
        if result["ok"]:
            # Try to parse as JSON for structured responses
            text = result["response"].text
            try:
                parsed = json.loads(text)
            except (json.JSONDecodeError, TypeError):
                parsed = {"raw_text": text}

            return {
                "ok": True,
                "task_type": task_type,
                "result": parsed,
                "ai_run_id": ai_run.id,
                "provider": result["response"].model,
                "latency_ms": result["latency_ms"],
            }
        else:
            return {
                "ok": False,
                "task_type": task_type,
                "error": result["error"],
                "ai_run_id": ai_run.id,
            }

    # ── Public task methods ───────────────────────────

    def analyze_statement(self, theorem_text: str, project_id: str | None = None, user_id: str | None = None, provider: str | None = None) -> dict:
        return self._run("analyze", f"Theorem:\n{theorem_text}", project_id, user_id, provider)

    def generate_proof_plan(self, theorem_text: str, project_id: str | None = None, user_id: str | None = None, provider: str | None = None) -> dict:
        return self._run("proof_plan", f"Theorem:\n{theorem_text}", project_id, user_id, provider)

    def search_counterexamples(self, statement: str, project_id: str | None = None, user_id: str | None = None, provider: str | None = None) -> dict:
        return self._run("counterexample", f"Statement:\n{statement}", project_id, user_id, provider)

    def formalize_to_lean(self, theorem_text: str, project_id: str | None = None, user_id: str | None = None, provider: str | None = None) -> dict:
        return self._run("formalize", f"Theorem:\n{theorem_text}", project_id, user_id, provider)

    def explain(self, text: str, user_id: str | None = None, provider: str | None = None) -> dict:
        return self._run("explain", text, None, user_id, provider)

    def reason(self, prompt: str, project_id: str | None = None, user_id: str | None = None, provider: str | None = None, mode: str = "heuristic") -> dict:
        task = "reason" if mode == "heuristic" else "reason"
        return self._run(task, prompt, project_id, user_id, provider)
