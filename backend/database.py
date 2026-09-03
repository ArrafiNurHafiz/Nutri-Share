"""Database engine and session management.

Supports Vercel Postgres (Neon), Supabase PostgreSQL, and SQLite (tests).
"""
from __future__ import annotations

import ssl
from collections.abc import AsyncGenerator
from typing import Optional
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from backend.config import settings
from backend.utils.logger import logger

_engine = None
_async_session_maker: Optional[async_sessionmaker[AsyncSession]] = None


def _get_database_url() -> str:
    """Return the appropriate database URL based on config."""
    if settings.database_url:
        return settings.database_url
    raise ValueError("DATABASE_URL is required. Configure PostgreSQL in .env")


def _normalize_url(url: str) -> tuple[str, dict]:
    """Strip asyncpg-unsupported params from URL; return (clean_url, connect_args)."""
    parsed = urlparse(url)

    # Extract query params we need to handle specially
    if parsed.query:
        params = parse_qs(parsed.query)
        ssl_mode = params.pop("sslmode", None)
        remaining = urlencode(params, doseq=True) if params else ""
        clean = urlunparse(parsed._replace(query=remaining))
    else:
        ssl_mode = None
        clean = url

    connect_args: dict = {"statement_cache_size": 0}
    if ssl_mode:
        # asyncpg expects an ssl.SSLContext, not strings
        ctx = ssl.create_default_context()
        val = ssl_mode[0] if isinstance(ssl_mode, list) else ssl_mode
        if val in ("require", "verify-full", "prefer"):
            ctx.check_hostname = True
            ctx.verify_mode = ssl.CERT_REQUIRED
        elif val == "verify-ca":
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_REQUIRED
        connect_args["ssl"] = ctx

    return clean, connect_args


def init_db(db_path: str | None = None) -> str:
    """Initialize the database engine.

    Supports Vercel Postgres (Neon), Supabase PostgreSQL, and SQLite (:memory:).

    Returns the resolved connection string.
    """
    global _engine, _async_session_maker

    if db_path == ":memory:":
        conn_str = "sqlite+aiosqlite:///:memory:"
        _engine = create_async_engine(conn_str, echo=False)
    else:
        raw = _get_database_url()
        conn_str, connect_args = _normalize_url(raw)
        logger.info("initializing_database", url=conn_str.split("@")[-1] if "@" in conn_str else conn_str.split("///")[-1])

        _engine = create_async_engine(
            conn_str,
            echo=False,
            pool_size=5,
            max_overflow=10,
            # Neon (serverless Postgres) closes idle connections after ~5 min.
            # pool_pre_ping verifies the connection before checkout; pool_recycle
            # rotates connections before the server-side idle timeout so a stale
            # pooled connection never reaches the application.
            pool_pre_ping=True,
            pool_recycle=300,
            connect_args=connect_args,
        )

    _async_session_maker = async_sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)
    return conn_str


def get_session_maker() -> async_sessionmaker[AsyncSession]:
    if _async_session_maker is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return _async_session_maker


async def create_tables():
    """Create all tables if they don't exist."""
    if _engine is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")

    # Import models so SQLModel.metadata is populated
    from backend import models  # noqa: F401

    async with _engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    # Migration: add columns if missing (safe for PostgreSQL)
    async with _engine.begin() as conn:
        from sqlalchemy import text

        for stmt in (
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TEXT",
        ):
            try:
                await conn.execute(text(stmt))
            except Exception:
                pass  # column already exists or not supported

    # Add indexes for frequently queried columns (safe to run multiple times)
    async with _engine.begin() as conn:
        from sqlalchemy import text

        indexes = [
            # Users table
            "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)",
            "CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)",
            "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
            # Donations table
            "CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status)",
            "CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id)",
            "CREATE INDEX IF NOT EXISTS idx_donations_claimed_by ON donations(claimed_by)",
            "CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at)",
            # TopsisResult table
            "CREATE INDEX IF NOT EXISTS idx_topsis_results_donation_id ON topsis_results(donation_id)",
            "CREATE INDEX IF NOT EXISTS idx_topsis_results_recipient_id ON topsis_results(recipient_id)",
            # Notification table
            "CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)",
            # Claim table
            "CREATE INDEX IF NOT EXISTS idx_claims_donation_id ON claims(donation_id)",
            "CREATE INDEX IF NOT EXISTS idx_claims_recipient_id ON claims(recipient_id)",
            # Review table
            "CREATE INDEX IF NOT EXISTS idx_reviews_donor_id ON reviews(donor_id)",
            "CREATE INDEX IF NOT EXISTS idx_reviews_donation_id ON reviews(donation_id)",
        ]

        for idx_sql in indexes:
            try:
                await conn.execute(text(idx_sql))
            except Exception:
                pass  # index already exists or not supported


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    maker = get_session_maker()
    async with maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def close_db():
    global _engine, _async_session_maker
    if _engine:
        await _engine.dispose()
        _engine = None
        _async_session_maker = None
