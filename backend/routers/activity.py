"""Activity log routes.

Mirrors server/routes.ts lines 565-574.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel import text

from backend.auth import get_current_user
from backend.dependencies import SessionDep
from backend.models import User

router = APIRouter()


@router.get("/activity-logs")
async def get_activity_logs(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "admin":
        result = await session.execute(
            text("""
                SELECT al.*, u.name as user_name, u.role as user_role
                FROM activity_logs al
                LEFT JOIN users u ON u.id = al.user_id
                ORDER BY al.id DESC LIMIT 50
            """)
        )
    else:
        result = await session.execute(
            text("""
                SELECT *
                FROM activity_logs
                WHERE user_id = :uid
                ORDER BY id DESC LIMIT 20
            """),
            {"uid": current_user.id},
        )
    return [dict(r._mapping) for r in result.all()]
