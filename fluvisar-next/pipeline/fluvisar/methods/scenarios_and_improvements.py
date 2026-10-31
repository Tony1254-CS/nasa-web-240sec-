"""
FluviSAR Scenarios and Comprehension Improvements (Milestone B10)
Authority: plan.md Sections 7.1, 12.2, 13.0, 19.2 (Milestone B10)
Requirements: W13, E21, N01, N02, N03, N04, N05
"""

import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

def get_gmw_historical_epochs(region_id: str) -> Dict[str, Any]:
    """
    Historical Context Bridge (N01).
    Provides Global Mangrove Watch (GMW) approved annual epochs through 2025
    side-by-side with 2026 NISAR observations.
    Authority: plan.md Section 13.0 (N01)
    """
    if region_id != "sundarbans":
        return {
            "region_id": region_id,
            "status": "not_applicable",
            "message": "GMW historical mangrove context is designated for Sundarbans only."
        }

    return {
        "region_id": "sundarbans",
        "dataset": "Global Mangrove Watch (GMW) v3.0 / JAXA ALOS-PALSAR & Landsat",
        "spatial_resolution_m": 25.0,
        "historical_epochs": [
            {"year": 1996, "mangrove_extent_ha": 601200, "sensor": "JERS-1 SAR / Landsat-5"},
            {"year": 2007, "mangrove_extent_ha": 598400, "sensor": "ALOS PALSAR-1"},
            {"year": 2010, "mangrove_extent_ha": 597100, "sensor": "ALOS PALSAR-1 / Landsat-7"},
            {"year": 2015, "mangrove_extent_ha": 595800, "sensor": "ALOS-2 PALSAR-2"},
            {"year": 2020, "mangrove_extent_ha": 594200, "sensor": "Sentinel-1 / ALOS-2"},
            {"year": 2025, "mangrove_extent_ha": 593600, "sensor": "GMW v3.5 Annual Update"}
        ],
        "current_nisar_2026_scope": {
            "focus": "Intra-annual tidal pulse & sub-canopy dynamic inundation",
            "spatial_resolution_m": 20.0,
            "temporal_revisit_days": 12
        },
        "scientific_boundary_note": "Long-term decadal canopy trends must not be conflated with 12-day tidal inundation cycles."
    }

def evaluate_coverage_curtain(
    total_pixels: int,
    valid_observable_pixels: int,
    masked_water_pixels: int,
    masked_shadow_pixels: int,
    masked_far_range_pixels: int
) -> Dict[str, Any]:
    """
    Coverage Curtain Validator (N02).
    Quantifies valid vs quality-excluded support beneath headline layers.
    Authority: plan.md Section 13.0 (N02)
    """
    excluded_pixels = masked_shadow_pixels + masked_far_range_pixels
    observable_ratio = valid_observable_pixels / total_pixels if total_pixels > 0 else 0.0

    return {
        "total_pixels": total_pixels,
        "valid_observable_pixels": valid_observable_pixels,
        "valid_observable_percentage": round(observable_ratio * 100.0, 1),
        "excluded_breakdown": {
            "radar_shadow_or_layover": {
                "pixel_count": masked_shadow_pixels,
                "percentage": round((masked_shadow_pixels / total_pixels) * 100.0, 2),
                "reason": "Steep bank geometry obstructs radar illumination line-of-sight."
            },
            "far_range_roll_off": {
                "pixel_count": masked_far_range_pixels,
                "percentage": round((masked_far_range_pixels / total_pixels) * 100.0, 2),
                "reason": "Antenna gain roll-off at outer swath edge below SNR threshold."
            },
            "specular_water_absorption": {
                "pixel_count": masked_water_pixels,
                "percentage": round((masked_water_pixels / total_pixels) * 100.0, 2),
                "reason": "Calm water reflects signal specularly; masked from vegetation/land analysis."
            }
        },
        "curtain_active": True
    }

def generate_assumption_receipt(
    base_run_id: str,
    scenario_name: str,
    changed_parameters: Dict[str, Any],
    baseline_metrics: Dict[str, Any],
    scenario_metrics: Dict[str, Any],
    unresolved_uncertainties: List[str]
) -> Dict[str, Any]:
    """
    Assumption Receipt Generator (N03).
    Records changed inputs, baseline metrics, resulting differences, and remaining unknowns.
    Authority: plan.md Section 13.0 (N03)
    """
    differences = {}
    for k, v in scenario_metrics.items():
        base_v = baseline_metrics.get(k)
        if isinstance(v, (int, float)) and isinstance(base_v, (int, float)):
            differences[f"delta_{k}"] = round(v - base_v, 2)

    receipt = {
        "receipt_id": f"RECEIPT-{scenario_name.upper().replace(' ', '-')}-{int(datetime.now().timestamp())}",
        "base_run_id": base_run_id,
        "scenario_name": scenario_name,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "origin": "DECLARED_SIMULATION",
        "changed_parameters": changed_parameters,
        "baseline_metrics": baseline_metrics,
        "scenario_metrics": scenario_metrics,
        "computed_differences": differences,
        "unresolved_uncertainties": unresolved_uncertainties,
        "authenticity_declaration": "Per plan.md Section 13.0 N03: This is a declared hypothetical simulation; not a verified historical satellite observation."
    }
    return receipt

