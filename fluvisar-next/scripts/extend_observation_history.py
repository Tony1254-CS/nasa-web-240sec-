"""Add source-dated optical imagery, six same-orbit RTC passes, and measured pair bundles."""
import copy
import json
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image
from rasterio.enums import Resampling
from rasterio.transform import from_bounds
from rasterio.vrt import WarpedVRT

import ingest_sentinel1 as ingest

ROOT=ingest.ROOT
PUBLIC=ROOT/'apps/web/public'
INDEX=PUBLIC/'observations/index.json'

def discover(region,record,kind):
 path=ROOT/f'data/raw/discovery-{region}-{kind}.json'
 if path.exists():return json.loads(path.read_text(encoding='utf8'))
 optical=kind=='optical'
 endpoint='https://earth-search.aws.element84.com/v1' if optical else ingest.CATALOG
 response=ingest.SESSION.post(endpoint+'/search',json={'collections':['sentinel-2-l2a' if optical else ingest.COLLECTION],
  'bbox':record['bbox'],'datetime':'2026-06-01T00:00:00Z/2026-11-05T23:59:59Z','limit':100},timeout=50)
 response.raise_for_status();bbox=record['bbox']
 scenes=[s for s in response.json()['features'] if s['bbox'][0]<=bbox[0] and s['bbox'][1]<=bbox[1] and s['bbox'][2]>=bbox[2] and s['bbox'][3]>=bbox[3]]
 if optical:scenes.sort(key=lambda s:s['properties'].get('eo:cloud_cover',100))
 else:scenes=sorted([s for s in scenes if s['properties'].get('platform')=='sentinel-1d'],key=lambda s:s['properties']['datetime'])
 ingest.write_json(path,scenes)
 return scenes

def radar(region,scene,record):
 date=scene['properties']['datetime'][:10]
 previous=next((o for o in record['observations'] if o['id']==scene['id']),None)
 transform,width,height,roi=ingest.grid(record['bbox'])
 directory=ROOT/'data/derived'/f's1-rtc-{region}-history-30m-v1'
 public=PUBLIC/'observations'/region
 bands={};paths={};hashes={}
 for band in ['vv','vh']:
  path=ROOT/previous['numeric_path' if band=='vv' else 'vh_numeric_path'] if previous else directory/f'{date}_{band}_db.tif'
  if path.exists():
   with rasterio.open(path) as ds: values=ds.read(1)
  else:
   print('Read RTC',region,date,band,flush=True)
   values,valid=ingest.read_band(scene['assets'][band]['href'],transform,width,height)
   values[~roi]=ingest.NODATA
   ingest.save_numeric(path,values,transform)
  bands[band]=values;paths[band]=path.relative_to(ROOT).as_posix();hashes[band]=ingest.sha(path)
  ingest.save_gray(public/f'{date}_{band}.png',values,transform,record['bbox'])
 valid=(bands['vv']!=ingest.NODATA)&(bands['vh']!=ingest.NODATA)&roi
 water=valid&(bands['vv']<ingest.THRESHOLD)
 ingest.save_mask(public/f'{date}_water.png',water,valid,transform,record['bbox'],[57,196,217,220])
 display=ingest.save_dual_polarization(public,region,date,bands['vv'],bands['vh'],valid,transform,record['bbox'])
 ingest.write_json(ROOT/'data/raw'/region/f'{scene["id"]}.json',scene)
 obs={**display,'id':scene['id'],'date':date,'datetime':scene['properties']['datetime'],
  'sensor':'Sentinel-1D C-band SAR RTC','platform':scene['properties']['platform'],
  'relative_orbit':scene['properties']['sat:relative_orbit'],'orbit_direction':scene['properties']['sat:orbit_state'],
  'polarizations':['VV','VH'],'source_url':f'{ingest.CATALOG}/collections/{ingest.COLLECTION}/items/{scene["id"]}',
  'source_assets':{band:scene['assets'][band]['href'] for band in ['vv','vh']},
  'numeric_path':paths['vv'],'vh_numeric_path':paths['vh'],'numeric_sha256':hashes,
  'valid_fraction':round(float(valid.sum()/roi.sum()),6),'valid_pixel_count':int(valid.sum()),
  'water_area_ha':round(float(water.sum()*.09),6),'mean_vv_db':float(bands['vv'][valid].mean()),'mean_vh_db':float(bands['vh'][valid].mean()),
  **{f'{band}_url':f'/observations/{region}/{date}_{band}.png' for band in ['vv','vh','water']},
  'display_sha256':{band:ingest.sha(public/f'{date}_{band}.png') for band in ['vv','vh','water']}}
 print('RTC ready',region,date,flush=True)
 return obs,{**bands,'valid':valid,'water':water}

