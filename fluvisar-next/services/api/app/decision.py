"""Decision Desk: exact exposure and repeat observations, scoped to a registered run."""
from functools import lru_cache
import hashlib
import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
from app.raster_runtime import rasterize, transform_geom, RUNTIME
from app.evidence import ROOT, PUBLIC, features, read_registered, impact, numerical, filtered


@lru_cache(maxsize=48)
def decision_context(run_id, finding_id=None):
    from app.main import get_run_bundle
    bundle = get_run_bundle(run_id)
    selected = features(bundle, finding_id)
    fingerprint = hashlib.sha256()
    fingerprint.update(Path(__file__).read_bytes())
    fingerprint.update((Path(__file__).parent/'evidence.py').read_bytes())
    for filename in ('raster_runtime.py', 'portable_raster.py'):
        fingerprint.update((Path(__file__).parent/filename).read_bytes())
    fingerprint.update(RUNTIME.encode())
    fingerprint.update(json.dumps(bundle, sort_keys=True).encode())
    for path in [PUBLIC/'observations'/bundle['region_id']/'evidence-context.json', PUBLIC/'observations'/bundle['region_id']/'nasa-context.json']:
        if path.exists():
            fingerprint.update(path.read_bytes())
    for observation in bundle['observations']:
        for field in ('numeric_path','vh_numeric_path'):
            stat = (ROOT/observation[field]).stat()
            fingerprint.update(f'{observation[field]}:{stat.st_size}:{stat.st_mtime_ns}'.encode())
    signature = fingerprint.hexdigest()
    cache_path = ROOT/'data/derived/decision-cache'/f"{run_id}--{finding_id or 'study'}.json"
    if cache_path.exists():
        try:
            saved = json.loads(cache_path.read_text(encoding='utf8'))
        except (OSError, ValueError):
            saved = {}
        if saved.get('signature') == signature:
            return saved['result']
    rows = []
    for observation in sorted(bundle['observations'], key=lambda row: row['date']):
        vv, transform, crs = read_registered(observation['numeric_path'])
        vh, transform_vh, crs_vh = read_registered(observation['vh_numeric_path'])
        if vv.shape != vh.shape or transform != transform_vh or crs != crs_vh:
            raise ValueError('Numerical channels must share a grid')
        # Full study footprint, or the selected finding; no interpolation between passes.
        geometries = [f['geometry'] for f in selected] if finding_id else [{
            'type': 'Polygon', 'coordinates': [[
                [bundle['bbox'][0], bundle['bbox'][1]], [bundle['bbox'][2], bundle['bbox'][1]],
                [bundle['bbox'][2], bundle['bbox'][3]], [bundle['bbox'][0], bundle['bbox'][3]],
                [bundle['bbox'][0], bundle['bbox'][1]]]]}]
        projected = [transform_geom('EPSG:4326', crs, geometry) for geometry in geometries]
        scope = rasterize([(geometry, 1) for geometry in projected], out_shape=vv.shape,
                          transform=transform, fill=0, dtype='uint8').astype(bool)
        valid = scope & np.isfinite(vv) & np.isfinite(vh)
        water = valid & (vv < float(bundle['threshold_db']))
        count = int(valid.sum())
        rows.append({
            'date': observation['date'], 'datetime': observation['datetime'],
            'id': observation['id'], 'source_url': observation['source_url'],
            'valid_pixel_count': count, 'scope_pixel_count': int(scope.sum()),
            'valid_fraction': float(count / scope.sum()) if scope.any() else 0,
            'water_area_ha': round(int(water.sum()) * float(bundle['pixel_area_m2']) / 10000, 6),
            'water_fraction': float(water.sum() / count) if count else None,
            'mean_vv_db': float(vv[valid].mean()) if count else None,
            'mean_vh_db': float(vh[valid].mean()) if count else None,
        })
    exposure = impact(bundle, finding_id)
    # Only matching objects are returned, never the entire 180k-record source archive.
    from app.evidence import asset_index
    assets, _ = asset_index(bundle['region_id'], exposure['source']['assets_sha256'])
    ids = {row['id'] for row in exposure['intersections']}
    exposure['map_assets'] = {'type': 'FeatureCollection', 'features': [f for f in assets if f['properties']['id'] in ids]}
    candidate_review = {}
    if not finding_id:
        from shapely.geometry import shape
        from shapely import make_valid
        _, tree = asset_index(bundle['region_id'], exposure['source']['assets_sha256'])
        _, a, b, common, _, transform, crs = numerical(bundle, None)
        geometries = [(transform_geom('EPSG:4326', crs, f['geometry']), i+1) for i, f in enumerate(selected)]
        labels = rasterize(geometries, out_shape=a.shape, transform=transform, fill=0, dtype='int32') if geometries else np.zeros(a.shape, dtype='int32')
        cores = {}
        for category in ('land-to-water', 'water-to-land'):
            tests = []
            for threshold in (-18, -17, -16):
                t0, t1 = a < threshold, b < threshold
                mask = (~t0 & t1 if category == 'land-to-water' else t0 & ~t1) & common
                tests.append(filtered(mask, int(bundle['minimum_component_pixels'])))
            core = np.logical_and.reduce(tests)
            cores[category] = np.bincount(labels[core], minlength=len(selected)+1)
        for i, finding in enumerate(selected):
            geometry = make_valid(shape(finding['geometry']))
            counts = {'building': 0, 'road': 0, 'facility': 0, 'settlement': 0}
            for asset_index_value in tree.query(geometry, predicate='intersects'):
                asset = assets[asset_index_value]
                source_shape = make_valid(shape(asset['geometry']))
                intersection = source_shape.intersection(geometry)
                if intersection.is_empty or (source_shape.geom_type in ('Polygon','MultiPolygon') and intersection.area == 0) or (source_shape.geom_type in ('LineString','MultiLineString') and intersection.length == 0):
                    continue
                counts[asset['properties']['kind']] += 1
            props = finding['properties']
            core_pixels = int(cores[props['category']][i+1])
            candidate_review[props['id']] = {**counts, 'asset_count': sum(counts.values()),
                'robust_core_ha': core_pixels*float(bundle['pixel_area_m2'])/10000,
                'robust_fraction': core_pixels / max(1, props['pixel_count'])}
    nasa_path = PUBLIC / 'observations' / bundle['region_id'] / 'nasa-context.json'
    nasa = json.loads(nasa_path.read_text(encoding='utf8')) if nasa_path.exists() else None
    result = {'run_id': run_id, 'region_id': bundle['region_id'], 'pair': bundle['pair'], 'numerical_runtime': RUNTIME,
            'finding_id': finding_id, 'scope': 'selected finding' if finding_id else 'study footprint',
            'threshold_db': bundle['threshold_db'], 'history': rows, 'exposure': exposure,
            'nasa': nasa, 'candidate_review': candidate_review,
            'computed_at': datetime.now(timezone.utc).isoformat(),
            'interpretation': 'Repeated classifications are observations at acquisition times, not continuous inundation, a forecast, or confirmed permanent land change.'}
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w',encoding='utf8',dir=cache_path.parent,suffix='.json',delete=False) as output:
            temporary = Path(output.name)
            json.dump({'signature':signature,'result':result},output,separators=(',',':'))
        os.replace(temporary,cache_path)
    finally:
        if temporary and temporary.exists():
            temporary.unlink()
    return result
