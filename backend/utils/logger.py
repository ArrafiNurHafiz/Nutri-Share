"""Shared utilities — logger, activity logging.

Extends the structlog setup with domain-specific logging helpers.
Provides structured logging for production with JSON output.
"""
from __future__ import annotations

import sys
from datetime import UTC, datetime

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config import settings


def setup_logging() -> None:
    """Configure structured logging with structlog."""
    # Shared processors for all log levels
    shared_processors: list[structlog.types.Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    if settings.is_production:
        # Production: JSON output for log aggregation
        renderer = structlog.processors.JSONRenderer()
    else:
        # Development: Human-readable console output
        renderer = structlog.dev.ConsoleRenderer(colors=True)

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Configure stdlib logging to use structlog
    import logging

    formatter = structlog.stdlib.ProcessorFormatter(
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            renderer,
        ],
        foreign_pre_chain=shared_processors,
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)

    # Set log level based on environment
    log_level = logging.DEBUG if settings.log_level == "debug" else logging.INFO
    root_logger.setLevel(log_level)

    # Suppress noisy libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


# Initialize logging on import
setup_logging()

logger = structlog.get_logger()


async def log_activity(
    session: AsyncSession,
    user_id: int,
    action: str,
    details: str = "",
) -> None:
    """Insert an activity log entry (silent on failure).

    Shared across all routers. Replaces duplicated log_activity() in auth/donations/admin.
    """
    from backend.models import ActivityLog

    try:
        entry = ActivityLog(
            user_id=user_id,
            action=action,
            details=details,
            created_at=datetime.now(UTC).isoformat(),
        )
        session.add(entry)
        await session.commit()

        # Also log to structured logger
        logger.info(
            "activity_logged",
            user_id=user_id,
            action=action,
            details=details,
        )
    except Exception:
        await session.rollback()
        logger.error(
            "activity_log_failed",
            user_id=user_id,
            action=action,
            exc_info=True,
        )


def log_request(method: str, path: str, status_code: int, duration_ms: float) -> None:
    """Log HTTP request with structured data."""
    logger.info(
        "http_request",
        method=method,
        path=path,
        status_code=status_code,
        duration_ms=round(duration_ms, 2),
    )


def log_error(error: Exception, context: dict | None = None) -> None:
    """Log error with context."""
    logger.error(
        "application_error",
        error_type=type(error).__name__,
        error_message=str(error),
        **(context or {}),
        exc_info=True,
    )
