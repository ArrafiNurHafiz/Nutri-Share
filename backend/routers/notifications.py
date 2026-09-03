"""Notification routes — list, mark read (polling-based).
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import select

from backend.auth import get_current_user
from backend.dependencies import SessionDep
from backend.models import Notification, User

router = APIRouter()


@router.get("/notifications")
async def list_notifications(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.id.desc())
        .limit(50)
    )
    return result.scalars().all()


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    n = await session.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    n = n.scalar_one_or_none()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.is_read = 1
    session.add(n)
    await session.commit()
    return {"success": True}
