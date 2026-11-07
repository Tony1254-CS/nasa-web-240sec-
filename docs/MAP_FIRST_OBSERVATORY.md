# Map-first Observatory

Both `/observatory/jamuna` and `/observatory/sundarbans` use the full workspace
width for the map. Desktop investigation controls sit in a horizontal toolbar.
Explore, Radar & layers and More tools open the existing investigation panel
on demand. Phone users retain the compact Explore features drawer.

The finding inspector opens when requested or when a finding is selected. Its
details can collapse; desktop users can resize it from its lower corner.
All six dates, playback, date pairing, swipe/split comparison, radar channels,
coverage, evidence workflows, exports and contextual data chat remain available.
Measured areas, numeric radar products and the geographic study bounds are unchanged.

## Dated optical detail

The previous display resampled an entire Sentinel-2 tile to a 2048-pixel context
image. Only a fraction of those pixels covered the study area. The context image
remains useful at low zoom and outside the study boundary.

The detail pyramid reads the **original dated Sentinel-2 L2A true-colour COG**
directly. It reprojects the study area to Web Mercator with bilinear resampling,
then writes lossless 256-pixel WebP tiles at zoom levels 10 through 14. MapLibre
loads tiles for the current date and viewport. Above level 14, the retained
source detail is enlarged; the original optical source resolution is 10 metres.
Clouds and shadows remain visible. Outside the study area, the dated context
image remains beneath the detail layer; beyond its coverage the Esri context
mosaic is used. The map labels the observation date and cloud fraction.

Each of the twelve date/region combinations has a `detail.json` recording the
source asset URL, observation ID, date, bbox, original dimensions, tile count,
method and SHA-256 of the ordered tile contents. Radar measurements and the
30-metre numerical analysis grid are independent of this display pyramid.

```powershell
cd fluvisar-next
.\.venv-data\Scripts\python.exe scripts/build_optical_detail_tiles.py
.\.venv-data\Scripts\python.exe scripts/validate_observations.py
cd apps/web
npx playwright test tests/map-first.spec.ts tests/observatory-controls.spec.ts tests/observation-history.spec.ts --workers=2
```

The build requires access to the public source COGs. Completed date pyramids are
reused on subsequent builds. Published tiles are served locally with the app;
viewing the retained study detail does not require a live satellite data API.
