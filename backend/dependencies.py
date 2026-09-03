"""FastAPI dependencies.

Reusable dependency functions for route handlers.
"""
from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_session as _get_session
from backend.models import User

# Re-export for convenience
get_session = _get_session
SessionDep = Annotated[AsyncSession, Depends(get_session)]


async def get_current_user_dep(
    session: SessionDep,
    token: str | None = None,
) -> User:
    """Lightweight current-user lookup by ID from auth middleware."""
    raise HTTPException(status_code=401, detail="Not authenticated")
