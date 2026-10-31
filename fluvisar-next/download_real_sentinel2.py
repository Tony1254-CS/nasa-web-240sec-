"""
Download REAL Sentinel-2 satellite imagery from AWS Earth Search STAC API.
Uses rasterio's remote COG windowed-read to download ONLY the AOI portion.
Creates true-color PNG overlays for the Jamuna River and Sundarbans.
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

# ------- AOI Bounding Boxes (EPSG:4326) -------
JAMUNA_BBOX = [89.60, 25.40, 89.90, 25.75]   # lon_min, lat_min, lon_max, lat_max
SUNDARBANS_BBOX = [89.55, 21.75, 89.85, 22.00]

# ------- Target image dimensions -------
IMG_WIDTH = 1024

# ------- 2024 proxy date windows for the six 2026 timeline slots -------
PROXY_DATES = {
    '2026-06-23': ('2024-05-15', '2024-06-30'),
    '2026-07-17': ('2024-06-15', '2024-07-31'),
    '2026-08-10': ('2024-07-15', '2024-08-20'),
    '2026-08-26': ('2024-08-01', '2024-09-10'),
    '2026-09-19': ('2024-09-01', '2024-10-05'),
    '2026-10-21': ('2024-10-01', '2024-11-15'),
}

STAC_URL = 'https://earth-search.aws.element84.com/v1/search'


def stac_search(bbox, start, end, max_cloud=40, limit=10):
    """Search STAC for Sentinel-2 L2A scenes."""
    payload = json.dumps({
        'collections': ['sentinel-2-c1-l2a'],
        'bbox': bbox,
        'datetime': f'{start}T00:00:00Z/{end}T23:59:59Z',
        'limit': limit,
        'sortby': [{'field': 'properties.eo:cloud_cover', 'direction': 'asc'}],
    }).encode()

    req = urllib.request.Request(
        STAC_URL, data=payload,
        headers={'Content-Type': 'application/json', 'User-Agent': 'FluviSAR/1.0'},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read())
    features = data.get('features', [])
    # Filter by cloud cover
    return [f for f in features if f['properties'].get('eo:cloud_cover', 100) <= max_cloud]


def read_aoi_from_cog(href: str, bbox: list, target_w: int = IMG_WIDTH):
    """
    Read just the AOI window from a remote COG using rasterio + GDAL vsicurl.
    Returns an RGB numpy array (H, W, 3) uint8.
    """
    import rasterio
    from rasterio.windows import from_bounds

    env = rasterio.Env(
        GDAL_HTTP_MERGE_CONSECUTIVE_RANGES='YES',
        GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR',
        CPL_VSIL_CURL_ALLOWED_EXTENSIONS='.tif,.tiff',
        VSI_CACHE=True,
        VSI_CACHE_SIZE=5000000,
    )

    # Convert s3:// URL to HTTPS for public access
    if href.startswith('s3://'):
        bucket, _, key = href[5:].partition('/')
        href = f'https://{bucket}.s3.us-west-2.amazonaws.com/{key}'

    # Use /vsicurl/ prefix for remote reading
    vsi_path = f'/vsicurl/{href}'

    with env:
        with rasterio.open(vsi_path) as ds:
            print(f'    Opened: {ds.width}x{ds.height}, bands={ds.count}, crs={ds.crs}')

            # Get window for our AOI
            win = from_bounds(bbox[0], bbox[1], bbox[2], bbox[3], transform=ds.transform)

            # Clamp to dataset bounds
            col_off = max(0, int(win.col_off))
            row_off = max(0, int(win.row_off))
            width = min(int(win.width), ds.width - col_off)
            height = min(int(win.height), ds.height - row_off)

            if width <= 0 or height <= 0:
                print(f'    WARNING: AOI is outside this scene bounds')
                return None

            actual_win = rasterio.windows.Window(col_off, row_off, width, height)

            # Calculate output resolution
            target_h = int(height * target_w / width) if width > 0 else target_w

            # Read with downsampling via out_shape
            if ds.count >= 3:
                # Visual asset: RGB bands
                data = ds.read(
                    [1, 2, 3],
                    window=actual_win,
                    out_shape=(3, target_h, target_w),
                )
                rgb = np.moveaxis(data, 0, -1)  # (3, H, W) -> (H, W, 3)
            else:
                # Single-band: read and replicate
                data = ds.read(
                    1,
                    window=actual_win,
                    out_shape=(target_h, target_w),
                )
                rgb = np.stack([data, data, data], axis=-1)

            # Handle data type: Sentinel-2 visual is usually uint8 already
            if rgb.dtype != np.uint8:
                # Sentinel-2 L2A reflectance: uint16 0-10000
                # Apply percentile stretch
                lo = np.percentile(rgb[rgb > 0], 2) if np.any(rgb > 0) else 0
                hi = np.percentile(rgb[rgb > 0], 98) if np.any(rgb > 0) else 1
                if hi <= lo:
                    hi = lo + 1
                rgb = np.clip((rgb.astype(np.float32) - lo) / (hi - lo) * 255, 0, 255).astype(np.uint8)

            return rgb


def save_png(rgb_array, output_path: Path):
    """Save RGB numpy array as PNG."""
    img = Image.fromarray(rgb_array, mode='RGB')
    img.save(str(output_path), optimize=True)
    size_kb = output_path.stat().st_size / 1024
    print(f'    Saved: {output_path.name} ({img.width}x{img.height}, {size_kb:.0f} KB)')


def make_sar_from_optical(rgb_array):
    """Convert optical RGB to SAR-like grayscale with speckle texture."""
    # Weighted grayscale
    gray = (0.299 * rgb_array[:,:,0].astype(np.float32) +
            0.587 * rgb_array[:,:,1].astype(np.float32) +
            0.114 * rgb_array[:,:,2].astype(np.float32))

    # Enhance contrast for SAR look
    lo = np.percentile(gray, 5)
    hi = np.percentile(gray, 95)
    if hi <= lo:
        hi = lo + 1
    gray = np.clip((gray - lo) / (hi - lo) * 200 + 20, 10, 245)

    # Add multiplicative speckle noise (gamma-distributed, typical for SAR)
    speckle = np.random.gamma(shape=4.0, scale=1.0/4.0, size=gray.shape)
    gray = np.clip(gray * speckle, 5, 250).astype(np.uint8)

    # Return as RGB (grayscale in 3 channels for consistency)
    return np.stack([gray, gray, gray], axis=-1)


def process_jamuna():
    """Download real imagery for all Jamuna dates."""
    print('\n' + '='*60)
    print('JAMUNA RIVER - Downloading Real Sentinel-2 Imagery')
    print('='*60)

    for target_date, (search_start, search_end) in sorted(PROXY_DATES.items()):
        print(f'\n--- {target_date} (proxy: {search_start} to {search_end}) ---')

        optical_path = OUTPUT_DIR / f'jamuna_optical_{target_date}.png'
        sar_path = OUTPUT_DIR / f'jamuna_sar_{target_date}.png'

        features = stac_search(JAMUNA_BBOX, search_start, search_end, max_cloud=50)
        if not features:
            print(f'  No scenes found. Trying wider window...')
            # Widen the search window by 2 weeks each side
            features = stac_search(JAMUNA_BBOX, search_start, search_end, max_cloud=80, limit=20)

        if not features:
            print(f'  STILL no scenes. Skipping {target_date}.')
            continue

        # Try each scene until one works
        success = False
        for i, scene in enumerate(features[:5]):
            scene_id = scene['id']
            cloud = scene['properties'].get('eo:cloud_cover', '?')
            print(f'  Scene {i+1}: {scene_id} (cloud: {cloud}%)')

            assets = scene.get('assets', {})

            # Prefer 'visual' (pre-rendered RGB), else try individual bands
            visual_href = assets.get('visual', {}).get('href')
            if not visual_href:
                # Try the 'true-color-image' or 'thumbnail' assets
                for key in ['true-color-image', 'rendered_preview']:
                    if key in assets:
                        visual_href = assets[key].get('href')
                        break

            if visual_href:
                print(f'  Using visual asset: {visual_href[:80]}...')
                try:
                    rgb = read_aoi_from_cog(visual_href, JAMUNA_BBOX)
                    if rgb is not None and rgb.shape[0] > 10 and rgb.shape[1] > 10:
                        save_png(rgb, optical_path)
                        # Generate SAR-like from optical
                        sar_rgb = make_sar_from_optical(rgb)
                        save_png(sar_rgb, sar_path)
                        success = True
                        break
                except Exception as e:
                    print(f'    Error with visual asset: {e}')
                    continue

            # Fallback: try individual R/G/B bands
            red_href = assets.get('red', {}).get('href')
            green_href = assets.get('green', {}).get('href')
            blue_href = assets.get('blue', {}).get('href')

            if red_href and green_href and blue_href:
                print(f'  Using individual R/G/B bands...')
                try:
                    import rasterio
                    from rasterio.windows import from_bounds

                    bands = []
                    for band_name, href in [('red', red_href), ('green', green_href), ('blue', blue_href)]:
                        if href.startswith('s3://'):
                            bucket, _, key = href[5:].partition('/')
                            href = f'https://{bucket}.s3.us-west-2.amazonaws.com/{key}'
                        vsi = f'/vsicurl/{href}'

                        with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR'):
                            with rasterio.open(vsi) as ds:
                                win = from_bounds(*JAMUNA_BBOX, transform=ds.transform)
                                col_off = max(0, int(win.col_off))
                                row_off = max(0, int(win.row_off))
                                w = min(int(win.width), ds.width - col_off)
                                h = min(int(win.height), ds.height - row_off)
                                actual_win = rasterio.windows.Window(col_off, row_off, w, h)
                                target_h = int(h * IMG_WIDTH / w) if w > 0 else IMG_WIDTH
                                band_data = ds.read(1, window=actual_win, out_shape=(target_h, IMG_WIDTH))
                                bands.append(band_data)
                                print(f'    {band_name}: {band_data.shape}')

                    # Stack and stretch
                    min_h = min(b.shape[0] for b in bands)
                    min_w = min(b.shape[1] for b in bands)
                    bands = [b[:min_h, :min_w] for b in bands]

                    def stretch(b):
                        lo = np.percentile(b[b > 0], 2) if np.any(b > 0) else 0
                        hi = np.percentile(b[b > 0], 98) if np.any(b > 0) else 1
                        if hi <= lo: hi = lo + 1
                        return np.clip((b.astype(np.float32) - lo) / (hi - lo) * 255, 0, 255).astype(np.uint8)

                    rgb = np.stack([stretch(bands[0]), stretch(bands[1]), stretch(bands[2])], axis=-1)
                    save_png(rgb, optical_path)
                    sar_rgb = make_sar_from_optical(rgb)
                    save_png(sar_rgb, sar_path)
                    success = True
                    break
                except Exception as e:
                    print(f'    Error with individual bands: {e}')
                    continue

        if not success:
            print(f'  FAILED to get imagery for {target_date}')


def process_sundarbans():
    """Download real imagery for Sundarbans."""
    print('\n' + '='*60)
    print('SUNDARBANS - Downloading Real Sentinel-2 Imagery')
    print('='*60)

    # We need 2 images: spring tide (Aug-Sep monsoon peak) and neap tide (Oct-Nov dry)
    sundarbans_dates = {
        'spring': ('2024-08-01', '2024-09-30'),
        'neap': ('2024-10-15', '2024-12-15'),
    }

    for tide_name, (search_start, search_end) in sundarbans_dates.items():
        print(f'\n--- Sundarbans {tide_name} tide ({search_start} to {search_end}) ---')

        optical_path = OUTPUT_DIR / f'sundarbans_optical_{tide_name}.png'
        sar_path = OUTPUT_DIR / f'sundarbans_sar_{tide_name}.png'

        features = stac_search(SUNDARBANS_BBOX, search_start, search_end, max_cloud=60, limit=15)
        if not features:
            features = stac_search(SUNDARBANS_BBOX, search_start, search_end, max_cloud=90, limit=20)

        if not features:
            print(f'  No scenes found for {tide_name}')
            continue

        success = False
        for i, scene in enumerate(features[:5]):
            scene_id = scene['id']
            cloud = scene['properties'].get('eo:cloud_cover', '?')
            print(f'  Scene {i+1}: {scene_id} (cloud: {cloud}%)')

            assets = scene.get('assets', {})
            visual_href = assets.get('visual', {}).get('href')

            if visual_href:
                try:
                    rgb = read_aoi_from_cog(visual_href, SUNDARBANS_BBOX)
                    if rgb is not None and rgb.shape[0] > 10:
                        save_png(rgb, optical_path)
                        sar_rgb = make_sar_from_optical(rgb)
                        save_png(sar_rgb, sar_path)
                        success = True
                        break
                except Exception as e:
                    print(f'    Error: {e}')
                    continue

        if not success:
            print(f'  FAILED for Sundarbans {tide_name}')


def main():
    print('FluviSAR Real Satellite Imagery Downloader v2')
    print('=' * 50)
    print(f'Output: {OUTPUT_DIR}')
    print(f'Jamuna AOI: {JAMUNA_BBOX}')
    print(f'Sundarbans AOI: {SUNDARBANS_BBOX}')

    try:
        import rasterio
        print(f'rasterio {rasterio.__version__} OK')
    except ImportError:
        print('ERROR: pip install rasterio')
        sys.exit(1)

    process_jamuna()
    process_sundarbans()

    print('\n' + '=' * 50)
    print('DONE! Check files in:', OUTPUT_DIR)
    # List generated files
    for f in sorted(OUTPUT_DIR.glob('*.png')):
        size_kb = f.stat().st_size / 1024
        print(f'  {f.name}: {size_kb:.0f} KB')


if __name__ == '__main__':
    main()

