"""Rate limiting utility — in-memory sliding window with trusted proxy support.

Used as FastAPI dependencies on sensitive endpoints (login, register, etc.).
Fallback when slowapi is not available or for APIRouter compatibility.

Enhanced with trusted proxy support to prevent X-Forwarded-For spoofing.
"""
from __future__ import annotations

import time
from collections import defaultdict
from collections.abc import Callable

from fastapi import HTTPException, Request

# List of trusted proxy IPs (set via env in production)
TRUSTED_PROXIES: set[str] = set()


class _MemoryRateLimiter:
    """Simple in-memory sliding window rate limiter per IP + path."""

    def __init__(self) -> None:
        self._hits: dict[str, list[float]] = defaultdict(list)

    def check(self, key: str, max_requests: int, window_seconds: int) -> None:
        now = time.time()
        self._hits[key] = [t for t in self._hits.get(key, []) if t > now - window_seconds]
        if len(self._hits[key]) >= max_requests:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again later.",
            )
        self._hits[key].append(now)

    def cleanup(self) -> None:
        """Remove all expired entries to free memory."""
        now = time.time()
        for key in list(self._hits.keys()):
            self._hits[key] = [t for t in self._hits[key] if t > now - 120]
            if not self._hits[key]:
                del self._hits[key]


_limiter = _MemoryRateLimiter()


def _get_client_ip(request: Request) -> str:
    """Extract client IP from request, handling proxies securely.

    Only trusts X-Forwarded-For when the direct peer is a known trusted proxy.
    In development (no proxy), uses the direct connection IP.
    """
    peer_ip = request.client.host if request.client else "unknown"
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded and peer_ip in TRUSTED_PROXIES:
        return forwarded.split(",")[0].strip()
    return peer_ip


def rate_limit_dependency(
    max_requests: int = 10,
    window_seconds: int = 60,
) -> Callable:
    """Factory for rate limit FastAPI dependencies.

    Usage:
        @router.post("/login", dependencies=[Depends(rate_limit_dependency(10, 60))])
    """

    def _dependency(request: Request) -> None:
        ip = _get_client_ip(request)
        key = f"{ip}:{request.url.path}"
        _limiter.check(key, max_requests, window_seconds)

    return _dependency
