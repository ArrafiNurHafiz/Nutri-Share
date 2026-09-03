"""Gamification service — badge calculation.

Mirrors server/routes.ts lines 552-563.
"""
from __future__ import annotations


def calculate_badges(total_donations: int, review_count: int) -> list[dict[str, str]]:
    """Calculate badges for a donor based on their stats."""
    badges: list[dict[str, str]] = []
    if total_donations >= 1:
        badges.append({"name": "Beginner Donor", "icon": "🌱", "desc": "Your first donation!"})
    if total_donations >= 5:
        badges.append({"name": "Active Donor", "icon": "⭐", "desc": "5 donations distributed"})
    if total_donations >= 10:
        badges.append({"name": "Food Hero", "icon": "🏆", "desc": "10 donations — amazing impact!"})
    if total_donations >= 20:
        badges.append({"name": "Donation Legend", "icon": "👑", "desc": "20+ donations, truly inspiring!"})
    if review_count >= 5:
        badges.append({"name": "Recipient Favorite", "icon": "❤️", "desc": "5+ positive reviews from recipients"})
    return badges
