"""
FluviSAR Jamuna Floodplain Recovery & Decision Flip Engine
Authority: plan.md Section 6.1 (J2, J3), 11.2, 13.1 (R01-R07)
"""

from typing import Dict, Any, List, Set, Tuple

def calculate_water_recurrence(wet_counts: int, valid_counts: int) -> Dict[str, Any]:
    """
    Computes observed water recurrence fraction: N_wet / N_valid.
    Authority: plan.md Section 11.0, 13.1 (R01)
    Missing passes never count as dry or wet.
    """
    if valid_counts == 0:
        return {
            "fraction": None,
            "wet_count": 0,
            "valid_count": 0,
            "reason": "No valid cloud/speckle-screened observations"
        }

    fraction = round(wet_counts / valid_counts, 3)
    return {
        "fraction": fraction,
        "wet_count": wet_counts,
        "valid_count": valid_counts,
        "is_permanent_water": fraction >= 0.85,
        "is_recurrent_floodplain": 0.20 <= fraction < 0.85,
        "is_dry_cropland": fraction < 0.20
    }

def solve_graph_reachability(
    settlements: List[Dict[str, Any]],
    facilities: List[Dict[str, Any]],
    edges: List[Dict[str, Any]],
    severed_edge_ids: Set[str] = set()
) -> Dict[str, Any]:
    """
    Evaluates service graph connectivity between settlements and health/school facilities.
    Authority: plan.md Section 6.1 (J3), 13.1 (R05)
    """
    # Build adjacency list excluding severed edges
    adj: Dict[str, List[Tuple[str, float]]] = {}
    all_node_ids = {s["id"] for s in settlements} | {f["id"] for f in facilities}
    for nid in all_node_ids:
        adj[nid] = []

    for e in edges:
        if e["id"] in severed_edge_ids:
            continue
        u, v, cost = e["from"], e["to"], e.get("travel_time_min", 10.0)
        adj[u].append((v, cost))
        adj[v].append((u, cost))

    # Evaluate shortest travel time from each settlement to nearest facility (Dijkstra)
    facility_ids = {f["id"] for f in facilities}
    reachable_settlements = 0
    isolated_settlements = []

    for s in settlements:
        sid = s["id"]
        # Breadth-first / Dijkstra search for facility
        visited = set()
        queue = [(sid, 0.0)]
        found_facility = False
        min_time = float("inf")

        while queue:
            curr, time_spent = queue.pop(0)
            if curr in visited:
                continue
            visited.add(curr)

            if curr in facility_ids:
                found_facility = True
                min_time = min(min_time, time_spent)
                break

            for neighbor, edge_time in adj.get(curr, []):
                if neighbor not in visited:
                    queue.append((neighbor, time_spent + edge_time))

        if found_facility:
            reachable_settlements += 1
        else:
            isolated_settlements.append({
                "settlement_id": sid,
                "name": s.get("name", sid),
                "population": s.get("population", 0)
            })

    total_pop_isolated = sum(item["population"] for item in isolated_settlements)

    return {
        "total_settlements": len(settlements),
        "reachable_settlements": reachable_settlements,
        "isolated_settlements": isolated_settlements,
        "total_population_isolated": total_pop_isolated,
        "connectivity_rate": round(reachable_settlements / max(1, len(settlements)), 2)
    }

def solve_decision_flip(
    candidates: List[Dict[str, Any]],
    budget_visits: int = 3,
    prioritize_isolated_links: bool = False
) -> Dict[str, Any]:
    """
    Deterministic inspection-budget Decision Flip Engine.
    Authority: plan.md Section 11.2, 13.1 (R04, R07)
    Compares candidate inspection shortlists under alternative operational assumptions.
    """
    def score_candidate(cand: Dict[str, Any], prioritize_links: bool) -> float:
        score = cand.get("exposure_score", 1.0)
        if prioritize_links and cand.get("critical_link_involved", False):
            score += 10.0
        if cand.get("is_cropland", False):
            score += 2.0
        return score

    # Sort under nominal assumption
    nominal_sorted = sorted(candidates, key=lambda c: score_candidate(c, False), reverse=True)
    nominal_selected = [c["id"] for c in nominal_sorted[:budget_visits]]

    # Sort under alternative scenario assumption
    scenario_sorted = sorted(candidates, key=lambda c: score_candidate(c, prioritize_isolated_links), reverse=True)
    scenario_selected = [c["id"] for c in scenario_sorted[:budget_visits]]

    # Determine stable vs flipped decisions
    stable_selected = list(set(nominal_selected) & set(scenario_selected))
    dropped_candidates = list(set(nominal_selected) - set(scenario_selected))
    added_candidates = list(set(scenario_selected) - set(nominal_selected))

    has_decision_flip = len(dropped_candidates) > 0

    return {
        "budget_visits": budget_visits,
        "assumption_nominal": "Standard Transition Area Prioritization",
        "assumption_scenario": "Critical Connectivity / Isolated Link Prioritization" if prioritize_isolated_links else "Nominal",
        "has_decision_flip": has_decision_flip,
        "stable_inspections": stable_selected,
        "dropped_inspections": dropped_candidates,
        "added_inspections": added_candidates,
        "resolving_question": (
            "Is the Roumari East ferry crossing passable by foot/boat?"
            if has_decision_flip
            else "Current observations are robust to connectivity assumptions."
        )
    }

