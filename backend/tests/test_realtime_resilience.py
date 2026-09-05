"""Tests for Multi-instance, Reconnection, and Event Loss Resilience."""
import asyncio
import json
import pytest
from httpx import AsyncClient

from backend.services.realtime import RealtimeBroker


@pytest.mark.asyncio
async def test_multi_instance_isolation_demonstration():
    """Verify that independent broker instances simulate distinct server processes."""
    broker_instance_a = RealtimeBroker()
    broker_instance_b = RealtimeBroker()

    # User connects SSE to Instance B
    queue_b = broker_instance_b.subscribe(user_id=10, role="admin")

    # Mutation happens on Instance A
    delivered = await broker_instance_a.publish(
        event_type="CLAIM_CREATED",
        resource_id=999,
        target_roles=["admin"],
    )

    # In-memory broker on Instance A cannot deliver directly to Instance B subscribers
    assert delivered == 0
    assert queue_b.qsize() == 0

    broker_instance_b.unsubscribe(queue_b)


@pytest.mark.asyncio
async def test_subscriber_lifecycle_memory_cleanup():
    """Verify queue cleanup when client disconnects or unsubscribes."""
    broker = RealtimeBroker()
    q1 = broker.subscribe(user_id=5, role="donor")
    q2 = broker.subscribe(user_id=5, role="donor")

    assert len(broker._user_subscribers[5]) == 2
    assert len(broker._role_subscribers["donor"]) == 2
    assert len(broker._client_meta) == 2

    broker.unsubscribe(q1)
    assert len(broker._user_subscribers[5]) == 1
    assert len(broker._role_subscribers["donor"]) == 1

    broker.unsubscribe(q2)
    assert 5 not in broker._user_subscribers
    assert "donor" not in broker._role_subscribers
    assert len(broker._client_meta) == 0


@pytest.mark.asyncio
async def test_queue_overflow_protection():
    """Verify broker drops slow client queue without crashing or leaking memory."""
    broker = RealtimeBroker()
    q = broker.subscribe(user_id=7, role="recipient")

    # Fill queue to maxsize (100) + overflow
    for i in range(120):
        await broker.publish(
            event_type="DONATION_CREATED",
            resource_id=i,
            target_user_ids=[7],
        )

    assert q.qsize() == 100
    broker.unsubscribe(q)
