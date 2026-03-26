import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class GraphEdge(Base):
    __tablename__ = "graph_edges"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_id: Mapped[str] = mapped_column(String, ForeignKey("math_objects.id", ondelete="CASCADE"), index=True)
    target_id: Mapped[str] = mapped_column(String, ForeignKey("math_objects.id", ondelete="CASCADE"), index=True)
    relation: Mapped[str] = mapped_column(String(100))
    label: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    source = relationship("MathObject", foreign_keys=[source_id], back_populates="outgoing_edges")
    target = relationship("MathObject", foreign_keys=[target_id], back_populates="incoming_edges")
