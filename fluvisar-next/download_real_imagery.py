"""
Download REAL Sentinel-2 satellite imagery from AWS Earth Search STAC API.
Crops to Jamuna River AOI and creates true-color PNG overlays for each date.
"""
import json
import os
import sys
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

OUTPUT_DIR = Path(__file__).parent / 'apps' / 'web' / 'public' / 'rasters'
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Jamuna River AOI (EPSG:4326)
AOI_BBOX = [89.60, 25.40, 89.90, 25.75]

# We use 2024 Sentinel-2 proxy dates that match the seasonal pattern of 2026
# (monsoon cycle repeats yearly in Bangladesh)
PROXY_SEARCH_WINDOWS = {
    '2026-06-23': ('2024-06-10', '2024-06-30'),  # Early monsoon
    '2026-07-17': ('2024-07-05', '2024-07-25'),  # Rising monsoon
    '2026-08-10': ('2024-08-01', '2024-08-15'),  # Pre-peak
    '2026-08-26': ('2024-08-16', '2024-09-05'),  # Peak flood
    '2026-09-19': ('2024-09-10', '2024-09-30'),  # Recession
    '2026-10-21': ('2024-10-10', '2024-10-31'),  # Winter dry
}

STAC_URL = 'https://earth-search.aws.element84.com/v1/search'


