"""Auth routes — register, login, logout, me, forgot/reset password, profile update.

Mirrors server/routes.ts lines 18-170.
"""
from __future__ import annotations

import secrets
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlmodel import select

from backend.auth import (
    clear_auth_cookie,
    get_current_user,
    hash_password,
    set_auth_cookie,
    sign_token,
    verify_password,
)
from backend.config import settings
from backend.dependencies import SessionDep
from backend.models import (
    DonorProfile,
    RecipientProfile,
    User,
)
from backend.schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterAdminRequest,
    RegisterDonorRequest,
    RegisterRecipientRequest,
    ResetPasswordRequest,
    UpdateProfileRequest,
)
from backend.utils.logger import logger, log_activity
from backend.utils.rate_limit import rate_limit_dependency

router = APIRouter()


@router.post("/auth/register/admin", dependencies=[Depends(rate_limit_dependency(10, 60))])
async def register_admin(
    body: RegisterAdminRequest,
    session: SessionDep,
    response: Response,
):
    admin_key = settings.admin_secret_key
    if body.admin_key != admin_key:
        raise HTTPException(status_code=403, detail="Invalid admin key")

    existing = await session.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email is already registered")

    hashed = hash_password(body.password)
    user = User(
        name=body.name,
        email=body.email,
        password=hashed,
        role="admin",
        status="verified",
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    return {
        "message": "Admin created successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "status": user.status,
        },
    }


@router.post("/auth/login", dependencies=[Depends(rate_limit_dependency(30, 60))])
async def login(
    body: LoginRequest,
    session: SessionDep,
    response: Response,
):
    result = await session.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password):
        logger.debug("login_failed", email=body.email, user_found=user is not None)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    logger.debug("login_check", email=user.email, status=user.status, role=user.role)
    if user.status != "verified" and user.role != "admin":
        raise HTTPException(status_code=403, detail="Your account has not been verified by an admin yet.")

    token = sign_token(user)
    set_auth_cookie(response, token)

    await log_activity(session, user.id, "login", f"User {user.role} login")

    profile = None
    if user.role == "donor":
        p = await session.execute(
            select(DonorProfile).where(DonorProfile.user_id == user.id)
        )
        profile = p.scalar_one_or_none()
    elif user.role == "recipient":
        p = await session.execute(
            select(RecipientProfile).where(RecipientProfile.user_id == user.id)
        )
        profile = p.scalar_one_or_none()

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "status": user.status,
        },
        "profile": profile,
    }


@router.post("/auth/logout")
async def logout(response: Response):
    clear_auth_cookie(response)
    return {"message": "Logout successful"}


@router.get("/auth/me")
async def get_me(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    """Return the current authenticated user and their profile."""
    profile = None
    if current_user.role == "donor":
        p = await session.execute(
            select(DonorProfile).where(DonorProfile.user_id == current_user.id)
        )
        profile = p.scalar_one_or_none()
    elif current_user.role == "recipient":
        p = await session.execute(
            select(RecipientProfile).where(RecipientProfile.user_id == current_user.id)
        )
        profile = p.scalar_one_or_none()

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role,
            "status": current_user.status,
        },
        "profile": profile,
    }


