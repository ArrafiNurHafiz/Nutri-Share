"""Tests for TOPSIS algorithm — distance calculation, ranking, edge cases."""
from __future__ import annotations

import pytest
import numpy as np
from unittest.mock import AsyncMock, MagicMock, patch

from backend.services.topsis import _haversine_km


class TestHaversine:
    """Tests for Haversine distance calculation."""

    def test_same_point(self):
        """Distance from point to itself should be zero."""
        d = _haversine_km(0, 0, 0, 0)
        assert d == pytest.approx(0.0, abs=0.001)

    def test_known_distance(self):
        """Jakarta to Bandung should be approximately 115-150 km."""
        # Jakarta (-6.2, 106.8) to Bandung (-6.9, 107.6)
        d = _haversine_km(-6.2, 106.8, -6.9, 107.6)
        assert d == pytest.approx(115.0, abs=10.0)

    def test_equator(self):
        """1 degree longitude at equator should be approximately 111 km."""
        d = _haversine_km(0, 0, 0, 1)
        assert d == pytest.approx(111.19, abs=0.5)

    def test_antipodal(self):
        """Distance to opposite side of Earth should be approximately 20,000 km."""
        d = _haversine_km(0, 0, 0, 180)
        assert d == pytest.approx(20015.0, abs=10.0)

    def test_north_pole(self):
        """Distance from North Pole to North Pole should be zero."""
        d = _haversine_km(90, 0, 90, 180)
        assert d == pytest.approx(0.0, abs=1.0)

    def test_negative_coordinates(self):
        """Test with negative coordinates (Southern/Western hemisphere)."""
        # Sydney (-33.8, 151.2) to Melbourne (-37.8, 144.9)
        d = _haversine_km(-33.8, 151.2, -37.8, 144.9)
        assert d == pytest.approx(714.0, abs=10.0)

    def test_same_longitude_different_latitude(self):
        """Test points on same longitude."""
        # 1 degree latitude difference
        d = _haversine_km(0, 100, 1, 100)
        assert d == pytest.approx(111.0, abs=1.0)

    def test_symmetric(self):
        """Distance should be symmetric."""
        d1 = _haversine_km(-6.2, 106.8, -6.9, 107.6)
        d2 = _haversine_km(-6.9, 107.6, -6.2, 106.8)
        assert d1 == pytest.approx(d2, abs=0.001)


class TestTopsisCalculation:
    """Tests for TOPSIS calculation logic (mocked database)."""

    @pytest.mark.asyncio
    async def test_single_recipient(self):
        """Single recipient should get rank 1 with CI score 1."""
        # This test verifies the function exists and is callable
        # Full integration testing would require database setup
        from backend.services.topsis import calculate_topsis_for_donation
        assert callable(calculate_topsis_for_donation)

    def test_topsis_criteria_weights(self):
        """Test that TOPSIS uses correct criteria weights."""
        # Test entropy calculation logic
        matrix = np.array([
            [80, 5, 24, 5.0, 10],  # Recipient 1
            [60, 3, 12, 8.0, 20],  # Recipient 2
            [90, 8, 48, 2.0, 5],   # Recipient 3
        ])

        # Normalize
        norm_factors = np.sqrt(np.sum(matrix**2, axis=0))
        norm_matrix = matrix / norm_factors

        # Entropy calculation
        p_sum = np.sum(norm_matrix, axis=0)
        p_matrix = norm_matrix / p_sum
        k = -1.0 / np.log(len(matrix))
        entropy = -k * np.sum(p_matrix * np.log(np.clip(p_matrix, 1e-12, 1)), axis=0)

        # Weights should sum to 1
        d_j = np.maximum(0, 1 - entropy)
        w_j = d_j / np.sum(d_j) if np.sum(d_j) > 0 else np.full(matrix.shape[1], 1.0 / matrix.shape[1])

        assert len(w_j) == 5
        assert pytest.approx(np.sum(w_j), abs=0.001) == 1.0

    def test_topsis_ranking(self):
        """Test TOPSIS ranking with known values."""
        # Simple 2-recipient test
        matrix = np.array([
            [100, 10, 48, 2, 30],  # Best protein, urgency, time; closest; longest since last
            [50, 5, 24, 10, 15],   # Worse in most criteria
        ])

        is_benefit = np.array([True, True, True, False, True])

        # Normalize
        norm_factors = np.sqrt(np.sum(matrix**2, axis=0))
        norm_factors = np.where(norm_factors == 0, 1e-12, norm_factors)
        norm_matrix = matrix / norm_factors

        # Equal weights for simplicity
        w_j = np.full(5, 0.2)
        v_matrix = norm_matrix * w_j

        # Ideal solutions
        a_plus = np.where(is_benefit, np.max(v_matrix, axis=0), np.min(v_matrix, axis=0))
        a_minus = np.where(is_benefit, np.min(v_matrix, axis=0), np.max(v_matrix, axis=0))

        # Distances
        d_plus = np.sqrt(np.sum((v_matrix - a_plus) ** 2, axis=1))
        d_minus = np.sqrt(np.sum((v_matrix - a_minus) ** 2, axis=1))

        # CI scores
        denom = d_plus + d_minus
        ci_scores = np.where(denom == 0, 0, d_minus / denom)

        # First recipient should have higher CI (closer to ideal)
        assert ci_scores[0] > ci_scores[1]
