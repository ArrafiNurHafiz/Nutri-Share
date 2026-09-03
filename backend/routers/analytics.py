"""Analytics routes — impact metrics, trends, and reports.

Provides data for dashboards and impact visualization.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlmodel import select, text

from backend.auth import get_current_user
from backend.dependencies import SessionDep
from backend.models import Donation, DonorProfile, RecipientProfile, Review, User
from backend.services.cache import cache

router = APIRouter()

# Cache TTL for analytics (10 minutes)
ANALYTICS_TTL = 600


@router.get("/analytics/impact")
async def impact_metrics(session: SessionDep):
    """Get overall impact metrics for the platform."""
    cache_key = "analytics:impact"
    cached = cache.get(cache_key)
    if cached:
        return cached

    # Total portions donated
    portions = await session.execute(
        text("SELECT COALESCE(SUM(portion_count), 0) FROM donations WHERE status = 'completed'")
    )
    total_portions = portions.scalar_one() or 0

    # People helped (unique recipients)
    people = await session.execute(
        text("SELECT COUNT(DISTINCT claimed_by) FROM donations WHERE status = 'completed'")
    )
    people_helped = people.scalar_one() or 0

    # Food waste prevented (kg) - assuming 0.3kg per portion
    food_waste_kg = total_portions * 0.3

    # CO2 equivalent saved (kg) - assuming 2.5kg CO2 per kg food waste prevented
    co2_saved_kg = food_waste_kg * 2.5

    # Active donors
    active_donors = await session.execute(
        select(User).where(User.role == "donor", User.status == "verified")
    )
    active_donor_count = len(active_donors.scalars().all())

    # Active recipients
    active_recipients = await session.execute(
        select(User).where(User.role == "recipient", User.status == "verified")
    )
    active_recipient_count = len(active_recipients.scalars().all())

    # Average rating
    avg_rating = await session.execute(
        text("SELECT COALESCE(AVG(rating), 0) FROM reviews")
    )
    average_rating = avg_rating.scalar_one() or 0

    result = {
        "total_portions_donated": total_portions,
        "people_helped": people_helped,
        "food_waste_prevented_kg": round(food_waste_kg, 2),
        "co2_saved_kg": round(co2_saved_kg, 2),
        "active_donors": active_donor_count,
        "active_recipients": active_recipient_count,
        "average_rating": round(float(average_rating), 2),
    }

    cache.set(cache_key, result, ANALYTICS_TTL)
    return result


@router.get("/analytics/trends")
async def donation_trends(
    session: SessionDep,
    period: str = Query("week", pattern="^(week|month|year)$"),
):
    """Get donation trends over time."""
    cache_key = f"analytics:trends:{period}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    now = datetime.now(timezone.utc)

    if period == "week":
        start_date = now - timedelta(days=7)
        date_format = "%Y-%m-%d"
    elif period == "month":
        start_date = now - timedelta(days=30)
        date_format = "%Y-%m-%d"
    else:  # year
        start_date = now - timedelta(days=365)
        date_format = "%Y-%m"

    # Get donations grouped by date
    result = await session.execute(
        text(
            "SELECT DATE(created_at) as date, COUNT(*) as count, SUM(portion_count) as portions "
            "FROM donations "
            "WHERE status = 'completed' AND created_at >= :start_date "
            "GROUP BY DATE(created_at) "
            "ORDER BY date"
        ).bindparams(start_date=start_date.isoformat())
    )
    rows = result.mappings().all()

    trends = [
        {
            "date": row["date"],
            "donation_count": row["count"],
            "portions": row["portions"],
        }
        for row in rows
    ]

    cache.set(cache_key, trends, ANALYTICS_TTL)
    return trends


@router.get("/analytics/donor/{donor_id}")
async def donor_analytics(
    donor_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    """Get analytics for a specific donor."""
    # Only allow admins or the donor themselves
    if current_user.role != "admin" and current_user.id != donor_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Access denied")

    # Get donor profile
    dp = await session.execute(
        select(DonorProfile).where(DonorProfile.user_id == donor_id)
    )
    donor_profile = dp.scalar_one_or_none()
    if not donor_profile:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Donor profile not found")

    # Get donation stats
    stats = await session.execute(
        text(
            "SELECT COUNT(*) as total_donations, "
            "SUM(portion_count) as total_portions, "
            "AVG(rating) as avg_rating "
            "FROM donations d "
            "LEFT JOIN reviews r ON r.donor_id = :donor_id "
            "WHERE d.donor_id = :donor_id AND d.status = 'completed'"
        ).bindparams(donor_id=donor_id)
    )
    row = stats.mappings().first()

    # Get recent donations
    recent = await session.execute(
        select(Donation)
        .where(Donation.donor_id == donor_id, Donation.status == "completed")
        .order_by(Donation.id.desc())
        .limit(5)
    )
    recent_donations = [
        {
            "id": d.id,
            "food_name": d.food_name,
            "portion_count": d.portion_count,
            "created_at": d.created_at,
        }
        for d in recent.scalars().all()
    ]

    result = {
        "donor_id": donor_id,
        "business_name": donor_profile.business_name,
        "business_type": donor_profile.business_type,
        "total_donations": row["total_donations"] if row else 0,
        "total_portions": row["total_portions"] or 0,
        "average_rating": round(float(row["avg_rating"] or 0), 2),
        "recent_donations": recent_donations,
    }

    return result


@router.get("/analytics/recipient/{recipient_id}")
async def recipient_analytics(
    recipient_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    """Get analytics for a specific recipient."""
    # Only allow admins or the recipient themselves
    if current_user.role != "admin" and current_user.id != recipient_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Access denied")

    # Get recipient profile
    rp = await session.execute(
        select(RecipientProfile).where(RecipientProfile.user_id == recipient_id)
    )
    recipient_profile = rp.scalar_one_or_none()
    if not recipient_profile:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Recipient profile not found")

    # Get received donations stats
    stats = await session.execute(
        text(
            "SELECT COUNT(*) as total_received, "
            "SUM(portion_count) as total_portions "
            "FROM donations "
            "WHERE claimed_by = :recipient_id AND status = 'completed'"
        ).bindparams(recipient_id=recipient_id)
    )
    row = stats.mappings().first()

    result = {
        "recipient_id": recipient_id,
        "institution_name": recipient_profile.institution_name,
        "institution_type": recipient_profile.institution_type,
        "resident_count": recipient_profile.resident_count,
        "total_received": row["total_received"] if row else 0,
        "total_portions": row["total_portions"] or 0,
    }

    return result