def search_stac(start_date: str, end_date: str) -> list:
    """Search for Sentinel-2 scenes covering the Jamuna AOI."""
    payload = json.dumps({
        'collections': ['sentinel-2-c1-l2a'],
        'bbox': AOI_BBOX,
        'datetime': f'{start_date}T00:00:00Z/{end_date}T23:59:59Z',
        'limit': 5,
        'sortby': [{'field': 'properties.eo:cloud_cover', 'direction': 'asc'}],
    }).encode('utf-8')

    req = urllib.request.Request(
        STAC_URL,
        data=payload,
        headers={'Content-Type': 'application/json', 'User-Agent': 'FluviSAR/1.0'},
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    return data.get('features', [])


def download_band(url: str, dst: Path) -> Path:
    """Download a file from a URL (supports S3 public URLs)."""
    # Convert s3:// to https:// for public Sentinel-2 on AWS
    if url.startswith('s3://'):
        bucket, _, key = url[5:].partition('/')
        url = f'https://{bucket}.s3.amazonaws.com/{key}'

    print(f'  Downloading {dst.name} from {url[:80]}...')
    req = urllib.request.Request(url, headers={'User-Agent': 'FluviSAR/1.0'})
    with urllib.request.urlopen(req) as resp:
        dst.write_bytes(resp.read())
    print(f'  Downloaded: {dst} ({dst.stat().st_size / 1024 / 1024:.1f} MB)')
    return dst


def create_true_color_png(red_path: Path, green_path: Path, blue_path: Path,
                          output_path: Path, bbox: list) -> None:
    """Read 3 Sentinel-2 band GeoTIFFs, crop to AOI, composite true-color PNG."""
    import rasterio
    from rasterio.windows import from_bounds

    with rasterio.open(str(red_path)) as red_ds:
        window = from_bounds(*bbox, transform=red_ds.transform)
        # Clamp window to dataset bounds
        window = window.intersection(rasterio.windows.Window(0, 0, red_ds.width, red_ds.height))
        red = red_ds.read(1, window=window)

    with rasterio.open(str(green_path)) as green_ds:
        window = from_bounds(*bbox, transform=green_ds.transform)
        window = window.intersection(rasterio.windows.Window(0, 0, green_ds.width, green_ds.height))
        green = green_ds.read(1, window=window)

    with rasterio.open(str(blue_path)) as blue_ds:
        window = from_bounds(*bbox, transform=blue_ds.transform)
        window = window.intersection(rasterio.windows.Window(0, 0, blue_ds.width, blue_ds.height))
        blue = blue_ds.read(1, window=window)

    # Sentinel-2 L2A reflectance is uint16 (0-10000 = 0-100% reflectance)
    # Convert to 8-bit with contrast stretch for display
    def stretch(band, pmin=2, pmax=98):
        lo = np.percentile(band[band > 0], pmin) if np.any(band > 0) else 0
        hi = np.percentile(band[band > 0], pmax) if np.any(band > 0) else 1
        if hi <= lo:
            hi = lo + 1
        stretched = np.clip((band.astype(np.float32) - lo) / (hi - lo) * 255, 0, 255)
        return stretched.astype(np.uint8)

    # Ensure all bands have same shape
    min_h = min(red.shape[0], green.shape[0], blue.shape[0])
    min_w = min(red.shape[1], green.shape[1], blue.shape[1])
    red = red[:min_h, :min_w]
    green = green[:min_h, :min_w]
    blue = blue[:min_h, :min_w]

    rgb = np.stack([stretch(red), stretch(green), stretch(blue)], axis=-1)

    # Resize to reasonable web resolution (1024px wide)
    img = Image.fromarray(rgb, mode='RGB')
    target_w = 1024
    target_h = int(img.height * target_w / img.width)
    img = img.resize((target_w, target_h), Image.LANCZOS)

    img.save(str(output_path), quality=92)
    print(f'  Saved: {output_path} ({target_w}x{target_h})')


def process_date(target_date: str):
    """Find and process Sentinel-2 imagery for a target date."""
    search_start, search_end = PROXY_SEARCH_WINDOWS[target_date]
    print(f'\n=== Processing {target_date} (searching {search_start} to {search_end}) ===')

    features = search_stac(search_start, search_end)
    if not features:
        print(f'  WARNING: No scenes found for {target_date}')
        return False

    # Pick the scene with lowest cloud cover
    scene = features[0]
    scene_id = scene['id']
    cloud = scene['properties'].get('eo:cloud_cover', '?')
    print(f'  Selected scene: {scene_id} (cloud cover: {cloud}%)')

    assets = scene.get('assets', {})
    red_url = assets.get('red', {}).get('href')
    green_url = assets.get('green', {}).get('href')
    blue_url = assets.get('blue', {}).get('href')

    if not all([red_url, green_url, blue_url]):
        print(f'  WARNING: Missing band assets for {scene_id}')
        return False

    # Download bands to temp directory
    tmp_dir = OUTPUT_DIR / '_tmp'
    tmp_dir.mkdir(exist_ok=True)

    try:
        red_path = download_band(red_url, tmp_dir / f'{target_date}_red.tif')
        green_path = download_band(green_url, tmp_dir / f'{target_date}_green.tif')
        blue_path = download_band(blue_url, tmp_dir / f'{target_date}_blue.tif')

        output = OUTPUT_DIR / f'jamuna_optical_{target_date}.png'
        create_true_color_png(red_path, green_path, blue_path, output, AOI_BBOX)

        # Clean up temp files
        for p in [red_path, green_path, blue_path]:
            p.unlink(missing_ok=True)

        return True
    except Exception as e:
        print(f'  ERROR processing {target_date}: {e}')
        import traceback
        traceback.print_exc()
        return False


def main():
    print('FluviSAR Real Satellite Imagery Downloader')
    print('==========================================')
    print(f'Output: {OUTPUT_DIR}')
    print(f'AOI: {AOI_BBOX}')

    # Check rasterio availability
    try:
        import rasterio
        print(f'rasterio {rasterio.__version__} available')
    except ImportError:
        print('ERROR: rasterio is required. Install with: pip install rasterio')
        sys.exit(1)

    success_count = 0
    for target_date in sorted(PROXY_SEARCH_WINDOWS.keys()):
        if process_date(target_date):
            success_count += 1

    print(f'\n=== DONE: {success_count}/{len(PROXY_SEARCH_WINDOWS)} dates processed ===')


if __name__ == '__main__':
    main()

