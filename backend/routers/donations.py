"""Donation routes — CRUD, lifecycle (claim, arrived, complete).

Mirrors server/routes.ts lines 217-345.
"""
from __future__ import annotations

from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import select, text

from backend.auth import get_current_user
from backend.dependencies import SessionDep
from backend.models import (
    Claim,
    Donation,
    DonorProfile,
    Notification,
    RecipientProfile,
    Review,
    TopsisResult,
    User,
)
from backend.schemas import CreateDonationRequest
from backend.services.notifications import notify_user
from backend.services.topsis import calculate_topsis_for_donation
from backend.utils.logger import log_activity, logger
from backend.utils.rate_limit import rate_limit_dependency

router = APIRouter()


@router.post("/donations", dependencies=[Depends(rate_limit_dependency(20, 60))])
async def create_donation(
    body: CreateDonationRequest,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "donor":
        raise HTTPException(status_code=403, detail="Access denied")

    now = datetime.now(UTC)

    # Safe conversion helpers (handle empty strings)
    def to_int(val, default=0):
        if val is None or val == "":
            return default
        return int(val)

    def to_float(val, default=0.0):
        if val is None or val == "":
            return default
        return float(val)

    valid_until = now + timedelta(hours=to_int(body.hours_valid, 24))

    donation = Donation(
        donor_id=current_user.id,
        food_name=body.food_name,
        food_type=body.food_type,
        portion_count=to_int(body.portion_count),
        protein_per_portion=to_float(body.protein_per_portion),
        calorie_per_portion=to_float(body.calorie_per_portion),
        iron_mg=to_float(body.iron_mg) if body.iron_mg else None,
        vitamin_c_mg=to_float(body.vitamin_c_mg) if body.vitamin_c_mg else None,
        valid_until=valid_until.isoformat(),
        pickup_latitude=to_float(body.pickup_latitude),
        pickup_longitude=to_float(body.pickup_longitude),
        notes=body.notes or "",
        created_at=now.isoformat(),
    )
    session.add(donation)
    await session.commit()
    await session.refresh(donation)

    # Run TOPSIS (non-blocking on failure)
    try:
        await calculate_topsis_for_donation(session, donation.id)
    except Exception as _topsis_err:
        logger.error("topsis_calculation_failed", donation_id=donation.id, error=str(_topsis_err))

    # Notify verified recipients
    result = await session.execute(
        select(User.id).where(User.role == "recipient", User.status == "verified")
    )
    recipient_ids = result.scalars().all()
    for rid in recipient_ids:
        notif = Notification(
            user_id=rid,
            title="Donation Available!",
            message=f"Donation {body.food_name} ({body.portion_count} portions) has been published. Check your dashboard!",
            type="donation_available",
            is_read=0,
            related_donation_id=donation.id,
            created_at=now.isoformat(),
        )
        session.add(notif)
        await session.flush()
        await notify_user(rid, {
            "id": notif.id,
            "user_id": rid,
            "title": notif.title,
            "message": notif.message,
            "type": notif.type,
            "is_read": notif.is_read,
            "related_donation_id": notif.related_donation_id,
            "created_at": notif.created_at,
        })

    await log_activity(session, current_user.id, "donasi_buat", f"Published {body.food_name} ({body.portion_count} portions)")
    return {"message": "Donation published successfully!"}


@router.get("/donations")
async def list_donations(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
    donor_id: int | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    offset = (page - 1) * limit
    if current_user.role == "donor":
        result = await session.execute(
            select(Donation)
            .where(Donation.donor_id == current_user.id)
            .order_by(Donation.id.desc())
            .offset(offset)
            .limit(limit)
        )
    elif current_user.role == "admin":
        if donor_id:
            result = await session.execute(
                select(Donation)
                .where(Donation.donor_id == donor_id)
                .order_by(Donation.id.desc())
                .offset(offset)
                .limit(limit)
            )
        else:
            result = await session.execute(
                select(Donation)
                .order_by(Donation.id.desc())
                .offset(offset)
                .limit(limit)
            )
    else:
        if donor_id:
            result = await session.execute(
                select(Donation)
                .where(Donation.donor_id == donor_id)
                .order_by(Donation.id.desc())
                .offset(offset)
                .limit(limit)
            )
        else:
            result = await session.execute(
                select(Donation)
                .order_by(Donation.id.desc())
                .offset(offset)
                .limit(limit)
            )
    donations = result.scalars().all()

    # Batch load recipient profiles to avoid N+1 queries
    claimed_by_ids = [d.claimed_by for d in donations if d.claimed_by]
    recipient_profiles = {}
    if claimed_by_ids:
        profiles_result = await session.execute(
            select(RecipientProfile).where(RecipientProfile.user_id.in_(claimed_by_ids))
        )
        recipient_profiles = {rp.user_id: rp for rp in profiles_result.scalars().all()}

    enriched = []
    for d in donations:
        recipient_info = None
        if d.claimed_by and d.claimed_by in recipient_profiles:
            rp = recipient_profiles[d.claimed_by]
            recipient_info = {"name": rp.institution_name, "lat": rp.latitude, "lon": rp.longitude}
        enriched.append({**d.model_dump(), "recipient_info": recipient_info})

    return enriched


@router.get("/donations/active")
async def list_active_donations(
    session: SessionDep,
    recipient_id: int | None = Query(None),
):
    result = await session.execute(
        select(Donation).where(Donation.status == "active")
    )
    donations = result.scalars().all()

    # Batch load all related data to avoid N+1 queries
    donation_ids = [d.id for d in donations]
    donor_ids = list(set(d.donor_id for d in donations))

    # Batch load donor profiles
    donor_profiles = {}
    if donor_ids:
        dp_result = await session.execute(
            select(DonorProfile).where(DonorProfile.user_id.in_(donor_ids))
        )
        donor_profiles = {dp.user_id: dp for dp in dp_result.scalars().all()}

    # Batch load TOPSIS results if recipient_id provided
    topsis_map = {}
    if recipient_id and donation_ids:
        t_result = await session.execute(
            select(TopsisResult).where(
                TopsisResult.donation_id.in_(donation_ids),
                TopsisResult.recipient_id == recipient_id,
            )
        )
        topsis_map = {t.donation_id: t for t in t_result.scalars().all()}

    # Batch load claims if recipient_id provided
    claim_map = {}
    if recipient_id and donation_ids:
        c_result = await session.execute(
            select(Claim).where(
                Claim.donation_id.in_(donation_ids),
                Claim.recipient_id == recipient_id,
            )
        )
        claim_map = {c.donation_id: c for c in c_result.scalars().all()}

    enriched = []
    for d in donations:
        topsis = topsis_map.get(d.id)
        donor_prof = donor_profiles.get(d.donor_id)
        claim = claim_map.get(d.id)

        enriched.append({
            **d.model_dump(),
            "rank": topsis.rank_position if topsis else None,
            "ci_score": topsis.ci_score if topsis else None,
            "donor_name": donor_prof.business_name if donor_prof else None,
            "donor_address": donor_prof.address if donor_prof else None,
            "my_claim_status": claim.status if claim else None,
        })

    enriched.sort(key=lambda x: (x["rank"] or 999))
    return enriched


@router.get("/donations/transit")
async def list_transit_donations(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    uid = current_user.id
    r = current_user.role

    if r == "recipient":
        result = await session.execute(
            select(Donation).where(
                Donation.claimed_by == uid,
                Donation.status == "claimed",
            )
        )
    else:
        result = await session.execute(
            select(Donation).where(
                Donation.donor_id == uid,
                Donation.status == "claimed",
            )
        )
    donations = result.scalars().all()

    # Batch load all related data to avoid N+1 queries
    donor_ids = list(set(d.donor_id for d in donations))
    claimed_by_ids = list(set(d.claimed_by for d in donations if d.claimed_by))

    # Batch load donor profiles
    donor_profiles = {}
    if donor_ids:
        dp_result = await session.execute(
            select(DonorProfile).where(DonorProfile.user_id.in_(donor_ids))
        )
        donor_profiles = {dp.user_id: dp for dp in dp_result.scalars().all()}

    # Batch load recipient profiles
    recipient_profiles = {}
    if claimed_by_ids:
        rp_result = await session.execute(
            select(RecipientProfile).where(RecipientProfile.user_id.in_(claimed_by_ids))
        )
        recipient_profiles = {rp.user_id: rp for rp in rp_result.scalars().all()}

    enriched = []
    for d in donations:
        donor_prof = donor_profiles.get(d.donor_id)
        rp = recipient_profiles.get(d.claimed_by) if d.claimed_by else None

        enriched.append({
            **d.model_dump(),
            "donor_name": donor_prof.business_name if donor_prof else None,
            "donor_lat": d.pickup_latitude,
            "donor_lon": d.pickup_longitude,
            "recipient_name": rp.institution_name if rp else None,
            "recipient_lat": rp.latitude if rp else None,
            "recipient_lon": rp.longitude if rp else None,
        })
    return enriched


@router.get("/donations/history")
async def list_donation_history(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "recipient":
        raise HTTPException(status_code=403, detail="Access denied")

    result = await session.execute(
        select(Claim).where(
            Claim.recipient_id == current_user.id,
            Claim.status == "approved",
        )
    )
    claims = result.scalars().all()

    # Batch load all related donations, donor profiles, and reviews to avoid N+1 queries
    donation_ids = [c.donation_id for c in claims]
    donation_map: dict[int, Donation] = {}
    donor_profile_map: dict[int, str] = {}
    reviewed_set: set[int] = set()

    if donation_ids:
        # Batch load donations
        donations_result = await session.execute(
            select(Donation).where(Donation.id.in_(donation_ids))
        )
        donation_map = {d.id: d for d in donations_result.scalars().all()}

        # Batch load donor profiles
        donor_ids = list({d.donor_id for d in donation_map.values()})
        if donor_ids:
            dp_result = await session.execute(
                select(DonorProfile).where(DonorProfile.user_id.in_(donor_ids))
            )
            donor_profile_map = {dp.user_id: dp.business_name for dp in dp_result.scalars().all()}

        # Batch load existing reviews (ORM select for cross-dialect compatibility)
        reviews_result = await session.execute(
            select(Review.id, Review.donation_id).where(Review.donation_id.in_(donation_ids))
        )
        reviewed_set = {r.donation_id for r in reviews_result.all()}

    enriched = []
    for c in claims:
        d = donation_map.get(c.donation_id)
        enriched.append({
            **c.model_dump(),
            "status": d.status if d else None,
            "donor_id": d.donor_id if d else None,
            "food_name": d.food_name if d else None,
            "protein": d.protein_per_portion if d else None,
            "donor_name": donor_profile_map.get(d.donor_id) if d else None,
            "completed_at": d.completed_at if d else None,
            "has_reviewed": c.donation_id in reviewed_set,
        })
    return enriched


@router.get("/donations/{donation_id}")
async def get_donation(donation_id: int, session: SessionDep):
    d = await session.execute(select(Donation).where(Donation.id == donation_id))
    d = d.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Donation not found")

    dp = await session.execute(
        select(DonorProfile).where(DonorProfile.user_id == d.donor_id)
    )
    donor_prof = dp.scalar_one_or_none()

    return {**d.model_dump(), "donor_name": donor_prof.business_name if donor_prof else None}


@router.post("/donations/{donation_id}/claim", dependencies=[Depends(rate_limit_dependency(10, 60))])
async def claim_donation(
    donation_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "recipient":
        raise HTTPException(status_code=403, detail="Access denied")

    # Validate donation exists and is active
    d_check = await session.execute(select(Donation).where(Donation.id == donation_id))
    d = d_check.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Donation not found")
    if d.status != "active":
        raise HTTPException(status_code=400, detail="Donation is no longer available for claim")

    # Prevent duplicate claim submissions by the same recipient
    existing_claim = await session.execute(
        select(Claim).where(
            Claim.donation_id == donation_id,
            Claim.recipient_id == current_user.id,
            Claim.status.in_(["pending", "approved", "in_transit", "arrived", "completed"]),
        )
    )
    if existing_claim.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You have already submitted a claim for this donation")

    t = await session.execute(
        select(TopsisResult)
        .where(
            TopsisResult.donation_id == donation_id,
            TopsisResult.recipient_id == current_user.id,
        )
        .order_by(TopsisResult.id.desc())
    )
    topsis = t.scalars().first()
    rank = topsis.rank_position if topsis else 99

    claim = Claim(
        donation_id=donation_id,
        recipient_id=current_user.id,
        topsis_rank_at_claim=rank,
        status="pending",
        created_at=datetime.now(UTC).isoformat(),
    )
    session.add(claim)
    await session.commit()

    # Notify admins
    admins = await session.execute(select(User.id).where(User.role == "admin"))

    for aid in admins.scalars().all():
        notif = Notification(
            user_id=aid,
            title="New Claim!",
            message=f"Donation {d.food_name if d else '#' + str(donation_id)} claimed by a recipient. Review now.",
            type="system",
            is_read=0,
            related_donation_id=donation_id,
            created_at=datetime.now(UTC).isoformat(),
        )
        session.add(notif)
        await session.flush()
        await notify_user(aid, {
            "id": notif.id,
            "user_id": aid,
            "title": notif.title,
            "message": notif.message,
            "type": notif.type,
            "is_read": notif.is_read,
            "related_donation_id": notif.related_donation_id,
            "created_at": notif.created_at,
        })
    await session.commit()

    await log_activity(session, current_user.id, "klaim_buat", f"Mengklaim donasi #{donation_id}")
    return {"message": "Claim submitted successfully, waiting for admin approval."}


@router.post("/donations/{donation_id}/arrived", dependencies=[Depends(rate_limit_dependency(10, 60))])
async def confirm_arrived(
    donation_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "recipient":
        raise HTTPException(status_code=403, detail="Only recipients can confirm arrival")

    d = await session.execute(
        select(Donation).where(
            Donation.id == donation_id,
            Donation.status == "claimed",
            Donation.claimed_by == current_user.id,
        )
    )
    d = d.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Donation not found or status mismatch")

    now = datetime.now(UTC).isoformat()
    d.arrived_at = now
    session.add(d)

    # Sync claim status to arrived
    cl = await session.execute(
        select(Claim).where(
            Claim.donation_id == donation_id,
            Claim.recipient_id == current_user.id,
            Claim.status.in_(["approved", "in_transit"]),
        )
    )
    claim_obj = cl.scalar_one_or_none()
    if claim_obj:
        claim_obj.status = "arrived"
        session.add(claim_obj)

    await session.commit()
    return {"message": "Kedatangan dikonfirmasi"}


@router.post("/donations/{donation_id}/complete", dependencies=[Depends(rate_limit_dependency(10, 60))])
async def complete_donation(
    donation_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "donor":
        raise HTTPException(status_code=403, detail="Access denied")

    d = await session.execute(
        select(Donation).where(
            Donation.id == donation_id,
            Donation.status == "claimed",
            Donation.donor_id == current_user.id,
        )
    )
    d = d.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Donation not found or status mismatch")

    now = datetime.now(UTC).isoformat()
    d.status = "completed"
    d.completed_at = now
    session.add(d)

    # Sync claim status to completed
    if d.claimed_by:
        cl = await session.execute(
            select(Claim).where(
                Claim.donation_id == donation_id,
                Claim.recipient_id == d.claimed_by,
                Claim.status.in_(["approved", "in_transit", "arrived"]),
            )
        )
        claim_obj = cl.scalar_one_or_none()
        if claim_obj:
            claim_obj.status = "completed"
            session.add(claim_obj)

    # Update recipient's last_received_donation
    if d.claimed_by:
        rp = await session.execute(
            select(RecipientProfile).where(RecipientProfile.user_id == d.claimed_by)
        )
        rp = rp.scalar_one_or_none()
        if rp:
            rp.last_received_donation = now
            session.add(rp)

    # Increment donor total_donations
    dp = await session.execute(
        select(DonorProfile).where(DonorProfile.user_id == d.donor_id)
    )
    dp = dp.scalar_one_or_none()
    if dp:
        dp.total_donations += 1
        session.add(dp)

    await session.commit()
    await log_activity(session, current_user.id, "donasi_selesai", f"Donasi #{donation_id} selesai")
    return {"message": "Handover confirmed successfully"}