@router.post("/auth/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, session: SessionDep):
    result = await session.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Email is not registered")

    reset_token = "".join(secrets.choice("abcdefghijklmnopqrstuvwxyz0123456789") for _ in range(32))
    expiry = (datetime.now(UTC) + timedelta(hours=1)).isoformat()
    user.reset_token = reset_token
    user.reset_token_expiry = expiry
    session.add(user)
    await session.commit()

    response = {"message": "Link reset password telah dikirim"}
    if not settings.is_production:
        response["resetToken"] = reset_token
    return response


@router.post("/auth/reset-password")
async def reset_password(body: ResetPasswordRequest, session: SessionDep):
    now = datetime.now(UTC).isoformat()
    result = await session.execute(
        select(User).where(
            User.reset_token == body.token,
            User.reset_token_expiry > now,
        )
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user.password = hash_password(body.password)
    user.reset_token = None
    user.reset_token_expiry = None
    session.add(user)
    await session.commit()
    return {"message": "Password reset successfully. Please log in."}


@router.post("/auth/register/donor", dependencies=[Depends(rate_limit_dependency(5, 60))])
async def register_donor(body: RegisterDonorRequest, session: SessionDep):
    existing = await session.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email is already registered")

    hashed = hash_password(body.password)
    user = User(
        name=body.business_name,
        email=body.email,
        password=hashed,
        role="donor",
        status="pending",
    )
    session.add(user)
    await session.flush()

    profile = DonorProfile(
        user_id=user.id,
        business_name=body.business_name,
        business_type=body.business_type,
        address=body.address,
        latitude=float(body.latitude),
        longitude=float(body.longitude),
        phone=body.phone,
    )
    session.add(profile)
    await session.commit()
    return {"message": "Registration successful. Awaiting admin verification."}


@router.post("/auth/register/recipient", dependencies=[Depends(rate_limit_dependency(5, 60))])
async def register_recipient(body: RegisterRecipientRequest, session: SessionDep):
    existing = await session.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email is already registered")

    hashed = hash_password(body.password)
    user = User(
        name=body.institution_name,
        email=body.email,
        password=hashed,
        role="recipient",
        status="pending",
    )
    session.add(user)
    await session.flush()

    profile = RecipientProfile(
        user_id=user.id,
        institution_name=body.institution_name,
        institution_type=body.institution_type,
        address=body.address,
        latitude=float(body.latitude),
        longitude=float(body.longitude),
        phone=body.phone,
        resident_count=int(body.resident_count),
        age_range=body.age_range,
        health_condition=body.health_condition,
        daily_protein_need=float(body.daily_protein_need),
        daily_calorie_need=float(body.daily_calorie_need),
        daily_iron_need=float(body.daily_iron_need),
        daily_vitamin_c_need=float(body.daily_vitamin_c_need),
    )
    session.add(profile)
    await session.commit()
    return {"message": "Registration successful. Awaiting admin verification."}


def _safe_float(val: str | None, default: float = 0.0) -> float:
    """Convert a string to float, returning default on empty or invalid input."""
    if not val:
        return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


def _safe_int(val: str | None, default: int = 0) -> int:
    """Convert a string to int, returning default on empty or invalid input."""
    if not val:
        return default
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return default


@router.put("/users/{user_id}/profile", dependencies=[Depends(rate_limit_dependency(10, 60))])
async def update_profile(
    user_id: int,
    body: UpdateProfileRequest,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    user = await session.execute(select(User).where(User.id == user_id))
    user = user.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if body.name:
        user.name = body.name
    if body.email:
        user.email = body.email
    if body.password:
        user.password = hash_password(body.password)

    if user.role == "donor":
        p = await session.execute(select(DonorProfile).where(DonorProfile.user_id == user_id))
        p = p.scalar_one_or_none()
        if p:
            if body.business_name:
                p.business_name = body.business_name
            if body.business_type:
                p.business_type = body.business_type
            if body.address:
                p.address = body.address
            if body.latitude:
                p.latitude = _safe_float(body.latitude)
            if body.longitude:
                p.longitude = _safe_float(body.longitude)
            if body.phone:
                p.phone = body.phone
            if body.logo_url is not None:
                p.logo_url = body.logo_url
            session.add(p)

    elif user.role == "recipient":
        p = await session.execute(
            select(RecipientProfile).where(RecipientProfile.user_id == user_id)
        )
        p = p.scalar_one_or_none()
        if p:
            if body.institution_name:
                p.institution_name = body.institution_name
            if body.institution_type:
                p.institution_type = body.institution_type
            if body.address:
                p.address = body.address
            if body.latitude:
                p.latitude = _safe_float(body.latitude)
            if body.longitude:
                p.longitude = _safe_float(body.longitude)
            if body.phone:
                p.phone = body.phone
            if body.logo_url is not None:
                p.document_url = body.logo_url
            if body.resident_count:
                p.resident_count = _safe_int(body.resident_count)
            if body.daily_protein_need:
                p.daily_protein_need = _safe_float(body.daily_protein_need)
            if body.daily_calorie_need:
                p.daily_calorie_need = _safe_float(body.daily_calorie_need)
            if body.daily_iron_need:
                p.daily_iron_need = _safe_float(body.daily_iron_need)
            if body.daily_vitamin_c_need:
                p.daily_vitamin_c_need = _safe_float(body.daily_vitamin_c_need)
            session.add(p)

    session.add(user)
    await session.commit()
    await session.refresh(user)

    profile = None
    if user.role == "donor":
        pp = await session.execute(select(DonorProfile).where(DonorProfile.user_id == user_id))
        profile = pp.scalar_one_or_none()
    elif user.role == "recipient":
        pp = await session.execute(
            select(RecipientProfile).where(RecipientProfile.user_id == user_id)
        )
        profile = pp.scalar_one_or_none()

    return {
        "message": "Profile updated successfully",
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role, "status": user.status},
        "profile": profile,
    }
