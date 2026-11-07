import hashlib
import json
import math
import sys
from pathlib import Path

import numpy as np
import pytest
import rasterio
from starlette.testclient import TestClient

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'services/api'))
from app.main import app

CATALOG=json.loads((ROOT/'apps/web/public/observations/index.json').read_text(encoding='utf8'))
CLIENT=TestClient(app)

def review(region,stage,**params):
 record=CATALOG['regions'][region]
 response=CLIENT.get(f"/api/runs/{record['run_id']}/evidence/{stage}",params=params)
 assert response.status_code==200,response.text
 result=response.json();assert result['region_id']==region and result['pair']==record['pair']
 assert result['logs'] and result['computed_at']
 return result

@pytest.mark.parametrize('region',['jamuna','sundarbans'])
def test_histogram_counts_equal_registered_common_support(region):
 record=CATALOG['regions'][region];result=review(region,'detect')
 hist=result['histogram'];assert sum(hist['counts_t0'])==sum(hist['counts_t1'])==record['metrics']['common_valid_pixel_count']
 with rasterio.open(ROOT/record['common_mask_path']) as source:support=source.read(1).astype(bool)
 by_date={o['date']:o for o in record['observations']}
 for index,date in enumerate(record['pair']):
  with rasterio.open(ROOT/by_date[date]['numeric_path']) as source:values=source.read(1)[support]
  counts,_=np.histogram(values,bins=np.array(hist['edges_db']))
  assert counts.tolist()==hist['counts_t0' if index==0 else 'counts_t1']

@pytest.mark.parametrize('region',['jamuna','sundarbans'])
def test_threshold_tests_match_independently_retained_analysis(region):
 record=CATALOG['regions'][region];result=review(region,'challenge')
 assert result['sensitivity']==record['threshold_sensitivity']
 primary=record['metrics']['land_to_water_ha']+record['metrics']['water_to_land_ha']
 assert 0<=result['robust_core_ha']<=primary
 assert result['contested_fringe_ha']>=0
 feature=record['findings']['features'][0]
 focused=review(region,'detect',finding_id=feature['properties']['id'])
 assert focused['histogram']['valid_pixel_count']==feature['properties']['pixel_count']
 assert math.isclose(focused['selected_area_ha'],feature['properties']['area_ha'])

@pytest.mark.parametrize('region',['jamuna','sundarbans'])
def test_investigate_explain_and_field_do_not_fabricate_confirmation(region):
 record=CATALOG['regions'][region]
 investigation=review(region,'investigate')
 assert {o['id'] for o in investigation['observations']}=={o['id'] for o in record['observations'] if o['date'] in record['pair']}
 assert all(o['source_url'] and o['gap_days']>=0 for o in investigation['optical'])
 explanation=review(region,'explain');assert explanation['verdict']=='SCREENING CANDIDATE'
 assert 'confidence' not in explanation and 'probability' not in explanation
 field=review(region,'field');assert field['status']=='awaiting observation'
 assert field['task']['region_id']==region and field['task']['questions']

@pytest.mark.parametrize('region',['jamuna','sundarbans'])
def test_exposure_uses_actual_archived_sources_and_consistent_intersections(region):
 record=CATALOG['regions'][region];result=review(region,'impact')
 source=result['source'];path=ROOT/'apps/web/public'/source['assets_url'].lstrip('/')
 assert hashlib.sha256(path.read_bytes()).hexdigest()==source['assets_sha256']
 assets=json.loads(path.read_text(encoding='utf8'))['features'];ids={f['properties']['id'] for f in assets}
 assert len(assets)==source['asset_count'] and all(row['id'] in ids for row in result['intersections'])
 for category in ['land-to-water','water-to-land']:
  rows=[row for row in result['intersections'] if row['category']==category]
  counts=result['assets'][category]
  for kind in ['building','road','facility','settlement']:assert counts[kind]==sum(row['kind']==kind for row in rows)
  assert abs(sum(row['intersected_road_m'] for row in rows)-counts['road_length_m'])<1
  expected=record['metrics']['land_to_water_ha' if category=='land-to-water' else 'water_to_land_ha']
  assert sum(result['landcover'][category].values())<=expected+.001
 with rasterio.open(ROOT/source['landcover']['path']) as dataset:reference=dataset.read(1)
 for code,label in source['landcover']['classes'].items():
  assert math.isclose(result['reference_inventory_ha'][label],np.count_nonzero(reference==int(code))*.09,abs_tol=1e-6)
 assert source['landcover']['year']==2021

def test_unknown_contexts_and_false_source_dates_are_rejected():
 run=CATALOG['regions']['jamuna']['run_id'];base=f'/api/runs/{run}/evidence/'
 assert CLIENT.get(base+'made-up').status_code==404
 assert CLIENT.get(base+'detect',params={'finding_id':'not-in-this-pair'}).status_code==404
 assert CLIENT.get(base+'investigate',params={'optical_before':'2026-08-26'}).status_code==400
 assert CLIENT.get('/api/runs/not-a-run/evidence/detect').status_code==404
