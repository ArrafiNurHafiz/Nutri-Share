"""Tests for 1/4 Safe Shelf Life Priority Escalation and Auto-Expiration Logic."""
from datetime import datetime, timedelta, timezone
import pytest
from backend.models import Donation, TopsisResult, User, RecipientProfile
from backend.services.topsis import (
    get_donation_escalation_stage,
    sweep_auto_expire_donations,
)
from backend.auth import hash_password, sign_token


def test_escalation_stages_calculation():
    # Total 4 hours: 10:00 to 14:00. Quarter = 1 hour.
    created_at = datetime(2026, 9, 23, 10, 0, 0, tzinfo=timezone.utc).isoformat()
    valid_until = datetime(2026, 9, 23, 14, 0, 0, tzinfo=timezone.utc).isoformat()

    # Case 1: Quarter 1 (10:30, 30 mins in, fraction = 0.125) -> Stage 1, Rank 1 allowed
    t1 = datetime(2026, 9, 23, 10, 30, 0, tzinfo=timezone.utc)
    stage1 = get_donation_escalation_stage(created_at, valid_until, t1)
    assert stage1["is_expired"] is False
    assert stage1["current_stage"] == 1
    assert stage1["max_allowed_rank"] == 1
    assert stage1["seconds_until_next_stage"] == pytest.approx(1800, 5)

    # Case 2: Quarter 2 (11:15, 1h15m in, fraction = 0.3125) -> Stage 2, Rank <= 2 allowed
    t2 = datetime(2026, 9, 23, 11, 15, 0, tzinfo=timezone.utc)
    stage2 = get_donation_escalation_stage(created_at, valid_until, t2)
    assert stage2["is_expired"] is False
    assert stage2["current_stage"] == 2
    assert stage2["max_allowed_rank"] == 2
    assert stage2["seconds_until_next_stage"] == pytest.approx(2700, 5)

    # Case 3: Quarter 3 (12:30, 2h30m in, fraction = 0.625) -> Stage 3, Rank <= 3 allowed
    t3 = datetime(2026, 9, 23, 12, 30, 0, tzinfo=timezone.utc)
    stage3 = get_donation_escalation_stage(created_at, valid_until, t3)
    assert stage3["is_expired"] is False
    assert stage3["current_stage"] == 3
    assert stage3["max_allowed_rank"] == 3

    # Case 4: Quarter 4 (13:30, 3h30m in, fraction = 0.875) -> Stage 4, All ranks allowed (999)
    t4 = datetime(2026, 9, 23, 13, 30, 0, tzinfo=timezone.utc)
    stage4 = get_donation_escalation_stage(created_at, valid_until, t4)
    assert stage4["is_expired"] is False
    assert stage4["current_stage"] == 4
    assert stage4["max_allowed_rank"] == 999

    # Case 5: Expired (14:01, past valid_until) -> Stage 5 / Expired
    t5 = datetime(2026, 9, 23, 14, 1, 0, tzinfo=timezone.utc)
    stage5 = get_donation_escalation_stage(created_at, valid_until, t5)
    assert stage5["is_expired"] is True
    assert stage5["max_allowed_rank"] == 0
    assert stage5["current_stage"] == 5


@pytest.mark.asyncio
async def test_auto_expire_sweep(db_session):
    now = datetime.now(timezone.utc)
    past_time = (now - timedelta(hours=1)).isoformat()
    future_time = (now + timedelta(hours=4)).isoformat()

    d_expired = Donation(
        donor_id=1,
        food_name="Expired Bento",
        food_type="makanan_berat",
        portion_count=10,
        valid_until=past_time,
        pickup_latitude=-7.79,
        pickup_longitude=110.36,
        status="active",
        created_at=(now - timedelta(hours=5)).isoformat(),
    )
    d_active = Donation(
        donor_id=1,
        food_name="Fresh Salad",
        food_type="sayur",
        portion_count=10,
        valid_until=future_time,
        pickup_latitude=-7.79,
        pickup_longitude=110.36,
        status="active",
        created_at=now.isoformat(),
    )
    db_session.add(d_expired)
    db_session.add(d_active)
    await db_session.commit()
    await db_session.refresh(d_expired)
    await db_session.refresh(d_active)

    expired_ids = await sweep_auto_expire_donations(db_session)
    assert d_expired.id in expired_ids
    assert d_active.id not in expired_ids

    await db_session.refresh(d_expired)
    assert d_expired.status == "expired"


@pytest.mark.asyncio
async def test_claim_enforces_priority_escalation(client, db_session):
    now = datetime.now(timezone.utc)
    created_at = now.isoformat()
    valid_until = (now + timedelta(hours=4)).isoformat()

    # Create recipient user & sign token
    recip = User(
        name="Escalation Recipient",
        email="esc_recip@test.com",
        password=hash_password("test1234"),
        role="recipient",
        status="verified",
    )
    db_session.add(recip)
    await db_session.commit()
    await db_session.refresh(recip)

    recip_prof = RecipientProfile(
        user_id=recip.id,
        institution_name="Panti Escalation",
        institution_type="panti_asuhan",
        address="Jl Panti Escalation",
        latitude=-6.3,
        longitude=106.9,
        phone="0812444",
        resident_count=20,
    )
    db_session.add(recip_prof)

    donation = Donation(
        donor_id=1,
        food_name="Nasi Kotak Ayam",
        food_type="makanan_berat",
        portion_count=20,
        valid_until=valid_until,
        pickup_latitude=-7.79,
        pickup_longitude=110.36,
        status="active",
        created_at=created_at,
    )
    db_session.add(donation)
    await db_session.commit()
    await db_session.refresh(donation)

    # Register topsis result as rank 2 for recipient
    tr = TopsisResult(
        donation_id=donation.id,
        recipient_id=recip.id,
        rank_position=2,
        ci_score=0.75,
        calculated_at=now.isoformat(),
    )
    db_session.add(tr)
    await db_session.commit()

    token = sign_token(recip)
    client.cookies.set("nutrishare_token", token)

    # Recipient attempts to claim in Quarter 1 (Rank 2 not allowed yet) -> Should be rejected with 403
    resp = await client.post(f"/api/donations/{donation.id}/claim")
    assert resp.status_code == 403
    data = resp.json()
    assert "tahap" in data.get("message", "") or "Peringkat" in data.get("message", "")

    # Advance simulated time into Quarter 2 (created 2 hours ago, valid for 2 more hours => 50% elapsed)
    donation.created_at = (now - timedelta(hours=2)).isoformat()
    donation.valid_until = (now + timedelta(hours=2)).isoformat()
    db_session.add(donation)
    await db_session.commit()

    # In Stage 2, Rank 2 is allowed to claim -> Should succeed!
    resp2 = await client.post(f"/api/donations/{donation.id}/claim")
    assert resp2.status_code == 200
