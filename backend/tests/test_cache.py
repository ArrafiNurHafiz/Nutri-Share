"""Tests for cache service — set, get, TTL, invalidate, cleanup."""
from __future__ import annotations

import time
import pytest
from unittest.mock import patch

from backend.services.cache import _MemoryCache, cache, cached


class TestMemoryCache:
    """Tests for _MemoryCache class."""

    def setup_method(self):
        """Clear cache before each test."""
        self.cache = _MemoryCache()

    def test_set_and_get(self):
        """Test basic set and get operations."""
        self.cache.set("key1", "value1")
        assert self.cache.get("key1") == "value1"

    def test_get_nonexistent_key(self):
        """Test get returns None for nonexistent key."""
        assert self.cache.get("nonexistent") is None

    def test_set_overwrites_existing(self):
        """Test set overwrites existing value."""
        self.cache.set("key1", "value1")
        self.cache.set("key1", "value2")
        assert self.cache.get("key1") == "value2"

    def test_ttl_expiration(self):
        """Test cache expires after TTL."""
        self.cache.set("key1", "value1", ttl_seconds=1)
        assert self.cache.get("key1") == "value1"

        # Wait for expiration
        time.sleep(1.1)
        assert self.cache.get("key1") is None

    def test_different_ttl_values(self):
        """Test different TTL values."""
        self.cache.set("short", "value", ttl_seconds=1)
        self.cache.set("long", "value", ttl_seconds=10)

        time.sleep(1.1)
        assert self.cache.get("short") is None
        assert self.cache.get("long") == "value"

    def test_invalidate_existing_key(self):
        """Test invalidate removes existing key."""
        self.cache.set("key1", "value1")
        self.cache.invalidate("key1")
        assert self.cache.get("key1") is None

    def test_invalidate_nonexistent_key(self):
        """Test invalidate on nonexistent key doesn't raise error."""
        self.cache.invalidate("nonexistent")  # Should not raise

    def test_invalidate_pattern(self):
        """Test invalidate_pattern removes matching keys."""
        self.cache.set("user:1:name", "Alice")
        self.cache.set("user:1:email", "alice@test.com")
        self.cache.set("user:2:name", "Bob")

        self.cache.invalidate_pattern("user:1")

        assert self.cache.get("user:1:name") is None
        assert self.cache.get("user:1:email") is None
        assert self.cache.get("user:2:name") == "Bob"

    def test_clear(self):
        """Test clear removes all entries."""
        self.cache.set("key1", "value1")
        self.cache.set("key2", "value2")
        self.cache.clear()

        assert self.cache.get("key1") is None
        assert self.cache.get("key2") is None

    def test_cleanup_removes_expired(self):
        """Test cleanup removes expired entries."""
        self.cache.set("expired", "value", ttl_seconds=1)
        self.cache.set("valid", "value", ttl_seconds=10)

        time.sleep(1.1)
        self.cache.cleanup()

        assert self.cache.get("expired") is None
        assert self.cache.get("valid") == "value"

    def test_store_various_types(self):
        """Test storing various data types."""
        self.cache.set("string", "hello")
        self.cache.set("int", 42)
        self.cache.set("list", [1, 2, 3])
        self.cache.set("dict", {"key": "value"})
        self.cache.set("none", None)

        assert self.cache.get("string") == "hello"
        assert self.cache.get("int") == 42
        assert self.cache.get("list") == [1, 2, 3]
        assert self.cache.get("dict") == {"key": "value"}
        assert self.cache.get("none") is None


class TestGlobalCache:
    """Tests for the global cache instance."""

    def test_global_cache_exists(self):
        """Test global cache instance exists."""
        assert cache is not None
        assert isinstance(cache, _MemoryCache)

    def test_global_cache_isolation(self):
        """Test global cache works independently."""
        cache.set("test_key", "test_value")
        assert cache.get("test_key") == "test_value"
        cache.invalidate("test_key")


class TestCachedDecorator:
    """Tests for the cached decorator."""

    def setup_method(self):
        """Clear cache before each test."""
        cache.clear()

    @pytest.mark.asyncio
    async def test_cached_caches_result(self):
        """Test cached decorator caches function result."""
        call_count = 0

        @cached(ttl_seconds=60)
        async def expensive_function(x: int) -> int:
            nonlocal call_count
            call_count += 1
            return x * 2

        result1 = await expensive_function(5)
        result2 = await expensive_function(5)

        assert result1 == 10
        assert result2 == 10
        assert call_count == 1  # Function called only once

    @pytest.mark.asyncio
    async def test_cached_different_args(self):
        """Test cached decorator differentiates by arguments."""
        call_count = 0

        @cached(ttl_seconds=60)
        async def multiply(x: int, y: int) -> int:
            nonlocal call_count
            call_count += 1
            return x * y

        result1 = await multiply(2, 3)
        result2 = await multiply(4, 5)

        assert result1 == 6
        assert result2 == 20
        assert call_count == 2

    @pytest.mark.asyncio
    async def test_cached_with_key_prefix(self):
        """Test cached decorator with custom key prefix."""
        @cached(ttl_seconds=60, key_prefix="custom")
        async def my_function() -> str:
            return "result"

        await my_function()
        # Check that the key uses the custom prefix instead of function name
        assert cache.get("custom") == "result"

    @pytest.mark.asyncio
    async def test_cached_respects_ttl(self):
        """Test cached decorator respects TTL."""
        call_count = 0

        @cached(ttl_seconds=1)
        async def short_ttl() -> int:
            nonlocal call_count
            call_count += 1
            return 42

        await short_ttl()
        assert call_count == 1

        time.sleep(1.1)

        await short_ttl()
        assert call_count == 2  # Function called again after TTL
