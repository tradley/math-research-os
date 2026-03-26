"""
Retrieval layer: gathers relevant math objects, prior proofs,
and graph neighbors to enrich AI prompts with project context.

Start with PostgreSQL text search. Upgrade to pgvector + embeddings later.
"""

from sqlalchemy.orm import Session

from app.models.math_object import MathObject
from app.models.proof_state import ProofState
from app.models.graph_edge import GraphEdge


class MathRetrievalService:
    def __init__(self, db: Session):
        self.db = db

    def get_related_objects(self, project_id: str, query: str, limit: int = 10) -> list[dict]:
        """Simple ilike search on statement text. Upgrade to embeddings later."""
        rows = (
            self.db.query(MathObject)
            .filter(MathObject.project_id == project_id)
            .filter(MathObject.statement_text.ilike(f"%{query[:80]}%"))
            .limit(limit)
            .all()
        )
        return [
            {"id": r.id, "title": r.title, "statement_text": r.statement_text, "object_type": r.object_type, "status": r.status}
            for r in rows
        ]

    def get_prior_proofs(self, project_id: str, limit: int = 5) -> list[dict]:
        rows = (
            self.db.query(ProofState)
            .filter(ProofState.project_id == project_id)
            .order_by(ProofState.updated_at.desc())
            .limit(limit)
            .all()
        )
        return [
            {"id": r.id, "status": r.status, "strategy": r.strategy[:200], "steps_count": len(r.steps) if isinstance(r.steps, list) else 0}
            for r in rows
        ]

    def get_graph_neighbors(self, object_id: str, limit: int = 10) -> list[dict]:
        """Get objects directly connected by graph edges."""
        edges = (
            self.db.query(GraphEdge)
            .filter((GraphEdge.source_id == object_id) | (GraphEdge.target_id == object_id))
            .limit(limit)
            .all()
        )
        neighbor_ids = set()
        for e in edges:
            neighbor_ids.add(e.source_id if e.target_id == object_id else e.target_id)

        if not neighbor_ids:
            return []

        neighbors = self.db.query(MathObject).filter(MathObject.id.in_(neighbor_ids)).all()
        return [
            {"id": n.id, "title": n.title, "object_type": n.object_type, "statement_text": n.statement_text[:300]}
            for n in neighbors
        ]

    def build_context(self, project_id: str, query: str, object_id: str | None = None) -> str:
        """Assemble a context block for AI prompts."""
        parts = []

        related = self.get_related_objects(project_id, query, limit=5)
        if related:
            parts.append("=== Related math objects ===")
            for obj in related:
                parts.append(f"[{obj['object_type']}] {obj['title']}: {obj['statement_text'][:200]}")

        proofs = self.get_prior_proofs(project_id, limit=3)
        if proofs:
            parts.append("\n=== Recent proof attempts ===")
            for p in proofs:
                parts.append(f"[{p['status']}] Strategy: {p['strategy'][:150]} ({p['steps_count']} steps)")

        if object_id:
            neighbors = self.get_graph_neighbors(object_id, limit=5)
            if neighbors:
                parts.append("\n=== Graph neighbors ===")
                for n in neighbors:
                    parts.append(f"[{n['object_type']}] {n['title']}: {n['statement_text'][:150]}")

        return "\n".join(parts) if parts else "(No related objects found in project.)"
