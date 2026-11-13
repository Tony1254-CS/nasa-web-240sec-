"""
Test TRACE Field Evidence Return Loop & Handoff Endpoints
Authority: plan.md Section 14 (A01-A12, AX01-AX12)
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "services" / "api"))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_trace_cases():
    res = client.get("/api/trace/cases")
    assert res.status_code == 200
    cases = res.json()
    assert isinstance(cases, list)
    assert len(cases) >= 2
    ids = [c["id"] for c in cases]
    assert "CASE-JAMUNA-01" in ids
    assert "CASE-SUNDARBANS-01" in ids

def test_trace_observations_crud():
    # 1. Fetch initial observations
    res = client.get("/api/trace/observations")
    assert res.status_code == 200
    initial_obs = res.json()
    assert isinstance(initial_obs, list)

    # 2. Submit new structured observation
    test_id = "OBS-TEST-VERIFY-001"
    payload = {
        "id": test_id,
        "finding_id": "FINDING-JAMUNA-2026-CHILMARI-01",
        "region_id": "jamuna",
        "verdict": "SUPPORTS",
        "gps_lat": 25.5652,
        "gps_lon": 89.6641,
        "gps_accuracy_m": 3.8,
        "notes": "Verified active bankline slump along Chilmari western bend. Water is cutting through silt.",
        "observer_name": "Field Unit Alpha",
        "photo_data_url": None,
        "timestamp": "2026-11-07T03:30:00Z",
        "sample_type": "VERIFIED_FIELD_RECORD"
    }

    post_res = client.post("/api/trace/observations", json=payload)
    assert post_res.status_code == 200
    data = post_res.json()
    assert data["status"] == "success"
    assert data["record"]["review_status"] == "AWAITING_REVIEW"

    # 3. Test idempotency (submitting duplicate ID returns existing record without duplicate insertion)
    dup_res = client.post("/api/trace/observations", json=payload)
    assert dup_res.status_code == 200
    assert "already synced" in dup_res.json()["message"]

    # 4. Filter by finding_id
    filter_res = client.get("/api/trace/observations?finding_id=FINDING-JAMUNA-2026-CHILMARI-01")
    assert filter_res.status_code == 200
    filtered = filter_res.json()
    assert any(o["id"] == test_id for o in filtered)

    # 5. Scientific human review update
    review_res = client.patch(f"/api/trace/observations/{test_id}/review?status=CONFIRMED&reviewer=Chief+Geomorphologist")
    assert review_res.status_code == 200
    assert review_res.json()["record"]["review_status"] == "CONFIRMED"

if __name__ == "__main__":
    test_trace_cases()
    test_trace_observations_crud()
    print("✅ All TRACE Field endpoint tests passed successfully!")

