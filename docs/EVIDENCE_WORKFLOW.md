# Observatory Evidence and Live Analysis

Implemented for `/observatory/jamuna` and `/observatory/sundarbans`.

The header's Evidence menu opens any of six independent stages. Live Analysis starts at Detect and requires a review before proceeding through Investigate, Challenge, Explain, Field and Impact. Future stages stay locked until reached. Completion means the evidence review finished, not that erosion, inundation or damage was independently confirmed.

## Source-backed stages

| Stage | Work performed |
| --- | --- |
| Detect | Reads the two registered VV GeoTIFFs and common support mask; computes a 48-bin histogram from valid numerical pixels. |
| Investigate | Shows the actual source IDs, quality checks, selected optical images, cloud/shadow fractions and radar/optical time offsets. |
| Challenge | Recomputes -18/-17/-16 dB water masks and connected components, then measures robust intersections and threshold-sensitive fringe. A selected finding clips the scope after the global component filter. |
| Explain | Produces a rule-based screening verdict, evidence limits, source checksums and suggested field questions. No confidence percentage is invented. |
| Field | Creates a region/pair/finding-bound task and accepts authored observations, actual timestamps, optional device GPS and photographs. |
| Impact | Intersects retained transition polygons with archived OSM geometry and computes overlap with the actual ESA WorldCover 2021 reference grid. |

Sundarbans copy and field questions address tides, shoreline/sediment, visible vegetation and mangrove context. A radar transition does not establish sub-canopy inundation. The Impact table includes both the historical study-area land-cover inventory and the transition overlap, so a zero overlap is distinguishable from a missing reference.

## API and state

`GET /api/runs/{run_id}/evidence/{stage}` accepts an optional `finding_id`, `optical_before` and `optical_after`. Only registered runs, findings and acquisition dates are accepted. Results retain the region, run, pair, scope and actual computation timestamp. Stage logs describe operations actually performed against local artifacts; there are no simulated satellite downloads, fake team connections or automatically generated confirmations.

Changing the region, radar pair, selected finding or optical comparison resets the guided review. In-flight browser requests are cancelled, and the new context starts at Detect. Evidence mode preserves access to the map and header. Escape closes the workbench.

## Exposure source archive

Reproduce with:

```powershell
cd fluvisar-next
uv pip install --python .venv-data/Scripts/python.exe -r requirements-data.txt
.venv-data/Scripts/python.exe scripts/ingest_evidence_context.py
```

- `data/raw/{region}/osm-evidence.json`: original Overpass extract, with source timestamp.
- `apps/web/public/observations/{region}/assets.geojson`: mapped buildings, roads, facilities and settlement points.
- `apps/web/public/observations/{region}/evidence-context.json`: query, source URLs, checksums, attribution and reference-grid metadata.
- `data/derived/{region}-reference-2021/landcover.tif`: categorical WorldCover raster aligned to the existing 30 m grid.

The current archive contains 180,474 mapped records for Jamuna and 14 for the configured Sundarbans footprint. OSM is not an exhaustive asset inventory. Geometry intersection is potential exposure, not proven damage, households, residents or evacuation need. WorldCover is a **2021** reference, not a contemporary loss estimate.

Attribution: OpenStreetMap contributors, ODbL 1.0 ([license](https://www.openstreetmap.org/copyright)). ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium, CC BY 4.0 ([source documentation](https://esa-worldcover.org/en/data-access)).

## Field storage

Field observations live in the browser's `fluvisar-field-evidence` IndexedDB database, not in a server queue. A record retains the exact region, radar run, pair, optional finding, observer, actual observation time, condition, note, optional GPS accuracy and optional photograph. Photographs have SHA-256 checksums. JSON export includes the photo bytes as data URLs. Saving an observation does not alter the satellite verdict. No records are uploaded or sent to another person automatically.

Clearing browser storage removes these records; use Export with photos to keep a copy. API-based stage results and the full review can also be exported as JSON. Explain supports browser printing / Save PDF.

## Verification

- Backend tests check source-pixel histogram counts, retained threshold results, selected-finding scope, invalid-context rejection, reference land-cover inventories and archived asset intersections.
- Browser tests walk both regions through all six stages, exercise the threshold selector, download the review, persist/export a field photo with GPS, check region isolation and verify mobile access.
