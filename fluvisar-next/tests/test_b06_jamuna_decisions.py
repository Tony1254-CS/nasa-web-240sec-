"""
Unit tests for Milestone B06: Jamuna water recurrence, service graph, and Decision Flip engine.
Authority: plan.md Section 6.1 (J2, J3), 11.2, 13.1 (R01-R07)
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "pipeline" / "fluvisar" / "methods"))

from jamuna_decisions import (
    calculate_water_recurrence,
    solve_graph_reachability,
    solve_decision_flip
)

def test_water_recurrence():
    # 2 wet / 10 valid = 0.20 (recurrent floodplain)
    r1 = calculate_water_recurrence(wet_counts=2, valid_counts=10)
    assert r1["fraction"] == 0.20
    assert r1["is_recurrent_floodplain"] == True
    assert r1["is_permanent_water"] == False

    # 9 wet / 10 valid = 0.90 (permanent water)
    r2 = calculate_water_recurrence(wet_counts=9, valid_counts=10)
    assert r2["fraction"] == 0.90
    assert r2["is_permanent_water"] == True

    # 0 valid observations
    r0 = calculate_water_recurrence(wet_counts=0, valid_counts=0)
    assert r0["fraction"] is None
    assert "No valid" in r0["reason"]

def test_service_graph_reachability():
    settlements = [
        {"id": "S1", "name": "Chilmari Char Community", "population": 2500},
        {"id": "S2", "name": "Roumari East Village", "population": 4200},
    ]
    facilities = [
        {"id": "H1", "name": "Chilmari Upazila Health Complex", "type": "hospital"}
    ]
    edges = [
        {"id": "E1", "from": "S1", "to": "H1", "travel_time_min": 15.0},
        {"id": "E2", "from": "S2", "to": "S1", "travel_time_min": 25.0}, # River crossing edge
    ]

    # Baseline: both connected
    base_res = solve_graph_reachability(settlements, facilities, edges)
    assert base_res["total_settlements"] == 2
    assert base_res["reachable_settlements"] == 2
    assert len(base_res["isolated_settlements"]) == 0
    assert base_res["connectivity_rate"] == 1.0

    # Severed river crossing (E2)
    severed_res = solve_graph_reachability(settlements, facilities, edges, severed_edge_ids={"E2"})
    assert severed_res["reachable_settlements"] == 1 # Only S1 can reach H1
    assert len(severed_res["isolated_settlements"]) == 1
    assert severed_res["isolated_settlements"][0]["settlement_id"] == "S2"
    assert severed_res["total_population_isolated"] == 4200

def test_decision_flip_solver():
    candidates = [
        {"id": "C-01", "name": "Char Unit A", "exposure_score": 8.0, "critical_link_involved": False},
        {"id": "C-02", "name": "Char Unit B", "exposure_score": 7.0, "critical_link_involved": False},
        {"id": "C-03", "name": "Ferry Crossing Cutoff C", "exposure_score": 5.0, "critical_link_involved": True},
    ]

    # Under budget = 2, nominal picks C-01 and C-02 (scores 8.0 and 7.0)
    res_nominal = solve_decision_flip(candidates, budget_visits=2, prioritize_isolated_links=False)
    assert set(res_nominal["stable_inspections"]) == {"C-01", "C-02"}
    assert res_nominal["has_decision_flip"] == False

    # Under budget = 2, when critical links prioritized, C-03 jumps to 15.0 score, displacing C-02!
    res_flip = solve_decision_flip(candidates, budget_visits=2, prioritize_isolated_links=True)
    assert res_flip["has_decision_flip"] == True
    assert "C-03" in res_flip["added_inspections"]
    assert "C-02" in res_flip["dropped_inspections"]
    assert "C-01" in res_flip["stable_inspections"] # C-01 remains stable across both!

if __name__ == "__main__":
    test_water_recurrence()
    test_service_graph_reachability()
    test_decision_flip_solver()
    print("All Milestone B06 Jamuna decisions unit tests PASSED successfully!")
