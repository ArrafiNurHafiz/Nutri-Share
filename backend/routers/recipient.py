"""Recipient routes — AKG nutrition, emergency.

Mirrors server/routes.ts lines 348-386.
"""
from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import select

from backend.auth import get_current_user
from backend.dependencies import SessionDep
from backend.models import Donation, RecipientProfile, User
from backend.schemas import EmergencyRequest
from backend.services.realtime import broker
from backend.utils.rate_limit import rate_limit_dependency

router = APIRouter()


@router.get("/recipient/akg")
async def get_akg(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
    user_id: int | None = Query(None),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not logged in")

    target_user_id = current_user.id
    if current_user.role == "admin" and user_id:
        target_user_id = user_id
    elif current_user.role != "recipient" and not user_id:
        # If admin or non-recipient calls without user_id, find first recipient profile for inspection
        first_rp = await session.execute(select(RecipientProfile).limit(1))
        rp_sample = first_rp.scalar_one_or_none()
        if rp_sample:
            target_user_id = rp_sample.user_id

    profile = await session.execute(
        select(RecipientProfile).where(RecipientProfile.user_id == target_user_id)
    )
    profile = profile.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    today_start = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start.replace(hour=23, minute=59, second=59, microsecond=999999)

    result = await session.execute(
        select(Donation).where(
            Donation.claimed_by == target_user_id,
            Donation.status == "completed",
            Donation.completed_at >= today_start.isoformat(),
            Donation.completed_at <= today_end.isoformat(),
        )
    )
    today_dons = result.scalars().all()

    totals = {"protein": 0.0, "calories": 0.0, "iron": 0.0, "vitamin_c": 0.0}
    donation_details = []

    for d in today_dons:
        prot = d.protein_per_portion * d.portion_count
        cal = d.calorie_per_portion * d.portion_count
        fe = (d.iron_mg or 0) * d.portion_count
        vitc = (d.vitamin_c_mg or 0) * d.portion_count

        totals["protein"] += prot
        totals["calories"] += cal
        totals["iron"] += fe
        totals["vitamin_c"] += vitc

        donation_details.append({
            "id": d.id,
            "food_name": d.food_name,
            "portion_count": d.portion_count,
            "protein_total": prot,
            "calorie_total": cal,
            "iron_total": fe,
            "vitamin_c_total": vitc,
            "completed_at": d.completed_at,
        })

    needs = {
        "protein": profile.daily_protein_need,
        "calories": profile.daily_calorie_need,
        "iron": profile.daily_iron_need,
        "vitamin_c": profile.daily_vitamin_c_need,
    }

    def _pct(val: float, need: float) -> int:
        if need == 0:
            return 0
        return min(100, round((val / need) * 100))

    pct = {
        "protein": _pct(totals["protein"], needs["protein"]),
        "calories": _pct(totals["calories"], needs["calories"]),
        "iron": _pct(totals["iron"], needs["iron"]),
        "vitamin_c": _pct(totals["vitamin_c"], needs["vitamin_c"]),
    }
    overall = round((pct["protein"] + pct["calories"] + pct["iron"] + pct["vitamin_c"]) / 4)

    return {
        "date": today_start.isoformat()[:10],
        "daily_needs": needs,
        "today_intake": totals,
        "percentages": pct,
        "overall_percentage": overall,
        "donations_today": donation_details,
    }


@router.post("/recipient/emergency", dependencies=[Depends(rate_limit_dependency(5, 60))])
async def toggle_emergency(
    body: EmergencyRequest,
    session: SessionDep,
    current_user: User | None = Depends(get_current_user),
):
    # Validasi: user_id harus milik sendiri (untuk non-admin) atau admin bisa untuk siapa pun
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not logged in")

    user_id = body.user_id
    # Non-admin hanya bisa toggle emergency untuk dirinya sendiri
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    rp = await session.execute(
        select(RecipientProfile).where(RecipientProfile.user_id == user_id)
    )
    rp = rp.scalar_one_or_none()
    if not rp:
        raise HTTPException(status_code=404, detail="Recipient profile not found")

    if rp.emergency == "active":
        raise HTTPException(
            status_code=400,
            detail="Emergency status is active. Contact admin to deactivate.",
        )

    next_status = "pending" if rp.emergency == "none" else "none"
    rp.emergency = next_status
    session.add(rp)
    await session.commit()

    # Publish real-time emergency request event
    await broker.publish(
        event_type="EMERGENCY_STATUS_UPDATED",
        resource_id=user_id,
        data={"user_id": user_id, "emergency": next_status},
        target_roles=["admin"],
        target_user_ids=[user_id],
    )

    msg = (
        "Emergency request sent to admin"
        if next_status == "pending"
        else "Emergency request cancelled"
    )
    return {"emergency": next_status, "message": msg}
