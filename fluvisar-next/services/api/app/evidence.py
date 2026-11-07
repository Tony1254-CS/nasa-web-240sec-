"""Source-backed, on-demand evidence review. No probabilistic confidence is invented."""
import hashlib
import json
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
import numpy as np
import rasterio
from rasterio.features import rasterize
from rasterio.warp import transform_geom
from scipy import ndimage

ROOT=Path(__file__).resolve().parents[3]
PUBLIC=ROOT/'apps/web/public'

def read_registered(path):
 target=(ROOT/path).resolve()
 if not target.is_relative_to((ROOT/'data/derived').resolve()) or not target.is_file():raise ValueError('Registered numerical artifact is missing')
 with rasterio.open(target) as source:return source.read(1),source.transform,source.crs.to_string()

def pair_inputs(bundle):
 by_date={o['date']:o for o in bundle['observations']}
 return [by_date[date] for date in bundle['pair']]

def features(bundle,finding_id):
 selected=[f for f in bundle['findings']['features'] if not finding_id or f['properties']['id']==finding_id]
 if finding_id and not selected:raise KeyError('Finding is not part of the selected radar pair')
 return selected

def numerical(bundle,finding_id):
 observations=pair_inputs(bundle)
 a,transform,crs=read_registered(observations[0]['numeric_path']);b,transform_b,crs_b=read_registered(observations[1]['numeric_path'])
 if a.shape!=b.shape or transform!=transform_b or crs!=crs_b:raise ValueError('Pair is not aligned')
 common,_,_=read_registered(bundle['common_mask_path']);common=common.astype(bool)
 selected=features(bundle,finding_id)
 scope=common.copy()
 if finding_id:
  geometries=[transform_geom('EPSG:4326',crs,f['geometry']) for f in selected]
  scope&=rasterize([(g,1) for g in geometries],out_shape=a.shape,transform=transform,fill=0,dtype='uint8').astype(bool)
 return observations,a,b,common,scope,transform,crs

def filtered(mask,minimum):
 labels,_=ndimage.label(mask,structure=ndimage.generate_binary_structure(2,1));counts=np.bincount(labels.ravel());keep=counts>=minimum;keep[0]=False
 return keep[labels]

@lru_cache(maxsize=4)
def asset_index(region,checksum):
 from shapely import STRtree,box
 path=PUBLIC/'observations'/region/'assets.geojson'
 if hashlib.sha256(path.read_bytes()).hexdigest()!=checksum:raise ValueError('Asset snapshot checksum mismatch')
 assets=json.loads(path.read_text(encoding='utf8'))['features']
 bounds=[]
 for feature in assets:
  geometry=feature['geometry'];points=geometry['coordinates']
  if geometry['type']=='Point':points=[points]
  elif geometry['type']=='Polygon':points=points[0]
  bounds.append([min(p[0] for p in points),min(p[1] for p in points),max(p[0] for p in points),max(p[1] for p in points)])
 bounds=np.array(bounds,dtype='float64').reshape(-1,4)
 return assets,STRtree(box(bounds[:,0],bounds[:,1],bounds[:,2],bounds[:,3]))

