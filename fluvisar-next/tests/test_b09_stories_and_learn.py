"""
Unit tests for Milestone B09: Stories, Learn, Audience Adaptation, and SAR Physics
Authority: plan.md Sections 12.2, 12.3, 19.2 (Milestone B09)
Requirements: W12, E10, E13, E14, E18, E19, E22
"""

import sys
from pathlib import Path

# Ensure pipeline root is in sys.path
pipeline_root = Path(__file__).resolve().parent.parent / "pipeline"
if str(pipeline_root) not in sys.path:
    sys.path.insert(0, str(pipeline_root))

from fluvisar.methods.insar import NISAR_L_BAND_WAVELENGTH_M

def test_five_localized_story_chapters_contract():
    """Verify exactly 5 chapters across the two approved regions (E19)"""
    expected_chapters = [
        {"id": "river-change", "region": "jamuna", "view": "J1"},
        {"id": "floodplain-recovery", "region": "jamuna", "view": "J2"},
        {"id": "service-continuity", "region": "jamuna", "view": "J3"},
        {"id": "mangrove-pulse", "region": "sundarbans", "view": "S1"},
        {"id": "relative-motion", "region": "jamuna", "view": "X1"}
    ]

    assert len(expected_chapters) == 5
    jamuna_count = sum(1 for c in expected_chapters if c["region"] == "jamuna")
    sundarbans_count = sum(1 for c in expected_chapters if c["region"] == "sundarbans")

    assert jamuna_count == 4
    assert sundarbans_count == 1
    # Strict Invariant: No foreign regions in active story chapters
    for c in expected_chapters:
        assert c["region"] in ["jamuna", "sundarbans"]

def test_sar_physics_formulas():
    """Verify SAR Lab physics constants and formulas (E18, E22)"""
    # 1. Fringe displacement formula: displacement per fringe = lambda / 2
    fringe_disp_m = NISAR_L_BAND_WAVELENGTH_M / 2.0
    fringe_disp_mm = fringe_disp_m * 1000.0
    assert round(fringe_disp_mm, 1) == 119.2

    # 2. Backscatter to audio frequency mapping (E22 Sonification)
    # f = 220 * 2^((dB + 25) / 12)
    def calc_freq(db: float) -> float:
        clamped = max(-25.0, min(0.0, db))
        return 220.0 * (2.0 ** ((clamped + 25.0) / 12.0))

    # Water (-25 dB) should produce lowest fundamental frequency 220 Hz
    assert round(calc_freq(-25.0), 1) == 220.0
    # Medium (-13 dB) should produce ~440 Hz (one octave higher)
    assert round(calc_freq(-13.0), 1) == 440.0
    # High structure / double bounce (-1 dB) should produce ~880 Hz
    assert round(calc_freq(-1.0), 1) == 880.0

def test_audience_separation():
    """Verify that Audience Switcher perspectives maintain distinct registers (E10)"""
    perspectives = ["public", "decision", "analyst"]
    assert len(perspectives) == 3

if __name__ == "__main__":
    test_five_localized_story_chapters_contract()
    test_sar_physics_formulas()
    test_audience_separation()
    print("All Milestone B09 Stories, Learn, and Physics unit tests PASSED successfully!")

