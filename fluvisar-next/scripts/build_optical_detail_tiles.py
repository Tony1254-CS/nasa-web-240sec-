"""Publish dated, source-resolution optical tiles for the two study areas.

Read the original Sentinel-2 TCI COG, never the downsampled context PNG.
The context remains available outside the analysis footprint. Only display
imagery is reprojected; numerical radar products and metrics are untouched.
"""
import hashlib
import json
import math
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image
from rasterio.enums import Resampling
from rasterio.transform import from_bounds
from rasterio.vrt import WarpedVRT
from rasterio.warp import transform_bounds

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'apps/web/public'
WORLD = 20037508.342789244
MIN_ZOOM, MAX_ZOOM = 10, 14


def build(region, observation):
    destination = PUBLIC / 'observations' / region / 'optical' / observation['date']
    manifest = destination / 'detail.json'
    url = observation['source_assets']['visual']
    bbox = observation['bbox']
    if manifest.exists():
        metadata = json.loads(manifest.read_text(encoding='utf-8'))
        if (metadata['source_url'] == url and metadata['bbox'] == bbox
                and metadata['detail_minzoom'] == MIN_ZOOM and metadata['detail_maxzoom'] == MAX_ZOOM
                and len(list(destination.glob('*/*/*.webp'))) == metadata['tile_count']):
            return region, observation['date'], metadata
    destination.mkdir(parents=True, exist_ok=True)
    west, south, east, north = transform_bounds('EPSG:4326', 'EPSG:3857', *bbox)
    span = WORLD * 2 / 2**MAX_ZOOM
    x0, x1 = math.floor((west + WORLD) / span), math.floor((east + WORLD) / span)
    y0, y1 = math.floor((WORLD - north) / span), math.floor((WORLD - south) / span)
    width, height = (x1 - x0 + 1) * 256, (y1 - y0 + 1) * 256
    bounds = (x0 * span - WORLD, WORLD - (y1 + 1) * span,
              (x1 + 1) * span - WORLD, WORLD - y0 * span)
    print('Read native optical pixels', region, observation['date'], width, height, flush=True)
    with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR', GDAL_HTTP_TIMEOUT='60',
                      GDAL_HTTP_MAX_RETRY='3', CPL_VSIL_CURL_ALLOWED_EXTENSIONS='.tif'):
        with rasterio.open(url) as source:
            with WarpedVRT(source, crs='EPSG:3857', transform=from_bounds(*bounds, width, height),
                           width=width, height=height, resampling=Resampling.bilinear) as vrt:
                rgb = vrt.read([1, 2, 3])
                valid = vrt.dataset_mask() > 0
            source_shape = [source.height, source.width]
    # Clip to the actual analysis bbox; no stretched edge pixels or invented fill.
    resolution = span / 256
    xs = bounds[0] + (np.arange(width) + .5) * resolution
    ys = bounds[3] - (np.arange(height) + .5) * resolution
    valid &= (xs[None, :] >= west) & (xs[None, :] <= east)
    valid &= (ys[:, None] >= south) & (ys[:, None] <= north)
    image = Image.fromarray(np.dstack([rgb.transpose(1, 2, 0), valid.astype('uint8') * 255]))
    digest = hashlib.sha256()
    count = 0
    for zoom in range(MIN_ZOOM, MAX_ZOOM + 1):
        scale = 2**(MAX_ZOOM - zoom)
        for x in range(x0 // scale, x1 // scale + 1):
            folder = destination / str(zoom) / str(x)
            folder.mkdir(parents=True, exist_ok=True)
            for y in range(y0 // scale, y1 // scale + 1):
                left, top = (x * scale - x0) * 256, (y * scale - y0) * 256
                tile = image.crop((left, top, left + scale * 256, top + scale * 256))
                if scale > 1:
                    tile = tile.resize((256, 256), Image.Resampling.LANCZOS)
                path = folder / f'{y}.webp'
                tile.save(path, 'WEBP', lossless=True, method=4)
                digest.update(path.read_bytes())
                count += 1
    metadata = {'source_url': url, 'source_id': observation['id'], 'date': observation['date'],
                'bbox': bbox, 'source_shape': source_shape, 'source_gsd_m': 10,
                'detail_tiles_url': f'/observations/{region}/optical/{observation["date"]}/{{z}}/{{x}}/{{y}}.webp',
                'detail_minzoom': MIN_ZOOM, 'detail_maxzoom': MAX_ZOOM,
                'tile_count': count, 'tiles_sha256': digest.hexdigest(),
                'method': 'Original dated TCI COG, Web Mercator pyramid; bilinear reprojection, lossless WebP; clouds retained.'}
    manifest.write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
    print('Published detail tiles', region, observation['date'], count, flush=True)
    return region, observation['date'], metadata


def main():
    catalog_path = PUBLIC / 'observations/index.json'
    catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
    with ThreadPoolExecutor(max_workers=2) as pool:
        jobs = [pool.submit(build, region, observation)
                for region, record in catalog['regions'].items()
                for observation in record.get('optical_observations', [])]
        results = {(region, date): metadata for region, date, metadata in (job.result() for job in jobs)}
    for region, record in catalog['regions'].items():
        for observation in record['optical_observations']:
            metadata = results[region, observation['date']]
            for key in ('detail_tiles_url', 'detail_minzoom', 'detail_maxzoom', 'source_gsd_m'):
                observation[key] = metadata[key]
    for path in (catalog_path, PUBLIC / 'observations/manifest.json', ROOT / 'apps/web/src/data/observations.json'):
        path.write_text(json.dumps(catalog, ensure_ascii=False, separators=(',', ':'), allow_nan=False), encoding='utf-8')


if __name__ == '__main__':
    main()
