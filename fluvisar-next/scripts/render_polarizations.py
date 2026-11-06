"""Rebuild optional polarization displays from retained numeric data without downloading again."""
import json
import numpy as np
import rasterio
from ingest_sentinel1 import ROOT, save_dual_polarization, write_json

target = ROOT / "apps/web/public/observations/index.json"
catalog = json.loads(target.read_text(encoding="utf-8"))
for region, record in catalog["regions"].items():
    for observation in record["observations"]:
        with rasterio.open(ROOT / observation["numeric_path"]) as source:
            vv = source.read(1)
            transform = source.transform
        with rasterio.open(ROOT / observation["vh_numeric_path"]) as source:
            vh = source.read(1)
        valid = np.isfinite(vv) & np.isfinite(vh) & (vv != -9999) & (vh != -9999)
        observation.update(save_dual_polarization(ROOT / "apps/web/public/observations" / region, region,
                           observation["date"], vv, vh, valid, transform, record["bbox"]))
        print(region, observation["date"], "source-derived ratio and RGB saved")
for destination in [target, target.with_name("manifest.json"), ROOT / "apps/web/src/data/observations.json"]:
    write_json(destination, catalog)
