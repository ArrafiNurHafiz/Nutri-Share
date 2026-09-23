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


# Policy weights baseline: [C1: Protein 25%, C2: Urgency 25%, C3: Shelf Life 15%, C4: Distance 20%, C5: Fairness/Days 15%]
DEFAULT_POLICY_WEIGHTS = np.array([0.25, 0.25, 0.15, 0.20, 0.15])
ALPHA_POLICY = 0.50  # 50% Policy, 50% Shannon Entropy for stability & objectivity


def generate_match_reasons(raw_c1: float, raw_c2: float, raw_c3: float, raw_c4: float, raw_c5: float, rank: int) -> list[str]:
    """Generate human-readable matching justification for recipients & donors."""
    reasons = []

    if raw_c5 < 0.2:
        reasons.append("Pemerataan: Baru saja menerima donasi hari ini")
    elif raw_c5 >= 14:
        reasons.append(f"Pemerataan: Belum menerima donasi {int(raw_c5)} hari")
    elif raw_c5 >= 7:
        reasons.append(f"Pemerataan: {int(raw_c5)} hari sejak donasi terakhir")

    if raw_c2 >= 1000:
        reasons.append("Prioritas Darurat Aktif (Emergency Boost)")
    elif raw_c2 >= 6:
        reasons.append("Tingkat urgensi kebutuhan tinggi")
    elif raw_c2 < 2:
        reasons.append("Kebutuhan gizi hari ini sebagian besar telah terpenuhi")

    if raw_c4 <= 3.0:
        reasons.append(f"Sangat dekat ({raw_c4:.1f} km) - distribusi kilat")
    elif raw_c4 <= 7.0:
        reasons.append(f"Jarak terjangkau ({raw_c4:.1f} km)")

    if raw_c1 >= 70:
        reasons.append(f"Memenuhi {raw_c1:.0f}% kebutuhan protein harian")
    elif raw_c1 >= 30:
        reasons.append(f"Menyuplai {raw_c1:.0f}% sisa defisit protein")
    elif raw_c1 > 0:
        reasons.append(f"Menyuplai tambahan gizi {raw_c1:.0f}%")

    if not reasons:
        reasons.append("Skor kesesuaian logistik & nutrisi optimal")

    return reasons


async def _get_recipient_fulfillment(session: any, recipient_id: int, prot_target: float) -> tuple[float, float, str | None]:
    """Calculate protein and portions received/claimed by recipient in the last 24 hours.

    Returns (claimed_protein_today, fulfillment_ratio, last_claim_time).
    """
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    since_iso = (now - timedelta(hours=24)).isoformat()

    rows = await session.execute(
        sa_text(
            "SELECT d.protein_per_portion, d.portion_count, d.claimed_at, d.completed_at, d.created_at "
            "FROM donations d "
            "WHERE d.claimed_by = :rid "
            "AND d.status IN ('claimed', 'arrived', 'completed') "
            "AND (d.claimed_at >= :since OR d.completed_at >= :since OR d.created_at >= :since)"
        ),
        {"rid": recipient_id, "since": since_iso},
    )
    donations_today = rows.all()

    total_protein_today = 0.0
    last_time = None
    for row in donations_today:
        total_protein_today += (row.protein_per_portion or 0.0) * (row.portion_count or 0)
        t = row.claimed_at or row.completed_at or row.created_at
        if t and (last_time is None or t > last_time):
            last_time = t

    if not last_time:
        last_row = await session.execute(
            sa_text(
                "SELECT claimed_at, completed_at FROM donations "
                "WHERE claimed_by = :rid AND status = 'completed' "
                "ORDER BY id DESC LIMIT 1"
            ),
            {"rid": recipient_id}
        )
        l_r = last_row.first()
        if l_r:
            last_time = l_r.completed_at or l_r.claimed_at

    fulfillment_ratio = min(1.0, total_protein_today / prot_target) if prot_target > 0 else (1.0 if total_protein_today > 0 else 0.0)
    return total_protein_today, fulfillment_ratio, last_time


# --- TOPSIS Calculation ---

async def calculate_topsis_for_donation(session: any, donation_id: int) -> None:
    """Calculate TOPSIS rankings for all verified recipients of a donation."""
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

    if len(recipients) == 1:
        await _save_single_result(session, donation_id, donation, recipients[0])
        return

    await _compute_rankings(session, donation_id, donation, recipients)


