import json
import os
import sys
import urllib.request
from pathlib import Path
import numpy as np
from PIL import Image
import rasterio
from rasterio.warp import transform_bounds
from rasterio.windows import from_bounds

OUTPUT_DIR = Path(__file__).parent / 'apps' / 'web' / 'public' / 'rasters'
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

JAMUNA_BBOX = [89.60, 25.40, 89.90, 25.75]
SUNDARBANS_BBOX = [89.55, 21.75, 89.85, 22.00]

# Proxy search dates in 2024 (monsoon & post-monsoon cycle)
JAMUNA_DATES = {
    '2026-06-23': ('2024-05-15', '2024-06-30'),
    '2026-07-17': ('2024-06-15', '2024-07-31'),
    '2026-08-10': ('2024-07-15', '2024-08-20'),
    '2026-08-26': ('2024-08-01', '2024-09-10'),
    '2026-09-19': ('2024-09-01', '2024-10-05'),
    '2026-10-21': ('2024-10-01', '2024-11-15'),
}

STAC_URL = 'https://earth-search.aws.element84.com/v1/search'

def search_stac(bbox, start, end, max_cloud=60):
    payload = json.dumps({
        'collections': ['sentinel-2-c1-l2a'],
        'bbox': bbox,
        'datetime': f'{start}T00:00:00Z/{end}T23:59:59Z',
        'limit': 10,
        'sortby': [{'field': 'properties.eo:cloud_cover', 'direction': 'asc'}]
    }).encode('utf-8')
    req = urllib.request.Request(STAC_URL, data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'FluviSAR/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            feats = data.get('features', [])
            return [f for f in feats if f['properties'].get('eo:cloud_cover', 100) <= max_cloud]
    except Exception as e:
        print(f"Error searching STAC: {e}")
        return []

def extract_window(href, bbox, target_w, target_h):
    vsi_url = f"/vsicurl/{href}"
    with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR', CPL_VSIL_CURL_ALLOWED_EXTENSIONS='.tif,.tiff'):
        with rasterio.open(vsi_url) as ds:
            bbox_proj = transform_bounds('EPSG:4326', ds.crs, *bbox)
            win = from_bounds(*bbox_proj, transform=ds.transform)
            col_off = max(0, int(win.col_off))
            row_off = max(0, int(win.row_off))
            width = min(int(win.width), ds.width - col_off)
            height = min(int(win.height), ds.height - row_off)
            if width <= 0 or height <= 0:
                return None
            actual_win = rasterio.windows.Window(col_off, row_off, width, height)
            data = ds.read([1, 2, 3], window=actual_win, out_shape=(3, target_h, target_w))
            rgb = np.moveaxis(data, 0, -1)
            return rgb

def make_sar_simulated(rgb):
    # Grayscale representing radar backscatter from optical reflectance
    gray = (0.299 * rgb[:,:,0].astype(np.float32) +
            0.587 * rgb[:,:,1].astype(np.float32) +
            0.114 * rgb[:,:,2].astype(np.float32))
    # Water is dark in SAR
    # Sand & structures are bright
    speckle = np.random.gamma(shape=3.5, scale=1.0/3.5, size=gray.shape)
    sar = np.clip(gray * speckle * 1.1, 0, 255).astype(np.uint8)
    return np.stack([sar, sar, sar], axis=-1)

def run():
    print("=== Downloading Real Sentinel-2 True-Color Imagery ===")
    
    # 1. Jamuna River
    for target_date, (s_start, s_end) in JAMUNA_DATES.items():
        print(f"Fetching Jamuna for {target_date} ({s_start} to {s_end})...")
        feats = search_stac(JAMUNA_BBOX, s_start, s_end)
        if not feats:
            feats = search_stac(JAMUNA_BBOX, s_start, s_end, max_cloud=100)
        
        saved = False
        for f in feats:
            visual_url = f.get('assets', {}).get('visual', {}).get('href')
            if not visual_url:
                continue
            try:
                print(f"  Attempting scene: {f['id']} (cloud: {f['properties'].get('eo:cloud_cover')}%)")
                rgb = extract_window(visual_url, JAMUNA_BBOX, 1024, 1195)
                if rgb is not None:
                    # Save Optical
                    opt_path = OUTPUT_DIR / f'jamuna_optical_{target_date}.png'
                    Image.fromarray(rgb).save(opt_path, optimize=True)
                    print(f"  -> Saved {opt_path.name}")
                    
                    # Save SAR counterpart
                    sar_rgb = make_sar_simulated(rgb)
                    sar_path = OUTPUT_DIR / f'jamuna_sar_{target_date}.png'
                    Image.fromarray(sar_rgb).save(sar_path, optimize=True)
                    print(f"  -> Saved {sar_path.name}")
                    saved = True
                    break
            except Exception as e:
                print(f"    Failed: {e}")
        if not saved:
            print(f"  FAILED to retrieve imagery for {target_date}")

    # 2. Sundarbans
    sundar_windows = {
        'spring': ('2024-08-01', '2024-09-30'),
        'neap': ('2024-10-15', '2024-12-15')
    }
    for tide, (s_start, s_end) in sundar_windows.items():
        print(f"Fetching Sundarbans for {tide} tide...")
        feats = search_stac(SUNDARBANS_BBOX, s_start, s_end, max_cloud=80)
        for f in feats:
            visual_url = f.get('assets', {}).get('visual', {}).get('href')
            if not visual_url:
                continue
            try:
                rgb = extract_window(visual_url, SUNDARBANS_BBOX, 1024, 853)
                if rgb is not None:
                    sar_rgb = make_sar_simulated(rgb)
                    sar_path = OUTPUT_DIR / f'sundarbans_sar_{tide}.png'
                    Image.fromarray(sar_rgb).save(sar_path, optimize=True)
                    print(f"  -> Saved {sar_path.name}")
                    break
            except Exception as e:
                print(f"    Failed: {e}")

    print("=== Finished processing real satellite imagery! ===")

if __name__ == '__main__':
    run()

