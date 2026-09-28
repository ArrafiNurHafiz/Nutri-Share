"""Tests for concurrency control, idempotency, race condition prevention, and duplicate actions."""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone, timedelta
import pytest
from httpx import AsyncClient
from sqlmodel import select

from backend.auth import hash_password, sign_token
from backend.models import Claim, Donation, DonorProfile, RecipientProfile, User, Review, TopsisResult


@pytest.mark.asyncio
class TestConcurrencyAndIdempotency:
    """Rigorous tests for duplicate submission prevention and state transitions."""

    async def test_duplicate_claim_by_same_recipient_fails(self, client: AsyncClient, db_session):
        """Same recipient cannot submit two claims for the same donation."""
        # Setup donor & recipient
        donor = User(name="Donor Concur", email="donor_c@test.com", password=hash_password("pw"), role="donor", status="verified")
        recip = User(name="Recip Concur", email="recip_c@test.com", password=hash_password("pw"), role="recipient", status="verified")
        db_session.add_all([donor, recip])
        await db_session.commit()
        await db_session.refresh(donor)
        await db_session.refresh(recip)

        dp = DonorProfile(user_id=donor.id, business_name="Cafe C", business_type="kafe", address="Jl A", latitude=-6.2, longitude=106.8, phone="081")
        rp = RecipientProfile(user_id=recip.id, institution_name="Panti C", institution_type="panti_asuhan", address="Jl B", latitude=-6.2, longitude=106.8, phone="082")
        db_session.add_all([dp, rp])

        donation = Donation(
            donor_id=donor.id,
            food_name="Nasi Uduk",
            food_type="makanan_berat",
            portion_count=10,
            protein_per_portion=5.0,
            calorie_per_portion=250.0,
            valid_until=(datetime.now(timezone.utc) + timedelta(hours=6)).isoformat(),
            pickup_latitude=-6.2,
            pickup_longitude=106.8,
            status="active",
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        db_session.add(donation)
        await db_session.commit()
        await db_session.refresh(donation)

        tr = TopsisResult(
            donation_id=donation.id,
            recipient_id=recip.id,
            rank_position=1,
            ci_score=0.99,
            calculated_at=datetime.now(timezone.utc).isoformat(),
        )
        db_session.add(tr)
        await db_session.commit()

        recip_token = sign_token(recip)
        client.cookies.set("nutrishare_token", recip_token)

        # First claim -> SUCCESS
        r1 = await client.post(f"/api/donations/{donation.id}/claim")
        assert r1.status_code == 200

        # Second immediate claim (double click) -> REJECTED 400
        r2 = await client.post(f"/api/donations/{donation.id}/claim")
        assert r2.status_code == 400
        msg2 = r2.json()["message"].lower()
        assert "already" in msg2 or "no longer available" in msg2 or "sudah" in msg2

    async def test_claim_non_active_donation_fails(self, client: AsyncClient, db_session):
        """Completed or inactive donation cannot be claimed."""
        donor = User(name="Donor C2", email="donor_c2@test.com", password=hash_password("pw"), role="donor", status="verified")
        recip = User(name="Recip C2", email="recip_c2@test.com", password=hash_password("pw"), role="recipient", status="verified")
        db_session.add_all([donor, recip])
        await db_session.commit()
        await db_session.refresh(donor)
        await db_session.refresh(recip)

        dp = DonorProfile(user_id=donor.id, business_name="Cafe C2", business_type="kafe", address="Jl A", latitude=-6.2, longitude=106.8, phone="081")
        rp = RecipientProfile(user_id=recip.id, institution_name="Panti C2", institution_type="panti_asuhan", address="Jl B", latitude=-6.2, longitude=106.8, phone="082")
        db_session.add_all([dp, rp])

        donation = Donation(
            donor_id=donor.id,
            food_name="Soto Ayam",
            food_type="makanan_berat",
            portion_count=5,
            protein_per_portion=8.0,
            calorie_per_portion=300.0,
            valid_until=(datetime.now(timezone.utc) + timedelta(hours=6)).isoformat(),
            pickup_latitude=-6.2,
            pickup_longitude=106.8,
            status="completed",
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        db_session.add(donation)
        await db_session.commit()
        await db_session.refresh(donation)

        recip_token = sign_token(recip)
        client.cookies.set("nutrishare_token", recip_token)

        resp = await client.post(f"/api/donations/{donation.id}/claim")
        assert resp.status_code == 400
        assert "no longer available" in resp.json()["message"].lower()

    async def test_instant_claim_rejection_for_subsequent_claims(self, client: AsyncClient, db_session):
        """When a recipient claims a donation, it is immediately assigned and subsequent claims for the same donation are rejected."""
        admin = User(name="Admin C", email="admin_c@test.com", password=hash_password("pw"), role="admin", status="verified")
        donor = User(name="Donor C3", email="donor_c3@test.com", password=hash_password("pw"), role="donor", status="verified")
        recip1 = User(name="Recip 1", email="recip1_c@test.com", password=hash_password("pw"), role="recipient", status="verified")
        recip2 = User(name="Recip 2", email="recip2_c@test.com", password=hash_password("pw"), role="recipient", status="verified")
        db_session.add_all([admin, donor, recip1, recip2])
        await db_session.commit()
        for u in [admin, donor, recip1, recip2]:
            await db_session.refresh(u)

        dp = DonorProfile(user_id=donor.id, business_name="Resto C3", business_type="restoran", address="Jl A", latitude=-6.2, longitude=106.8, phone="081")
        rp1 = RecipientProfile(user_id=recip1.id, institution_name="Panti 1", institution_type="panti_asuhan", address="Jl B", latitude=-6.2, longitude=106.8, phone="082")
        rp2 = RecipientProfile(user_id=recip2.id, institution_name="Panti 2", institution_type="panti_asuhan", address="Jl C", latitude=-6.2, longitude=106.8, phone="083")
        db_session.add_all([dp, rp1, rp2])

        donation = Donation(
            donor_id=donor.id,
            food_name="Bakmi Goreng",
            food_type="makanan_berat",
            portion_count=15,
            protein_per_portion=6.0,
            calorie_per_portion=300.0,
            valid_until=(datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(),
            pickup_latitude=-6.2,
            pickup_longitude=106.8,
            status="active",
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        db_session.add(donation)
        await db_session.commit()
        await db_session.refresh(donation)

        # Recipient 1 claims donation directly via instant claim
        r1_token = sign_token(recip1)
        client.cookies.set("nutrishare_token", r1_token)
        claim_resp = await client.post(f"/api/donations/{donation.id}/claim")
        assert claim_resp.status_code == 200

        # Verify donation is claimed and marked for recipient 1
        await db_session.refresh(donation)
        assert donation.status == "claimed"
        assert donation.claimed_by == recip1.id

        # Recipient 2 attempting to claim the already-claimed donation should be rejected
        r2_token = sign_token(recip2)
        client.cookies.set("nutrishare_token", r2_token)
        dup_claim = await client.post(f"/api/donations/{donation.id}/claim")
        assert dup_claim.status_code == 400