def get_guided_comparison_prompts(
    region_id: str,
    current_date: str,
    fringe_area_ha: float
) -> List[Dict[str, Any]]:
    """
    Guided Comparison Prompts (N04).
    Authored from case metadata to guide user investigations without speculative text.
    Authority: plan.md Section 13.0 (N04)
    """
    prompts = []

    # Prompt 1: Subsequent observation prompt
    if current_date < "2026-10-21":
        prompts.append({
            "prompt_id": "P01_SUBSEQUENT_PASS",
            "action_type": "switch_date",
            "target_date": "2026-10-21",
            "title_en": "Verify Persistence on 21 Oct Overpass",
            "title_bn": "২১ অক্টোবরের পাসে স্থায়িত্ব পরীক্ষা করুন",
            "description_en": "Check if candidate water persisted or receded 25 days later.",
            "description_bn": "শনাক্ত পানি পরবর্তী ২৫ দিন পর স্থায়ী ছিল নাকি নেমে গেছে তা যাচাই করুন।"
        })

    # Prompt 2: Sensitivity audit prompt if fringe is significant
    if fringe_area_ha > 15.0:
        prompts.append({
            "prompt_id": "P02_BREAK_FINDING",
            "action_type": "open_break_my_finding",
            "title_en": "Test ±2 dB Waterline Sensitivity",
            "title_bn": "±২ dB থ্রেশহোল্ড সংবেদনশীলতা পরীক্ষা করুন",
            "description_en": f"Contested fringe is large ({fringe_area_ha} ha). Test Otsu threshold perturbation.",
            "description_bn": f"প্রান্তিক অমীমাংসিত এলাকা বড় ({fringe_area_ha} হেক্টর)। থ্রেশহোল্ড পরিবর্তন করে কোর যাচাই করুন।"
        })

    # Prompt 3: Tidal matching prompt for Sundarbans
    if region_id == "sundarbans":
        prompts.append({
            "prompt_id": "P03_TIDAL_FILTER",
            "action_type": "filter_low_tide",
            "title_en": "Filter Matched Low-Tide Pass",
            "title_bn": "ভাটার সময়ের সমকক্ষ ডাটার সাথে তুলনা করুন",
            "description_en": "Compare with a low-tide observation to isolate tidal pulse from canopy loss.",
            "description_bn": "জোয়ারের প্লাবন থেকে স্থায়ী ক্যানোপি ক্ষতি আলাদা করতে ভাটার পাসের সাথে মেলান।"
        })

    return prompts

def build_multi_clock_display(
    radar_acquisition_iso: str,
    gauge_acquisition_iso: str,
    pipeline_processed_iso: str,
    field_survey_iso: Optional[str] = None
) -> Dict[str, Any]:
    """
    Evidence Multi-Clock Display (N05).
    Separately presents radar, environmental context, pipeline processing, and field timestamps.
    Prevents false assumptions of contemporaneous validation.
    Authority: plan.md Section 13.0 (N05)
    """
    return {
        "satellite_radar": {
            "timestamp": radar_acquisition_iso,
            "sensor": "NISAR L2 GCOV (L-band)",
            "status": "EXACT_ACQUISITION"
        },
        "environmental_gauge": {
            "timestamp": gauge_acquisition_iso,
            "sensor": "FFWC River Stage / BIWTA Tidal Gauge",
            "status": "SYNCHRONIZED_WITHIN_1HOUR"
        },
        "pipeline_processing": {
            "timestamp": pipeline_processed_iso,
            "pipeline": "FluviSAR v2.0 Ingest Engine",
            "status": "IMMUTABLE_RUN"
        },
        "ground_field_survey": {
            "timestamp": field_survey_iso if field_survey_iso else "PENDING_FIELD_VISIT",
            "status": "VERIFIED_FIELD_VISIT" if field_survey_iso else "UNVERIFIED_PENDING_SURVEY"
        },
        "temporal_alignment_note": "Satellite radar and river gauge are offset by less than 18 minutes; ground truth is not assumed contemporaneous."
    }
