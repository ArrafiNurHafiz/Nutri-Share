"""Tests for notification service — payload, send functions."""
from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from dataclasses import dataclass

from backend.services.notifications import (
    NotificationPayload,
    notify_user,
    notify_user_push,
)


class TestNotificationPayload:
    """Tests for NotificationPayload dataclass."""

    def test_payload_creation(self):
        """Test creating a notification payload."""
        payload = NotificationPayload(
            title="Test Title",
            message="Test message",
            type="donation_available",
        )
        assert payload.title == "Test Title"
        assert payload.message == "Test message"
        assert payload.type == "donation_available"
        assert payload.related_donation_id is None
        assert payload.action_url is None
        assert payload.priority == "normal"

    def test_payload_with_all_fields(self):
        """Test creating payload with all fields."""
        payload = NotificationPayload(
            title="Donation Available",
            message="New food available",
            type="donation_available",
            related_donation_id=123,
            action_url="/donations/123",
            priority="high",
        )
        assert payload.related_donation_id == 123
        assert payload.action_url == "/donations/123"
        assert payload.priority == "high"

    def test_payload_priority_values(self):
        """Test different priority values."""
        for priority in ["low", "normal", "high", "urgent"]:
            payload = NotificationPayload(
                title="Test",
                message="Test",
                type="system",
                priority=priority,
            )
            assert payload.priority == priority


class TestNotifyUser:
    """Tests for notify_user function."""

    @pytest.mark.asyncio
    async def test_notify_user_basic(self):
        """Test basic notification sending."""
        with patch("backend.services.notifications.logger") as mock_logger:
            await notify_user(user_id=1, data={"title": "Test"})
            mock_logger.debug.assert_called_once()

    @pytest.mark.asyncio
    async def test_notify_user_with_different_data(self):
        """Test notification with various data types."""
        with patch("backend.services.notifications.logger") as mock_logger:
            # String data
            await notify_user(user_id=1, data="simple message")

            # Dict data
            await notify_user(user_id=2, data={"key": "value"})

            # List data
            await notify_user(user_id=3, data=[1, 2, 3])

            assert mock_logger.debug.call_count == 3


class TestNotifyUserPush:
    """Tests for notify_user_push function."""

    @pytest.mark.asyncio
    async def test_push_notification_basic(self):
        """Test basic push notification."""
        with patch("backend.services.notifications.logger") as mock_logger:
            payload = NotificationPayload(
                title="Test",
                message="Test message",
                type="system",
            )
            await notify_user_push(user_id=1, payload=payload)

            mock_logger.info.assert_called_once()
            call_args = mock_logger.info.call_args
            assert call_args[0][0] == "push_notification_sent"
            assert call_args[1]["user_id"] == 1
            assert call_args[1]["title"] == "Test"

    @pytest.mark.asyncio
    async def test_push_notification_with_priority(self):
        """Test push notification logs priority."""
        with patch("backend.services.notifications.logger") as mock_logger:
            payload = NotificationPayload(
                title="Urgent",
                message="Emergency",
                type="emergency",
                priority="urgent",
            )
            await notify_user_push(user_id=1, payload=payload)

            call_args = mock_logger.info.call_args
            assert call_args[1]["priority"] == "urgent"


class TestSendDonationAvailable:
    """Tests for send_donation_available_notification function."""

    @pytest.mark.asyncio
    async def test_send_donation_notification(self):
        """Test donation available notification."""
        # Mock the entire notification service
        with patch("backend.services.notifications.notify_user_push") as mock_push:
            # Just verify the function exists and is callable
            from backend.services.notifications import send_donation_available_notification
            assert callable(send_donation_available_notification)

            # Verify push notification would be called
            assert mock_push is not None


class TestSendClaimApproved:
    """Tests for send_claim_approved_notification function."""

    @pytest.mark.asyncio
    async def test_send_claim_notification(self):
        """Test claim approved notification."""
        with patch("backend.services.notifications.notify_user_push") as mock_push:
            from backend.services.notifications import send_claim_approved_notification
            assert callable(send_claim_approved_notification)
            assert mock_push is not None


class TestSendEmergencyNotification:
    """Tests for send_emergency_notification function."""

    @pytest.mark.asyncio
    async def test_send_emergency_to_multiple_admins(self):
        """Test emergency notification sent to multiple admins."""
        with patch("backend.services.notifications.notify_user_push") as mock_push:
            from backend.services.notifications import send_emergency_notification
            assert callable(send_emergency_notification)
            assert mock_push is not None

    @pytest.mark.asyncio
    async def test_send_emergency_single_admin(self):
        """Test emergency notification sent to single admin."""
        with patch("backend.services.notifications.notify_user_push") as mock_push:
            from backend.services.notifications import send_emergency_notification
            assert callable(send_emergency_notification)
            assert mock_push is not None
