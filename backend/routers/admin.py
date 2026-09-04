"""Admin routes — users, claims, search, delete, emergency toggle.

Mirrors server/routes.ts lines 450-548.
"""
from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import select, text

from backend.auth import get_current_user
from backend.dependencies import SessionDep
from backend.models import (
    Claim,
    Donation,
    Notification,
    RecipientProfile,
    User,
)
from backend.schemas import AdminVerifyRequest
from backend.services.notifications import notify_user
from backend.services.topsis import run_topsis_all_active
from backend.utils.logger import log_activity
from backend.utils.rate_limit import rate_limit_dependency

router = APIRouter()


@router.get("/admin/users")
async def admin_list_users(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    # Donors with profiles
    donors_result = await session.execute(
        text("""
            SELECT u.id, u.name, u.email, u.role, u.status,
                   dp.business_name, dp.business_type, dp.address,
                   dp.latitude, dp.longitude, dp.phone, dp.logo_url, dp.total_donations
            FROM users u
            LEFT JOIN donor_profiles dp ON dp.user_id = u.id
            WHERE u.role = 'donor'
        """)
    )
    donors = [dict(r._mapping) for r in donors_result.all()]

    # Recipients with profiles
    recipients_result = await session.execute(
        text("""
            SELECT u.id, u.name, u.email, u.role, u.status,
                   rp.institution_name, rp.institution_type, rp.address,
                   rp.latitude, rp.longitude, rp.phone, rp.resident_count,
                   rp.age_range, rp.health_condition, rp.daily_protein_need,
                   rp.daily_calorie_need, rp.daily_iron_need, rp.daily_vitamin_c_need,
                   rp.urgency_score, rp.emergency, rp.last_received_donation, rp.document_url
            FROM users u
            LEFT JOIN recipient_profiles rp ON rp.user_id = u.id
            WHERE u.role = 'recipient'
        """)
    )
    recipients = [dict(r._mapping) for r in recipients_result.all()]

    # Remove password field from each
    for d in donors:
        d.pop("password", None)
    for r in recipients:
        r.pop("password", None)

    return {"donors": donors, "recipients": recipients}


@router.post("/admin/users/{user_id}/verify", dependencies=[Depends(rate_limit_dependency(30, 60))])
async def admin_verify_user(
    user_id: int,
    body: AdminVerifyRequest,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    user = await session.execute(select(User).where(User.id == user_id))
    user = user.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.status = "verified"
    session.add(user)

    if body.urgency_score and user.role == "recipient":
        rp = await session.execute(
            select(RecipientProfile).where(RecipientProfile.user_id == user_id)
        )
        rp = rp.scalar_one_or_none()
        if rp:
            rp.urgency_score = int(body.urgency_score)
            session.add(rp)

    await session.commit()

    if user.role == "recipient":
        await run_topsis_all_active()

    await log_activity(session, current_user.id, "user_verifikasi", f"User {user_id} diverifikasi")
    return {"message": "User diverifikasi"}


@router.get("/admin/claims")
async def admin_list_claims(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    result = await session.execute(
        text("""
            SELECT c.*, d.food_name, rp.institution_name
            FROM claims c
            LEFT JOIN donations d ON d.id = c.donation_id
            LEFT JOIN recipient_profiles rp ON rp.user_id = c.recipient_id
            ORDER BY c.id DESC
        """)
    )
    return [dict(r._mapping) for r in result.all()]


@router.post("/admin/claims/{claim_id}/approve", dependencies=[Depends(rate_limit_dependency(30, 60))])
async def admin_approve_claim(
    claim_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    claim = await session.execute(select(Claim).where(Claim.id == claim_id))
    claim = claim.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.status != "pending":
        raise HTTPException(status_code=400, detail="Claim is not in pending status")

    # Update donation
    d = await session.execute(select(Donation).where(Donation.id == claim.donation_id))
    d = d.scalar_one_or_none()
    if not d or d.status not in ["active", "claimed"]:
        raise HTTPException(status_code=400, detail="Donation is no longer available")

    now = datetime.now(UTC).isoformat()
    claim.status = "approved"
    claim.reviewed_at = now
    claim.reviewed_by = current_user.id
    session.add(claim)

    if d:
        d.status = "claimed"
        d.claimed_by = claim.recipient_id
        d.claimed_at = now
        session.add(d)

    # Automatically reject other competing pending claims for the same donation
    competing = await session.execute(
        select(Claim).where(
            Claim.donation_id == claim.donation_id,
            Claim.id != claim_id,
            Claim.status == "pending",
        )
    )
    for cc in competing.scalars().all():
        cc.status = "rejected"
        cc.reviewed_at = now
        cc.reviewed_by = current_user.id
        session.add(cc)

    await session.flush()

    # Notify donor and recipient
    notify_ids = [claim.recipient_id]
    if d:
        notify_ids.append(d.donor_id)

    for uid in notify_ids:
        notif = Notification(
            user_id=uid,
            title="Claim Approved!",
            message=f"Donation {d.food_name if d else '#' + str(claim.donation_id)} has been approved. Check the latest status on your dashboard.",
            type="claim_approved",
            is_read=0,
            related_donation_id=claim.donation_id,
            created_at=now,
        )
        session.add(notif)
        await session.flush()
        await notify_user(uid, {
            "id": notif.id,
            "user_id": uid,
            "title": notif.title,
            "message": notif.message,
            "type": notif.type,
            "is_read": notif.is_read,
            "related_donation_id": notif.related_donation_id,
            "created_at": notif.created_at,
        })

    await session.commit()
    await log_activity(session, current_user.id, "klaim_setujui", f"Klaim #{claim_id} disetujui")
    return {"message": "Klaim disetujui"}


@router.post("/admin/users/{user_id}/emergency", dependencies=[Depends(rate_limit_dependency(20, 60))])
async def admin_toggle_emergency(
    user_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    rp = await session.execute(
        select(RecipientProfile).where(RecipientProfile.user_id == user_id)
    )
    rp = rp.scalar_one_or_none()
    if not rp:
        raise HTTPException(status_code=404, detail="Recipient profile not found")

    next_status = (
        "active" if rp.emergency == "pending"
        else "none" if rp.emergency == "active"
        else "pending"
    )
    rp.emergency = next_status
    session.add(rp)
    await session.commit()

    await run_topsis_all_active()
    return {"emergency": next_status}


@router.delete("/admin/users/{user_id}", dependencies=[Depends(rate_limit_dependency(10, 60))])
async def admin_delete_user(
    user_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    user = await session.execute(
        select(User).where(User.id == user_id)
    )
    user = user.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Tidak bisa menghapus admin")

    try:
        # Get donation IDs for cleanup
        donation_ids = await session.execute(
            select(Donation.id).where(Donation.donor_id == user_id)
        )
        donation_ids_list = donation_ids.scalars().all()

        for did in donation_ids_list:
            await session.execute(text("DELETE FROM claims WHERE donation_id = :did"), {"did": did})
            await session.execute(text("DELETE FROM topsis_results WHERE donation_id = :did"), {"did": did})
            await session.execute(text("DELETE FROM reviews WHERE donation_id = :did"), {"did": did})
            await session.execute(text("DELETE FROM notifications WHERE related_donation_id = :did"), {"did": did})

        await session.execute(text("DELETE FROM claims WHERE recipient_id = :uid"), {"uid": user_id})
        await session.execute(text("DELETE FROM topsis_results WHERE recipient_id = :uid"), {"uid": user_id})
        await session.execute(text("DELETE FROM reviews WHERE donor_id = :uid"), {"uid": user_id})
        await session.execute(text("DELETE FROM reviews WHERE recipient_id = :uid"), {"uid": user_id})
        await session.execute(text("DELETE FROM notifications WHERE user_id = :uid"), {"uid": user_id})
        await session.execute(text("DELETE FROM donations WHERE donor_id = :uid"), {"uid": user_id})
        await session.execute(text("DELETE FROM donations WHERE claimed_by = :uid"), {"uid": user_id})
        await session.execute(text("DELETE FROM donor_profiles WHERE user_id = :uid"), {"uid": user_id})
        await session.execute(text("DELETE FROM recipient_profiles WHERE user_id = :uid"), {"uid": user_id})
        await session.execute(text("DELETE FROM activity_logs WHERE user_id = :uid"), {"uid": user_id})
        await session.execute(text("DELETE FROM users WHERE id = :uid"), {"uid": user_id})
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal menghapus user: {e}")

    return {"message": f"User {user.role} berhasil dihapus"}


@router.get("/admin/search")
async def admin_search(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
    q: str = Query("", min_length=0),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    q = q.strip()
    if len(q) < 2:
        return {"donors": [], "recipients": [], "donations": [], "claims": []}

    like = f"%{q}%"

    donors = await session.execute(
        text("""
            SELECT u.id, u.name, u.email, u.status, dp.business_name, dp.business_type
            FROM users u
            LEFT JOIN donor_profiles dp ON dp.user_id = u.id
            WHERE u.role = 'donor'
            AND (dp.business_name LIKE :q OR u.email LIKE :q OR u.name LIKE :q)
        """),
        {"q": like},
    )

    recipients = await session.execute(
        text("""
            SELECT u.id, u.name, u.email, u.status, rp.institution_name, rp.institution_type
            FROM users u
            LEFT JOIN recipient_profiles rp ON rp.user_id = u.id
            WHERE u.role = 'recipient'
            AND (rp.institution_name LIKE :q OR u.email LIKE :q OR u.name LIKE :q)
        """),
        {"q": like},
    )

    donations = await session.execute(
        text("""
            SELECT d.*, dp.business_name as donor_name
            FROM donations d
            LEFT JOIN donor_profiles dp ON dp.user_id = d.donor_id
            WHERE d.food_name LIKE :q OR dp.business_name LIKE :q
        """),
        {"q": like},
    )

    claims = await session.execute(
        text("""
            SELECT c.*, d.food_name, rp.institution_name
            FROM claims c
            LEFT JOIN donations d ON d.id = c.donation_id
            LEFT JOIN recipient_profiles rp ON rp.user_id = c.recipient_id
            WHERE d.food_name LIKE :q OR rp.institution_name LIKE :q
        """),
        {"q": like},
    )

    return {
        "donors": [dict(r._mapping) for r in donors.all()],
        "recipients": [dict(r._mapping) for r in recipients.all()],
        "donations": [dict(r._mapping) for r in donations.all()],
        "claims": [dict(r._mapping) for r in claims.all()],
    }
