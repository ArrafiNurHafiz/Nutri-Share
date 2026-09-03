"""Public data routes — top donors, stats, map data, badges.
"""
from __future__ import annotations

from fastapi import APIRouter, Query
from sqlmodel import select, text, func

from backend.dependencies import SessionDep
from backend.models import (
    Donation,
    DonorProfile,
    RecipientProfile,
    Review,
    User,
)
from backend.services.cache import cache
from backend.services.gamification import calculate_badges

router = APIRouter()

# Cache TTL for public stats (5 minutes)
PUBLIC_STATS_TTL = 300


@router.get("/public/stats")
async def public_stats(session: SessionDep):
    """Live impact numbers for the landing page."""
    # Check cache first
    cached_stats = cache.get("public:stats")
    if cached_stats is not None:
        return cached_stats

    completed = await session.execute(
        text(
            "SELECT COALESCE(SUM(portion_count), 0) FROM donations WHERE status = 'completed'"
        )
    )
    total_portions = completed.scalar_one() or 0
    food_waste_kg = total_portions * 3  # ~0.3 kg per portion → integer display

    people = await session.execute(
        text(
            "SELECT COUNT(DISTINCT claimed_by) FROM donations WHERE status = 'completed'"
        )
    )
    people_helped = people.scalar_one() or 0

    partners = await session.execute(
        select(User).where(User.role == "donor", User.status == "verified")
    )
    partner_count = len(partners.scalars().all())

    completed_count = await session.execute(
        select(Donation).where(Donation.status == "completed")
    )
    completed_donations = len(completed_count.scalars().all())

    result = {
        "food_waste_kg": food_waste_kg,
        "people_helped": people_helped,
        "partner_count": partner_count,
        "completed_donations": completed_donations,
        "total_portions": total_portions,
    }

    # Cache the result
    cache.set("public:stats", result, PUBLIC_STATS_TTL)
    return result


@router.get("/public/top-donors")
async def top_donors(
    session: SessionDep,
    period: str = Query("all", pattern="^(all|month)$"),
):
    now_str = None
    if period == "month":
        from datetime import datetime, timezone

        now = datetime.now(timezone.utc)
        now_str = now.strftime("%Y-%m")

    if period == "month":
        # Count donations per donor in the current month
        # Using SQLAlchemy-compatible date functions (works with both SQLite and PostgreSQL)
        rows = await session.execute(
            text(
                "SELECT donor_id, COUNT(*) as cnt FROM donations "
                "WHERE created_at LIKE :month_pattern "
                "GROUP BY donor_id ORDER BY cnt DESC LIMIT 3"
            ).bindparams(month_pattern=f"{now_str}%")
        )
        donor_counts = {row.donor_id: row.cnt for row in rows.mappings().all()}
        donor_ids = list(donor_counts.keys())
        if not donor_ids:
            return []

        profiles = await session.execute(
            select(DonorProfile).where(DonorProfile.user_id.in_(donor_ids))
        )
        profiles_map = {p.user_id: p for p in profiles.scalars().all()}

        # Sort by count descending
        donor_ids.sort(key=lambda uid: donor_counts.get(uid, 0), reverse=True)
        donors = [profiles_map[uid] for uid in donor_ids if uid in profiles_map]
    else:
        result = await session.execute(
            select(DonorProfile).order_by(DonorProfile.total_donations.desc()).limit(3)
        )
        donors = result.scalars().all()

    output = []
    for p in donors:
        reviews = await session.execute(
            select(Review).where(Review.donor_id == p.user_id)
        )
        reviews_list = reviews.scalars().all()
        avg_rating = (
            sum(r.rating for r in reviews_list) / len(reviews_list)
            if reviews_list
            else 0
        )
        donation_count = (
            donor_counts.get(p.user_id, 0) if period == "month" else p.total_donations
        )
        output.append({
            "id": p.user_id,
            "business_name": p.business_name,
            "total_donations": donation_count,
            "type": p.business_type,
            "logo_url": p.logo_url,
            "rating": f"{avg_rating:.1f}",
            "review_count": len(reviews_list),
        })
    return output


@router.get("/public/reviews")
async def public_reviews(
    session: SessionDep,
    limit: int = Query(8, ge=1, le=20),
):
    """Recent recipient reviews for the landing page testimonials."""
    rows = await session.execute(
        text(
            "SELECT r.id, r.rating, r.comment, r.created_at, "
            "u.name AS recipient_name, dp.business_name AS donor_name "
            "FROM reviews r "
            "JOIN users u ON u.id = r.recipient_id "
            "LEFT JOIN donor_profiles dp ON dp.user_id = r.donor_id "
            "WHERE r.comment != '' "
            "ORDER BY r.created_at DESC LIMIT :limit"
        ).bindparams(limit=limit)
    )
    return [
        {
            "id": row.id,
            "rating": row.rating,
            "comment": row.comment,
            "created_at": row.created_at,
            "recipient_name": row.recipient_name,
            "donor_name": row.donor_name,
        }
        for row in rows.mappings().all()
    ]


@router.get("/map/data")
async def map_data(session: SessionDep):
    donors = await session.execute(
        select(DonorProfile).join(User, User.id == DonorProfile.user_id).where(User.status == "verified")
    )
    recipients = await session.execute(
        select(RecipientProfile).join(User, User.id == RecipientProfile.user_id).where(User.status == "verified")
    )
    active = await session.execute(
        select(Donation).where(Donation.status == "active")
    )
    return {
        "donors": [dict(r._mapping) for r in donors.all()],
        "recipients": [dict(r._mapping) for r in recipients.all()],
        "activeDonations": [dict(r._mapping) for r in active.all()],
    }


@router.get("/donors/{donor_id}/badges")
async def donor_badges(donor_id: int, session: SessionDep):
    dp = await session.execute(
        select(DonorProfile.total_donations).where(DonorProfile.user_id == donor_id)
    )
    total = dp.scalar_one_or_none() or 0

    reviews_count = await session.execute(
        select(Review).where(Review.donor_id == donor_id)
    )
    review_count = len(reviews_count.scalars().all())

    return calculate_badges(total, review_count)
