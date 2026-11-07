"""Acquire OSM asset geometry and the actual ESA WorldCover 2021 reference grid."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import requests
import numpy as np
import rasterio
from rasterio.enums import Resampling
from rasterio.vrt import WarpedVRT
import ingest_sentinel1 as ingest

ROOT=ingest.ROOT

def process(region,record):
 raw=ROOT/'data/raw'/region/'osm-evidence.json';raw.parent.mkdir(parents=True,exist_ok=True)
 w,s,e,n=record['bbox'];bbox=f'{s},{w},{n},{e}'
 query=f'[out:json][timeout:90];(way["building"]({bbox});way["highway"]({bbox});node["amenity"]({bbox});way["amenity"]({bbox});node["place"]({bbox}););out body geom;'
 endpoint='https://overpass-api.de/api/interpreter'
 if not raw.exists():
  print('Download OSM assets',region,flush=True)
  for server in [endpoint,'https://overpass.kumi.systems/api/interpreter','https://overpass.private.coffee/api/interpreter']:
   try:
    response=requests.get(server,params={'data':query},headers={'User-Agent':'FluviSAR/1.0 (academic Earth observation prototype; one-time Bangladesh exposure extract)'},timeout=110);response.raise_for_status();data=response.json()
    if 'remark' in data:raise RuntimeError(data['remark'])
    ingest.write_json(raw,data);endpoint=server;break
   except Exception as error:
    print('OSM endpoint retry',region,type(error).__name__,flush=True)
  if not raw.exists():raise RuntimeError('OSM source could not be acquired')
 data=json.loads(raw.read_text(encoding='utf8'));features=[]
 for item in data['elements']:
  tags=item.get('tags',{});geometry=None
  if item['type']=='node':geometry={'type':'Point','coordinates':[item['lon'],item['lat']]}
  elif item.get('geometry'):
   points=[[p['lon'],p['lat']] for p in item['geometry']]
   if len(points)>=4 and points[0]==points[-1] and ('building' in tags or 'amenity' in tags):geometry={'type':'Polygon','coordinates':[points]}
   elif len(points)>=2:geometry={'type':'LineString','coordinates':points}
  if not geometry:continue
  ident=f"{item['type']}/{item['id']}"
  features.append({'type':'Feature','geometry':geometry,'properties':{'id':ident,'name':tags.get('name:en',tags.get('name',ident)),
   'kind':'building' if 'building' in tags else 'road' if 'highway' in tags else 'facility' if 'amenity' in tags else 'settlement',
   'tags':tags,'source_url':'https://www.openstreetmap.org/'+ident}})
 public=ROOT/'apps/web/public/observations'/region
 assets=public/'assets.geojson';ingest.write_json(assets,{'type':'FeatureCollection','features':features})
 tile='N24E087' if region=='jamuna' else 'N21E087'
 url=f'https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_{tile}_Map.tif'
 numeric=ROOT/'data/derived'/f'{region}-reference-2021'/'landcover.tif'
 transform,width,height,roi=ingest.grid(record['bbox'])
 if not numeric.exists():
  print('Download WorldCover reference',region,flush=True)
  with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR',GDAL_HTTP_TIMEOUT='45',GDAL_HTTP_MAX_RETRY='2',CPL_VSIL_CURL_ALLOWED_EXTENSIONS='.tif',GDAL_HTTP_MERGE_CONSECUTIVE_RANGES='YES'):
   with rasterio.open(url) as source:
    with WarpedVRT(source,crs=ingest.CRS,transform=transform,width=width,height=height,resampling=Resampling.nearest,nodata=0) as vrt:values=vrt.read(1)
  values[~roi]=0;ingest.save_numeric(numeric,values.astype('uint8'),transform,0)
 metadata={'region_id':region,'retrieved_at':datetime.now(timezone.utc).isoformat(),'osm_timestamp':data.get('osm3s',{}).get('timestamp_osm_base'),
  'assets_url':f'/observations/{region}/assets.geojson','asset_count':len(features),'assets_sha256':ingest.sha(assets),
  'osm_query':query,'osm_endpoint':endpoint,'osm_raw_sha256':ingest.sha(raw),'osm_license':'ODbL 1.0','osm_attribution':'© OpenStreetMap contributors','osm_license_url':'https://www.openstreetmap.org/copyright',
  'landcover':{'name':'ESA WorldCover 2021 v200','source_url':url,'documentation_url':'https://esa-worldcover.org/en/data-access',
   'attribution':'ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium','license':'CC-BY-4.0',
   'year':2021,'path':numeric.relative_to(ROOT).as_posix(),'sha256':ingest.sha(numeric),'source_resolution_m':10,'analysis_resolution_m':30,
   'classes':{'10':'Tree cover','20':'Shrubland','30':'Grassland','40':'Cropland','50':'Built-up','60':'Bare/sparse vegetation','70':'Snow/ice','80':'Permanent water','90':'Herbaceous wetland','95':'Mangroves','100':'Moss/lichen'}}}
 ingest.write_json(public/'evidence-context.json',metadata)
 print('Evidence context ready',region,len(features),'mapped assets',flush=True)

def main():
 catalog=json.loads((ROOT/'apps/web/public/observations/index.json').read_text(encoding='utf8'))
 with ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(lambda args:process(*args),catalog['regions'].items()))

if __name__=='__main__':main()
