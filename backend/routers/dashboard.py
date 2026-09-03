"""Dashboard routes — stats and trends.

Mirrors server/routes.ts lines 188-214.
"""
from __future__ import annotations

from datetime import UTC, datetime, timedelta

from fastapi import APIRouter
from sqlmodel import select, text

from backend.dependencies import SessionDep
from backend.models import Donation, User

router = APIRouter()


@router.get("/dashboard/stats")
async def dashboard_stats(session: SessionDep):
    donors = await session.execute(
        select(User).where(User.role == "donor")
    )
    recipients = await session.execute(
        select(User).where(User.role == "recipient")
    )
    active = await session.execute(
        select(Donation).where(Donation.status == "active")
    )
    completed = await session.execute(
        select(Donation).where(Donation.status == "completed")
    )
    return {
        "donors": len(donors.scalars().all()),
        "recipients": len(recipients.scalars().all()),
        "active_donations": len(active.scalars().all()),
        "completed_donations": len(completed.scalars().all()),
    }


@router.get("/dashboard/trends")
async def dashboard_trends(session: SessionDep):
    now = datetime.now(UTC)
    weekly = []
    for i in range(6, -1, -1):
        d = now - timedelta(days=i)
        day_start = d.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = d.replace(hour=23, minute=59, second=59, microsecond=999999)

        result = await session.execute(
            text(
                "SELECT COUNT(*) as c FROM donations "
                "WHERE completed_at >= :start AND completed_at <= :end"
            ),
            {"start": day_start.isoformat(), "end": day_end.isoformat()},
        )
        count = result.scalar_one() or 0
        weekly.append({"date": day_start.isoformat()[:10], "count": count})

    food_types = await session.execute(
        text("SELECT food_type, COUNT(*) as c FROM donations GROUP BY food_type ORDER BY c DESC")
    )
    food_types_list = [{"food_type": row[0], "count": row[1]} for row in food_types.all()]

    total_portions = await session.execute(
        text("SELECT COALESCE(SUM(portion_count), 0) FROM donations WHERE status = 'completed'")
    )
    total_protein = await session.execute(
        text(
            "SELECT COALESCE(SUM(protein_per_portion * portion_count), 0) "
            "FROM donations WHERE status = 'completed'"
        )
    )

    return {
        "weekly": weekly,
        "foodTypes": food_types_list,
        "totalPortions": total_portions.scalar_one() or 0,
        "totalProtein": total_protein.scalar_one() or 0,
    }
