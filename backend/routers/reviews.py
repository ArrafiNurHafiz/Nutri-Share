"""Review routes — create review, list donor reviews.

Mirrors server/routes.ts lines 400-421.
"""
from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select

from backend.auth import get_current_user
from backend.dependencies import SessionDep
from backend.models import Donation, Notification, RecipientProfile, Review, User
from backend.schemas import ReviewRequest
from backend.utils.rate_limit import rate_limit_dependency

router = APIRouter()


@router.post("/reviews", dependencies=[Depends(rate_limit_dependency(20, 60))])
async def create_review(
    body: ReviewRequest,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    # Validate donation exists and is completed
    d = await session.execute(
        select(Donation).where(Donation.id == body.donation_id)
    )
    donation = d.scalar_one_or_none()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    if donation.status != "completed":
        raise HTTPException(status_code=400, detail="Only completed donations can be reviewed")

    # Validate current user is the recipient who claimed this donation
    if current_user.role != "recipient" or current_user.id != donation.claimed_by:
        raise HTTPException(status_code=403, detail="Only donation recipients can leave a review")

    # Check if review already exists
    existing = await session.execute(
        select(Review).where(Review.donation_id == body.donation_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="This donation has already been reviewed")

    review = Review(
        donation_id=body.donation_id,
        donor_id=donation.donor_id,
        recipient_id=current_user.id,
        rating=body.rating,
        comment=body.comment or "",
        created_at=datetime.now(UTC).isoformat(),
    )
    session.add(review)
    await session.flush()

    # Notify donor
    notif = Notification(
        user_id=donation.donor_id,
        title="New Review!",
        message=f"The recipient has left a {body.rating}-star review for your donation.",
        type="system",
        is_read=0,
        related_donation_id=body.donation_id,
        created_at=datetime.now(UTC).isoformat(),
    )
    session.add(notif)
    await session.commit()

    return {"message": "Review submitted successfully"}


@router.get("/donors/{donor_id}/reviews")
async def get_donor_reviews(donor_id: int, session: SessionDep):
    result = await session.execute(
        select(Review).where(Review.donor_id == donor_id).order_by(Review.id.desc())
    )
    reviews = result.scalars().all()

    enriched = []
    for r in reviews:
        rec = await session.execute(
            select(RecipientProfile).where(RecipientProfile.user_id == r.recipient_id)
        )
        rec = rec.scalar_one_or_none()
        enriched.append({
            **r.model_dump(),
            "recipient_name": rec.institution_name if rec else None,
        })
    return enriched