def optical(region,scene,record):
 date=scene['properties']['datetime'][:10];path=PUBLIC/'observations'/region/f'{date}_optical.png'
 metadata=path.with_suffix('.json')
 if path.exists() and metadata.exists():return json.loads(metadata.read_text(encoding='utf8'))
 print('Read optical',region,date,flush=True)
 transform=from_bounds(*record['bbox'],1024,1024)
 with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR',GDAL_HTTP_TIMEOUT='45',GDAL_HTTP_MAX_RETRY='2',CPL_VSIL_CURL_ALLOWED_EXTENSIONS='.tif'):
  with rasterio.open(scene['assets']['visual']['href']) as src:
   with WarpedVRT(src,crs='EPSG:4326',transform=transform,width=1024,height=1024,resampling=Resampling.bilinear) as vrt:
    rgb=vrt.read([1,2,3]);valid=vrt.dataset_mask()>0
  with rasterio.open(scene['assets']['scl']['href']) as src:
   with WarpedVRT(src,crs='EPSG:4326',transform=transform,width=1024,height=1024,resampling=Resampling.nearest) as vrt:scl=vrt.read(1)
 Image.fromarray(np.dstack([rgb.transpose(1,2,0),valid.astype('uint8')*255])).save(path)
 obs={'id':scene['id'],'date':date,'datetime':scene['properties']['datetime'],'sensor':'Sentinel-2 L2A true colour',
  'url':f'/observations/{region}/{path.name}','bbox':record['bbox'],'source_url':f'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/{scene["id"]}',
  'source_assets':{b:scene['assets'][b]['href'] for b in ['visual','scl']},'display_sha256':ingest.sha(path),
  'cloud_fraction':round(float(np.isin(scl,[3,8,9,10,11]).sum()/scl.size),6),
  'scene_cloud_percent':scene['properties']['eo:cloud_cover'],'valid_fraction':round(float(valid.mean()),6),
  'display_method':'Actual Sentinel-2 TCI; clouds retained, no temporal substitution; EPSG:4326 ROI crop.'}
 ingest.write_json(metadata,obs);ingest.write_json(ROOT/'data/raw'/region/f'{scene["id"]}.json',scene)
 print('Optical ready',region,date,'ROI cloud/shadow',obs['cloud_fraction'],flush=True)
 return obs

