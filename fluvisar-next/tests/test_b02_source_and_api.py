"""
Verification tests for Milestone B02: GCOV linear-to-dB conversion, statistics, and FastAPI endpoints.
Authority: plan.md Section 10.2, 10.3, 16.3, 17.0
"""

import sys
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "pipeline" / "fluvisar" / "adapters"))
sys.path.insert(0, str(BASE_DIR / "services" / "api"))

from gcov import linear_power_to_db, compute_raster_statistics, GCOVAdapter
from app.main import app
from starlette.testclient import TestClient

def test_linear_power_to_db_conversion():
    # 1.0 linear power = 0.0 dB
    # 0.1 linear power = -10.0 dB
    # 0.01 linear power = -20.0 dB
    power = np.array([1.0, 0.1, 0.01, -1.0, 0.0, -9999.0], dtype=np.float32)
    db, valid_mask = linear_power_to_db(power, nodata_val=-9999.0)

    assert valid_mask[0] == True
    assert valid_mask[1] == True
    assert valid_mask[2] == True
    assert valid_mask[3] == False # Negative power
    assert valid_mask[4] == False # Zero power
    assert valid_mask[5] == False # Nodata

    assert np.isclose(db[0], 0.0, atol=1e-3)
    assert np.isclose(db[1], -10.0, atol=1e-3)
    assert np.isclose(db[2], -20.0, atol=1e-3)
    assert db[3] == -9999.0
    assert db[4] == -9999.0

def test_compute_raster_statistics():
    power = np.array([0.1, 0.01, 0.01, 0.001], dtype=np.float32)
    db, valid_mask = linear_power_to_db(power)
    stats = compute_raster_statistics(db, valid_mask)

    assert stats["valid_pixel_count"] == 4
    assert stats["valid_fraction"] == 1.0
    assert np.isclose(stats["max_db"], -10.0, atol=1e-3)
    assert np.isclose(stats["min_db"], -30.0, atol=1e-3)

def test_gcov_adapter_point_sampling():
    adapter = GCOVAdapter(region_id="jamuna")
    bounds = (89.60, 25.40, 89.90, 25.75)
    grid = np.full((100, 100), -15.4, dtype=np.float32)

    # Sample inside
    res_inside = adapter.sample_point(lon=89.75, lat=25.55, bounds=bounds, db_grid=grid)
    assert res_inside["masked"] == False
    assert res_inside["value"] == -15.4
    assert res_inside["unit"] == "dB"

    # Sample outside
    res_outside = adapter.sample_point(lon=91.00, lat=25.55, bounds=bounds, db_grid=grid)
    assert res_outside["masked"] == True
    assert res_outside["value"] is None
    assert "Outside" in res_outside["reason"]

def test_fastapi_endpoints():
    client = TestClient(app)
    
    # 1. Health
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    # 2. Regions (Jamuna & Sundarbans)
    res = client.get("/api/regions")
    assert res.status_code == 200
    regions = res.json()
    assert len(regions) == 2
    ids = [r["id"] for r in regions]
    assert "jamuna" in ids
    assert "sundarbans" in ids

    # 3. Artifact Sampling API
    sample_res = client.get("/api/artifacts/art-jamuna-gcov/sample?lon=89.75&lat=25.55")
    assert sample_res.status_code == 200
    data = sample_res.json()
    assert data["masked"] == False
    assert isinstance(data["value"], float)
    assert data["unit"] == "dB"

    # 4. Out of bounds sampling
    oob_res = client.get("/api/artifacts/art-jamuna-gcov/sample?lon=91.00&lat=25.55")
    assert oob_res.status_code == 200
    oob_data = oob_res.json()
    assert oob_data["masked"] == True
    assert oob_data["value"] is None

if __name__ == "__main__":
    test_linear_power_to_db_conversion()
    test_compute_raster_statistics()
    test_gcov_adapter_point_sampling()
    test_fastapi_endpoints()
    print("All Milestone B02 verification tests PASSED successfully!")

