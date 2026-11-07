# One design system, source-linked observations

The Observatory routes use a separate feature rail, a map with fitted real study bounds, source-aware timelines, a pair selector, synchronized swipe/split comparison, and complete dark/light controls. Other content pages retain their existing design.

## Actual connected data

The current measurements come from **Copernicus Sentinel-1D C-band RTC**, discovered through the Microsoft Planetary Computer STAC catalogue and downloaded from its registered assets. They are not NISAR observations, optical images restyled as radar, or seasonal proxy dates.

| Region | Actual acquisition dates | Land → water candidates | Water → land candidates |
| --- | --- | ---: | ---: |
| Jamuna, Chilmari–Roumari | 2026-10-19 / 2026-10-31 | 248.76 ha | 1,496.25 ha |
| Sundarbans, Passur | 2026-10-22 / 2026-11-03 | 18.18 ha | 21.96 ha |

All areas above are computed screening results, not confirmed erosion, land gain, loss or damage. No exposed population, expert consensus percentage, fabricated field testimony, invented gauge levels, or made-up provenance hashes are presented in the active application.

The dataset contains six actual same-orbit Sentinel-1 acquisitions and six Sentinel-2 optical acquisitions per region (24 source scenes in total). VV/VH numerical rasters, source metadata, acquisition timestamps, display checksums and common-support masks are retained. The two original default radar pairs contain 759 candidate polygons; all 15 radar combinations per region have their own recomputed metrics, threshold sensitivity and candidate geometry. Public source metadata links are available in the app and in the exported manifest.

## Reproducible method

1. Select actual compatible same-platform, same-relative-orbit Sentinel-1 RTC scenes covering each configured region, before 2026-11-06.
2. Retain original unsigned STAC records and source asset URLs. Access signatures remain in memory; they are not saved in application files.
3. Average calibrated linear RTC intensity onto an aligned **30 m EPSG:32645** grid, then compute `10 * log10(power)`. Mask nodata/nonpositive power.
4. Define the rectangular WGS84 study region on projected pixel centers. Analyze only pixels with valid VV and VH on both dates.
5. Screen low backscatter with the declared **VV < −17 dB** rule. Compare the two masks on common valid support.
6. Retain four-connected transition components with at least **9 pixels**. Compute area from pixel count × **900 m²**. Retain raw transition totals separately from component-filtered totals.
7. Repeat screening at **−18, −17 and −16 dB** and report threshold sensitivity. Render source-derived arrays at the exact registered WGS84 bounds for display.
8. Compute SHA-256 checksums of downloaded numerical products and generated display artifacts.

This fixed-threshold screening is not an independently validated open-water classifier. Radar shadow, surface roughness, wetness, incidence and water-level changes can affect the result. In particular, it does not establish sub-canopy inundation in mangroves. Physics simulations and generated ML exercises remain explicitly educational, separate from the source-linked evidence tab.

## Files and application connection

- `fluvisar-next/scripts/ingest_sentinel1.py`: public archive discovery, actual source acquisition and processing.
- `fluvisar-next/scripts/validate_observations.py`: independent numerical/artifact invariants.
- `fluvisar-next/data/raw/jamuna/` and `data/raw/sundarbans/`: downloaded source records.
- `fluvisar-next/data/derived/`: numerical VV/VH GeoTIFFs and support masks.
- `fluvisar-next/apps/web/public/observations/index.json`: runtime source catalogue; `manifest.json` is the same retained record.
- `fluvisar-next/apps/web/src/data/evidence.tsx`: shared loading, current region and provenance validation.
- `fluvisar-next/apps/web/src/data/analysisRegistry.ts`: source-backed image resolution for the imported science pages.
- `fluvisar-next/services/api/app/main.py`: run lookup and actual numerical pixel sampling. Unknown IDs return 404; no coordinate formula invents a value.

