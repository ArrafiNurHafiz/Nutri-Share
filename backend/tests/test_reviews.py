"""Integration tests for reviews API endpoint and schema validation."""
from __future__ import annotations

from datetime import datetime, timezone
import pytest
from httpx import AsyncClient
from sqlmodel import select

from backend.auth import hash_password, sign_token
from backend.models import Donation, DonorProfile, RecipientProfile, User, Review


@pytest.mark.asyncio
class TestReviewsAPI:
    """Tests for review creation, authentication, authorization, and duplicate prevention."""

    async def test_create_review_minimal_payload(self, client: AsyncClient, db_session):
        """Recipient can submit review with only donation_id, rating, comment (no donor_id/recipient_id in body)."""
        # Create donor
        donor = User(name="Review Donor", email="rev_donor@test.com", password=hash_password("pw"), role="donor", status="verified")
        db_session.add(donor)
        await db_session.commit()
        await db_session.refresh(donor)
        dp = DonorProfile(user_id=donor.id, business_name="Rev Cafe", business_type="kafe", address="Jl Test", latitude=-6.2, longitude=106.8, phone="08111")
        db_session.add(dp)

        # Create recipient
        recip = User(name="Review Recipient", email="rev_recip@test.com", password=hash_password("pw"), role="recipient", status="verified")
        db_session.add(recip)
        await db_session.commit()
        await db_session.refresh(recip)
        rp = RecipientProfile(user_id=recip.id, institution_name="Rev Panti", institution_type="panti_asuhan", address="Jl Test", latitude=-6.2, longitude=106.8, phone="08222")
        db_session.add(rp)

        # Create completed donation claimed by recip
        donation = Donation(
            donor_id=donor.id,
            food_name="Ayam Bakar",
            food_type="makanan_berat",
            portion_count=10,
            protein_per_portion=10.0,
            calorie_per_portion=300.0,
            valid_until=datetime.now(timezone.utc).isoformat(),
            pickup_latitude=-6.2,
            pickup_longitude=106.8,
            status="completed",
            claimed_by=recip.id,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        db_session.add(donation)
        await db_session.commit()
        await db_session.refresh(donation)

        recip_token = sign_token(recip)

        # Submit review without donor_id and recipient_id in JSON payload
        resp = await client.post(
            "/api/reviews",
            json={
                "donation_id": donation.id,
                "rating": 5,
                "comment": "Makanan sangat berkualiatas dan higienis!",
            },
            cookies={"nutrishare_token": recip_token},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "message" in data or "id" in data

        # Check in DB that donor_id and recipient_id were correctly populated by server
        rev = await db_session.execute(select(Review).where(Review.donation_id == donation.id))
        created_rev = rev.scalar_one()
        assert created_rev.donor_id == donor.id
        assert created_rev.recipient_id == recip.id
        assert created_rev.rating == 5

        # Duplicate review attempt should fail
        dup_resp = await client.post(
            "/api/reviews",
            json={"donation_id": donation.id, "rating": 4, "comment": "Ulang"},
            cookies={"nutrishare_token": recip_token},
        )
        assert dup_resp.status_code == 400

    async def test_review_non_completed_donation_fails(self, client: AsyncClient, db_session):
        """Active donation cannot be reviewed."""
        donor = User(name="Donor 2", email="donor2@test.com", password=hash_password("pw"), role="donor", status="verified")
        recip = User(name="Recip 2", email="recip2@test.com", password=hash_password("pw"), role="recipient", status="verified")
        db_session.add(donor)
        db_session.add(recip)
        await db_session.commit()
        await db_session.refresh(donor)
        await db_session.refresh(recip)

        donation = Donation(
            donor_id=donor.id,
            food_name="Roti",
            food_type="roti",
            portion_count=5,
            protein_per_portion=3.0,
            calorie_per_portion=150.0,
            valid_until=datetime.now(timezone.utc).isoformat(),
            pickup_latitude=-6.2,
            pickup_longitude=106.8,
            status="active",
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        db_session.add(donation)
        await db_session.commit()
        await db_session.refresh(donation)

        recip_token = sign_token(recip)
        resp = await client.post(
            "/api/reviews",
            json={"donation_id": donation.id, "rating": 5, "comment": "Belum selesai"},
            cookies={"nutrishare_token": recip_token},
        )
        assert resp.status_code == 400
