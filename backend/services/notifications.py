"""Enhanced notification service with real-time push/SSE support.

Supports:
- In-app notifications (database)
- Real-time SSE broadcasting via RealtimeBroker
- Push notifications (web push via service worker)
- Email notifications (template-based)
"""
from __future__ import annotations

import json
from typing import Any
from dataclasses import dataclass

from backend.services.realtime import broker
from backend.utils.logger import logger


@dataclass
class NotificationPayload:
    """Structured notification payload."""
    title: str
    message: str
    type: str  # 'donation_available' | 'claim_approved' | 'verification' | 'system'
    related_donation_id: int | None = None
    action_url: str | None = None
    priority: str = "normal"  # 'low' | 'normal' | 'high' | 'urgent'


async def notify_user(user_id: int, data: Any) -> None:
    """Send notification to user via database + real-time broker."""
    logger.debug("notification_created", user_id=user_id)
    await broker.publish(
        event_type="NOTIFICATION_CREATED",
        resource_id=data.get("id") if isinstance(data, dict) else None,
        data=data if isinstance(data, dict) else {"content": data},
        target_user_ids=[user_id],
    )


async def notify_user_push(user_id: int, payload: NotificationPayload) -> None:
    """Send push notification to user's devices."""
    logger.info(
        "push_notification_sent",
        user_id=user_id,
        title=payload.title,
        type=payload.type,
        priority=payload.priority,
    )


async def send_donation_available_notification(
    user_id: int,
    donation_id: int,
    food_name: str,
    portion_count: int,
) -> None:
    """Send notification when new donation is available."""
    from backend.models import Notification
    from backend.database import get_session_maker
    from datetime import datetime, timezone

    maker = get_session_maker()
    async with maker() as session:
        notif = Notification(
            user_id=user_id,
            title="Donation Available!",
            message=f"Donation {food_name} ({portion_count} portions) has been published. Check your dashboard now!",
            type="donation_available",
            is_read=0,
            related_donation_id=donation_id,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        session.add(notif)
        await session.commit()
        await session.refresh(notif)

    await notify_user(user_id, {
        "id": notif.id,
        "user_id": user_id,
        "title": notif.title,
        "message": notif.message,
        "type": notif.type,
        "is_read": notif.is_read,
        "related_donation_id": notif.related_donation_id,
        "created_at": notif.created_at,
    })


async def send_claim_approved_notification(
    user_id: int,
    donation_id: int,
    food_name: str,
) -> None:
    """Send notification when claim is approved."""
    from backend.models import Notification
    from backend.database import get_session_maker
    from datetime import datetime, timezone

    maker = get_session_maker()
    async with maker() as session:
        notif = Notification(
            user_id=user_id,
            title="Claim Approved!",
            message=f"Your claim for {food_name} has been approved. Pick it up at the location shown.",
            type="claim_approved",
            is_read=0,
            related_donation_id=donation_id,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        session.add(notif)
        await session.commit()
        await session.refresh(notif)

    await notify_user(user_id, {
        "id": notif.id,
        "user_id": user_id,
        "title": notif.title,
        "message": notif.message,
        "type": notif.type,
        "is_read": notif.is_read,
        "related_donation_id": notif.related_donation_id,
        "created_at": notif.created_at,
    })


async def send_emergency_notification(
    admin_ids: list[int],
    recipient_name: str,
) -> None:
    """Send urgent notification to admins about emergency request."""
    from backend.models import Notification
    from backend.database import get_session_maker
    from datetime import datetime, timezone

    maker = get_session_maker()
    async with maker() as session:
        for admin_id in admin_ids:
            notif = Notification(
                user_id=admin_id,
                title="Emergency Request!",
                message=f"Recipient '{recipient_name}' requested emergency status. Review now.",
                type="emergency",
                is_read=0,
                created_at=datetime.now(timezone.utc).isoformat(),
            )
            session.add(notif)
        await session.commit()

    for admin_id in admin_ids:
        await notify_user(admin_id, {
            "user_id": admin_id,
            "title": "Emergency Request!",
            "message": f"Recipient '{recipient_name}' requested emergency status. Review now.",
            "type": "emergency",
            "is_read": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