All active routes read the same observation bundle. Observatory, Decision Desk, reports, atlas, stories and the Intelligence evidence tab therefore use matching source IDs, dates and area values. The older `/rasters` simulations and `geoData.ts` constants are no longer used as analytical observations by the active routes.

## Run and verify

From `fluvisar-next`, prepare the data/API environment once:

```powershell
uv venv --python 3.12 .venv-data
uv pip install --python .venv-data/Scripts/python.exe -r requirements-data.txt
.venv-data/Scripts/python.exe scripts/ingest_sentinel1.py
.venv-data/Scripts/python.exe scripts/extend_observation_history.py
.venv-data/Scripts/python.exe scripts/validate_observations.py
```

The ingested files are already present in this workspace. The ingestion command is for reproducing the download, and reuses its local numerical cache. Source access is subject to the public archive's access policy.

From `fluvisar-next/apps/web`:

```powershell
npm run dev
npm run build
npm run test:e2e -- --workers=1
```

`npm run dev` now starts/reuses the local numerical API on port 8000 and starts Vite, which proxies `/api`. For hosted production, serve `/api` through the Python service alongside the built static app. The public JSON/PNGs are self-contained for map rendering and reports; numerical click sampling additionally needs the API and GeoTIFFs.

Satellite mode uses real date-indexed Sentinel-2 TCI imagery, not the same Esri mosaic for every date. Each optical scene preserves its own timestamp, source metadata, original clouds and ROI cloud/shadow fraction. The full source tile is reprojected to a 2048px WGS84 display; the smaller dashed box is the numerical analysis footprint. Esri provides context only beyond valid dated source coverage. Optical and radar acquisitions are separate timelines because their actual pass dates differ.

Swipe clips one full-size registered map without resizing it; split uses equally sized synchronized maps. The pair dialog selects two actual dates. Choosing a timeline date opens that single acquisition; selecting a pair activates comparison. Pair-specific raster changes and area metrics load together. The evidence error boundary no longer remounts the page when a pair is selected.

No daily or three-day flood history is fabricated. Cloud cover and acquisition gaps remain visible. A change in water extent/backscatter is not, by itself, a confirmed flood or permanent erosion claim.

VV/VH ratio and RGB display artifacts are calculated from the retained numerical rasters by `scripts/render_polarizations.py`, also integrated into ingestion. Ratio is `VV_dB − VH_dB`; RGB is a declared display composite of VV, VH and ratio, not full-polarimetric Pauli decomposition. Pixel sampling follows the visible map side, and ratio samples subtract the two actual numerical channel samples.

Verification includes production build, browser tests for public routes and restored map controls, four API/adapter tests, numeric/display/optical SHA-256 checks and independent recomputation of all selectable pairs and all 759 polygon/pixel-area invariants. Browser alignment checks compare actual projected anchor coordinates from both map instances after swipe, split, pan and zoom. Maximum polygon round-trip area difference was 0.000287 ha for Jamuna and 0.000134 ha for Sundarbans.

## Observation history

| Region | Sentinel-1 radar dates | Sentinel-2 optical dates |
| --- | --- | --- |
| Jamuna | Jul 3, Aug 20, Sep 25, Oct 7, Oct 19, Oct 31 (2026) | Jun 2, Sep 15, Oct 10, Oct 15, Oct 20, Oct 25 (2026) |
| Sundarbans | Jul 6, Aug 23, Sep 28, Oct 10, Oct 22, Nov 3 (2026) | Jun 4, Sep 14, Oct 12, Oct 17, Oct 22, Oct 27 (2026) |

- `scripts/extend_observation_history.py`: cached STAC discovery, same-orbit radar history, real optical crops, all radar pair bundles.
- `scripts/expand_optical_context.py`: expands the dated optical display to the original source tile without stretching the study crop.
- `public/observations/{region}/pairs/`: independently calculated pair geometry, metrics and transition rasters.
- `tests/observation-history.spec.ts`: real served-image hashes, date-to-source mapping, pair persistence, updated measurements and theme switching.
