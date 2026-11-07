# Decision Desk — observed change, potential exposure and field review

Route: `/impact`. Research snapshot: **November 7, 2026**.

## Review workflow

1. Choose Jamuna or Sundarbans in the shared region selector.
2. Select actual before/after acquisitions. Each region has six radar dates and fifteen registered comparison bundles. Metrics, source IDs, geometry and exports follow the same pair.
3. Inspect the dated optical context or switch to radar VV/VH, water masks, map context and the aligned comparison divider. The visible imagery date is separate from the analysis pair.
4. Review all candidate polygons through the searchable ledger. The default map displays the largest fifteen polygons per class; the initial review shortlist is the largest twenty-four overall. These scopes are explicitly labelled and do not remove other candidates.
5. Select a polygon to inspect its area, coordinates, source pixels, evidence, repeat observations and browser-local review state.
6. Open **Assets & land use** / **Habitat & assets** for exact mapped intersections. Clear selection for the entire footprint.
7. Open **Evidence & context** for nearest optical observations, NASA precipitation, NISAR catalog records and interpretation limits.
8. Queue field review, author dated observations and optionally request device GPS or add a real photo. Records are stored in IndexedDB and await human review. Review status alone does not prove an observation was received or reviewed.
9. Export the case packet or create the source-linked printable brief. Links reopen the region, pair and selected finding.

## Numerical methods

The existing Sentinel-1 method is preserved: VV threshold −17 dB, matching calibrated VV/VH acquisitions, 30 m EPSG:32645 grid, common valid pair support and a minimum nine-pixel, four-connected component. Threshold tests use −18/−17/−16 dB.

The observation history reads each registered numerical VV/VH raster, rasterizes the study footprint or selected finding on that observation's grid and counts valid VV-threshold water pixels. Water area is `pixel count × 900 / 10,000` hectares. Valid support, means and original acquisition IDs are returned alongside the result. Different valid support must be considered when comparing passes. Gaps between acquisitions are not interpolated; repeated classifications are not proof of continuous inundation or permanent land change.

Review ordering is transparent:

- **Largest area first:** polygon area, descending.
- **Awaiting review:** browser-local unreviewed records, ordered by area.
- **Mapped asset overlap:** the count of intersecting mapped objects for each polygon, then area. This is not a vulnerability or hazard model.
- **Threshold-sensitive first:** lowest fraction of the original polygon retained in the corresponding transition class across all three threshold tests, then area. This is robustness under those tests, not classification accuracy.

## Exposure and scenario distinction

Actual exposure uses the archived OSM geometry, a spatial index and exact projected intersections. Road lengths are computed in metres; boundary-only polygon/line touches do not count. Assets are intersected only with nearby candidate geometries to avoid expensive unions of an entire seasonal footprint. The source archive checksum is verified.

WorldCover 2021 provides historical reference-class overlap and a full-footprint inventory. It does not establish 2026 crop or mangrove loss. A zero OSM result means no intersection in that archived map, not the absence of real assets. No people-at-risk, damaged-household or monetary-loss estimate is invented.

**What-if scenario** preserves the user-defined corridor length, depth and orientation, its area formula, live OSM building/road queries, map envelope and assumption export. This geometry is hypothetical. It never replaces the actual exposure calculation or becomes a forecast.

## NASA data provenance

`scripts/ingest_decision_context.py` archives original public JSON responses under `data/raw/{region}/decision-context/`, retains their SHA-256 hashes and writes the public `nasa-context.json`.

- [NASA POWER meteorological sources](https://power.larc.nasa.gov/docs/methodology/data/sources_meteorology/): daily UTC `IMERG_PRECTOT` at the regional centre cell, with its native 0.1° context. Fill values remain missing in `imerg_mm`. Where IMERG is not supplied, `PRECTOTCORR` is retained as separately labelled MERRA-2/GEOS-IT model context at 0.5° × 0.625°; `source` identifies the fallback. These series are not parcel-scale rainfall or proof of flood causation. Three/seven-day windows require all daily values.
- [ASF Search API](https://docs.asf.alaska.edu/api/): NISAR GCOV records intersecting each study footprint, June 1–November 7, 2026. Original granule IDs, acquisition times, orbit direction, track, frame, polarization and product links are retained. The two context records use matching track/frame/polarization and distinct dates.
- [NISAR GCOV guide](https://nisar-docs.asf.alaska.edu/gcov/): provisional L-band backscatter is a different product from the Sentinel-1 C-band analysis. Catalog presence does not prove complete footprint coverage or a validated numerical analysis. The ASF catalog was accessible; direct browse requests returned HTTP 403 in this environment. The UI uses verified acquisition records and source links instead of broken images or fabricated previews. Numerical NISAR HDF5 ingestion requires a separate acquisition and sensor-specific processing step.

Jamuna explanations focus on river stage, exposed sediment and bank review. Sundarbans explanations focus on tide, wetland/shoreline conditions and habitat reference. No acquisition-matched river-level or tide record has been ingested; matching is not claimed. FFWC is linked as an official source for further station verification.

## API, caching and exports

`GET /api/runs/{run_id}/decision-context?finding_id=...` resolves only registered runs and findings. It returns history, exposure, source geometry for intersecting assets, per-candidate review statistics and NASA context. Unknown run/finding returns 404.

Results are cached in memory and in ignored `data/derived/decision-cache/`. A signature covers processing source files, the registered bundle, source-context metadata, NASA archive and numerical artifact size/mtime. `scripts/warm_decision_cache.py` precomputes all thirty study-area comparisons. Restart the service after replacing source artifacts or ingestion outputs.

Case JSON includes pair metrics, the selected geometry, exactly the two analysis acquisitions, QC, decision context, on-device field metadata and a matching deep link. Photos are exported separately through the field form. Printable briefs are generated from the same selected evidence; no example damage/population figures are inserted.

## Validation

`tests/test_decision_desk.py` compares history with retained numeric measurements, selected-polygon counts with GeoTIFF pixels, asset-map identities with exact intersection results, threshold-core bounds, run isolation and NASA raw-response hashes/values.

`apps/web/tests/impact-desk.spec.ts` exercises both regions, source-consistent pair changes and exports, equal-size aligned map canvases, comparison clipping, review status, exposure, scenario controls, deep links, mobile field access and light theme. The existing legacy route smoke test now targets the new Decision Desk flow.
