"""
Unit tests for Milestone B10: Scenarios, Historical Bridge (N01), Coverage Curtain (N02),
Assumption Receipt (N03), Guided Prompts (N04), and Evidence Multi-Clock (N05).
Authority: plan.md Sections 7.1, 12.2, 13.0, 19.2 (Milestone B10)
"""

import sys
from pathlib import Path

# Ensure pipeline root is in sys.path
pipeline_root = Path(__file__).resolve().parent.parent / "pipeline"
if str(pipeline_root) not in sys.path:
    sys.path.insert(0, str(pipeline_root))

from fluvisar.methods.scenarios_and_improvements import (
    get_gmw_historical_epochs,
    evaluate_coverage_curtain,
    generate_assumption_receipt,
    get_guided_comparison_prompts,
    build_multi_clock_display,
)

def test_gmw_historical_bridge_n01():
    """Verify GMW historical epochs for Sundarbans (N01)"""
    gmw_sundarbans = get_gmw_historical_epochs("sundarbans")
    assert len(gmw_sundarbans["historical_epochs"]) == 6
    assert gmw_sundarbans["historical_epochs"][0]["year"] == 1996
    assert gmw_sundarbans["historical_epochs"][-1]["year"] == 2025
    assert "conflated" in gmw_sundarbans["scientific_boundary_note"]

    gmw_jamuna = get_gmw_historical_epochs("jamuna")
    assert gmw_jamuna["status"] == "not_applicable"

def test_coverage_curtain_n02():
    """Verify coverage curtain support mask breakdown (N02)"""
    curtain = evaluate_coverage_curtain(
        total_pixels=10000,
        valid_observable_pixels=7800,
        masked_water_pixels=1500,
        masked_shadow_pixels=400,
        masked_far_range_pixels=300
    )
    assert curtain["valid_observable_percentage"] == 78.0
    assert curtain["excluded_breakdown"]["radar_shadow_or_layover"]["pixel_count"] == 400
    assert "Steep bank geometry" in curtain["excluded_breakdown"]["radar_shadow_or_layover"]["reason"]

def test_assumption_receipt_n03():
    """Verify assumption receipt generation and delta calculation (N03)"""
    receipt = generate_assumption_receipt(
        base_run_id="run-2026-prod-01",
        scenario_name="Stage +1.5m Flood Surge",
        changed_parameters={"delta_stage_m": 1.5, "sever_ferry": True},
        baseline_metrics={"inundation_ha": 145.8, "isolated_pop": 0},
        scenario_metrics={"inundation_ha": 182.4, "isolated_pop": 3420},
        unresolved_uncertainties=["Embankment failure depth at western Chilmari bend"]
    )

    assert receipt["computed_differences"]["delta_inundation_ha"] == 36.6
    assert receipt["computed_differences"]["delta_isolated_pop"] == 3420
    assert "DECLARED_SIMULATION" == receipt["origin"]
    assert "not a verified historical" in receipt["authenticity_declaration"]

def test_guided_comparison_prompts_n04():
    """Verify metadata-driven guided prompts (N04)"""
    prompts = get_guided_comparison_prompts(
        region_id="jamuna",
        current_date="2026-08-26",
        fringe_area_ha=28.4
    )
    assert len(prompts) >= 2
    prompt_ids = [p["prompt_id"] for p in prompts]
    assert "P01_SUBSEQUENT_PASS" in prompt_ids
    assert "P02_BREAK_FINDING" in prompt_ids

def test_multi_clock_evidence_display_n05():
    """Verify multi-clock separation prevents false contemporaneous assumptions (N05)"""
    clocks = build_multi_clock_display(
        radar_acquisition_iso="2026-08-26T11:42:15Z",
        gauge_acquisition_iso="2026-08-26T12:00:00Z",
        pipeline_processed_iso="2026-10-31T08:00:00Z",
        field_survey_iso=None
    )
    assert clocks["satellite_radar"]["timestamp"] == "2026-08-26T11:42:15Z"
    assert clocks["ground_field_survey"]["timestamp"] == "PENDING_FIELD_VISIT"
    assert clocks["ground_field_survey"]["status"] == "UNVERIFIED_PENDING_SURVEY"

if __name__ == "__main__":
    test_gmw_historical_bridge_n01()
    test_coverage_curtain_n02()
    test_assumption_receipt_n03()
    test_guided_comparison_prompts_n04()
    test_multi_clock_evidence_display_n05()
    print("All Milestone B10 Scenarios and Comprehension unit tests PASSED successfully!")
