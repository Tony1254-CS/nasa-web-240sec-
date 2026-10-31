"""
Unit tests for Milestone B07: Specialty & Research Methods (InSAR, Transects, SWOT, Compound View)
Authority: plan.md Sections 10.6, 10.7, 11.0, 19.2 (Milestone B07)
"""

import sys
from pathlib import Path
import numpy as np

# Ensure pipeline root is in sys.path
pipeline_root = Path(__file__).resolve().parent.parent / "pipeline"
if str(pipeline_root) not in sys.path:
    sys.path.insert(0, str(pipeline_root))

from fluvisar.methods.insar import (
    NISAR_L_BAND_WAVELENGTH_M,
    SENTINEL1_C_BAND_WAVELENGTH_M,
    phase_to_los_displacement,
    mask_by_coherence,
    reference_displacement_to_point,
    compute_wrapped_phase,
    count_fringes,
    sample_transect_profile,
    adapt_swot_water_elevation,
    build_compound_observation_profile,
    evaluate_nisar_contribution_benchmark,
)

def test_phase_to_los_displacement_physics():
    """Verify standard InSAR formula: displacement = - (lambda / (4 * pi)) * phase"""
    # A phase change of -4*pi should equal +lambda (positive motion toward satellite)
    phase = np.array([-4.0 * np.pi, 0.0, 4.0 * np.pi], dtype=np.float32)
    disp = phase_to_los_displacement(phase, wavelength_m=NISAR_L_BAND_WAVELENGTH_M, sign=-1)

    np.testing.assert_almost_equal(disp[0], NISAR_L_BAND_WAVELENGTH_M, decimal=4)
    np.testing.assert_almost_equal(disp[1], 0.0, decimal=4)
    np.testing.assert_almost_equal(disp[2], -NISAR_L_BAND_WAVELENGTH_M, decimal=4)

def test_coherence_masking():
    """Verify pixels below minimum coherence threshold are masked"""
    data = np.array([[10.0, 20.0], [30.0, 40.0]], dtype=np.float32)
    coherence = np.array([[0.80, 0.20], [0.35, np.nan]], dtype=np.float32)

    masked = mask_by_coherence(data, coherence, min_coherence=0.35, nodata_value=-9999.0)
    assert masked[0, 0] == 10.0
    assert masked[0, 1] == -9999.0
    assert masked[1, 0] == 30.0
    assert masked[1, 1] == -9999.0

def test_connected_component_referencing():
    """Verify displacement is referenced only within the same connected component"""
    disp = np.array([[5.0, 7.0], [10.0, 2.0]], dtype=np.float32)
    components = np.array([[1, 1], [2, 1]], dtype=np.int32)

    ref_disp, meta = reference_displacement_to_point(disp, components, ref_row=0, ref_col=0)
    assert meta["success"] is True
    assert meta["ref_component_id"] == 1
    # Pixel [0,0] is reference, so should be 0.0
    assert ref_disp[0, 0] == 0.0
    # Pixel [0,1] is in component 1, value = 7 - 5 = 2.0
    assert ref_disp[0, 1] == 2.0
    # Pixel [1,1] is in component 1, value = 2 - 5 = -3.0
    assert ref_disp[1, 1] == -3.0
    # Pixel [1,0] is in component 2 (disconnected), must be masked out
    assert ref_disp[1, 0] == -9999.0

def test_wrapped_phase_and_fringe_counter():
    """Verify wrapped phase interval and fringe count calculation"""
    phase_ramp = np.linspace(0, 6 * np.pi, 100) # 3 full cycles
    wrapped = compute_wrapped_phase(phase_ramp)

    assert np.all(wrapped >= -np.pi) and np.all(wrapped <= np.pi)

    valid_mask = np.ones(100, dtype=bool)
    fringes = count_fringes(phase_ramp, valid_mask, wavelength_m=NISAR_L_BAND_WAVELENGTH_M)
    assert fringes["fringe_count"] == 3.0
    # lambda/2 for NISAR = 238.4 / 2 = 119.2 mm
    np.testing.assert_almost_equal(fringes["displacement_per_fringe_mm"], 119.2, decimal=1)

def test_sample_transect_profile():
    """Verify transect profiler with coherence breaks"""
    rows, cols = 50, 50
    phase = np.zeros((rows, cols), dtype=np.float32)
    coherence = np.full((rows, cols), 0.70, dtype=np.float32)
    # Simulate a river in the middle with low coherence
    coherence[20:30, :] = 0.10
    components = np.ones((rows, cols), dtype=np.int32)
    components[20:30, :] = 0

    profile = sample_transect_profile(
        phase, coherence, components,
        r0=0, c0=25, r1=49, c1=25,
        pixel_spacing_m=20.0,
        wavelength_m=NISAR_L_BAND_WAVELENGTH_M,
        min_coherence=0.35,
        num_samples=50
    )

    assert profile["sample_count"] == 50
    assert profile["total_length_m"] == 980.0
    # The middle points across the river should be marked invalid/breaks
    invalid_points = [p for p in profile["points"] if not p["is_valid"]]
    assert len(invalid_points) > 5

def test_swot_water_elevation():
    """Verify SWOT adapter handles valid overpass and missing dates"""
    # Valid date with good uncertainty
    swot_good = adapt_swot_water_elevation(
        reach_id="reach_jamuna_chilmari",
        target_date="2026-08-15",
        water_surface_height_m=18.42,
        slope_m_per_km=0.075,
        height_uncertainty_m=0.08
    )
    assert swot_good["status"] == "ready"
    assert swot_good["water_surface_height_m"] == 18.42
    assert swot_good["quality_flag"] == "GOOD"

    # Missing overpass date
    swot_missing = adapt_swot_water_elevation(
        reach_id="reach_jamuna_chilmari",
        target_date="2026-07-01",
        water_surface_height_m=None,
        slope_m_per_km=None,
        height_uncertainty_m=None
    )
    assert swot_missing["status"] == "unavailable"
    assert "No valid SWOT" in swot_missing["reason"]

def test_compound_observation_and_benchmark():
    """Verify 3-axis decoupled observation and benchmark protocol"""
    profile = build_compound_observation_profile(
        backscatter_db=-16.5,
        vegetation_index=0.12,
        los_displacement_mm=None,
        coherence=0.20
    )
    assert profile["composite_risk_score"] is None
    assert profile["axes"]["radar_backscatter"]["physical_interpretation"] == "OPEN_WATER_CANDIDATE"
    assert profile["axes"]["line_of_sight_motion"]["physical_interpretation"] == "DECOHERENT_OR_UNOBSERVABLE"

    benchmark = evaluate_nisar_contribution_benchmark()
    assert "BENCHMARK" in benchmark["benchmark_id"]
    assert "added_nisar_l_band" in benchmark["comparison_matrix"]["canopy_penetration"]

if __name__ == "__main__":
    test_phase_to_los_displacement_physics()
    test_coherence_masking()
    test_connected_component_referencing()
    test_wrapped_phase_and_fringe_counter()
    test_sample_transect_profile()
    test_swot_water_elevation()
    test_compound_observation_and_benchmark()
    print("All Milestone B07 Specialty & Research unit tests PASSED successfully!")
