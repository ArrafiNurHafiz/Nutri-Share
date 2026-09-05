"""Tests for Real-time event broker and SSE endpoints."""
import asyncio
import json
import pytest
from httpx import AsyncClient

from backend.services.realtime import broker


@pytest.mark.asyncio
async def test_broker_subscribe_unsubscribe():
    """Verify subscription queue management."""
    q = broker.subscribe(user_id=999, role="recipient")
    assert q in broker._user_subscribers[999]
    assert q in broker._role_subscribers["recipient"]

    broker.unsubscribe(q)
    assert 999 not in broker._user_subscribers
    assert "recipient" not in broker._role_subscribers


@pytest.mark.asyncio
async def test_broker_publish_targeted():
    """Verify targeted event delivery by user_id and role."""
    q_admin = broker.subscribe(user_id=1, role="admin")
    q_recipient = broker.subscribe(user_id=2, role="recipient")
    q_donor = broker.subscribe(user_id=3, role="donor")

    try:
        # Publish targeted to admin only
        delivered = await broker.publish(
            event_type="CLAIM_CREATED",
            resource_id=101,
            data={"status": "pending"},
            target_roles=["admin"],
        )
        assert delivered == 1
        assert not q_recipient.qsize()
        assert not q_donor.qsize()

        msg = q_admin.get_nowait()
        parsed = json.loads(msg)
        assert parsed["event_type"] == "CLAIM_CREATED"
        assert parsed["resource_id"] == 101

        # Publish targeted to specific user
        delivered = await broker.publish(
            event_type="CLAIM_APPROVED",
            resource_id=101,
            target_user_ids=[2],
        )
        assert delivered == 1
        assert not q_admin.qsize()
        assert not q_donor.qsize()

        msg_rec = q_recipient.get_nowait()
        parsed_rec = json.loads(msg_rec)
        assert parsed_rec["event_type"] == "CLAIM_APPROVED"
    finally:
        broker.unsubscribe(q_admin)
        broker.unsubscribe(q_recipient)
        broker.unsubscribe(q_donor)


@pytest.mark.asyncio
async def test_events_stream_unauthorized(client: AsyncClient):
    """Verify unauthorized user cannot subscribe to SSE stream."""
    response = await client.get("/api/events/stream")
    assert response.status_code == 401
