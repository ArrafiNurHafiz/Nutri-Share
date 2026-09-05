"""Real-time event broker for SSE broadcasting.

Role and user-based delivery with in-memory asyncio.Queue per client.
Serverless compatible: client reconnects automatically if function cycles.
"""
from __future__ import annotations

import asyncio
import json
import uuid
from collections import defaultdict
from datetime import UTC, datetime
from typing import Any, AsyncGenerator

from backend.utils.logger import logger


class RealtimeBroker:
    """Manages SSE subscribers and dispatches events by role/user."""

    def __init__(self) -> None:
        # user_id -> set of asyncio.Queue
        self._user_subscribers: dict[int, set[asyncio.Queue]] = defaultdict(set)
        # role -> set of asyncio.Queue
        self._role_subscribers: dict[str, set[asyncio.Queue]] = defaultdict(set)
        # queue -> (user_id, role)
        self._client_meta: dict[asyncio.Queue, tuple[int, str]] = {}

    def subscribe(self, user_id: int, role: str) -> asyncio.Queue:
        """Register a new client connection."""
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        self._user_subscribers[user_id].add(queue)
        self._role_subscribers[role].add(queue)
        self._client_meta[queue] = (user_id, role)
        logger.debug("sse_client_subscribed", user_id=user_id, role=role, total_clients=len(self._client_meta))
        return queue

    def unsubscribe(self, queue: asyncio.Queue) -> None:
        """Remove a client connection."""
        meta = self._client_meta.pop(queue, None)
        if meta:
            uid, r = meta
            self._user_subscribers[uid].discard(queue)
            if not self._user_subscribers[uid]:
                self._user_subscribers.pop(uid, None)
            self._role_subscribers[r].discard(queue)
            if not self._role_subscribers[r]:
                self._role_subscribers.pop(r, None)
            logger.debug("sse_client_unsubscribed", user_id=uid, role=r, total_clients=len(self._client_meta))

    async def publish(
        self,
        event_type: str,
        resource_id: int | str | None = None,
        data: dict[str, Any] | None = None,
        target_user_ids: list[int] | None = None,
        target_roles: list[str] | None = None,
    ) -> int:
        """Publish real-time event to targeted users and roles."""
        payload = {
            "event_id": str(uuid.uuid4()),
            "event_type": event_type,
            "resource_id": resource_id,
            "timestamp": datetime.now(UTC).isoformat(),
            "data": data or {},
        }
        raw_msg = json.dumps(payload)

        # Collect unique target queues
        target_queues: set[asyncio.Queue] = set()

        if target_user_ids:
            for uid in target_user_ids:
                target_queues.update(self._user_subscribers.get(uid, set()))

        if target_roles:
            for role in target_roles:
                target_queues.update(self._role_subscribers.get(role, set()))

        # If neither target specified, do not broadcast arbitrarily
        delivered_count = 0
        for q in target_queues:
            try:
                q.put_nowait(raw_msg)
                delivered_count += 1
            except asyncio.QueueFull:
                # Discard slow client or drop oldest
                try:
                    q.get_nowait()
                    q.put_nowait(raw_msg)
                    delivered_count += 1
                except Exception:
                    pass

        logger.debug(
            "realtime_event_published",
            event_type=event_type,
            resource_id=resource_id,
            delivered_to=delivered_count,
        )
        return delivered_count


# Global singleton instance
broker = RealtimeBroker()
