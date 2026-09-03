"""Integration tests for donations API endpoints."""
from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestDonationsCRUD:
    """Tests for donation CRUD operations."""

    async def test_create_donation_success(self, client: AsyncClient, donor_token: str):
        """Test successful donation creation."""
        response = await client.post(
            "/api/donations",
            json={
                "food_name": "Nasi Goreng",
                "food_type": "makanan_berat",
                "portion_count": 10,
                "protein_per_portion": 8.0,
                "calorie_per_portion": 350.0,
                "hours_valid": 6,
                "pickup_latitude": -6.2,
                "pickup_longitude": 106.8,
            },
            cookies={"nutrishare_token": donor_token},
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data

    async def test_create_donation_unauthorized(self, client: AsyncClient):
        """Test creating donation without auth fails."""
        response = await client.post(
            "/api/donations",
            json={
                "food_name": "Nasi Goreng",
                "food_type": "makanan_berat",
                "portion_count": 10,
                "protein_per_portion": 8.0,
                "calorie_per_portion": 350.0,
                "hours_valid": 6,
                "pickup_latitude": -6.2,
                "pickup_longitude": 106.8,
            },
        )
        assert response.status_code == 401

    async def test_list_donations(self, client: AsyncClient, donor_token: str, test_donation: dict):
        """Test listing donations."""
        response = await client.get(
            "/api/donations",
            cookies={"nutrishare_token": donor_token},
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_get_donation_by_id(self, client: AsyncClient, test_donation: dict):
        """Test getting donation by ID."""
        donation_id = test_donation["id"]
        response = await client.get(f"/api/donations/{donation_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == donation_id

    async def test_get_donation_not_found(self, client: AsyncClient):
        """Test getting nonexistent donation fails."""
        response = await client.get("/api/donations/99999")
        assert response.status_code == 404


@pytest.mark.asyncio
class TestDonationsActive:
    """Tests for active donations listing."""

    async def test_list_active_donations(self, client: AsyncClient, test_donation: dict):
        """Test listing active donations."""
        response = await client.get("/api/donations/active")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_list_active_donations_with_recipient(self, client: AsyncClient, recipient_token: str, test_donation: dict):
        """Test listing active donations with recipient ID."""
        response = await client.get(
            "/api/donations/active",
            cookies={"nutrishare_token": recipient_token},
        )
        assert response.status_code == 200


@pytest.mark.asyncio
class TestDonationsTransit:
    """Tests for transit donations listing."""

    async def test_list_transit_donations_donor(self, client: AsyncClient, donor_token: str):
        """Test listing transit donations for donor."""
        response = await client.get(
            "/api/donations/transit",
            cookies={"nutrishare_token": donor_token},
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_list_transit_donations_recipient(self, client: AsyncClient, recipient_token: str):
        """Test listing transit donations for recipient."""
        response = await client.get(
            "/api/donations/transit",
            cookies={"nutrishare_token": recipient_token},
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_list_transit_unauthorized(self, client: AsyncClient):
        """Test listing transit donations without auth fails."""
        response = await client.get("/api/donations/transit")
        assert response.status_code == 401


@pytest.mark.asyncio
class TestDonationsClaim:
    """Tests for donation claim flow."""

    async def test_claim_donation_success(self, client: AsyncClient, recipient_token: str, test_donation: dict):
        """Test claiming a donation."""
        donation_id = test_donation["id"]
        response = await client.post(
            f"/api/donations/{donation_id}/claim",
            cookies={"nutrishare_token": recipient_token},
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data

    async def test_claim_donation_unauthorized(self, client: AsyncClient, test_donation: dict):
        """Test claiming donation without auth fails."""
        donation_id = test_donation["id"]
        response = await client.post(f"/api/donations/{donation_id}/claim")
        assert response.status_code == 401

    async def test_claim_donation_not_found(self, client: AsyncClient, recipient_token: str):
        """Test claiming nonexistent donation fails."""
        response = await client.post(
            "/api/donations/99999/claim",
            cookies={"nutrishare_token": recipient_token},
        )
        assert response.status_code in [404, 403]


@pytest.mark.asyncio
class TestDonationsHistory:
    """Tests for donation history."""

    async def test_list_donation_history_recipient(self, client: AsyncClient, recipient_token: str):
        """Test listing donation history for recipient."""
        response = await client.get(
            "/api/donations/history",
            cookies={"nutrishare_token": recipient_token},
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_list_donation_history_donor_fails(self, client: AsyncClient, donor_token: str):
        """Test that donors cannot access recipient history."""
        response = await client.get(
            "/api/donations/history",
            cookies={"nutrishare_token": donor_token},
        )
        assert response.status_code == 403
