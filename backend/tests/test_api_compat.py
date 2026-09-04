"""Contract tests — verify the Python backend returns identical responses to Node.js.

These tests run against the production-like server with the existing SQLite database,
verifying that every endpoint returns the expected format and status codes.
"""
from __future__ import annotations

import pytest


@pytest.mark.asyncio
class TestHealth:
    async def test_health(self, client):
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert "status" in data
        assert data["status"] == "ok"


@pytest.mark.asyncio
class TestDashboard:
    async def test_stats(self, client):
        resp = await client.get("/api/dashboard/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert "donors" in data
        assert "recipients" in data
        assert "active_donations" in data
        assert "completed_donations" in data
        assert isinstance(data["donors"], int)
        assert isinstance(data["recipients"], int)

    async def test_trends(self, client):
        resp = await client.get("/api/dashboard/trends")
        assert resp.status_code == 200
        data = resp.json()
        assert "weekly" in data
        assert "foodTypes" in data
        assert "totalPortions" in data
        assert "totalProtein" in data
        assert isinstance(data["weekly"], list)
        assert isinstance(data["foodTypes"], list)


@pytest.mark.asyncio
class TestPublic:
    async def test_top_donors(self, client):
        resp = await client.get("/api/public/top-donors")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        if data:
            d = data[0]
            assert "id" in d
            assert "business_name" in d
            assert "total_donations" in d
            assert "rating" in d
            assert "review_count" in d
            assert isinstance(d["rating"], str)
            assert isinstance(d["review_count"], int)

    async def test_map_data(self, client):
        resp = await client.get("/api/map/data")
        assert resp.status_code == 200
        data = resp.json()
        assert "donors" in data
        assert "recipients" in data
        assert "activeDonations" in data

    async def test_badges(self, client):
        resp = await client.get("/api/donors/6/badges")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

    async def test_badges_not_found(self, client):
        resp = await client.get("/api/donors/99999/badges")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


@pytest.mark.asyncio
class TestAuth:
    async def test_me_no_cookie(self, client):
        resp = await client.get("/api/auth/me")
        assert resp.status_code == 401
        assert "message" in resp.json()

    async def test_login_wrong_credentials(self, client):
        resp = await client.post(
            "/api/auth/login",
            json={"email": "nonexistent@test.com", "password": "wrong"},
        )
        assert resp.status_code == 401
        assert "message" in resp.json()

    async def test_login_missing_fields(self, client):
        resp = await client.post("/api/auth/login", json={})
        assert resp.status_code == 422  # FastAPI validation error

    async def test_logout(self, client):
        resp = await client.post("/api/auth/logout")
        assert resp.status_code == 200
        assert resp.json()["message"] == "Logout successful"

    async def test_forgot_password(self, client):
        resp = await client.post(
            "/api/auth/forgot-password",
            json={"email": "seed_donor@test.com"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "message" in data

    async def test_forgot_password_not_found(self, client):
        resp = await client.post(
            "/api/auth/forgot-password",
            json={"email": "ghost@test.com"},
        )
        assert resp.status_code == 404
        assert "message" in resp.json()

    async def test_register_duplicate(self, client):
        resp = await client.post(
            "/api/auth/register/donor",
            json={
                "business_name": "Test",
                "email": "seed_donor@test.com",
                "password": "test123",
                "business_type": "kafe",
                "address": "Test",
                "latitude": "-6.2",
                "longitude": "106.8",
                "phone": "08123",
            },
        )
        assert resp.status_code == 409
        assert "message" in resp.json()


@pytest.mark.asyncio
class TestDonations:
    async def test_list_donations_unauthorized(self, client):
        resp = await client.get("/api/donations")
        assert resp.status_code == 401

    async def test_list_donations(self, client, donor_token: str):
        resp = await client.get("/api/donations", cookies={"nutrishare_token": donor_token})
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

    async def test_get_donation(self, client, donor_token: str):
        # Get first donation's ID dynamically
        list_resp = await client.get("/api/donations", cookies={"nutrishare_token": donor_token})
        assert list_resp.status_code == 200
        donations = list_resp.json()
        if not donations:
            return  # skip if no data
        don_id = donations[0]["id"]
        resp = await client.get(f"/api/donations/{don_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert "food_name" in data
        assert "donor_name" in data

    async def test_get_donation_not_found(self, client):
        resp = await client.get("/api/donations/99999")
        assert resp.status_code == 404
        assert "message" in resp.json()

    async def test_active_donations(self, client):
        resp = await client.get("/api/donations/active")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

    async def test_create_donation_unauthorized(self, client):
        resp = await client.post(
            "/api/donations",
            json={
                "food_name": "Test",
                "food_type": "makanan_berat",
                "portion_count": "10",
                "protein_per_portion": "5",
                "calorie_per_portion": "200",
                "hours_valid": "24",
                "pickup_latitude": "-6.2",
                "pickup_longitude": "106.8",
            },
        )
        assert resp.status_code == 401
        assert "message" in resp.json()

    async def test_transit_no_auth(self, client):
        resp = await client.get("/api/donations/transit?user_id=6&role=donor")
        assert resp.status_code == 401


@pytest.mark.asyncio
class TestRecipient:
    async def test_akg_missing_user_id(self, client):
        """Requires auth via cookie — return 401 without cookie."""
        resp = await client.get("/api/recipient/akg")
        assert resp.status_code == 401

    async def test_akg(self, client):
        """Requires auth via cookie — return 401 without cookie."""
        resp = await client.get("/api/recipient/akg?user_id=24")
        assert resp.status_code == 401


@pytest.mark.asyncio
class TestNotifications:
    async def test_list_no_user_id(self, client):
        """Requires auth via cookie — return 401 without cookie."""
        resp = await client.get("/api/notifications")
        assert resp.status_code == 401

    async def test_list_with_user_id(self, client):
        """Requires auth via cookie — return 401 without cookie."""
        resp = await client.get("/api/notifications?user_id=5")
        assert resp.status_code == 401


@pytest.mark.asyncio
class TestAdmin:
    async def test_admin_users_unauthorized(self, client):
        resp = await client.get("/api/admin/users")
        assert resp.status_code == 401
        assert "message" in resp.json()

    async def test_admin_topsis_unauthorized(self, client):
        resp = await client.post("/api/admin/topsis/run")
        assert resp.status_code == 401

    async def test_admin_claims_unauthorized(self, client):
        resp = await client.get("/api/admin/claims")
        assert resp.status_code == 401

    async def test_search_min_length(self, client):
        resp = await client.get("/api/admin/search?q=a")
        assert resp.status_code == 401  # no auth


@pytest.mark.asyncio
class TestReviews:
    async def test_donor_reviews(self, client):
        resp = await client.get("/api/donors/6/reviews")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

    async def test_donor_reviews_empty(self, client):
        resp = await client.get("/api/donors/99999/reviews")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


@pytest.mark.asyncio
class TestTopsis:
    async def test_topsis_results(self, client):
        """Requires auth — return 401 without cookie."""
        resp = await client.get("/api/topsis/2")
        assert resp.status_code == 401

    async def test_topsis_not_found(self, client):
        """Requires auth — return 401 without cookie."""
        resp = await client.get("/api/topsis/99999")
        assert resp.status_code == 401


@pytest.mark.asyncio
class Test404:
    async def test_unknown_endpoint(self, client):
        resp = await client.get("/api/this-does-not-exist")
        assert resp.status_code == 404
        assert "message" in resp.json()


@pytest.mark.asyncio
class TestErrorFormat:
    """Verify error response format matches Node.js: { "message": "..." }"""

    async def test_error_response_format(self, client):
        resp = await client.get("/api/donations/99999")
        assert resp.status_code == 404
        data = resp.json()
        assert "message" in data
        assert isinstance(data["message"], str)
