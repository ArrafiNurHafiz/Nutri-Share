"""Pytest fixtures and configuration.

Uses in-memory SQLite database for test isolation.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# Ensure project root is on sys.path
sys.path.insert(0, str(Path.cwd()))

# Set test environment before importing any backend modules
os.environ["ENVIRONMENT"] = "development"
os.environ["DB_PATH"] = ":memory:"


@pytest.fixture(scope="session")
def event_loop():
    import asyncio

    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def db_session():
    """Create a test database session with in-memory SQLite."""
    from backend.database import init_db, create_tables, get_session_maker, close_db

    # Initialize in-memory database
    init_db(":memory:")
    await create_tables()

    # Create test data
    maker = get_session_maker()
    async with maker() as session:
        yield session

    await close_db()


@pytest_asyncio.fixture
async def client(db_session) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client against the FastAPI app with isolated test database."""
    from backend.main import app
    from backend.auth import sign_token
    from backend.models import User, DonorProfile, RecipientProfile, Donation, TopsisResult
    from datetime import datetime, timezone, timedelta

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Seed minimal data for contract tests
        # Create donor
        donor = User(name="Seed Donor", email="seed_donor@test.com", password="hash", role="donor", status="verified")
        db_session.add(donor)
        await db_session.commit()
        await db_session.refresh(donor)
        donor_prof = DonorProfile(user_id=donor.id, business_name="Seed Cafe", business_type="kafe", address="Jl Test", latitude=-6.2, longitude=106.8, phone="08123")
        db_session.add(donor_prof)

        # Create recipient
        recip = User(name="Seed Recipient", email="seed_recipient@test.com", password="hash", role="recipient", status="verified")
        db_session.add(recip)
        await db_session.commit()
        await db_session.refresh(recip)
        recip_prof = RecipientProfile(user_id=recip.id, institution_name="Seed Panti", institution_type="panti_asuhan", address="Jl Panti", latitude=-6.3, longitude=106.9, phone="08124", resident_count=30, daily_protein_need=50.0, daily_calorie_need=2000.0)
        db_session.add(recip_prof)

        # Create a donation for contract tests
        donation = Donation(donor_id=donor.id, food_name="Nasi Goreng", food_type="makanan_berat", portion_count=10, protein_per_portion=5.0, calorie_per_portion=200.0, valid_until=(datetime.now(timezone.utc) + timedelta(hours=6)).isoformat(), pickup_latitude=-6.2, pickup_longitude=106.8, status="active", created_at=datetime.now(timezone.utc).isoformat())
        db_session.add(donation)
        await db_session.commit()
        await db_session.refresh(donation)

        # Create a TopsisResult for contract test
        from datetime import datetime
        tr = TopsisResult(donation_id=donation.id, recipient_id=recip.id, rank_position=1, ci_score=0.85, calculated_at=datetime.now(timezone.utc).isoformat())
        db_session.add(tr)
        await db_session.commit()

        yield ac


@pytest_asyncio.fixture
async def donor_token(db_session) -> str:
    """Create a test donor and return their JWT token."""
    from backend.auth import hash_password, sign_token
    from backend.models import User, DonorProfile

    # Create test donor user
    user = User(
        name="Test Donor",
        email="donor@test.com",
        password=hash_password("test123"),
        role="donor",
        status="verified",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # Create donor profile
    profile = DonorProfile(
        user_id=user.id,
        business_name="Test Restaurant",
        business_type="restoran",
        address="Jl. Test No. 1",
        latitude=-6.2,
        longitude=106.8,
        phone="08123456789",
    )
    db_session.add(profile)
    await db_session.commit()

    return sign_token(user)


@pytest_asyncio.fixture
async def recipient_token(db_session) -> str:
    """Create a test recipient and return their JWT token."""
    from backend.auth import hash_password, sign_token
    from backend.models import User, RecipientProfile

    # Create test recipient user
    user = User(
        name="Test Recipient",
        email="recipient@test.com",
        password=hash_password("test123"),
        role="recipient",
        status="verified",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # Create recipient profile
    profile = RecipientProfile(
        user_id=user.id,
        institution_name="Panti Asuhan Test",
        institution_type="panti_asuhan",
        address="Jl. Test No. 2",
        latitude=-6.3,
        longitude=106.9,
        phone="08123456780",
        resident_count=50,
        daily_protein_need=50.0,
        daily_calorie_need=2000.0,
    )
    db_session.add(profile)
    await db_session.commit()

    return sign_token(user)


@pytest_asyncio.fixture
async def admin_token(db_session) -> str:
    """Create a test admin and return their JWT token."""
    from backend.auth import hash_password, sign_token
    from backend.models import User

    # Create test admin user
    user = User(
        name="Test Admin",
        email="admin@test.com",
        password=hash_password("test123"),
        role="admin",
        status="verified",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    return sign_token(user)


@pytest_asyncio.fixture
async def test_donation(db_session, donor_token) -> dict:
    """Create a test donation and return its data."""
    from backend.auth import decode_token
    from backend.models import Donation
    from datetime import datetime, timezone, timedelta

    # Decode token to get user_id
    payload = decode_token(donor_token)
    donor_id = payload["id"]

    # Create donation
    donation = Donation(
        donor_id=donor_id,
        food_name="Nasi Goreng",
        food_type="makanan_berat",
        portion_count=10,
        protein_per_portion=8.0,
        calorie_per_portion=350.0,
        valid_until=(datetime.now(timezone.utc) + timedelta(hours=6)).isoformat(),
        pickup_latitude=-6.2,
        pickup_longitude=106.8,
        status="active",
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    db_session.add(donation)
    await db_session.commit()
    await db_session.refresh(donation)

    return {
        "id": donation.id,
        "donor_id": donor_id,
        "food_name": "Nasi Goreng",
        "portion_count": 10,
    }
