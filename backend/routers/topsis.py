"""TOPSIS routes — view rankings, admin re-run.

Mirrors server/routes.ts lines 389-397, 445-448.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select

from backend.auth import get_current_user
from backend.dependencies import SessionDep
from backend.models import RecipientProfile, TopsisResult, User
from backend.services.topsis import run_topsis_all_active

router = APIRouter()


@router.get("/topsis/{donation_id}")
async def get_topsis_results(
    donation_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(TopsisResult)
        .where(TopsisResult.donation_id == donation_id)
        .order_by(TopsisResult.rank_position)
    )
    results = result.scalars().all()

    enriched = []
    for r in results:
        prof = await session.execute(
            select(RecipientProfile).where(RecipientProfile.user_id == r.recipient_id)
        )
        prof = prof.scalar_one_or_none()
        enriched.append({
            **r.model_dump(),
            "institution_name": prof.institution_name if prof else None,
        })
    return {"results": enriched}


@router.post("/admin/topsis/run")
async def admin_run_topsis(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    await run_topsis_all_active()
    return {"message": "TOPSIS recalculation completed."}
