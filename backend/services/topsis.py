"""TOPSIS algorithm — NumPy vectorized implementation.

Mirrors server/topsis.ts exactly in logic and output.
Uses entropy weighting and Euclidean distance for ranking.

Criteria:
  C1 (benefit)  = % protein need fulfilled
  C2 (benefit)  = urgency score (emergency * 1000 boost)
  C3 (benefit)  = remaining time before expiry (hours)
  C4 (cost)     = pickup → recipient distance in km
  C5 (benefit)  = days since last donation received
"""
from __future__ import annotations

from datetime import datetime, timezone

import numpy as np
from sqlalchemy import text as sa_text
from sqlmodel import select

from backend.models import Donation

HOUR_MS = 3_600_000
DAY_MS = 86_400_000
EPSILON = 1e-12


# --- Haversine ---

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine distance in kilometres between two lat/lon points."""
    R = 6371.0
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = (
        np.sin(dlat / 2) ** 2
        + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2) ** 2
    )
    return float(R * 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a)))


# --- TOPSIS Calculation ---

async def calculate_topsis_for_donation(session: any, donation_id: int) -> None:
    """Calculate TOPSIS rankings for all verified recipients of a donation.

    Uses the provided async session (works with both PostgreSQL and SQLite).
    Results are stored in the topsis_results table.
    """
    donation = await session.execute(
        select(Donation).where(Donation.id == donation_id, Donation.status == "active")
    )
    donation = donation.scalar_one_or_none()
    if not donation:
        return

    recipients = await session.execute(
        sa_text(
            "SELECT rp.* FROM recipient_profiles rp "
            "JOIN users u ON u.id = rp.user_id "
            "WHERE u.status = 'verified'"
        )
    )
    recipients = recipients.all()

    if not recipients:
        return

    # Single recipient: rank = 1, ci_score = 1, no entropy calculation
    if len(recipients) == 1:
        await _save_single_result(session, donation_id, recipients[0].user_id)
        return

    await _compute_rankings(session, donation_id, donation, recipients)


async def run_topsis_all_active() -> None:
    """Recalculate TOPSIS for all active donations.

    Uses the async session. Called at startup and on admin trigger.
    """
    from backend.database import get_session_maker

    maker = get_session_maker()
    async with maker() as session:
        result = await session.execute(
            select(Donation.id).where(Donation.status == "active")
        )
        donation_ids = result.scalars().all()

        for did in donation_ids:
            await calculate_topsis_for_donation(session, did)
        await session.commit()


# --- Internal helpers (async) ---

async def _save_single_result(session, donation_id: int, recipient_id: int) -> None:
    now = datetime.now(timezone.utc).isoformat()
    await session.execute(sa_text("DELETE FROM topsis_results WHERE donation_id = :did"), {"did": donation_id})
    await session.execute(
        sa_text(
            "INSERT INTO topsis_results "
            "(donation_id, recipient_id, rank_position, "
            "raw_c1, raw_c2, raw_c3, raw_c4, raw_c5, "
            "weight_c1, weight_c2, weight_c3, weight_c4, weight_c5, "
            "d_plus, d_minus, ci_score, calculated_at) "
            "VALUES (:did, :rid, 1, 0, 0, 0, 0, 0, "
            "0, 0, 0, 0, 0, 0, 1, 1, :now)"
        ),
        {"did": donation_id, "rid": recipient_id, "now": now},
    )


async def _compute_rankings(session, donation_id, donation, recipients):
    now_ts = datetime.now(timezone.utc).timestamp() * 1000
    valid_until_ts = datetime.fromisoformat(donation.valid_until).timestamp() * 1000
    total_protein = donation.protein_per_portion * donation.portion_count

    n = 5
    m = len(recipients)
    matrix = np.zeros((m, n))
    recipient_ids = []

    for i, rp in enumerate(recipients):
        recipient_ids.append(rp.user_id)
        c1 = min(100, (total_protein / rp.daily_protein_need) * 100) if rp.daily_protein_need > 0 else 0
        c2 = rp.urgency_score * 1000 if rp.emergency == "active" else rp.urgency_score
        c3 = max((valid_until_ts - now_ts) / HOUR_MS, 0.1)
        c4 = _haversine_km(donation.pickup_latitude, donation.pickup_longitude, rp.latitude, rp.longitude)
        c5 = 30.0
        if rp.last_received_donation:
            last_ts = datetime.fromisoformat(rp.last_received_donation).timestamp() * 1000
            c5 = max((now_ts - last_ts) / DAY_MS, 0)
        matrix[i] = [c1, c2, c3, c4, c5]

    is_benefit = np.array([True, True, True, False, True])

    norm_factors = np.sqrt(np.sum(matrix**2, axis=0))
    norm_factors = np.where(norm_factors == 0, EPSILON, norm_factors)
    norm_matrix = matrix / norm_factors

    p_sum = np.where(np.sum(norm_matrix, axis=0) == 0, EPSILON, np.sum(norm_matrix, axis=0))
    p_matrix = norm_matrix / p_sum
    k = -1.0 / np.log(m)
    entropy = -k * np.sum(p_matrix * np.log(np.clip(p_matrix, EPSILON, 1)), axis=0)
    d_j = np.maximum(0, 1 - entropy)
    sum_d_j = np.sum(d_j)
    w_j = np.full(n, 1.0 / n) if sum_d_j == 0 else d_j / sum_d_j
    v_matrix = norm_matrix * w_j
    a_plus = np.where(is_benefit, np.max(v_matrix, axis=0), np.min(v_matrix, axis=0))
    a_minus = np.where(is_benefit, np.min(v_matrix, axis=0), np.max(v_matrix, axis=0))
    d_plus = np.sqrt(np.sum((v_matrix - a_plus) ** 2, axis=1))
    d_minus = np.sqrt(np.sum((v_matrix - a_minus) ** 2, axis=1))
    denom = d_plus + d_minus
    ci_scores = np.where(denom == 0, 0, d_minus / denom)
    sorted_indices = np.argsort(-ci_scores)

    await _persist_results(session, donation_id, donation, recipients, recipient_ids, matrix, sorted_indices, w_j, d_plus, d_minus, ci_scores)


async def _persist_results(session, donation_id, donation, recipients, recipient_ids, matrix, sorted_indices, w_j, d_plus, d_minus, ci_scores):
    now_str = datetime.now(timezone.utc).isoformat()
    w_list = w_j.tolist()

    await session.execute(sa_text("DELETE FROM topsis_results WHERE donation_id = :did"), {"did": donation_id})

    insert_sql = sa_text(
        "INSERT INTO topsis_results "
        "(donation_id, recipient_id, rank_position, "
        "raw_c1, raw_c2, raw_c3, raw_c4, raw_c5, "
        "weight_c1, weight_c2, weight_c3, weight_c4, weight_c5, "
        "d_plus, d_minus, ci_score, calculated_at) "
        "VALUES (:did, :rid, :rank, :c1, :c2, :c3, :c4, :c5, "
        ":w1, :w2, :w3, :w4, :w5, :dp, :dm, :ci, :now)"
    )
    notif_sql = sa_text(
        "INSERT INTO notifications "
        "(user_id, title, message, type, is_read, related_donation_id, created_at) "
        "VALUES (:uid, :title, :msg, 'donation_available', 0, :did, :now)"
    )

    for rank_idx, orig_idx in enumerate(sorted_indices):
        rank_pos = rank_idx + 1
        rid = recipient_ids[orig_idx]
        row = matrix[orig_idx]

        await session.execute(insert_sql, {
            "did": donation_id, "rid": rid, "rank": rank_pos,
            "c1": float(row[0]), "c2": float(row[1]), "c3": float(row[2]),
            "c4": float(row[3]), "c5": float(row[4]),
            "w1": w_list[0], "w2": w_list[1], "w3": w_list[2],
            "w4": w_list[3], "w5": w_list[4],
            "dp": float(d_plus[orig_idx]), "dm": float(d_minus[orig_idx]),
            "ci": float(ci_scores[orig_idx]), "now": now_str,
        })

        if rank_pos == 1:
            await session.execute(notif_sql, {
                "uid": rid, "title": "Priority Donation!",
                "msg": f"You are the top priority for this donation: {donation.food_name}",
                "did": donation_id, "now": now_str,
            })
