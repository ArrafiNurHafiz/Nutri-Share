"""Notification and real-time SSE routes.
"""
from __future__ import annotations

import asyncio
from datetime import UTC, datetime
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from sqlmodel import select

from backend.auth import get_current_user
from backend.dependencies import SessionDep
from backend.models import Notification, User
from backend.services.realtime import broker
from backend.utils.logger import logger

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


@router.get("/events/stream")
async def event_stream(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    """Server-Sent Events endpoint streaming real-time domain events to authenticated users."""
    queue = broker.subscribe(current_user.id, current_user.role)

    async def sse_generator() -> AsyncGenerator[str, None]:
        try:
            # Send initial connected handshake event
            yield f"event: connected\ndata: {{\"status\": \"connected\", \"user_id\": {current_user.id}, \"role\": \"{current_user.role}\"}}\n\n"
            while True:
                # Check client disconnect
                if await request.is_disconnected():
                    break
                try:
                    # Wait for message with 15s keep-alive heartbeat timeout
                    raw_msg = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"event: message\ndata: {raw_msg}\n\n"
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            broker.unsubscribe(queue)

    return StreamingResponse(
        sse_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
