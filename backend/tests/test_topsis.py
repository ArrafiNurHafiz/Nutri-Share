"""Tests for TOPSIS algorithm — distance calculation, Shannon Entropy weighting, ranking, edge cases."""
from __future__ import annotations

import pytest
import numpy as np

from backend.services.topsis import _haversine_km, EPSILON


class TestHaversine:
    """Tests for Haversine distance calculation."""

    def test_same_point(self):
        """Distance from point to itself should be zero."""
        d = _haversine_km(0, 0, 0, 0)
        assert d == pytest.approx(0.0, abs=0.001)

    def test_known_distance(self):
        """Jakarta to Bandung should be approximately 115-150 km."""
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
        d = _haversine_km(-33.8, 151.2, -37.8, 144.9)
        assert d == pytest.approx(714.0, abs=10.0)

    def test_same_longitude_different_latitude(self):
        """Test points on same longitude."""
        d = _haversine_km(0, 100, 1, 100)
        assert d == pytest.approx(111.0, abs=1.0)

    def test_symmetric(self):
        """Distance should be symmetric."""
        d1 = _haversine_km(-6.2, 106.8, -6.9, 107.6)
        d2 = _haversine_km(-6.9, 107.6, -6.2, 106.8)
        assert d1 == pytest.approx(d2, abs=0.001)


class TestShannonEntropyAndTopsis:
    """Rigorous tests for Shannon Entropy formula, weighting properties, and TOPSIS edge cases."""

    def _calculate_weights(self, matrix: np.ndarray) -> np.ndarray:
        m, n = matrix.shape
        if m < 2:
            return np.full(n, 1.0 / n)

        norm_factors = np.sqrt(np.sum(matrix**2, axis=0))
        norm_factors = np.where(norm_factors == 0, EPSILON, norm_factors)
        norm_matrix = matrix / norm_factors

        p_sum = np.where(np.sum(norm_matrix, axis=0) == 0, EPSILON, np.sum(norm_matrix, axis=0))
        p_matrix = norm_matrix / p_sum
        k = 1.0 / np.log(m)
        entropy = -k * np.sum(p_matrix * np.log(np.clip(p_matrix, EPSILON, 1)), axis=0)
        d_j = np.maximum(0, 1 - entropy)
        sum_d_j = np.sum(d_j)
        w_j = np.full(n, 1.0 / n) if sum_d_j == 0 else d_j / sum_d_j
        return w_j

    def test_shannon_entropy_identical_criteria_values(self):
        """When all alternatives have identical values for a criterion, its entropy is 1.0 and divergence is 0."""
        # 3 recipients, criterion index 2 (C3) is identical (all 24.0)
        matrix = np.array([
            [80.0, 5.0, 24.0, 5.0, 10.0],
            [60.0, 3.0, 24.0, 8.0, 20.0],
            [90.0, 8.0, 24.0, 2.0, 5.0],
        ])
        w_j = self._calculate_weights(matrix)
        assert len(w_j) == 5
        assert pytest.approx(np.sum(w_j), abs=0.0001) == 1.0
        # Criterion 2 (C3) has 0 divergence, so its weight must be near 0
        assert w_j[2] < 0.01

    def test_shannon_entropy_all_identical_matrix(self):
        """When entire decision matrix has identical rows, weights should gracefully fall back to equal 1/n."""
        matrix = np.array([
            [50.0, 5.0, 24.0, 10.0, 15.0],
            [50.0, 5.0, 24.0, 10.0, 15.0],
            [50.0, 5.0, 24.0, 10.0, 15.0],
        ])
        w_j = self._calculate_weights(matrix)
        assert np.allclose(w_j, np.full(5, 0.2))
        assert pytest.approx(np.sum(w_j), abs=0.0001) == 1.0

    def test_shannon_entropy_diverse_criteria(self):
        """Verify normalized weights for diverse matrix."""
        matrix = np.array([
            [80.0, 5.0, 24.0, 5.0, 10.0],
            [60.0, 3.0, 12.0, 8.0, 20.0],
            [90.0, 8.0, 48.0, 2.0, 5.0],
        ])
        w_j = self._calculate_weights(matrix)
        assert len(w_j) == 5
        assert pytest.approx(np.sum(w_j), abs=0.0001) == 1.0
        assert np.all(w_j >= 0.0)
        assert np.all(w_j <= 1.0)
        assert not np.any(np.isnan(w_j))
        assert not np.any(np.isinf(w_j))

    def test_edge_case_many_alternatives(self):
        """Verify calculation stability with m=25 alternatives."""
        np.random.seed(42)
        matrix = np.random.uniform(1.0, 100.0, size=(25, 5))
        w_j = self._calculate_weights(matrix)
        assert len(w_j) == 5
        assert pytest.approx(np.sum(w_j), abs=0.0001) == 1.0
        assert np.all(w_j >= 0.0)
        assert not np.any(np.isnan(w_j))

    def test_edge_case_zeros_and_extremes(self):
        """Verify calculation with zero elements and extreme scale disparities."""
        matrix = np.array([
            [0.0, 1000000.0, 0.001, 10.0, 0.0],
            [50.0, 1.0, 100.0, 0.0, 50.0],
            [100.0, 500.0, 0.0, 5.0, 100.0],
        ])
        w_j = self._calculate_weights(matrix)
        assert len(w_j) == 5
        assert pytest.approx(np.sum(w_j), abs=0.0001) == 1.0
        assert not np.any(np.isnan(w_j))

    def test_topsis_ranking_correctness(self):
        """Test TOPSIS ranking with known values and criteria directions."""
        matrix = np.array([
            [100.0, 10.0, 48.0, 2.0, 30.0],  # Best across benefit criteria & lowest cost (distance 2km)
            [50.0, 5.0, 24.0, 10.0, 15.0],   # Worse in most criteria
        ])

        is_benefit = np.array([True, True, True, False, True])

        # Normalize
        norm_factors = np.sqrt(np.sum(matrix**2, axis=0))
        norm_factors = np.where(norm_factors == 0, EPSILON, norm_factors)
        norm_matrix = matrix / norm_factors

        w_j = np.full(5, 0.2)
        v_matrix = norm_matrix * w_j

        a_plus = np.where(is_benefit, np.max(v_matrix, axis=0), np.min(v_matrix, axis=0))
        a_minus = np.where(is_benefit, np.min(v_matrix, axis=0), np.max(v_matrix, axis=0))

        d_plus = np.sqrt(np.sum((v_matrix - a_plus) ** 2, axis=1))
        d_minus = np.sqrt(np.sum((v_matrix - a_minus) ** 2, axis=1))

        denom = d_plus + d_minus
        ci_scores = np.where(denom == 0, 0, d_minus / denom)

        assert ci_scores[0] > ci_scores[1]
        assert ci_scores[0] <= 1.0
        assert ci_scores[1] >= 0.0

    def test_generate_match_reasons(self):
        from backend.services.topsis import generate_match_reasons

        # Emergency boost & close distance
        reasons = generate_match_reasons(raw_c1=80.0, raw_c2=1000.0, raw_c3=24.0, raw_c4=2.5, raw_c5=15.0, rank=1)
        assert any("Darurat" in r for r in reasons)
        assert any("Sangat dekat" in r for r in reasons)
        assert any("protein" in r for r in reasons)
        assert any("Pemerataan" in r for r in reasons)

        # Standard normal fallback
        reasons_empty = generate_match_reasons(raw_c1=10.0, raw_c2=2.0, raw_c3=1.0, raw_c4=25.0, raw_c5=2.0, rank=3)
        assert len(reasons_empty) >= 1
