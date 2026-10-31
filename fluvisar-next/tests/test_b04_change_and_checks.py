"""
Unit tests for Milestone B04: Otsu thresholding, transition matrix, robust core/fringe, and 7 checks.
Authority: plan.md Section 7.3, 10.3, 10.4
"""

import sys
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "pipeline" / "fluvisar" / "methods"))

from water import (
    compute_otsu_threshold,
    classify_water,
    compute_pairwise_transitions,
    compute_robust_core_and_fringe,
    evaluate_seven_checks
)

def test_otsu_bimodal_threshold():
    np.random.seed(42)
    water = np.random.normal(loc=-18.0, scale=1.5, size=5000)
    land = np.random.normal(loc=-8.0, scale=1.5, size=5000)
    data = np.concatenate([water, land]).astype(np.float32)
    valid_mask = np.ones(data.shape, dtype=bool)

    threshold = compute_otsu_threshold(data, valid_mask)
    assert -15.0 <= threshold <= -11.0, f"Expected threshold in [-15, -11], got {threshold}"

def test_water_classification():
    data = np.array([-20.0, -15.0, -10.0, -5.0], dtype=np.float32)
    valid_mask = np.array([True, True, True, True], dtype=bool)
    threshold = -14.0

    mask = classify_water(data, threshold, valid_mask)
    assert mask[0] == True   # -20 <= -14 is True (Water)
    assert mask[1] == True   # -15 <= -14 is True (Water)
    assert mask[2] == False  # -10 <= -14 is False (Land)
    assert mask[3] == False  # -5 <= -14 is False (Land)

def test_pairwise_transitions():
    water_t1 = np.array([True, False, False, True], dtype=bool)
    water_t2 = np.array([True, False, True,  False], dtype=bool)
    valid_t1 = np.array([True, True,  True,  True], dtype=bool)
    valid_t2 = np.array([True, True,  True,  True], dtype=bool)

    res = compute_pairwise_transitions(water_t1, water_t2, valid_t1, valid_t2, pixel_area_ha=1.0)
    grid = res["transition_grid"]

    assert grid[0] == 1 # Stable Water
    assert grid[1] == 2 # Stable Land
    assert grid[2] == 3 # Land -> Water (Erosion candidate)
    assert grid[3] == 4 # Water -> Land (Accretion candidate)

    assert res["stable_water_ha"] == 1.0
    assert res["stable_land_ha"] == 1.0
    assert res["land_to_water_candidate_ha"] == 1.0
    assert res["water_to_land_candidate_ha"] == 1.0

def test_robust_core_and_fringe_invariant():
    data = np.array([-18.0, -13.5, -8.0], dtype=np.float32)
    valid_mask = np.ones(data.shape, dtype=bool)

    res = compute_robust_core_and_fringe(data, base_threshold_db=-14.0, valid_mask=valid_mask)
    core = res["robust_core_mask"]
    fringe = res["contested_fringe_mask"]

    assert core[0] == True
    assert fringe[0] == False

    assert core[1] == False
    assert fringe[1] == True

    assert core[2] == False
    assert fringe[2] == False

def test_seven_checks_evaluator():
    checks = evaluate_seven_checks(
        orbit_match=True,
        stage_delta_m=0.85,
        has_subsequent_obs=True,
        water_persisted=True,
        optical_clear_fraction=0.75,
        fringe_ratio=0.25
    )

    assert len(checks) == 7
    groups = [c["group"] for c in checks]
    assert "product-geometry" in groups
    assert "alignment" in groups
    assert "classification-sensitivity" in groups
    assert "hydrological-context" in groups
    assert "subsequent-observations" in groups
    assert "independent-comparison" in groups
    assert "controls-plausibility" in groups

    for c in checks:
        assert c["status"] in ["pass", "warn", "fail", "not-evaluated", "not-applicable"]

if __name__ == "__main__":
    test_otsu_bimodal_threshold()
    test_water_classification()
    test_pairwise_transitions()
    test_robust_core_and_fringe_invariant()
    test_seven_checks_evaluator()
    print("All Milestone B04 unit tests PASSED successfully!")
