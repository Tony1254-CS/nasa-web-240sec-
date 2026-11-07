"""Check the decision view against numerical artifacts, not presentation constants."""
import hashlib
import json
import sys
from pathlib import Path
import numpy as np
import pytest
import rasterio
from rasterio.features import rasterize
from rasterio.warp import transform_geom
from starlette.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'services/api'))
from app.main import app
CATALOG = json.loads((ROOT/'apps/web/public/observations/index.json').read_text())
CLIENT = TestClient(app)


@pytest.mark.parametrize('region', ['jamuna', 'sundarbans'])
def test_history_and_asset_priority_are_source_backed(region):
    bundle = CATALOG['regions'][region]
    response = CLIENT.get(f"/api/runs/{bundle['run_id']}/decision-context")
    assert response.status_code == 200, response.text
    data = response.json()
    assert len(data['history']) == 6
    for row in data['history']:
        observation = next(o for o in bundle['observations'] if o['date'] == row['date'])
        assert row['water_area_ha'] == pytest.approx(observation['water_area_ha'])
        assert row['id'] == observation['id']
        assert row['source_url'] == observation['source_url']
        assert 0 <= row['valid_fraction'] <= 1
    assert set(data['candidate_review']) == {f['properties']['id'] for f in bundle['findings']['features']}
    for finding in bundle['findings']['features']:
        stats = data['candidate_review'][finding['properties']['id']]
        assert 0 <= stats['robust_fraction'] <= 1
        assert stats['robust_core_ha'] <= finding['properties']['area_ha'] + 1e-6
        assert stats['asset_count'] == sum(stats[k] for k in ('building','road','facility','settlement'))
    intersections = data['exposure']['intersections']
    assert {f['properties']['id'] for f in data['exposure']['map_assets']['features']} == {row['id'] for row in intersections}
    if region == 'jamuna':
        assert data['exposure']['assets']['land-to-water']['building'] == 36
        assert data['exposure']['assets']['land-to-water']['road_length_m'] == pytest.approx(393.83)


def test_selected_history_uses_polygon_pixels_and_pair_isolation():
    bundle = CATALOG['regions']['sundarbans']
    finding = bundle['findings']['features'][0]
    result = CLIENT.get(f"/api/runs/{bundle['run_id']}/decision-context", params={'finding_id':finding['properties']['id']})
    assert result.status_code == 200, result.text
    data = result.json()
    observation = bundle['observations'][0]
    row = next(r for r in data['history'] if r['date'] == observation['date'])
    with rasterio.open(ROOT/observation['numeric_path']) as raster:
        values = raster.read(1)
        geometry = transform_geom('EPSG:4326', raster.crs, finding['geometry'])
        mask = rasterize([(geometry,1)],out_shape=values.shape,transform=raster.transform,fill=0,dtype='uint8').astype(bool)
        expected = int(np.count_nonzero(mask & np.isfinite(values) & (values < bundle['threshold_db']))) * .09
    assert row['water_area_ha'] == pytest.approx(expected)
    assert data['finding_id'] == finding['properties']['id']
    other_url = next(iter(bundle['pair_bundles'].values()))
    other = json.loads((ROOT/'apps/web/public'/other_url.lstrip('/')).read_text())
    pair_result = CLIENT.get(f"/api/runs/{other['run_id']}/decision-context")
    assert pair_result.status_code == 200
    assert pair_result.json()['pair'] == other['pair']
    assert pair_result.json()['run_id'] != bundle['run_id']
    invalid = CLIENT.get(f"/api/runs/{bundle['run_id']}/decision-context",params={'finding_id':'invented'})
    assert invalid.status_code == 404


@pytest.mark.parametrize('region', ['jamuna','sundarbans'])
def test_nasa_snapshot_preserves_rainfall_sources_and_catalog_identity(region):
    data = json.loads((ROOT/f'apps/web/public/observations/{region}/nasa-context.json').read_text())
    raw = ROOT/f'data/raw/{region}/decision-context'
    rain = data['rainfall']
    assert hashlib.sha256((raw/'imerg.json').read_bytes()).hexdigest() == rain['sha256']
    assert hashlib.sha256((raw/'geosit.json').read_bytes()).hexdigest() == rain['fallback_sha256']
    original = json.loads((raw/'imerg.json').read_text())['properties']['parameter']['IMERG_PRECTOT']
    fallback = json.loads((raw/'geosit.json').read_text())['properties']['parameter']['PRECTOTCORR']
    for row in rain['rows']:
        key = row['date'].replace('-','')
        if original[key] >= 0:
            assert row['source'] == 'IMERG' and row['mm'] == original[key]
        else:
            assert row['source'] == 'POWER_PRECTOTCORR' and row['mm'] == fallback[key]
    assert rain['time_standard'] == 'UTC'
    assert data['nisar']['record_count'] > 0
    assert all(r['id'].startswith('NISAR_') and r['track'] for r in data['nisar']['records'])
    pair = data['nisar']['preview_pair']
    assert len(pair) == 2 and pair[0]['datetime'] < pair[1]['datetime']
    assert (pair[0]['track'],pair[0]['frame'],pair[0]['polarization']) == (pair[1]['track'],pair[1]['frame'],pair[1]['polarization'])