def impact(bundle,finding_id):
 from shapely.geometry import shape
 from shapely.ops import unary_union
 from shapely import make_valid
 context_path=PUBLIC/'observations'/bundle['region_id']/'evidence-context.json'
 if not context_path.exists():raise ValueError('Exposure source archive must be acquired before analysis')
 context=json.loads(context_path.read_text(encoding='utf8'))
 assets,tree=asset_index(bundle['region_id'],context['assets_sha256'])
 selected=features(bundle,finding_id);cover,transform,crs=read_registered(context['landcover']['path'])
 results={};landcover={};rows=[]
 for category in ['land-to-water','water-to-land']:
  category_features=[f for f in selected if f['properties']['category']==category]
  projected=[transform_geom('EPSG:4326',crs,f['geometry']) for f in category_features]
  projected_shapes=[make_valid(shape(g)) for g in projected]
  geographic_shapes=[make_valid(shape(f['geometry'])) for f in category_features]
  counts={'building':0,'road':0,'facility':0,'settlement':0};road_length=0
  if projected_shapes:
   # Join each candidate against the spatial index first. Intersect assets only
   # with nearby candidate geometry rather than the entire complex reach union.
   # This preserves exact overlap while avoiding minute-long seasonal comparisons.
   matches={}
   for candidate_index,asset_index_value in tree.query(geographic_shapes,predicate='intersects').T:
    matches.setdefault(int(asset_index_value),[]).append(int(candidate_index))
   for index,candidate_indices in matches.items():
    local_union=unary_union([projected_shapes[i] for i in candidate_indices])
    asset=assets[index];geometry=make_valid(shape(transform_geom('EPSG:4326',crs,asset['geometry'])));overlap=geometry.intersection(local_union)
    if overlap.is_empty:continue
    if geometry.geom_type in ('Polygon','MultiPolygon') and overlap.area<=0:continue
    if geometry.geom_type in ('LineString','MultiLineString') and overlap.length<=0:continue
    props=asset['properties'];kind=props['kind'];counts[kind]+=1
    length=overlap.length if kind=='road' else 0;road_length+=length
    rows.append({**props,'category':category,'intersected_road_m':round(length,2)})
  counts['road_length_m']=round(road_length,2);results[category]=counts
  mask=rasterize([(g,1) for g in projected],out_shape=cover.shape,transform=transform,fill=0,dtype='uint8').astype(bool) if projected else np.zeros(cover.shape,dtype=bool)
  landcover[category]={label:round(float(np.count_nonzero(mask&(cover==int(code)))*.09),6) for code,label in context['landcover']['classes'].items()}
 return {'status':'screening','assets':results,'intersections':rows,'landcover':landcover,
  'reference_inventory_ha':{label:round(float(np.count_nonzero(cover==int(code))*.09),6) for code,label in context['landcover']['classes'].items()},'source':context,
  'notes':['Spatial intersection with mapped objects is potential exposure, not observed damage or a count of households.',
   'OSM coverage is incomplete. Zero intersections means none in this mapped snapshot, not absence of real assets.',
   'WorldCover 2021 is a historical land-cover reference resampled to the 30 m analysis grid; it does not establish current forest/crop loss.']}

