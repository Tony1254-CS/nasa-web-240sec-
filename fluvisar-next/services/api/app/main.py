"""
FluviSAR Backend REST API
Authority: plan.md Section 16.1, Section 17
Source-linked API: numerical samples are read from downloaded, registered Sentinel-1 RTC GeoTIFFs.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional, List
from pathlib import Path
import json

app = FastAPI(
    title="FluviSAR Scientific API",
    version="1.0.0",
    description="Backend API for NASA Space Apps NISAR Web Observatory"
)

from app.assistant import router as assistant_router
app.include_router(assistant_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DERIVED = BASE_DIR / "data" / "derived"

# --- Regions Registry ---

REGIONS_DATA = {
    "jamuna": {
        "id": "jamuna",
        "name": {"en": "Jamuna River", "bn": "যমুনা নদী"},
        "search_bbox": [89.60, 25.40, 89.90, 25.75],
        "centre": [89.75, 25.575],
        "preferred_analysis_crs": "EPSG:32645",
        "case_ids": ["river-memory", "floodplain-recovery", "service-continuity"],
        "views": ["J1", "J2", "J3", "X1", "C1"],
        "capabilities": {
            "gcov": "required",
            "optical": "required",
            "polarimetry": "input-dependent",
            "gunw": "input-dependent",
            "stage_context": "access-and-support-dependent",
            "soil_moisture": "retrieval-dependent"
        },
        "readiness": "metadata-found"
    },
    "sundarbans": {
        "id": "sundarbans",
        "name": {"en": "Sundarbans Mangrove", "bn": "সুন্দরবন ম্যানগ্রোভ"},
        "search_bbox": [89.55, 21.75, 89.85, 22.00],
        "centre": [89.70, 21.875],
        "preferred_analysis_crs": "EPSG:32645",
        "case_ids": ["wetland-pulse", "forest-restoration"],
        "views": ["S1", "S2", "X1", "C1"],
        "capabilities": {
            "gcov": "required",
            "optical": "required",
            "polarimetry": "input-dependent",
            "gunw": "input-dependent",
            "tide_context": "access-and-support-dependent",
            "restoration": "intervention-and-reference-dependent",
            "soil_moisture": "retrieval-dependent"
        },
        "readiness": "metadata-found"
    }
}

CASES_DATA = {
    "river-memory": {
        "id": "river-memory",
        "region_id": "jamuna",
        "question": {
            "en": "What changed in river & floodplain land, and which water transitions represent permanent erosion?",
            "bn": "নদী ও প্লাবনভূমিতে কী পরিবর্তন হয়েছে এবং কোনগুলো স্থায়ী নদীভাঙনের প্রমাণ?"
        },
        "goal": {
            "en": "Distinguish temporary flood recession from permanent bankline recession.",
            "bn": "সাময়িক বন্যার পানি নিষ্কাশন ও স্থায়ী নদীভাঙনের মধ্যে পার্থক্য নিশ্চিত করা।"
        },
        "approved_run_ids": ["run-2026-prod-01"],
        "default_view": "J1"
    },
    "wetland-pulse": {
        "id": "wetland-pulse",
        "region_id": "sundarbans",
        "question": {
            "en": "How do wetland water and radar backscatter respond under tidal context?",
            "bn": "জোয়ার-ভাটার সময়ে সুন্দরবনের পানি ও রাডার সিগন্যাল কীভাবে পরিবর্তিত হয়?"
        },
        "goal": {
            "en": "Isolate tidal inundation under mangrove canopy using multi-polarization radar.",
            "bn": "মাল্টি-পোলারাইজেশন রাডার ব্যবহার করে বনের ক্যানোপির নিচে জোয়ারের পানি চিহ্নিত করা।"
        },
        "approved_run_ids": ["run-2026-prod-01"],
        "default_view": "S1"
    }
}

# --- Routes ---

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FluviSAR Scientific API",
        "version": "2.0.0",
        "observation_catalog": "source-linked Sentinel-1 RTC"
    }

@app.get("/api/regions")
def get_regions():
    """Returns the two verified active regions (plan.md Section 3)"""
    catalog = read_catalog()["regions"]
    return [{**value, "readiness": "processed", "run_id": catalog[key]["run_id"], "observation_dates": sorted(o['date'] for o in catalog[key]['observations']), 'optical_dates': sorted(o['date'] for o in catalog[key].get('optical_observations', []))} for key, value in REGIONS_DATA.items()]

@app.get("/api/regions/{region_id}")
def get_region(region_id: str):
    if region_id not in REGIONS_DATA:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found. Active regions are 'jamuna' and 'sundarbans'.")
    return {**REGIONS_DATA[region_id], "readiness": "processed", "run_id": read_catalog()["regions"][region_id]["run_id"]}

@app.get("/api/cases/{case_id}")
def get_case(case_id: str):
    if case_id not in CASES_DATA:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")
    case = CASES_DATA[case_id]
    return {**case, "approved_run_ids": [read_catalog()["regions"][case["region_id"]]["run_id"]]}


CATALOG_PATH = BASE_DIR / "apps" / "web" / "public" / "observations" / "index.json"

def read_catalog():
    if not CATALOG_PATH.is_file():
        raise HTTPException(503, "Run the satellite ingestion pipeline before querying observations.")
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))

@app.get("/api/evidence")
def evidence_catalog():
    return read_catalog()

@app.get("/api/runs/{run_id}/bundle")
def get_run_bundle(run_id: str):
    for region in read_catalog()["regions"].values():
        if region["run_id"] == run_id:
            return region
        for pair_key, url in region.get('pair_bundles', {}).items():
            expected=f"s1-rtc-{region['region_id']}-{pair_key.replace('_','-')}-30m-v1"
            if expected == run_id:
                path=BASE_DIR/'apps/web/public'/url.lstrip('/')
                return {**region, **json.loads(path.read_text(encoding='utf-8'))}
    raise HTTPException(404, "Analysis run does not exist in the source catalogue.")

@app.get("/api/artifacts/{artifact_id}/sample")
def sample_numeric_artifact(artifact_id: str, lon: float = Query(..., ge=-180, le=180), lat: float = Query(..., ge=-90, le=90), channel: str = Query("vv", pattern="^(vv|vh)$")):
    import math
    from app.raster_runtime import rasterio, transform
    observation = None
    region_entry = None
    for region in read_catalog()["regions"].values():
        for item in region["observations"]:
            if item["id"] == artifact_id:
                observation, region_entry = item, region
                break
    if observation is None:
        raise HTTPException(404, "Unknown numerical observation artifact.")
    field = "vh_numeric_path" if channel == "vh" else "numeric_path"
    artifact_path = (BASE_DIR / observation[field]).resolve()
    if not artifact_path.is_relative_to(DATA_DERIVED.resolve()) or not artifact_path.is_file():
        raise HTTPException(503, "Registered numerical raster is missing; rerun ingestion.")
    result = {"artifact_id": artifact_id, "lon": lon, "lat": lat, "value": None, "unit": "dB", "masked": True, "source_channel": channel.upper(), "pixel_resolution_m": region_entry["resolution_m"], "source_observation_id": observation["id"], "source_url": observation["source_url"], "reason": "Outside valid observation support"}
    with rasterio.open(artifact_path) as dataset:
        x, y = transform("EPSG:4326", dataset.crs, [lon], [lat])
        row, col = dataset.index(x[0], y[0])
        if 0 <= row < dataset.height and 0 <= col < dataset.width:
            sample = dataset.read(1, window=((row, row+1),(col,col+1)), masked=True)
            if not sample.mask.any():
                measured = float(sample[0,0])
                if math.isfinite(measured):
                    result.update(value=measured, masked=False, reason=None)
    return result

@app.get('/api/runs/{run_id}/evidence/{stage}')
def review_evidence_stage(run_id: str, stage: str, finding_id: Optional[str] = None, optical_before: Optional[str] = None, optical_after: Optional[str] = None):
    from app.evidence import build_stage
    if stage not in ('detect','investigate','challenge','explain','field','impact'):
        raise HTTPException(404, 'Unknown evidence stage')
    bundle=get_run_bundle(run_id)
    for date in (optical_before,optical_after):
        if date and date not in {o['date'] for o in bundle.get('optical_observations',[])}:
            raise HTTPException(400, 'Optical date is not a registered acquisition')
    try:
        return build_stage(bundle,stage,finding_id,optical_before,optical_after)
    except KeyError as error:
        raise HTTPException(404, str(error)) from error
    except ValueError as error:
        raise HTTPException(503, str(error)) from error

@app.get('/api/runs/{run_id}/decision-context')
def review_decision_context(run_id: str, finding_id: Optional[str] = None):
    get_run_bundle(run_id)
    try:
        from app.decision import decision_context
        return decision_context(run_id, finding_id)
    except ImportError as error:
        raise HTTPException(503, 'The numerical analysis runtime could not load. Restore its dependencies or compute this comparison on a supported host.') from error
    except KeyError as error:
        raise HTTPException(404, str(error)) from error
    except ValueError as error:
        raise HTTPException(503, str(error)) from error