async def run_topsis_all_active() -> None:
    """Recalculate TOPSIS for all active donations."""
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

async def _save_single_result(session, donation_id: int, donation, rp) -> None:
    now = datetime.now(timezone.utc)
    now_ts = now.timestamp() * 1000
    now_str = now.isoformat()
    valid_until_ts = datetime.fromisoformat(donation.valid_until).timestamp() * 1000
    total_protein = (donation.protein_per_portion or 0.0) * (donation.portion_count or 0)

    rp_residents = max(1, getattr(rp, "resident_count", 1) or 1)
    raw_p_need = rp.daily_protein_need or 50.0
    prot_target = (raw_p_need * rp_residents) if (raw_p_need < 200 and rp_residents > 1) else raw_p_need

    claimed_protein_today, fulfillment_ratio, last_claim_time = await _get_recipient_fulfillment(session, rp.user_id, prot_target)

    # C1: % Protein of remaining need
    remaining_need = max(0.0, prot_target - claimed_protein_today)
    if remaining_need > 0:
        c1 = min(100.0, (total_protein / remaining_need) * 100.0) * (1.0 - 0.5 * fulfillment_ratio)
    else:
        c1 = 10.0  # Buffer

    # C2: Urgency decreases when daily quota is already fulfilled
    base_urgency = rp.urgency_score * 1000 if rp.emergency == "active" else (rp.urgency_score or 1)
    c2 = base_urgency * max(0.15, 1.0 - (0.85 * fulfillment_ratio))

    # C3: Shelf life hours
    c3 = max((valid_until_ts - now_ts) / HOUR_MS, 0.1)

    # C4: Distance in km
    c4 = _haversine_km(donation.pickup_latitude, donation.pickup_longitude, rp.latitude, rp.longitude)

    # C5: Days since last donation/claim
    effective_last = last_claim_time or rp.last_received_donation
    if effective_last:
        try:
            last_ts = datetime.fromisoformat(effective_last).timestamp() * 1000
            c5 = max((now_ts - last_ts) / DAY_MS, 0.0)
        except Exception:
            c5 = 7.0
    else:
        c5 = 30.0

    # Score decreases if already received daily portions
    ci_score = round(max(0.15, 1.0 - (0.85 * fulfillment_ratio)), 4)
    w = DEFAULT_POLICY_WEIGHTS

    await session.execute(sa_text("DELETE FROM topsis_results WHERE donation_id = :did"), {"did": donation_id})
    await session.execute(
        sa_text(
            "INSERT INTO topsis_results "
            "(donation_id, recipient_id, rank_position, "
            "raw_c1, raw_c2, raw_c3, raw_c4, raw_c5, "
            "weight_c1, weight_c2, weight_c3, weight_c4, weight_c5, "
            "d_plus, d_minus, ci_score, calculated_at) "
            "VALUES (:did, :rid, 1, :c1, :c2, :c3, :c4, :c5, "
            ":w1, :w2, :w3, :w4, :w5, 0, :ci, :ci, :now)"
        ),
        {
            "did": donation_id, "rid": rp.user_id,
            "c1": float(c1), "c2": float(c2), "c3": float(c3),
            "c4": float(c4), "c5": float(c5),
            "w1": float(w[0]), "w2": float(w[1]), "w3": float(w[2]),
            "w4": float(w[3]), "w5": float(w[4]),
            "ci": float(ci_score), "now": now_str,
        },
    )


