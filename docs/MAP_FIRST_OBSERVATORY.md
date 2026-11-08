# Map-first Observatory

Both Observatory routes keep the investigation panel on the left on desktop and
use a compact feature drawer on phones. The desktop rail spans the full workspace height, including the area beside the signal tracks and timeline; its scrollable controls and source-summary footer remain inside that rail. Both regions open at zoom 11.4 and pitch 55 degrees, including phones. Jamuna
centres on 89.75, 25.575; Sundarbans centres on the estuary at 89.74, 21.83. Comparisons use
shared top-down framing. Recenter and Replay return to the regional default. Each fresh Observatory visit zooms in from a wide view before arriving at that camera; previously seen sessions no longer suppress it. User interaction, Skip, comparison changes and reduced-motion preferences interrupt or bypass the introduction.

Both regions start on Satellite, restoring the requested cinematic view and tilted study-area camera. Switching imagery preserves the live camera. Sundarbans offers detailed Esri satellite context. This mosaic has no claimed
acquisition date. Dated observations switches to actual Sentinel-2 imagery; optical timeline passes and date comparisons retain the actual selected acquisition. Radar mode uses its separate six-pass timeline. Every retained date remains selectable. The two
least-cloudy retained scenes form the initial optical pair; cloud/shadow
percentages are shown in map labels and pair choices. Images with more than 10%
ROI cloud/shadow show a notice explaining their white cloud areas. Clouds remain
in the source imagery.

The finding inspector can collapse and resize on desktop. All radar channels,
coverage, six Evidence stages, Live Analysis, exports and contextual chat remain.
A floating assistant launcher sits at bottom right and opens a docked, non-modal
chat window. Phone playback leaves space for the launcher. Measured areas, numeric products and geographic study bounds are unchanged.

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


## Satellite overlays and comparison gestures

The actual radar-derived transition geometry is visible over Satellite and Radar
views. The expanded desktop legend identifies its radar acquisition pair and
separates those measurements from the optical/background image dates. Water mask
and transition controls retain Satellite when it is already selected; masks keep
their original Sentinel-1 dates. The largest-change action opens and locates the
actual retained finding. Changing imagery or lens clears obsolete pixel samples.

Comparison drag uses window pointer events, so leaving the grip or losing native
capture does not stop the gesture. It supports mouse and touch, cancels cleanly,
and leaves the map camera unchanged. Arrow keys adjust one percent (five with
Shift); Home and End reveal the full after/before image at zero and 100 percent.


The Compare measured radar water action switches to the actual before/after
Sentinel-1 water observations for the measured pair. This gives a direct check
when the optical/background images have different dates. External basemap tiles
are suppressed where the view is fully covered by the interior of retained dated
imagery, avoiding redundant background downloads during close inspection.
