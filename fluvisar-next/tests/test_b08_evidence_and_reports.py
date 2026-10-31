"""
Unit tests for Milestone B08: Evidence, Passport, Impact Ledger, and Decision Briefs
Authority: plan.md Sections 10.8, 11.0, 14.0, 17.0, 19.2 (Milestone B08)
"""

import sys
from pathlib import Path

# Ensure pipeline root is in sys.path
pipeline_root = Path(__file__).resolve().parent.parent / "pipeline"
if str(pipeline_root) not in sys.path:
    sys.path.insert(0, str(pipeline_root))

from fluvisar.methods.evidence_passport import (
    generate_finding_passport,
    append_revision_event,
    compute_impact_ledger,
    generate_decision_brief_manifest,
)

def test_finding_passport_generation():
    """Verify cryptographic lineage generation and immutable record creation"""
    passport = generate_finding_passport(
        finding_id="FINDING-JAMUNA-2026-CHILMARI-01",
        region_id="jamuna",
        date_a="2026-08-26",
        date_b="2026-09-19",
        granule_a="NISAR_L2_GCOV_20260826_01",
        granule_b="NISAR_L2_GCOV_20260919_01",
        otsu_threshold_db=-14.2,
        core_area_ha=145.8,
        fringe_area_ha=28.4,
        checks_summary={"G1_Geometry": "PASS", "G4_Hydrology": "PASS"},
        initial_claim="Active bank erosion along western Chilmari bend candidate."
    )

    assert passport["finding_id"] == "FINDING-JAMUNA-2026-CHILMARI-01"
    assert passport["review_state"] == "PROPOSED"
    assert len(passport["lineage_hash"]) == 64 # Valid SHA-256
    assert len(passport["revision_history"]) == 1
    assert passport["methodology"]["robustness_ratio"] > 0.80

def test_immutable_revision_history():
    """Verify that appending a revision event preserves prior history and updates cryptographic chain"""
    initial = generate_finding_passport(
        finding_id="FINDING-JAMUNA-2026-CHILMARI-01",
        region_id="jamuna",
        date_a="2026-08-26",
        date_b="2026-09-19",
        granule_a="NISAR_L2_GCOV_01",
        granule_b="NISAR_L2_GCOV_02",
        otsu_threshold_db=-14.2,
        core_area_ha=100.0,
        fringe_area_ha=20.0,
        checks_summary={"G1_Geometry": "PASS"},
        initial_claim="Initial candidate"
    )
    initial_hash = initial["lineage_hash"]

    # Append field survey review
    revised = append_revision_event(
        passport=initial,
        author="Dr. Rahman (BWDB Survey Team)",
        action="FIELD_VALIDATION_ATTACHED",
        new_state="CONFIRMED",
        rationale="Field team verified 25m embankment retreat using handheld RTK GNSS."
    )

    assert revised["review_state"] == "CONFIRMED"
    assert len(revised["revision_history"]) == 2
    assert revised["revision_history"][0]["action"] == "RECORD_CREATED"
    assert revised["revision_history"][1]["action"] == "FIELD_VALIDATION_ATTACHED"
    assert revised["revision_history"][1]["prior_state"] == "PROPOSED"
    assert revised["lineage_hash"] != initial_hash

def test_impact_ledger_computation():
    """Verify spatial intersection and asset tallying"""
    osm_assets = [
        {"name": "Chilmari Model Primary School", "type": "school", "dist_m": 45.0},
        {"name": "Roumari Community Clinic", "type": "clinic", "dist_m": 80.0},
        {"name": "Far Off Clinic", "type": "clinic", "dist_m": 500.0},
        {"name": "Chilmari Ghat Access Road", "type": "road", "length_km": 1.4, "dist_m": 15.0},
    ]

    ledger = compute_impact_ledger(
        candidate_mask_ha=174.2,
        osm_assets=osm_assets,
        settlement_population=1850,
        distance_threshold_m=100.0
    )

    assert ledger["affected_infrastructure"]["primary_schools_count"] == 1
    assert "Chilmari Model Primary School" in ledger["affected_infrastructure"]["primary_schools_list"]
    assert ledger["affected_infrastructure"]["community_clinics_count"] == 1
    assert ledger["affected_infrastructure"]["severed_road_network_km"] == 1.4
    assert ledger["population_exposure"]["estimated_exposed_population"] == 1850

def test_decision_brief_manifest():
    """Verify share URL, QR task contract, and bilingual manifest"""
    passport = generate_finding_passport(
        finding_id="FINDING-01",
        region_id="jamuna",
        date_a="2026-08-26",
        date_b="2026-09-19",
        granule_a="G1",
        granule_b="G2",
        otsu_threshold_db=-14.2,
        core_area_ha=100.0,
        fringe_area_ha=20.0,
        checks_summary={"G1": "PASS"},
        initial_claim="Candidate"
    )
    ledger = compute_impact_ledger(120.0, [], 500)

    manifest = generate_decision_brief_manifest(passport, ledger)

    assert "brief_metadata" in manifest
    assert "TASK-FINDING-01" == manifest["mobile_field_contract"]["task_id"]
    assert manifest["brief_metadata"]["title_bn"].startswith("ফ্লুভিসার")
    assert manifest["mobile_field_contract"]["share_url"].startswith("https://fluvisar.earth/#case=jamuna")

if __name__ == "__main__":
    test_finding_passport_generation()
    test_immutable_revision_history()
    test_impact_ledger_computation()
    test_decision_brief_manifest()
    print("All Milestone B08 Evidence & Passport unit tests PASSED successfully!")