async def _compute_rankings(session, donation_id, donation, recipients):
    now = datetime.now(timezone.utc)
    now_ts = now.timestamp() * 1000
    valid_until_ts = datetime.fromisoformat(donation.valid_until).timestamp() * 1000
    total_protein = (donation.protein_per_portion or 0.0) * (donation.portion_count or 0)

    n = 5
    m = len(recipients)
    matrix = np.zeros((m, n))
    recipient_ids = []
    fulfillment_ratios = []

    for i, rp in enumerate(recipients):
        recipient_ids.append(rp.user_id)
        rp_residents = max(1, getattr(rp, "resident_count", 1) or 1)
        raw_p_need = rp.daily_protein_need or 50.0
        prot_target = (raw_p_need * rp_residents) if (raw_p_need < 200 and rp_residents > 1) else raw_p_need

        claimed_protein_today, fulfillment_ratio, last_claim_time = await _get_recipient_fulfillment(session, rp.user_id, prot_target)
        fulfillment_ratios.append(fulfillment_ratio)

        # C1: Protein fulfillment
        remaining_need = max(0.0, prot_target - claimed_protein_today)
        if remaining_need > 0:
            c1 = min(100.0, (total_protein / remaining_need) * 100.0) * (1.0 - 0.5 * fulfillment_ratio)
        else:
            c1 = 10.0

        # C2: Urgency drops as daily nutrition gets fulfilled
        base_urgency = rp.urgency_score * 1000 if rp.emergency == "active" else (rp.urgency_score or 1)
        c2 = base_urgency * max(0.15, 1.0 - (0.85 * fulfillment_ratio))

        # C3: Shelf life
        c3 = max((valid_until_ts - now_ts) / HOUR_MS, 0.1)

        # C4: Distance
        c4 = _haversine_km(donation.pickup_latitude, donation.pickup_longitude, rp.latitude, rp.longitude)

        # C5: Fairness / Time since last donation
        effective_last = last_claim_time or rp.last_received_donation
        if effective_last:
            try:
                last_ts = datetime.fromisoformat(effective_last).timestamp() * 1000
                c5 = max((now_ts - last_ts) / DAY_MS, 0.0)
            except Exception:
                c5 = 7.0
        else:
            c5 = 30.0

        matrix[i] = [c1, c2, c3, c4, c5]

    is_benefit = np.array([True, True, True, False, True])

    norm_factors = np.sqrt(np.sum(matrix**2, axis=0))
    norm_factors = np.where(norm_factors == 0, EPSILON, norm_factors)
    norm_matrix = matrix / norm_factors

    p_sum = np.where(np.sum(norm_matrix, axis=0) == 0, EPSILON, np.sum(norm_matrix, axis=0))
    p_matrix = norm_matrix / p_sum
    k = 1.0 / np.log(m)
    entropy = -k * np.sum(p_matrix * np.log(np.clip(p_matrix, EPSILON, 1)), axis=0)
    d_j = np.maximum(0, 1 - entropy)
    sum_d_j = np.sum(d_j)
    w_entropy = np.full(n, 1.0 / n) if sum_d_j == 0 else d_j / sum_d_j

    # Entropy-Weighted Hybrid TOPSIS: Combine Objective Entropy with Domain Policy
    w_j = (ALPHA_POLICY * DEFAULT_POLICY_WEIGHTS) + ((1.0 - ALPHA_POLICY) * w_entropy)
    w_j = w_j / np.sum(w_j)

    v_matrix = norm_matrix * w_j
    a_plus = np.where(is_benefit, np.max(v_matrix, axis=0), np.min(v_matrix, axis=0))
    a_minus = np.where(is_benefit, np.min(v_matrix, axis=0), np.max(v_matrix, axis=0))
    d_plus = np.sqrt(np.sum((v_matrix - a_plus) ** 2, axis=1))
    d_minus = np.sqrt(np.sum((v_matrix - a_minus) ** 2, axis=1))
    denom = d_plus + d_minus
    ci_scores = np.where(denom == 0, 0, d_minus / denom)

    # Apply fulfillment penalty to final ranking score
    for idx, f_ratio in enumerate(fulfillment_ratios):
        if f_ratio > 0:
            ci_scores[idx] = ci_scores[idx] * (1.0 - 0.7 * f_ratio)

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
            "w1": float(w_list[0]), "w2": float(w_list[1]), "w3": float(w_list[2]),
            "w4": float(w_list[3]), "w5": float(w_list[4]),
            "dp": float(d_plus[orig_idx]), "dm": float(d_minus[orig_idx]),
            "ci": float(ci_scores[orig_idx]), "now": now_str,
        })

        if rank_pos == 1:
            await session.execute(notif_sql, {
                "uid": rid, "title": "Priority Donation!",
                "msg": f"You are the top priority for this donation: {donation.food_name}",
                "did": donation_id, "now": now_str,
            })

