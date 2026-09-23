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
        "total_food_saved_kg": food_waste_kg,
        "people_helped": people_helped,
        "total_beneficiaries": people_helped,
        "partner_count": partner_count,
        "completed_donations": completed_donations,
        "total_portions": total_portions,
        "total_portions_distributed": total_portions,
        "co2_saved_tons": round((food_waste_kg * 2.5) / 1000, 1),
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
        "donors": [d.model_dump() for d in donors.scalars().all()],
        "recipients": [r.model_dump() for r in recipients.scalars().all()],
        "activeDonations": [a.model_dump() for a in active.scalars().all()],
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


@router.get("/public/topsis-priority")
async def get_public_topsis_priority(session: SessionDep):
    """Public transparency data for Live Entropy-TOPSIS recipient ranking."""
    # Find latest active donation topsis results or latest available
    from backend.models import TopsisResult
    from backend.services.topsis import generate_match_reasons

    # Get the latest donation with topsis results
    latest_topsis = await session.execute(
        select(TopsisResult.donation_id)
        .order_by(TopsisResult.id.desc())
        .limit(1)
    )
    donation_id = latest_topsis.scalar_one_or_none()

    if donation_id:
        result = await session.execute(
            select(TopsisResult)
            .where(TopsisResult.donation_id == donation_id)
            .order_by(TopsisResult.rank_position)
            .limit(5)
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
                "rank": r.rank_position,
                "recipient_id": r.recipient_id,
                "institution_name": prof.institution_name if prof else f"Lembaga Sosial #{r.recipient_id}",
                "beneficiary_count": prof.resident_count if prof else 45,
                "institution_type": prof.institution_type if prof else "panti_asuhan",
                "address": prof.address if prof else "Yogyakarta",
                "ci_score": round(r.ci_score, 4),
                "distance_km": round(r.raw_c4, 1),
                "urgency_level": round(r.raw_c2, 1),
                "protein_fulfill_pct": round(r.raw_c1, 1),
                "match_reasons": reasons,
            })

        return {
            "donation_id": donation_id,
            "weights": weights_summary,
            "rankings": enriched,
            "algorithm": "Hybrid Shannon Entropy-TOPSIS (50% Policy + 50% Data Entropy)",
        }

    # If no results yet, return empty transparency status
    return {
        "donation_id": None,
        "weights": {
            "c1_protein": 0.25,
            "c2_urgency": 0.25,
            "c3_shelf_life": 0.15,
            "c4_distance": 0.20,
            "c5_fairness": 0.15,
        },
        "rankings": [],
        "algorithm": "Hybrid Shannon Entropy-TOPSIS (50% Policy + 50% Data Entropy)",
    }
