# Read-only numerical runtime

## Trigger and limits

On the current Windows host, Application Control blocked the GDAL DLL used by
Rasterio. This prevented a fresh API process from importing its numerical review
services. Existing archive fingerprints did not match current inputs, so they
were not accepted as current results. No Windows policy or security setting was
disabled or changed.

`app/raster_runtime.py` prefers the original Rasterio/GDAL implementation. If its
import raises `ImportError`, it selects a restricted reader using Tifffile, NumPy,
UTM equations and Shapely. It supports this project's single-band, north-up,
pixel-area WGS84/northern-UTM GeoTIFF grids. Unsupported projections, rotation,
grid types or mask geometry fail explicitly. It is not a general GDAL replacement
and does not write or resample source rasters. Ingestion still needs its normal
approved GDAL environment.

## Operations

- Read original retained TIFF arrays and their pixel-scale/tiepoint/CRS tags.
- Preserve nodata and finite-value masking for pixel sampling.
- Transform WGS84 and northern UTM coordinates without loading GDAL.
- Rasterize polygon membership at registered pixel centres, preserving holes and
  last-shape label replacement for the existing connected-component analysis.
- Reuse existing history, exposure, sensitivity and robustness algorithms.

The API selects the reader through one shared import in numerical evidence,
decision context and pixel sampling. Decision-cache signatures include the
reader source files and chosen runtime identity. Recomputed contexts expose
`numerical_runtime`; Insights retains it in exports. Original GeoTIFFs, published
measurements, map images and source metadata are unchanged.

## Validation evidence

Eight previously native-computed archives were held in memory before regenerating
their comparisons: three study comparisons and one selected finding per region.
The read-only runtime matched all tested history values exactly (valid/scope
counts, water area, VV/VH means), asset counts and recorded road lengths,
land-cover overlap/reference inventory and per-candidate robust/core statistics.
The default Jamuna reference remains 36 intersecting building ways and 393.83 m
of land-to-water road overlap.

Four independent unit/API checks cover synthetic GeoTIFF georeferencing and
masked windows, pixel-centre polygon masks and holes, label replacement, a known
UTM reference, a prior native-computed nearest-point distance, unsupported inputs,
both actual six-pass histories and source-labelled numeric pixel sampling.

```powershell
cd fluvisar-next
uv pip install --python .venv-data/Scripts/python.exe -r requirements-data.txt
.\.venv-data\Scripts\python.exe -m unittest discover -s tests -p test_portable_raster.py -v
```

The reader uses [Tifffile](https://github.com/cgohlke/tifffile) and
[UTM](https://github.com/Turbo87/utm), with pinned versions in requirements.
Existing tests that directly import GDAL still require a supported GDAL host;
they have not been rewritten to hide the local restriction.

## Browser QA on this host

The bundled headless Chromium could not initialize WebGL2, while the installed
Chrome channel could. Playwright accepts an optional channel override without
changing its default or altering production behavior:

```powershell
$env:PLAYWRIGHT_BROWSER_CHANNEL = 'chrome'
npx playwright test --workers=2
```

Map regressions use that installed browser here. This does not disable browser
security or system application policy.
