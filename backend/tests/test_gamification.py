"""Tests for gamification service — badge calculation."""
from __future__ import annotations

from backend.services.gamification import calculate_badges


class TestBadges:
    def test_no_donations(self):
        badges = calculate_badges(0, 0)
        assert badges == []

    def test_pemula(self):
        badges = calculate_badges(1, 0)
        names = [b["name"] for b in badges]
        assert "Beginner Donor" in names
        assert "Active Donor" not in names
        assert "Food Hero" not in names

    def test_aktif(self):
        badges = calculate_badges(5, 0)
        names = [b["name"] for b in badges]
        assert "Beginner Donor" in names
        assert "Active Donor" in names
        assert "Food Hero" not in names

    def test_pahlawan(self):
        badges = calculate_badges(10, 0)
        names = [b["name"] for b in badges]
        assert "Food Hero" in names
        assert "Donation Legend" not in names

    def test_legenda(self):
        badges = calculate_badges(20, 0)
        names = [b["name"] for b in badges]
        assert "Donation Legend" in names

    def test_favorit_penerima(self):
        badges = calculate_badges(1, 5)
        names = [b["name"] for b in badges]
        assert "Recipient Favorite" in names

    def test_all_badges(self):
        badges = calculate_badges(20, 5)
        assert len(badges) == 5
        expected = ["Beginner Donor", "Active Donor", "Food Hero", "Donation Legend", "Recipient Favorite"]
        assert [b["name"] for b in badges] == expected

    def test_badge_structure(self):
        badges = calculate_badges(1, 0)
        b = badges[0]
        assert "name" in b
        assert "icon" in b
        assert "desc" in b
        assert isinstance(b["name"], str)
        assert isinstance(b["icon"], str)
        assert isinstance(b["desc"], str)