def pair_bundle(region,record,a,b,arrays):
 pair=[a['date'],b['date']];key='_'.join(pair)
 if pair==record['pair']:return None
 x,y=arrays[a['date']],arrays[b['date']];common=x['valid']&y['valid'];w0=x['water']&common;w1=y['water']&common
 transform,_,_,roi=ingest.grid(record['bbox'])
 incoming,mask_in=ingest.candidate_features(region,'land-to-water',common&~w0&w1,transform)
 outgoing,mask_out=ingest.candidate_features(region,'water-to-land',common&w0&~w1,transform)
 directory=PUBLIC/'observations'/region/'pairs';directory.mkdir(parents=True,exist_ok=True)
 rgba=np.zeros((1024,1024,4),dtype='uint8')
 for mask,color in [(mask_in,[239,68,68,220]),(mask_out,[16,185,129,220])]:
  projected=ingest.display_array(np.where(common,mask.astype('float32'),ingest.NODATA),transform,record['bbox'],True);rgba[projected==1]=color
 change=directory/f'{key}.png';Image.fromarray(rgba).save(change)
 sensitivity=[]
 for threshold in [-18.,-17.,-16.]:
  v0=x['vv']<threshold;v1=y['vv']<threshold
  f0,_=ingest.components(common&~v0&v1);f1,_=ingest.components(common&v0&~v1)
  sensitivity.append({'threshold_db':threshold,'land_to_water_ha':round(float((f0>0).sum()*.09),6),'water_to_land_ha':round(float((f1>0).sum()*.09),6)})
 metrics={**record['metrics'],'land_to_water_ha':round(float(mask_in.sum()*.09),6),'water_to_land_ha':round(float(mask_out.sum()*.09),6),
  'raw_land_to_water_ha':round(float((common&~w0&w1).sum()*.09),6),'raw_water_to_land_ha':round(float((common&w0&~w1).sum()*.09),6),
  'water_area_t0_ha':round(float(w0.sum()*.09),6),'water_area_t1_ha':round(float(w1.sum()*.09),6),
  'common_valid_area_ha':round(float(common.sum()*.09),6),'common_valid_fraction':round(float(common.sum()/roi.sum()),6),
  'common_valid_pixel_count':int(common.sum()),'land_to_water_count':len(incoming),'water_to_land_count':len(outgoing),
  'candidate_count':len(incoming)+len(outgoing),'land_to_water_pixel_count':int(mask_in.sum()),'water_to_land_pixel_count':int(mask_out.sum())}
 run_id=f's1-rtc-{region}-{pair[0]}-{pair[1]}-30m-v1'
 common_path=ROOT/'data/derived'/run_id/'common_valid_mask.tif';ingest.save_numeric(common_path,common.astype('uint8'),transform,0)
 bundle={'run_id':run_id,'pair':pair,'metrics':metrics,'threshold_sensitivity':sensitivity,'findings':{'type':'FeatureCollection','features':incoming+outgoing},
  'change_url':'/'+change.relative_to(PUBLIC).as_posix(),'change_sha256':ingest.sha(change),'common_mask_path':common_path.relative_to(ROOT).as_posix()}
 path=directory/f'{key}.json';ingest.write_json(path,bundle)
 return key,'/'+path.relative_to(PUBLIC).as_posix()

def main():
 catalog=json.loads(INDEX.read_text(encoding='utf8'))
 for region,record in catalog['regions'].items():
  scenes=discover(region,record,'radar')
  orbit=record['observations'][0]['relative_orbit'];scenes=[s for s in scenes if s['properties']['sat:relative_orbit']==orbit]
  selected=[scenes[i] for i in [0,4,7,8,9,10]]
  optical_scenes=discover(region,record,'optical')
  selected_optical=optical_scenes[:4]
  for month in ['2026-06','2026-09']:
   selected_optical.append(next(s for s in optical_scenes if s['properties']['datetime'].startswith(month)))
  with ThreadPoolExecutor(max_workers=3) as pool:
   rf=[pool.submit(radar,region,s,record) for s in selected]
   of=[pool.submit(optical,region,s,record) for s in selected_optical]
   radar_results=[f.result() for f in rf];optical_results=[f.result() for f in of]
  by_date={o['date']:o for o,_ in radar_results};arrays={o['date']:a for o,a in radar_results}
  # Keep the existing default pair first for consumers that use the original two-scene bundle.
  record['observations']=[by_date[d] for d in record['pair']]+[o for o,_ in radar_results if o['date'] not in record['pair']]
  record['optical_observations']=sorted(optical_results,key=lambda o:o['date'])
  record['optical_pair']=[record['optical_observations'][0]['date'],max([o for o in optical_results if o['cloud_fraction']<.2] or optical_results,key=lambda o:o['date'])['date']]
  record['pair_bundles']={}
  obs=sorted(by_date.values(),key=lambda o:o['date'])
  for i,a in enumerate(obs):
   for b in obs[i+1:]:
    result=pair_bundle(region,record,a,b,arrays)
    if result:record['pair_bundles'][result[0]]=result[1]
  print('Region complete',region,'radar',len(obs),'optical',len(optical_results),'comparisons',len(record['pair_bundles']),flush=True)
 catalog['generated_at']=datetime.now(timezone.utc).isoformat()
 for path in [INDEX,PUBLIC/'observations/manifest.json',ROOT/'apps/web/src/data/observations.json']:
  ingest.write_json(path,catalog)
 print('Published complete observation history',flush=True)
 from expand_optical_context import main as expand_context
 expand_context()

if __name__=='__main__':main()
