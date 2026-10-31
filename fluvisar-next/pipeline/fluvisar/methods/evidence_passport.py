"""
FluviSAR Evidence, Passport, and Report Methods
Authority: plan.md Sections 10.8, 11.0, 14.0, 17.0, 19.2 (Milestone B08)
Requirements: W05, W09, W10, W14, E11, E12, E16, E17, R18
"""

import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

def generate_finding_passport(
    finding_id: str,
    region_id: str,
    date_a: str,
    date_b: str,
    granule_a: str,
    granule_b: str,
    otsu_threshold_db: float,
    core_area_ha: float,
    fringe_area_ha: float,
    checks_summary: Dict[str, str],
    initial_claim: str
) -> Dict[str, Any]:
    """
    Constructs an immutable Change Passport record for a detected finding (W10, E11).
    Every metric, threshold, and check is cryptographically bound into a lineage hash.
    Authority: plan.md Section 10.8, 14.0 (W10)
    """
    created_at = datetime.now(timezone.utc).isoformat()
    
    passport_data = {
        "finding_id": finding_id,
        "region_id": region_id,
        "observation_window": {
            "date_a": date_a,
            "date_b": date_b,
            "granules": [granule_a, granule_b]
        },
        "methodology": {
            "algorithm": "Otsu Bimodal Transition + 7-Check Scientific Audit",
            "threshold_db": otsu_threshold_db,
            "perturbation_range_db": [-2.0, -1.0, 0.0, 1.0, 2.0],
            "core_area_ha": round(core_area_ha, 2),
            "fringe_area_ha": round(fringe_area_ha, 2),
            "robustness_ratio": round(core_area_ha / (core_area_ha + fringe_area_ha), 3) if (core_area_ha + fringe_area_ha) > 0 else 0.0
        },
        "seven_checks": checks_summary,
        "review_state": "PROPOSED",
        "claims": [
            {
                "claim_id": f"CLAIM-{finding_id}-01",
                "statement": initial_claim,
                "origin": "OBSERVATION_DERIVED",
                "assessment": "PENDING_FIELD_AUDIT"
            }
        ],
        "revision_history": [
            {
                "revision_id": 1,
                "timestamp": created_at,
                "author": "FluviSAR Automated Pipeline",
                "action": "RECORD_CREATED",
                "prior_state": None,
                "new_state": "PROPOSED",
                "rationale": "Initial automated candidate detection and 7-check audit execution."
            }
        ]
    }

    # Compute deterministic SHA-256 hash of the initial record
    record_str = json.dumps(passport_data, sort_keys=True)
    lineage_hash = hashlib.sha256(record_str.encode('utf-8')).hexdigest()
    passport_data["lineage_hash"] = lineage_hash

    return passport_data

def append_revision_event(
    passport: Dict[str, Any],
    author: str,
    action: str,
    new_state: str,
    rationale: str
) -> Dict[str, Any]:
    """
    Appends an immutable revision event to the finding's history (R18).
    Prior history cannot be altered or rewritten.
    Authority: plan.md Section 11.0 (R18)
    """
    updated = json.loads(json.dumps(passport)) # Deep copy
    current_revisions = updated.get("revision_history", [])
    prior_state = updated.get("review_state", "PROPOSED")

    new_rev_id = len(current_revisions) + 1
    event = {
        "revision_id": new_rev_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "author": author,
        "action": action,
        "prior_state": prior_state,
        "new_state": new_state,
        "rationale": rationale
    }

    current_revisions.append(event)
    updated["revision_history"] = current_revisions
    updated["review_state"] = new_state

    # Recompute updated lineage hash including previous hash to form cryptographic chain
    chained_data = {
        "prior_hash": updated.get("lineage_hash", ""),
        "latest_event": event
    }
    updated["lineage_hash"] = hashlib.sha256(json.dumps(chained_data, sort_keys=True).encode('utf-8')).hexdigest()

    return updated

def compute_impact_ledger(
    candidate_mask_ha: float,
    osm_assets: List[Dict[str, Any]],
    settlement_population: int,
    distance_threshold_m: float = 100.0
) -> Dict[str, Any]:
    """
    Computes What Changed for Whom / Impact Ledger (W09, E16).
    Distinguishes physical inundation exposure from estimated damage.
    Authority: plan.md Section 14.0 (E16)
    """
    exposed_schools = [a for a in osm_assets if a.get("type") == "school" and a.get("dist_m", 999) <= distance_threshold_m]
    exposed_clinics = [a for a in osm_assets if a.get("type") == "clinic" and a.get("dist_m", 999) <= distance_threshold_m]
    exposed_roads_km = sum(a.get("length_km", 0.0) for a in osm_assets if a.get("type") == "road" and a.get("dist_m", 999) <= distance_threshold_m)

    return {
        "exposure_area_ha": round(candidate_mask_ha, 2),
        "affected_infrastructure": {
            "primary_schools_count": len(exposed_schools),
            "primary_schools_list": [s.get("name") for s in exposed_schools],
            "community_clinics_count": len(exposed_clinics),
            "community_clinics_list": [c.get("name") for c in exposed_clinics],
            "severed_road_network_km": round(exposed_roads_km, 2)
        },
        "population_exposure": {
            "estimated_exposed_population": settlement_population,
            "source": "BBS 2022 Census Mauza spatial intersection",
            "uncertainty_note": "Direct physical exposure only; does not assume 100% displacement."
        },
        "action_shortlist": [
            f"Verify primary school access in {s.get('name')}" for s in exposed_schools
        ] + [
            f"Assess boat shuttle deployment for {c.get('name')}" for c in exposed_clinics
        ]
    }

def generate_decision_brief_manifest(
    passport: Dict[str, Any],
    impact_ledger: Dict[str, Any],
    base_url: str = "https://fluvisar.earth"
) -> Dict[str, Any]:
    """
    Generates full reproducible manifest and shareable decision brief payload (W14, E17, E12).
    Includes QR contract for field inspection task handoff.
    Authority: plan.md Section 17.0 (E17, W14)
    """
    finding_id = passport["finding_id"]
    share_url = f"{base_url}/#case={passport['region_id']}&finding={finding_id}&hash={passport['lineage_hash'][:10]}"
    
    # Contract for Mobile Field Task (A01-A12)
    qr_field_task_payload = {
        "task_id": f"TASK-{finding_id}",
        "finding_id": finding_id,
        "region_id": passport["region_id"],
        "observation_dates": passport["observation_window"],
        "lineage_hash": passport["lineage_hash"],
        "verification_objective": "Inspect water edge and confirm road culvert condition",
        "share_url": share_url
    }

    return {
        "brief_metadata": {
            "title_en": f"FluviSAR Rapid Decision Brief: {finding_id}",
            "title_bn": f"ফ্লুভিসার দ্রুত সিদ্ধান্ত সারসংক্ষেপ: {finding_id}",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "status": passport["review_state"],
            "share_url": share_url,
        },
        "scientific_provenance": {
            "lineage_hash": passport["lineage_hash"],
            "core_area_ha": passport["methodology"]["core_area_ha"],
            "fringe_area_ha": passport["methodology"]["fringe_area_ha"],
            "seven_checks_summary": passport["seven_checks"]
        },
        "human_impact_summary": impact_ledger,
        "mobile_field_contract": qr_field_task_payload
    }