def build_stage(bundle,stage,finding_id=None,optical_before=None,optical_after=None):
 selected=features(bundle,finding_id);observations=pair_inputs(bundle);now=datetime.now(timezone.utc).isoformat()
 result={'stage':stage,'run_id':bundle['run_id'],'region_id':bundle['region_id'],'pair':bundle['pair'],'finding_id':finding_id,
  'computed_at':now,'scope':'selected finding' if finding_id else 'entire radar pair','logs':[]}
 if stage=='detect':
  _,a,b,common,scope,_,_=numerical(bundle,finding_id)
  values=[a[scope],b[scope]]
  low=float(min(v.min() for v in values)) if scope.any() else -30;high=float(max(v.max() for v in values)) if scope.any() else 0
  edges=np.linspace(np.floor(low),max(np.ceil(high),np.floor(low)+1),49)
  hist=[np.histogram(v,bins=edges)[0].tolist() for v in values]
  result.update(status='computed',observations=observations,metrics=bundle['metrics'],
   histogram={'edges_db':edges.tolist(),'counts_t0':hist[0],'counts_t1':hist[1],'valid_pixel_count':int(scope.sum())},
   method={'threshold_db':bundle['threshold_db'],'resolution_m':bundle['resolution_m'],'minimum_component_pixels':bundle['minimum_component_pixels'],'crs':bundle['crs']},
   selected_area_ha=round(sum(f['properties']['area_ha'] for f in selected),6),
   logs=[f"Opened two registered VV GeoTIFFs: {bundle['pair'][0]} / {bundle['pair'][1]}.",f'Checked matching numerical grids and {int(common.sum()):,} common valid pixels.',f'Computed the histogram from {int(scope.sum()):,} source pixels in this scope.'])
 elif stage=='investigate':
  optical=bundle.get('optical_observations',[]);chosen=[]
  for i,date in enumerate(bundle['pair']):
   explicit=[optical_before,optical_after][i]
   scene=next((o for o in optical if o['date']==explicit),None) if explicit else None
   scene=scene or min(optical,key=lambda o:abs((datetime.fromisoformat(o['date'])-datetime.fromisoformat(date)).days)) if optical else None
   if scene:chosen.append({**scene,'radar_date':date,'gap_days':abs((datetime.fromisoformat(scene['date'])-datetime.fromisoformat(date)).days)})
  result.update(status='review',checks=bundle['qc'],observations=observations,optical=chosen,
   notes=['Different sensors have different acquisition times. Date offsets and clouds are part of the evidence.',
    'Tide and canopy response require independent context.' if bundle['region_id']=='sundarbans' else 'Water-level and seasonal changes require independent context.'],
   logs=[f"Checked orbit {observations[0]['relative_orbit']} and recorded quality checks.",f'Matched {len(chosen)} actual optical source records; retained their time offsets and cloud fractions.'])
 elif stage=='challenge':
  _,a,b,common,scope,_,_=numerical(bundle,finding_id);rows=[];inside=[];outside=[]
  for threshold in [-18.,-17.,-16.]:
   w0=a<threshold;w1=b<threshold
   incoming=filtered(common&~w0&w1,bundle['minimum_component_pixels'])&scope
   outgoing=filtered(common&w0&~w1,bundle['minimum_component_pixels'])&scope
   inside.append(incoming);outside.append(outgoing)
   rows.append({'threshold_db':threshold,'land_to_water_ha':round(float(incoming.sum()*.09),6),'water_to_land_ha':round(float(outgoing.sum()*.09),6)})
  core_in=np.logical_and.reduce(inside);core_out=np.logical_and.reduce(outside)
  result.update(status='computed',sensitivity=rows,
   robust_core_ha=round(float((core_in|core_out).sum()*.09),6),
   contested_fringe_ha=round(float(((np.logical_or.reduce(inside)|np.logical_or.reduce(outside))&~(core_in|core_out)).sum()*.09),6),
   logs=['Recomputed water screening at -18, -17 and -16 dB on the actual pair.',f"Applied {bundle['minimum_component_pixels']}-pixel connected-component filtering before clipping to this scope.",'Measured the intersection and fringe across the three tests; no calibrated probability was inferred.'])
 elif stage=='explain':
  reasons=['Recorded radar pixels support water-transition screening candidates.',
   'The fixed VV threshold and sensitivity tests are not independent ground validation.',
   'Tides, wetness and mangrove canopy response can change the radar return; sub-canopy flooding is not established.' if bundle['region_id']=='sundarbans' else 'River stage, wetness and seasonal changes can mimic permanent land loss.']
  result.update(status='limited',verdict='SCREENING CANDIDATE',reasons=reasons,observations=observations,checks=bundle['qc'],
   area_ha=round(sum(f['properties']['area_ha'] for f in selected),6),candidate_count=len(selected),
   next_action='Collect a dated shoreline/tidal observation and photograph before assigning a confirmed change label.' if bundle['region_id']=='sundarbans' else 'Collect dated bankline observations and photographs before assigning a permanent erosion label.',
   logs=['Read source lineage, numerical support and recorded quality evidence.','Generated a rule-based explanation with explicit evidence limits.'])
 elif stage=='field':
  result.update(status='awaiting observation',task={'id':bundle['run_id']+':'+(finding_id or 'region'),'region_id':bundle['region_id'],'run_id':bundle['run_id'],'finding_id':finding_id,
   'geometry':selected[0]['geometry'] if finding_id else {'type':'Polygon','coordinates':[[[bundle['bbox'][0],bundle['bbox'][1]],[bundle['bbox'][2],bundle['bbox'][1]],[bundle['bbox'][2],bundle['bbox'][3]],[bundle['bbox'][0],bundle['bbox'][3]],[bundle['bbox'][0],bundle['bbox'][1]]]]},
   'questions':['What is the observed water/tide condition?','Is exposed sediment, shoreline retreat, or vegetation stress visible?','Record an actual observation time and location.'] if bundle['region_id']=='sundarbans' else ['Is this permanent bank retreat or temporary water cover?','What date and location does the photograph document?','Is a road, building or farmland visibly affected?']},
   logs=['Created a field task bound to this region, pair and scope.','Field observations must be recorded by a person; no team connection or ground confirmation is simulated.'])
 elif stage=='impact':
  result.update(impact(bundle,finding_id));result['logs']=['Verified the archived mapped-asset snapshot checksum.','Intersected source geometries with the actual transition polygons in EPSG:32645.','Counted reference land-cover overlap on the aligned 30 m grid.']
 else:raise KeyError('Unknown evidence stage')
 return result
