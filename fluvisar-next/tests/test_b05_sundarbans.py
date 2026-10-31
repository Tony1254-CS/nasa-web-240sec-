"""
Unit tests for Milestone B05: Sundarbans dual-pol, Pauli RGB, optical NDVI, and tide filtering.
Authority: plan.md Section 6.2, 10.5, 11.1
"""

import sys
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "pipeline" / "fluvisar" / "methods"))

from sundarbans import (
    compute_polarization_ratio,
    compute_pauli_decomposition,
    compute_ndvi,
    filter_by_tide,
    compute_joint_trajectory_fingerprint
)

def test_polarization_ratio():
    hh_db = np.array([-10.0, -12.0], dtype=np.float32)
    hv_db = np.array([-16.0, -18.0], dtype=np.float32)
    valid_mask = np.array([True, True], dtype=bool)

    ratio = compute_polarization_ratio(hh_db, hv_db, valid_mask)
    # Ratio_dB = HH - HV = -10 - (-16) = +6 dB
    assert np.isclose(ratio[0], 6.0, atol=1e-3)
    assert np.isclose(ratio[1], 6.0, atol=1e-3)

def test_pauli_rgb_decomposition():
    # Synthetic covariance terms
    # Idealized isotropic surface (water): C_HHHH = 1.0, C_VVVV = 1.0, Re(C_HHVV) = 1.0, C_HVHV = 0.0
    # Expected: R = (1 + 1 - 2)/2 = 0, G = 0, B = (1 + 1 + 2)/2 = 2.0 (Pure Blue/Surface)
    c_hhhh = np.array([1.0], dtype=np.float32)
    c_vvvv = np.array([1.0], dtype=np.float32)
    c_hvhv = np.array([0.001], dtype=np.float32)
    re_c_hhvv = np.array([1.0], dtype=np.float32)
    valid_mask = np.array([True], dtype=bool)

    r, g, b = compute_pauli_decomposition(c_hhhh, c_vvvv, c_hvhv, re_c_hhvv, valid_mask)
    assert np.isclose(r[0], 0.0, atol=1e-3)
    assert np.isclose(b[0], 2.0, atol=1e-3)

def test_ndvi_calculation():
    # Dense vegetation: NIR = 0.6, Red = 0.1 -> NDVI = (0.6 - 0.1) / (0.6 + 0.1) = 0.5 / 0.7 = 0.714
    # Water: NIR = 0.05, Red = 0.10 -> NDVI = (0.05 - 0.10) / (0.05 + 0.10) = -0.05 / 0.15 = -0.333
    red = np.array([0.10, 0.10], dtype=np.float32)
    nir = np.array([0.60, 0.05], dtype=np.float32)
    valid_mask = np.array([True, True], dtype=bool)

    ndvi = compute_ndvi(red, nir, valid_mask)
    assert np.isclose(ndvi[0], 0.714, atol=1e-3)
    assert np.isclose(ndvi[1], -0.333, atol=1e-3)

def test_tide_filtering():
    obs_list = [
        {"id": "obs-1", "date": "2026-07-07", "tide_height_m": 2.85}, # High Tide
        {"id": "obs-2", "date": "2026-07-19", "tide_height_m": 1.40}, # Low Tide
        {"id": "obs-3", "date": "2026-08-12", "tide_height_m": 3.10}, # High Tide
    ]

    high_tides = filter_by_tide(obs_list, condition="high-tide", tide_split_threshold_m=2.2)
    assert len(high_tides) == 2
    assert high_tides[0]["id"] == "obs-1"
    assert high_tides[1]["id"] == "obs-3"

    low_tides = filter_by_tide(obs_list, condition="low-tide", tide_split_threshold_m=2.2)
    assert len(low_tides) == 1
    assert low_tides[0]["id"] == "obs-2"

def test_joint_trajectory_fingerprint():
    # Case: Sub-canopy inundation (HV jumps +2.5 dB, NDVI stays high at 0.67)
    fp = compute_joint_trajectory_fingerprint(ndvi_val=0.67, hv_db=-11.5, baseline_ndvi=0.65, baseline_hv=-14.0)
    assert fp["quadrant"] == "Q1_TIDAL_SUB_CANOPY_INUNDATION"
    assert "Tidal Sub-Canopy" in fp["descriptive_label"]

if __name__ == "__main__":
    test_polarization_ratio()
    test_pauli_rgb_decomposition()
    test_ndvi_calculation()
    test_tide_filtering()
    test_joint_trajectory_fingerprint()
    print("All Milestone B05 Sundarbans unit tests PASSED successfully!")
