# Map-first Observatory

Both Observatory routes keep the investigation panel on the left on desktop and
use a compact feature drawer on phones. Jamuna opens with an angled, close river
view (desktop: centre 89.75, 25.575; zoom 10.9; pitch 55 degrees). Comparisons use
shared top-down framing. Recenter and Replay return to the regional default.

Sundarbans starts on detailed Esri satellite context. This mosaic has no claimed
acquisition date. Selecting a pass, Dated observations, or a date comparison
opens actual Sentinel-2 imagery. Every retained date remains selectable. The two
least-cloudy retained scenes form the initial optical pair; cloud/shadow
percentages are shown in map labels and pair choices. Images with more than 10%
ROI cloud/shadow show a notice explaining their white cloud areas. Clouds remain
in the source imagery.

The finding inspector can collapse and resize on desktop. All radar channels,
coverage, six Evidence stages, Live Analysis, exports and contextual chat remain.
A floating assistant launcher sits at bottom right, with space reserved in the
timeline. Measured areas, numeric products and geographic study bounds are unchanged.

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
