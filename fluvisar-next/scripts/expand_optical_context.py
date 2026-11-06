"""Render the actual dated Sentinel-2 tile beyond the smaller analysis footprint."""
import json
from concurrent.futures import ThreadPoolExecutor
import numpy as np
import rasterio
from rasterio.enums import Resampling
from rasterio.transform import from_bounds
from rasterio.vrt import WarpedVRT
from rasterio.warp import reproject
from affine import Affine
from PIL import Image
import ingest_sentinel1 as ingest

def expand(region,observation):
 root=ingest.ROOT;public=root/'apps/web/public'
 scene=json.loads((root/'data/raw'/region/f'{observation["id"]}.json').read_text(encoding='utf8'))
 bbox=scene['bbox'][:4];path=public/'observations'/region/f'{observation["date"]}_optical_context.png'
 if not path.exists():
  print('Read dated optical context',region,observation['date'],flush=True)
  with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR',GDAL_HTTP_TIMEOUT='45',GDAL_HTTP_MAX_RETRY='2',CPL_VSIL_CURL_ALLOWED_EXTENSIONS='.tif',GDAL_HTTP_MERGE_CONSECUTIVE_RANGES='YES'):
   with rasterio.open(scene['assets']['visual']['href']) as source:
    # Read the COG overview once before warping. A remote WarpedVRT over the
    # entire tile otherwise issues many repeated HTTP block requests.
    overview=source.read([1,2,3],out_shape=(3,2048,2048),resampling=Resampling.bilinear)
    src_transform=source.transform*Affine.scale(source.width/2048,source.height/2048)
    src_crs=source.crs
  rgb=np.zeros((3,2048,2048),dtype='uint8')
  reproject(overview,rgb,src_transform=src_transform,src_crs=src_crs,src_nodata=0,dst_transform=from_bounds(*bbox,2048,2048),dst_crs='EPSG:4326',dst_nodata=0,resampling=Resampling.bilinear)
  valid=np.any(rgb>0,axis=0)
  Image.fromarray(np.dstack([rgb.transpose(1,2,0),valid.astype('uint8')*255])).save(path)
 return {**observation,'roi_url':observation.get('roi_url',observation['url']),
  'roi_display_sha256':observation.get('roi_display_sha256',observation['display_sha256']),
  'url':'/'+path.relative_to(public).as_posix(),'display_bbox':bbox,'display_sha256':ingest.sha(path),
  'display_method':'Actual Sentinel-2 TCI source tile resampled to 2048px in EPSG:4326. Clouds retained. Analysis and ROI cloud statistics use the smaller bbox.'}

def main():
 root=ingest.ROOT;target=root/'apps/web/public/observations/index.json';catalog=json.loads(target.read_text(encoding='utf8'))
 with ThreadPoolExecutor(max_workers=3) as pool:
  tasks=[(region,pool.submit(expand,region,obs)) for region,record in catalog['regions'].items() for obs in record.get('optical_observations',[])]
  result={region:[] for region in catalog['regions']}
  for region,future in tasks:result[region].append(future.result())
 for region,observations in result.items():catalog['regions'][region]['optical_observations']=observations
 for path in [target,root/'apps/web/public/observations/manifest.json',root/'apps/web/src/data/observations.json']:ingest.write_json(path,catalog)
 print('Published full dated optical context',flush=True)

if __name__=='__main__':main()
