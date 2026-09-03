"""JWT authentication — sign, verify, cookie helpers, and middleware.

Mirrors server/auth.ts exactly:
- signToken(user) -> JWT string
- setAuthCookie(response, token) -> httpOnly cookie
- clearAuthCookie(response)
- authMiddleware -> FastAPI dependency
- requireRole(...roles) -> FastAPI dependency
"""
from __future__ import annotations

from collections.abc import Callable
from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, Response
from sqlmodel import select

from backend.config import settings
from backend.database import get_session_maker
from backend.models import User

# --- Password Hashing ---

def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# --- JWT ---

def sign_token(user: User) -> str:
    """Create a JWT token valid for 7 days."""
    payload = {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.name,
        "status": user.status,
        "exp": datetime.now(UTC) + timedelta(days=7),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_token(token: str) -> dict[str, Any]:
    """Decode and verify a JWT token. Raises 401 on failure."""
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid session")


# --- Cookie Helpers ---

def set_auth_cookie(res: Response, token: str) -> None:
    """Set the httpOnly auth cookie on the response.

    In production (Vercel HTTPS): always secure=True.
    Cross-origin deployments should set COOKIE_DOMAIN and use SameSite=None.
    Same-origin deployments use SameSite=Lax.
    """
    cross_origin = bool(settings.cookie_domain)
    res.set_cookie(
        key=settings.cookie_name,
        value=token,
        httponly=True,
        secure=settings.is_production,
        samesite="none" if cross_origin else "lax",
        domain=settings.cookie_domain or None,
        max_age=7 * 24 * 60 * 60,
        path="/",
    )


def clear_auth_cookie(res: Response) -> None:
    """Clear the auth cookie by setting an expired one."""
    res.delete_cookie(key=settings.cookie_name, path="/")


# --- FastAPI Dependencies ---

async def get_current_user(
    request: Request,
    response: Response,
) -> User:
    """Extract and verify JWT from httpOnly cookie.

    FastAPI dependency that replaces Express authMiddleware.
    """
    token = request.cookies.get(settings.cookie_name)
    if not token:
        raise HTTPException(status_code=401, detail="Not logged in")

    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except jwt.PyJWTError:
        clear_auth_cookie(response)
        raise HTTPException(status_code=401, detail="Invalid session")

    maker = get_session_maker()
    async with maker() as session:
        result = await session.execute(select(User).where(User.id == payload["id"]))
        user = result.scalar_one_or_none()
        if not user:
            clear_auth_cookie(response)
            raise HTTPException(status_code=401, detail="User not found")
        return user


def require_role(*roles: str) -> Callable[[User], User]:
    """Returns a FastAPI dependency that checks the current user's role.

    Usage: Depends(require_role("admin")) or Depends(require_role("donor", "admin"))
    """

    async def _role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Access denied")
        return current_user

    return _role_checker
