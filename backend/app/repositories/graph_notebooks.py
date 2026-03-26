from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.notebook import Notebook
from app.models.graph_edge import GraphEdge
from app.models.math_object import MathObject


class NotebookRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> Notebook:
        nb = Notebook(**data)
        self.db.add(nb)
        self.db.commit()
        self.db.refresh(nb)
        return nb

    def get(self, notebook_id: str) -> Notebook | None:
        return self.db.query(Notebook).filter(Notebook.id == notebook_id).first()

    def list_for_project(self, project_id: str) -> list[Notebook]:
        return self.db.query(Notebook).filter(Notebook.project_id == project_id).order_by(Notebook.updated_at.desc()).all()

    def update(self, notebook_id: str, data: dict) -> Notebook | None:
        nb = self.get(notebook_id)
        if not nb:
            return None
        for k, v in data.items():
            if v is not None:
                setattr(nb, k, v)
        self.db.commit()
        self.db.refresh(nb)
        return nb

    def delete(self, notebook_id: str) -> bool:
        nb = self.get(notebook_id)
        if not nb:
            return False
        self.db.delete(nb)
        self.db.commit()
        return True


class GraphEdgeRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> GraphEdge:
        edge = GraphEdge(**data)
        self.db.add(edge)
        self.db.commit()
        self.db.refresh(edge)
        return edge

    def delete(self, edge_id: str) -> bool:
        edge = self.db.query(GraphEdge).filter(GraphEdge.id == edge_id).first()
        if not edge:
            return False
        self.db.delete(edge)
        self.db.commit()
        return True

    def get_full_graph(self, project_id: str) -> dict:
        """Return nodes + edges in React Flow / Cytoscape format."""
        objects = self.db.query(MathObject).filter(MathObject.project_id == project_id).all()
        obj_ids = [o.id for o in objects]
        edges = []
        if obj_ids:
            edges = (
                self.db.query(GraphEdge)
                .filter(or_(GraphEdge.source_id.in_(obj_ids), GraphEdge.target_id.in_(obj_ids)))
                .all()
            )
        return {
            "nodes": [
                {"id": o.id, "object_type": o.object_type, "title": o.title, "status": o.status, "statement_text": o.statement_text}
                for o in objects
            ],
            "edges": [
                {"id": e.id, "source": e.source_id, "target": e.target_id, "relation": e.relation, "label": e.label}
                for e in edges
            ],
        }

    def list_for_project(self, project_id: str) -> list[GraphEdge]:
        obj_ids = [r[0] for r in self.db.query(MathObject.id).filter(MathObject.project_id == project_id).all()]
        if not obj_ids:
            return []
        return self.db.query(GraphEdge).filter(or_(GraphEdge.source_id.in_(obj_ids), GraphEdge.target_id.in_(obj_ids))).all()
