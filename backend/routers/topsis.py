"""TOPSIS routes — view rankings, admin re-run.

Mirrors server/routes.ts lines 389-397, 445-448.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select

from backend.auth import get_current_user
from backend.dependencies import SessionDep
from backend.models import RecipientProfile, TopsisResult, User
from backend.services.topsis import run_topsis_all_active, generate_match_reasons

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
    weights_summary = None

    for r in results:
        prof = await session.execute(
            select(RecipientProfile).where(RecipientProfile.user_id == r.recipient_id)
        )
        prof = prof.scalar_one_or_none()

        reasons = generate_match_reasons(
            raw_c1=r.raw_c1,
            raw_c2=r.raw_c2,
            raw_c3=r.raw_c3,
            raw_c4=r.raw_c4,
            raw_c5=r.raw_c5,
            rank=r.rank_position,
        )

        if weights_summary is None:
            weights_summary = {
                "c1_protein": round(r.weight_c1, 4),
                "c2_urgency": round(r.weight_c2, 4),
                "c3_shelf_life": round(r.weight_c3, 4),
                "c4_distance": round(r.weight_c4, 4),
                "c5_fairness": round(r.weight_c5, 4),
            }

        enriched.append({
            **r.model_dump(),
            "institution_name": prof.institution_name if prof else None,
            "match_reasons": reasons,
            "match_percentage": round(r.ci_score * 100, 1),
        })

    return {
        "results": enriched,
        "weights": weights_summary or {
            "c1_protein": 0.25,
            "c2_urgency": 0.25,
            "c3_shelf_life": 0.15,
            "c4_distance": 0.20,
            "c5_fairness": 0.15,
        },
        "algorithm": "Entropy-Weighted Hybrid TOPSIS",
    }


@router.post("/admin/topsis/run")
async def admin_run_topsis(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    await run_topsis_all_active()
    return {"message": "TOPSIS recalculation completed."}
