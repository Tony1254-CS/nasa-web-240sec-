"""Reproducible public Sentinel-1 RTC acquisition and explicitly limited water-change screening.

Uses actual acquisition timestamps; never relabels seasons or optical pixels as SAR.
Signed access URLs exist only in memory. Cropped numerical GeoTIFFs and unsigned STAC
records are retained, and all display artifacts have an exact WGS84 footprint.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

import numpy as np
import requests
import rasterio
from PIL import Image
from rasterio.enums import Resampling
from rasterio.features import geometry_mask, shapes
from rasterio.transform import from_bounds, from_origin
from rasterio.vrt import WarpedVRT
from rasterio.warp import reproject, transform_bounds, transform_geom, transform as transform_points
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
CATALOG = "https://planetarycomputer.microsoft.com/api/stac/v1"
COLLECTION = "sentinel-1-rtc"
SIGN = "https://planetarycomputer.microsoft.com/api/sas/v1/sign"
REGIONS = {
    "jamuna": {"name": "Jamuna · Chilmari–Roumari", "bbox": [89.60, 25.40, 89.90, 25.75]},
    "sundarbans": {"name": "Sundarbans · Passur", "bbox": [89.55, 21.75, 89.85, 22.00]},
}
CRS = "EPSG:32645"
RESOLUTION = 30
NODATA = -9999.0
MIN_PIXELS = 9
THRESHOLD = -17.0
SESSION = requests.Session()
SESSION.headers["User-Agent"] = "FluviSAR-real-observation-ingestion/1.0"


def write_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False), encoding="utf-8")


def sha(path: Path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def fetch_json(url, **kwargs):
    result = SESSION.get(url, timeout=45, **kwargs)
    result.raise_for_status()
    return result.json()


def search_pair(bbox, before):
    result = SESSION.post(CATALOG + "/search", json={
        "collections": [COLLECTION], "bbox": bbox,
        "datetime": f"2026-01-01T00:00:00Z/{before}T23:59:59Z", "limit": 100,
    }, timeout=45)
    result.raise_for_status()
    scenes = sorted(result.json()["features"], key=lambda f: f["properties"]["datetime"], reverse=True)
    # An entire ROI must lie inside the scene's geographical envelope. Invalid pixels
    # inside the envelope remain explicitly masked after the numerical read.
    scenes = [f for f in scenes if f["bbox"][0] <= bbox[0] and f["bbox"][1] <= bbox[1]
              and f["bbox"][2] >= bbox[2] and f["bbox"][3] >= bbox[3]]
    for later in scenes:
        p = later["properties"]
        for earlier in scenes:
            q = earlier["properties"]
            days = (datetime.fromisoformat(p["datetime"].replace("Z", "+00:00"))
                    - datetime.fromisoformat(q["datetime"].replace("Z", "+00:00"))).total_seconds() / 86400
            if (9 <= days <= 30 and p.get("sat:relative_orbit") == q.get("sat:relative_orbit")
                    and p.get("sat:orbit_state") == q.get("sat:orbit_state")
                    and p.get("platform") == q.get("platform")):
                return [earlier, later]
    raise RuntimeError("No compatible same-platform, same-relative-orbit pair in the real catalog")


def grid(bbox):
    w, s, e, n = transform_bounds("EPSG:4326", CRS, *bbox, densify_pts=21)
    w, s = math.floor(w / RESOLUTION) * RESOLUTION, math.floor(s / RESOLUTION) * RESOLUTION
    e, n = math.ceil(e / RESOLUTION) * RESOLUTION, math.ceil(n / RESOLUTION) * RESOLUTION
    transform = from_origin(w, n, RESOLUTION, RESOLUTION)
    width, height = round((e-w)/RESOLUTION), round((n-s)/RESOLUTION)
    ring = {"type": "Polygon", "coordinates": [[[bbox[0],bbox[1]],[bbox[2],bbox[1]],
             [bbox[2],bbox[3]],[bbox[0],bbox[3]],[bbox[0],bbox[1]]]]}
    roi = geometry_mask([transform_geom("EPSG:4326", CRS, ring)], out_shape=(height,width), transform=transform, invert=True)
    return transform, width, height, roi


def read_band(href, transform, width, height):
    signed = fetch_json(SIGN, params={"href": href})["href"]
    with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", GDAL_HTTP_TIMEOUT="45", GDAL_HTTP_MAX_RETRY="2",
                      CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif,.tiff", GDAL_HTTP_MERGE_CONSECUTIVE_RANGES="YES"):
        with rasterio.open(signed) as source:
            with WarpedVRT(source, crs=CRS, transform=transform, width=width, height=height,
                           resampling=Resampling.average, nodata=NODATA) as vrt:
                intensity = vrt.read(1, masked=True).filled(np.nan).astype("float32")
    valid = np.isfinite(intensity) & (intensity > 0)
    db = np.full(intensity.shape, NODATA, dtype="float32")
    db[valid] = 10 * np.log10(intensity[valid])
    return db, valid


def save_numeric(path, values, transform, nodata=NODATA):
    path.parent.mkdir(parents=True, exist_ok=True)
    with rasterio.open(path, "w", driver="GTiff", width=values.shape[1], height=values.shape[0], count=1,
                       dtype=values.dtype, crs=CRS, transform=transform, nodata=nodata,
                       compress="deflate", tiled=True) as output:
        output.write(values, 1)


def display_array(values, transform, bbox, nearest=False):
    result = np.full((1024,1024), NODATA, dtype="float32")
    reproject(values, result, src_transform=transform, src_crs=CRS, src_nodata=NODATA,
              dst_transform=from_bounds(*bbox,1024,1024), dst_crs="EPSG:4326", dst_nodata=NODATA,
              resampling=Resampling.nearest if nearest else Resampling.bilinear)
    return result


def save_gray(path, values, transform, bbox):
    values = display_array(values,transform,bbox)
    valid = values != NODATA
    gray = (np.clip((values + 25) / 25, 0, 1) * 255).astype("uint8")
    rgba = np.stack([gray,gray,gray,valid.astype("uint8")*255],axis=-1)
    Image.fromarray(rgba).save(path)


def save_mask(path, mask, valid, transform, bbox, color):
    values = np.where(valid,mask.astype("float32"),NODATA)
    projected = display_array(values,transform,bbox,nearest=True)
    rgba = np.zeros((1024,1024,4),dtype="uint8")
    rgba[projected == 1] = color
    Image.fromarray(rgba).save(path)


def save_dual_polarization(public_dir, region, date, vv, vh, valid, transform, bbox):
    """Source-derived VV/VH ratio and display composite, never a Pauli decomposition."""
    ratio = np.where(valid, vv - vh, NODATA).astype("float32")
    projected_ratio = display_array(ratio, transform, bbox)
    projected_vv = display_array(np.where(valid, vv, NODATA), transform, bbox)
    projected_vh = display_array(np.where(valid, vh, NODATA), transform, bbox)
    visible = (projected_ratio != NODATA) & (projected_vv != NODATA) & (projected_vh != NODATA)
    gray = (np.clip(projected_ratio / 15, 0, 1) * 255).astype("uint8")
    ratio_path = public_dir / f"{date}_ratio.png"
    Image.fromarray(np.stack([gray, gray, gray, visible.astype("uint8") * 255], axis=-1)).save(ratio_path)
    red = (np.clip((projected_vv + 25) / 25, 0, 1) * 255).astype("uint8")
    green = (np.clip((projected_vh + 30) / 25, 0, 1) * 255).astype("uint8")
    rgb_path = public_dir / f"{date}_rgb.png"
    Image.fromarray(np.stack([red, green, gray, visible.astype("uint8") * 255], axis=-1)).save(rgb_path)
    return {"ratio_url": f"/observations/{region}/{date}_ratio.png", "rgb_url": f"/observations/{region}/{date}_rgb.png",
            "polarization_display_sha256": {"ratio": sha(ratio_path), "rgb": sha(rgb_path)},
            "polarization_display_method": "Ratio = VV dB - VH dB. RGB = display-scaled VV, VH, ratio; not Pauli."}


def components(mask):
    labels, n = ndimage.label(mask,structure=ndimage.generate_binary_structure(2,1))
    counts = np.bincount(labels.ravel())
    keep = counts >= MIN_PIXELS
    keep[0] = False
    return np.where(keep[labels],labels,0).astype("int32"), counts


def candidate_features(region, category, mask, transform):
    labels, counts = components(mask)
    retained = np.flatnonzero(counts >= MIN_PIXELS)
    retained = retained[retained != 0]
    centers = ndimage.center_of_mass(mask,labels,retained)
    centroid_by_id = {}
    for label,(row,col) in zip(retained,centers):
        x,y = transform * (col+0.5,row+0.5)
        lon,lat = transform_points(CRS,"EPSG:4326",[x],[y])
        centroid_by_id[int(label)] = [lon[0],lat[0]]
    features = []
    for geometry,label in shapes(labels,mask=labels>0,transform=transform,connectivity=4):
        ident = int(label)
        features.append({"type":"Feature","geometry":transform_geom(CRS,"EPSG:4326",geometry,precision=7),
                         "properties":{"id":f"{region}-{category}-{ident:05d}","category":category,
                          "area_ha":round(int(counts[ident])*RESOLUTION**2/10000,6),
                          "pixel_count":int(counts[ident]),"centroid":centroid_by_id[ident],
                          "assessment":"screening-candidate","origin":"derived-observation"}})
    features.sort(key=lambda feature:feature["properties"]["area_ha"],reverse=True)
    return features, labels>0


def process_region(region, config, before):
    print(f"Searching actual RTC scenes for {region} before {before}",flush=True)
    scenes = search_pair(config["bbox"],before)
    pair = [scene["properties"]["datetime"][:10] for scene in scenes]
    print(f"Selected {region}: {pair}",flush=True)
    run_id = f"s1-rtc-{region}-{pair[0]}-{pair[1]}-30m-v1"
    numeric_dir = ROOT / "data" / "derived" / run_id
    raw_dir = ROOT / "data" / "raw" / region
    public_dir = ROOT / "apps" / "web" / "public" / "observations" / region
    public_dir.mkdir(parents=True,exist_ok=True)
    transform,width,height,roi = grid(config["bbox"])
    def prepare(scene,date,band):
        numeric = numeric_dir/f"{date}_{band}_db.tif"
        if numeric.exists():
            with rasterio.open(numeric) as data:
                db=data.read(1);valid=np.isfinite(db)&(db!=NODATA)
        else:
            print(f"Read {region} {date} {band.upper()} real COG",flush=True)
            db,valid = read_band(scene["assets"][band]["href"],transform,width,height)
        valid &= roi
        db[~valid] = NODATA
        save_numeric(numeric,db,transform)
        return db,valid
    pool=ThreadPoolExecutor(max_workers=2)
    pending={(date,band):pool.submit(prepare,scene,date,band) for scene,date in zip(scenes,pair) for band in ("vv","vh")}
    observations, arrays = [], []
    for scene,date in zip(scenes,pair):
        write_json(raw_dir/f"{scene['id']}.json",scene)
        bands, masks = {}, []
        numeric_paths, hashes = {}, {}
        for band in ("vv","vh"):
            numeric = numeric_dir/f"{date}_{band}_db.tif"
            db,valid = pending[(date,band)].result()
            png = public_dir/f"{date}_{band}.png"
            save_gray(png,db,transform,config["bbox"])
            bands[band]=db;masks.append(valid)
            numeric_paths[band]=numeric.relative_to(ROOT).as_posix()
            hashes[band]=sha(numeric)
        valid=masks[0]&masks[1]
        water=valid&(bands["vv"]<THRESHOLD)
        water_png=public_dir/f"{date}_water.png"
        save_mask(water_png,water,valid,transform,config["bbox"],[57,196,217,220])
        polarization_displays = save_dual_polarization(public_dir, region, date, bands["vv"], bands["vh"], valid, transform, config["bbox"])
        arrays.append({**bands,"valid":valid,"water":water})
        observations.append({**polarization_displays,"id":scene["id"],"date":date,"datetime":scene["properties"]["datetime"],
            "sensor":"Sentinel-"+str(scene["properties"].get("platform","")).split("-")[-1].upper()+" C-band SAR RTC",
            "platform":scene["properties"].get("platform"),"relative_orbit":scene["properties"].get("sat:relative_orbit"),
            "orbit_direction":scene["properties"].get("sat:orbit_state"),"polarizations":["VV","VH"],
            "source_url":f"{CATALOG}/collections/{COLLECTION}/items/{scene['id']}",
            "source_assets":{band:scene["assets"][band]["href"] for band in ("vv","vh")},
            "vv_url":f"/observations/{region}/{date}_vv.png","vh_url":f"/observations/{region}/{date}_vh.png",
            "water_url":f"/observations/{region}/{date}_water.png","numeric_path":numeric_paths["vv"],
            "vh_numeric_path":numeric_paths["vh"],"numeric_sha256":hashes,
            "valid_fraction":round(float(valid.sum()/roi.sum()),6),
            "valid_pixel_count":int(valid.sum()),"water_area_ha":round(float(water.sum()*0.09),6),
            "mean_vv_db":round(float(bands["vv"][valid].mean()),5),
            "mean_vh_db":round(float(bands["vh"][valid].mean()),5),
            "origin":"source-observation","processing":"linear gamma intensity averaged to 30 m before 10*log10; nodata masked",
            "display_range_db":[-25,0],"display_sha256":{"vv":sha(public_dir/f"{date}_vv.png"),"vh":sha(public_dir/f"{date}_vh.png"),"water":sha(water_png)}})
    pool.shutdown(wait=True)
    common=arrays[0]["valid"]&arrays[1]["valid"]
    water0=arrays[0]["water"]&common;water1=arrays[1]["water"]&common
    land_to_water=common&~water0&water1;water_to_land=common&water0&~water1
    incoming,filtered_in=candidate_features(region,"land-to-water",land_to_water,transform)
    outgoing,filtered_out=candidate_features(region,"water-to-land",water_to_land,transform)
    features=incoming+outgoing
    features.sort(key=lambda f:f["properties"]["area_ha"],reverse=True)
    geojson={"type":"FeatureCollection","features":features}
    write_json(public_dir/"findings.geojson",geojson)
    change_png=public_dir/"change.png"
    in_display=display_array(np.where(common,filtered_in.astype("float32"),NODATA),transform,config["bbox"],True)
    out_display=display_array(np.where(common,filtered_out.astype("float32"),NODATA),transform,config["bbox"],True)
    change=np.zeros((1024,1024,4),dtype="uint8")
    change[in_display==1]=[240,121,87,230];change[out_display==1]=[217,178,106,230]
    Image.fromarray(change).save(change_png)
    sensitivity=[]
    for threshold in (-18.0,-17.0,-16.0):
        a=arrays[0]["vv"]<threshold;b=arrays[1]["vv"]<threshold
        f1,_=components(common&~a&b);f2,_=components(common&a&~b)
        sensitivity.append({"threshold_db":threshold,"land_to_water_ha":round(float((f1>0).sum()*0.09),6),
                            "water_to_land_ha":round(float((f2>0).sum()*0.09),6)})
    metrics={"land_to_water_ha":round(float(filtered_in.sum()*0.09),6),"water_to_land_ha":round(float(filtered_out.sum()*0.09),6),
             "raw_land_to_water_ha":round(float(land_to_water.sum()*0.09),6),"raw_water_to_land_ha":round(float(water_to_land.sum()*0.09),6),
             "common_valid_area_ha":round(float(common.sum()*0.09),6),"common_valid_fraction":round(float(common.sum()/roi.sum()),6),
             "water_area_t0_ha":round(float(water0.sum()*0.09),6),"water_area_t1_ha":round(float(water1.sum()*0.09),6),
             "land_to_water_count":len(incoming),"water_to_land_count":len(outgoing),"candidate_count":len(features),
             "common_valid_pixel_count":int(common.sum()),"roi_pixel_count":int(roi.sum()),
             "land_to_water_pixel_count":int(filtered_in.sum()),"water_to_land_pixel_count":int(filtered_out.sum())}
    common_path=numeric_dir/"common_valid_mask.tif"
    save_numeric(common_path,common.astype("uint8"),transform,0)
    record={"region_id":region,"name":config["name"],"bbox":config["bbox"],"run_id":run_id,"pair":pair,
            "crs":CRS,"resolution_m":30,"pixel_area_m2":900,"threshold_db":THRESHOLD,"minimum_component_pixels":MIN_PIXELS,
            "connectivity":4,"observations":observations,"metrics":metrics,"threshold_sensitivity":sensitivity,
            "findings":geojson,"findings_url":f"/observations/{region}/findings.geojson","change_url":f"/observations/{region}/change.png",
            "change_sha256":sha(change_png),"common_mask_path":common_path.relative_to(ROOT).as_posix(),
            "qc":[{"id":"source-lineage","name":"Source lineage","status":"pass","reason":"Actual catalog acquisition IDs and unsigned source assets retained; cropped numeric and display SHA-256 hashes computed."},
                  {"id":"pair-geometry","name":"Comparable orbit","status":"pass","reason":f"Same platform, relative orbit {observations[0]['relative_orbit']}, direction and VV/VH channels; aligned 30 m projected grid."},
                  {"id":"common-support","name":"Common valid support","status":"pass" if metrics['common_valid_fraction']>.95 else "warn","reason":f"Both VV and VH valid at both dates over {metrics['common_valid_fraction']*100:.3f}% of ROI pixel centers."},
                  {"id":"threshold-sensitivity","name":"Threshold sensitivity","status":"warn","reason":"Screening repeated at -18, -17 and -16 dB; sensitivity is reported, not a calibrated classification accuracy."},
                  {"id":"interpretation","name":"Geomorphic interpretation","status":"warn","reason":"Land-to-water and water-to-land classes are low-backscatter threshold transitions, not confirmed erosion/accretion. Stage, wind, incidence and mangrove tidal changes remain confounders."}],
            "sources":[{"name":"Copernicus Sentinel-1 RTC / Planetary Computer","url":"https://planetarycomputer.microsoft.com/dataset/sentinel-1-rtc","license":"CC-BY-4.0"}],
            "interpretation":"Measured SAR backscatter and reproducible threshold-screening candidates; no damage, population-at-risk or permanent-erosion claim."}
    write_json(numeric_dir/"bundle.json",record)
    print(f"{region}: {len(features)} retained candidates; {metrics}",flush=True)
    return record


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--before",default="2026-11-05")
    parser.add_argument("--region",choices=list(REGIONS),action="append")
    args=parser.parse_args()
    target=ROOT/"apps"/"web"/"src"/"data"/"observations.json"
    existing=json.loads(target.read_text(encoding="utf-8")) if target.exists() else {"regions":{}}
    with ThreadPoolExecutor(max_workers=2) as executor:
      tasks={executor.submit(process_region,region,REGIONS[region],args.before):region for region in args.region or REGIONS}
      for task in as_completed(tasks):
        region=tasks[task]
        existing["regions"][region]=task.result()
        existing["generated_at"]=datetime.now(timezone.utc).isoformat()
        existing["method"]={"id":"s1-rtc-vv-threshold-30m-v1","sensor":"Sentinel-1 C-band SAR","threshold_db":THRESHOLD,
            "resolution_m":30,"pixel_area_m2":900,"minimum_component_pixels":MIN_PIXELS,"connectivity":4,
            "classification":"VV gamma0 dB < -17 screens low backscatter; this is not an independently validated water classifier",
            "source_catalog":CATALOG,"source_collection":COLLECTION}
        write_json(target,existing)
        write_json(ROOT/"apps"/"web"/"public"/"observations"/"manifest.json",existing)
        write_json(ROOT/"apps"/"web"/"public"/"observations"/"index.json",existing)
    print(f"Published real observation registry: {target}",flush=True)


if __name__=="__main__":
    main()
