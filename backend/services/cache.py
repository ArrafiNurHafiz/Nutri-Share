"""In-memory cache service for TOPSIS results and frequently accessed data.

This can be swapped to Redis in production by implementing the same interface.
"""
from __future__ import annotations

import time
from collections.abc import Callable
from typing import Any


class _MemoryCache:
    """Simple in-memory cache with TTL (Time-To-Live) support."""

    def __init__(self) -> None:
        self._store: dict[str, tuple[Any, float]] = {}

    def get(self, key: str) -> Any | None:
        """Get value if exists and not expired."""
        if key in self._store:
            value, expiry = self._store[key]
            if time.time() < expiry:
                return value
            del self._store[key]
        return None

    def set(self, key: str, value: Any, ttl_seconds: int = 300) -> None:
        """Set value with TTL (default 5 minutes)."""
        self._store[key] = (value, time.time() + ttl_seconds)

    def invalidate(self, key: str) -> None:
        """Remove a specific key from cache."""
        self._store.pop(key, None)

    def invalidate_pattern(self, pattern: str) -> None:
        """Remove all keys matching a pattern (simple prefix match)."""
        keys_to_remove = [k for k in self._store if pattern in k]
        for key in keys_to_remove:
            del self._store[key]

    def clear(self) -> None:
        """Clear all cached data."""
        self._store.clear()

    def cleanup(self) -> None:
        """Remove all expired entries."""
        now = time.time()
        expired = [k for k, (_, exp) in self._store.items() if now >= exp]
        for key in expired:
            del self._store[key]


# Global cache instance
cache = _MemoryCache()


def cached(ttl_seconds: int = 300, key_prefix: str = "") -> Callable:
    """Decorator for caching function results.

    Usage:
        @cached(ttl_seconds=300, key_prefix="topsis")
        async def calculate_topsis(donation_id: int) -> dict:
            ...
    """

    def decorator(func: Callable) -> Callable:
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            # Build cache key from function name, args, and kwargs
            key_parts = [key_prefix or func.__name__]
            key_parts.extend(str(a) for a in args)
            key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
            cache_key = ":".join(key_parts)

            # Check cache first
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value

            # Execute function and cache result
            result = await func(*args, **kwargs)
            cache.set(cache_key, result, ttl_seconds)
            return result

        wrapper.__name__ = func.__name__
        wrapper.__doc__ = func.__doc__
        return wrapper

    return decorator
