"""Build compact, reproducible proximity records from retained OSM and SAR geometry.

Run with .venv-data/Scripts/python.exe scripts/build_place_watch.py.
No live asset query, erosion forecast or alteration of source observations.
"""
import hashlib
import json
from pathlib import Path
from shapely.geometry import shape, mapping
from shapely.ops import transform, nearest_points
from shapely.strtree import STRtree
from rasterio.warp import transform as project

ROOT = Path(__file__).resolve().parents[1] / 'apps/web/public/observations'


def projected(geometry):
    return transform(lambda x, y, z=None: project('EPSG:4326', 'EPSG:32645', x, y), geometry)


def main():
    index = json.loads((ROOT / 'index.json').read_text(encoding='utf8'))
    output = {'schema': 1, 'method': 'Minimum planar geometry distance in EPSG:32645 to retained land-to-water polygons. Not bank retreat or a hazard probability.', 'regions': {}}
    for region_id, region in index['regions'].items():
        assets_path = ROOT / region_id / 'assets.geojson'
        findings_path = ROOT / region_id / 'findings.geojson'
        assets = json.loads(assets_path.read_text(encoding='utf8'))['features']
        findings = [f for f in json.loads(findings_path.read_text(encoding='utf8'))['features'] if f['properties']['category'] == 'land-to-water']
        geometries = [projected(shape(f['geometry'])) for f in findings]
        tree = STRtree(geometries)
        rows = []
        w, s, e, n = region['bbox']
        for feature in assets:
            props = feature['properties']
            name = props.get('tags', {}).get('name:en') or props.get('name') or props['id']
            named = name != props['id']
            if region_id == 'jamuna' and not (props['kind'] in ('settlement', 'facility') or named):
                continue
            geom = shape(feature['geometry'])
            point = geom.representative_point()
            if not (w <= point.x <= e and s <= point.y <= n):
                continue
            metric = projected(geom)
            nearest = int(tree.nearest(metric))
            distance = metric.distance(geometries[nearest])
            if distance > 5000:
                continue
            finding = findings[nearest]['properties']
            asset_point, change_point = nearest_points(metric, geometries[nearest])
            lon, lat = project('EPSG:32645', 'EPSG:4326', [asset_point.x, change_point.x], [asset_point.y, change_point.y])
            rows.append({'id': props['id'], 'name': name, 'kind': props['kind'], 'sourceUrl': props['source_url'], 'coordinates': [lon[0], lat[0]], 'changeCoordinates': [lon[1], lat[1]], 'distanceM': round(distance, 2), 'intersects': metric.intersects(geometries[nearest]), 'findingId': finding['id'], 'findingAreaHa': finding['area_ha'], 'findingGeometry': mapping(shape(findings[nearest]['geometry']))})
        rows.sort(key=lambda row: (row['distanceM'], row['id']))
        # Each row retains its exact matched geometry for audit and mini-map display.
        context = json.loads((ROOT / region_id / 'evidence-context.json').read_text(encoding='utf8'))
        output['regions'][region_id] = {'runId': region['run_id'], 'pair': region['pair'], 'sourceAssetCount': len(assets), 'eligibleWithin5km': len(rows), 'selection': 'Nearest 60 eligible records within the study bbox and 5 km of observed land-to-water. Jamuna: named objects or settlements/facilities. Sundarbans: all retained mapped objects.', 'assetSha256': hashlib.sha256(assets_path.read_bytes()).hexdigest(), 'findingSha256': hashlib.sha256(findings_path.read_bytes()).hexdigest(), 'assetSource': {k: context[k] for k in ['retrieved_at', 'osm_timestamp', 'osm_attribution', 'osm_license_url']}, 'rows': rows[:60]}
        print(region_id, len(rows), 'eligible; retained', len(rows[:60]))
    target = ROOT.parent / 'place-watch.json'
    target.write_text(json.dumps(output, ensure_ascii=False, separators=(',', ':')), encoding='utf8')
    print(target, target.stat().st_size, 'bytes')


if __name__ == '__main__':
    main()
