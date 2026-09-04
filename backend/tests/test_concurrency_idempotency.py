"""Tests for concurrency control, idempotency, race condition prevention, and duplicate actions."""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
import pytest
from httpx import AsyncClient
from sqlmodel import select

from backend.auth import hash_password, sign_token
from backend.models import Claim, Donation, DonorProfile, RecipientProfile, User, Review


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
        client.cookies.set("nutrishare_token", recip_token)

        # First claim -> SUCCESS
        r1 = await client.post(f"/api/donations/{donation.id}/claim")
        assert r1.status_code == 200

        # Second immediate claim (double click) -> REJECTED 400
        r2 = await client.post(f"/api/donations/{donation.id}/claim")
        assert r2.status_code == 400
        assert "already submitted" in r2.json()["message"].lower()

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
            valid_until=datetime.now(timezone.utc).isoformat(),
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

    async def test_competing_claim_auto_rejection_on_admin_approval(self, client: AsyncClient, db_session):
        """When Admin approves one claim, competing claims for the same donation are automatically rejected."""
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
            valid_until=datetime.now(timezone.utc).isoformat(),
            pickup_latitude=-6.2,
            pickup_longitude=106.8,
            status="active",
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        db_session.add(donation)
        await db_session.commit()
        await db_session.refresh(donation)

        # Recipient 1 claims
        c1 = Claim(donation_id=donation.id, recipient_id=recip1.id, topsis_rank_at_claim=1, status="pending", created_at=datetime.now(timezone.utc).isoformat())
        # Recipient 2 claims
        c2 = Claim(donation_id=donation.id, recipient_id=recip2.id, topsis_rank_at_claim=2, status="pending", created_at=datetime.now(timezone.utc).isoformat())
        db_session.add_all([c1, c2])
        await db_session.commit()
        await db_session.refresh(c1)
        await db_session.refresh(c2)

        admin_token = sign_token(admin)
        client.cookies.set("nutrishare_token", admin_token)

        # Admin approves claim 1
        approve_resp = await client.post(f"/api/admin/claims/{c1.id}/approve")
        assert approve_resp.status_code == 200

        # Verify claim 1 is approved and claim 2 is automatically rejected
        await db_session.refresh(c1)
        await db_session.refresh(c2)
        assert c1.status == "approved"
        assert c2.status == "rejected"

        # Attempting to re-approve claim 1 should fail
        dup_approve = await client.post(f"/api/admin/claims/{c1.id}/approve")
        assert dup_approve.status_code == 400
