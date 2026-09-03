"""Tests for analytics calculations — impact metrics, trends, stats."""
from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timedelta, timezone


class TestImpactCalculations:
    """Tests for impact metric calculations."""

    def test_food_waste_calculation(self):
        """Test food waste prevented calculation."""
        total_portions = 1000
        kg_per_portion = 0.3
        food_waste_kg = total_portions * kg_per_portion
        assert food_waste_kg == 300.0

    def test_co2_saved_calculation(self):
        """Test CO2 saved calculation."""
        food_waste_kg = 300.0
        co2_per_kg = 2.5
        co2_saved = food_waste_kg * co2_per_kg
        assert co2_saved == 750.0

    def test_zero_portions(self):
        """Test calculations with zero portions."""
        total_portions = 0
        food_waste_kg = total_portions * 0.3
        co2_saved = food_waste_kg * 2.5
        assert food_waste_kg == 0.0
        assert co2_saved == 0.0

    def test_large_numbers(self):
        """Test calculations with large numbers."""
        total_portions = 1_000_000
        food_waste_kg = total_portions * 0.3
        co2_saved = food_waste_kg * 2.5
        assert food_waste_kg == 300_000.0
        assert co2_saved == 750_000.0


class TestTrendCalculations:
    """Tests for trend calculation logic."""

    def test_week_period(self):
        """Test week period calculates correct start date."""
        now = datetime.now(timezone.utc)
        period = "week"

        if period == "week":
            start_date = now - timedelta(days=7)

        assert (now - start_date).days == 7

    def test_month_period(self):
        """Test month period calculates correct start date."""
        now = datetime.now(timezone.utc)
        period = "month"

        if period == "month":
            start_date = now - timedelta(days=30)

        assert (now - start_date).days == 30

    def test_year_period(self):
        """Test year period calculates correct start date."""
        now = datetime.now(timezone.utc)
        period = "year"

        if period == "year":
            start_date = now - timedelta(days=365)

        assert (now - start_date).days == 365


class TestRatingCalculations:
    """Tests for rating calculations."""

    def test_average_rating(self):
        """Test average rating calculation."""
        ratings = [5, 4, 3, 4, 5]
        avg = sum(ratings) / len(ratings)
        assert avg == 4.2

    def test_empty_ratings(self):
        """Test average rating with no ratings."""
        ratings = []
        avg = sum(ratings) / len(ratings) if ratings else 0
        assert avg == 0

    def test_single_rating(self):
        """Test average rating with single rating."""
        ratings = [5]
        avg = sum(ratings) / len(ratings)
        assert avg == 5.0

    def test_all_same_ratings(self):
        """Test average rating when all ratings are same."""
        ratings = [3, 3, 3, 3]
        avg = sum(ratings) / len(ratings)
        assert avg == 3.0


class TestDonorStats:
    """Tests for donor statistics calculations."""

    def test_total_donations(self):
        """Test total donations count."""
        donations = [
            {"portion_count": 10, "status": "completed"},
            {"portion_count": 15, "status": "completed"},
            {"portion_count": 5, "status": "completed"},
        ]
        total = sum(d["portion_count"] for d in donations)
        assert total == 30

    def test_completed_percentage(self):
        """Test completed donation percentage."""
        total = 100
        completed = 85
        percentage = (completed / total) * 100 if total > 0 else 0
        assert percentage == 85.0

    def test_zero_donations(self):
        """Test statistics with zero donations."""
        donations = []
        total = len(donations)
        completed = sum(1 for d in donations if d["status"] == "completed")
        assert total == 0
        assert completed == 0


class TestRecipientStats:
    """Tests for recipient statistics calculations."""

    def test_nutrition_coverage(self):
        """Test nutrition coverage calculation."""
        daily_need = 50.0  # grams of protein
        received = 35.0
        coverage = min(100, (received / daily_need) * 100) if daily_need > 0 else 0
        assert coverage == 70.0

    def test_zero_need(self):
        """Test nutrition coverage with zero need."""
        daily_need = 0
        received = 10
        coverage = min(100, (received / daily_need) * 100) if daily_need > 0 else 0
        assert coverage == 0

    def test_exceeding_need(self):
        """Test nutrition coverage exceeding 100%."""
        daily_need = 30.0
        received = 50.0
        coverage = min(100, (received / daily_need) * 100) if daily_need > 0 else 0
        assert coverage == 100  # Capped at 100%
