"""Tests for auth module — hashing, JWT, and configuration."""
from __future__ import annotations

import jwt
import pytest

from backend.auth import decode_token, hash_password, sign_token, verify_password
from backend.config import settings
from backend.models import User


class TestPasswordHashing:
    def test_hash_and_verify(self):
        pwd = "test123"
        hashed = hash_password(pwd)
        assert hashed != pwd
        assert verify_password(pwd, hashed) is True

    def test_wrong_password_fails(self):
        hashed = hash_password("correct")
        assert verify_password("wrong", hashed) is False

    def test_empty_password(self):
        hashed = hash_password("")
        assert verify_password("", hashed) is True
        assert verify_password("x", hashed) is False


class TestJWT:
    def make_user(self, **overrides) -> User:
        defaults = dict(id=1, name="Test", email="test@test.com", role="donor", status="verified")
        return User(**{**defaults, **overrides})

    def test_sign_and_decode(self):
        user = self.make_user()
        token = sign_token(user)
        payload = decode_token(token)
        assert payload["id"] == 1
        assert payload["role"] == "donor"
        assert payload["email"] == "test@test.com"

    def test_expired_token(self):
        from datetime import UTC, datetime, timedelta

        user = self.make_user()
        payload = {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "name": user.name,
            "status": user.status,
            "exp": datetime.now(UTC) - timedelta(hours=1),
        }
        token = jwt.encode(payload, settings.jwt_secret, algorithm="HS256")
        with pytest.raises(Exception):
            decode_token(token)

    def test_invalid_signature(self):
        token = jwt.encode({"id": 1}, "wrong-secret-key-at-least-32-characters-long!", algorithm="HS256")
        with pytest.raises(Exception):
            decode_token(token)

    def test_token_contains_user_info(self):
        user = self.make_user(id=42, name="Budi", role="admin", status="verified")
        token = sign_token(user)
        payload = decode_token(token)
        assert payload["id"] == 42
        assert payload["name"] == "Budi"
        assert payload["role"] == "admin"
        assert payload["status"] == "verified"
        assert "exp" in payload
