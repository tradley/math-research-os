"""
Background workers for expensive AI tasks.
Run with: celery -A app.workers.tasks worker --loglevel=info
"""

from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "math_research_os",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10)
def generate_proof_plan_task(self, project_id: str, theorem_text: str, user_id: str | None = None):
    """Long-running proof plan generation."""
    from app.db.session import SessionLocal
    from app.services.math_reasoning import MathReasoningService

    db = SessionLocal()
    try:
        service = MathReasoningService(db)
        result = service.generate_proof_plan(theorem_text, project_id, user_id)
        return result
    except Exception as exc:
        raise self.retry(exc=exc)
    finally:
        db.close()


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10)
def analyze_statement_task(self, project_id: str, theorem_text: str, user_id: str | None = None):
    """Background theorem analysis."""
    from app.db.session import SessionLocal
    from app.services.math_reasoning import MathReasoningService

    db = SessionLocal()
    try:
        service = MathReasoningService(db)
        result = service.analyze_statement(theorem_text, project_id, user_id)
        return result
    except Exception as exc:
        raise self.retry(exc=exc)
    finally:
        db.close()


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10)
def generate_paper_draft_task(self, project_id: str, notes: str, user_id: str | None = None):
    """Background paper draft generation."""
    from app.db.session import SessionLocal
    from app.services.math_reasoning import MathReasoningService

    db = SessionLocal()
    try:
        service = MathReasoningService(db)
        result = service.reason(
            f"Draft a research paper outline based on these notes:\n{notes}",
            project_id, user_id,
        )
        return result
    except Exception as exc:
        raise self.retry(exc=exc)
    finally:
        db.close()
