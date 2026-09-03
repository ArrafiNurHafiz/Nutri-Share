"""Integration tests for authentication API endpoints."""
from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestAuthRegistration:
    """Tests for user registration endpoints."""

    async def test_register_donor_success(self, client: AsyncClient):
        """Test successful donor registration."""
        response = await client.post(
            "/api/auth/register/donor",
            json={
                "business_name": "New Restaurant",
                "email": "newdonor@test.com",
                "password": "test123",
                "business_type": "restoran",
                "address": "Jl. Baru No. 1",
                "latitude": "-6.2",
                "longitude": "106.8",
                "phone": "08123456789",
            },
        )
        assert response.status_code == 200, response.text
        data = response.json()
        assert "message" in data

    async def test_register_recipient_success(self, client: AsyncClient):
        """Test successful recipient registration."""
        response = await client.post(
            "/api/auth/register/recipient",
            json={
                "institution_name": "New Panti",
                "email": "newrecipient@test.com",
                "password": "test123",
                "institution_type": "panti_asuhan",
                "address": "Jl. Baru No. 2",
                "latitude": "-6.3",
                "longitude": "106.9",
                "phone": "08123456780",
                "resident_count": "50",
                "age_range": "Anak-anak",
                "health_condition": "Umum",
                "daily_protein_need": "50",
                "daily_calorie_need": "2000",
                "daily_iron_need": "10",
                "daily_vitamin_c_need": "50",
            },
        )
        assert response.status_code == 200, response.text
        data = response.json()
        assert "message" in data

    async def test_register_duplicate_email(self, client: AsyncClient, donor_token: str):
        """Test registration with duplicate email fails."""
        response = await client.post(
            "/api/auth/register/donor",
            json={
                "business_name": "Duplicate Restaurant",
                "email": "donor@test.com",
                "password": "test123",
                "business_type": "restoran",
                "address": "Jl. Baru No. 3",
                "latitude": "-6.2",
                "longitude": "106.8",
                "phone": "08123456789",
            },
        )
        assert response.status_code in [400, 409]  # Bad request or conflict


@pytest.mark.asyncio
class TestAuthLogin:
    """Tests for login endpoint."""

    async def test_login_success(self, client: AsyncClient, donor_token: str):
        """Test successful login."""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "donor@test.com",
                "password": "test123",
            },
        )
        assert response.status_code == 200
        data = response.json()
        # Response returns user+profile, not just "message"
        assert "user" in data or "message" in data

    async def test_login_wrong_password(self, client: AsyncClient, donor_token: str):
        """Test login with wrong password fails."""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "donor@test.com",
                "password": "wrongpassword",
            },
        )
        assert response.status_code == 401

    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Test login with nonexistent user fails."""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@test.com",
                "password": "test123",
            },
        )
        assert response.status_code == 401


@pytest.mark.asyncio
class TestAuthMe:
    """Tests for /me endpoint."""

    async def test_get_current_user(self, client: AsyncClient, donor_token: str):
        """Test getting current user with valid token."""
        response = await client.get(
            "/api/auth/me",
            cookies={"nutrishare_token": donor_token},
        )
        assert response.status_code == 200
        data = response.json()
        # Response may nest user info under "user" or at root
        user = data.get("user", data)
        assert user["email"] == "donor@test.com"
        assert user["role"] == "donor"

    async def test_get_current_user_no_token(self, client: AsyncClient):
        """Test getting current user without token fails."""
        response = await client.get("/api/auth/me")
        assert response.status_code == 401

    async def test_get_current_user_invalid_token(self, client: AsyncClient):
        """Test getting current user with invalid token fails."""
        response = await client.get(
            "/api/auth/me",
            cookies={"nutrishare_token": "invalid-token"},
        )
        assert response.status_code == 401


@pytest.mark.asyncio
class TestAuthLogout:
    """Tests for logout endpoint."""

    async def test_logout_success(self, client: AsyncClient, donor_token: str):
        """Test successful logout."""
        response = await client.post(
            "/api/auth/logout",
            cookies={"nutrishare_token": donor_token},
        )
        assert response.status_code == 200
