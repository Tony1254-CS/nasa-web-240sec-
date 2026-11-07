# Cross-device review — 7 November 2026

## Coverage

The responsive audit covers ten routes in both dark and light mode:

`/`, `/atlas`, `/observatory/jamuna`, `/observatory/sundarbans`, `/impact`, `/intelligence`, `/sar-lab`, `/about`, `/stories`, `/reports`.

| View | Viewport |
| --- | --- |
| Desktop | 1920 × 1080 |
| Laptop | 1366 × 768 |
| Compact laptop | 1280 × 720 |
| Phone | 390 × 844 |
| Small phone | 360 × 800 |

All **100 route/viewport/theme combinations** pass the layout audit. Checks cover horizontal overflow, reachable header controls, navigation overlap, menu access, theme state, map initialization, the updated team role, and whether intro text/report actions are clipped by their panels. Screenshots are generated under `apps/web/test-results/responsive/` when the audit runs.

## Corrections made

1. **Compact-laptop navigation:** the menu now collapses at 1320 px, keeping the theme control and other header actions inside the viewport at 1280 px.
2. **Stories and Reports intro clipping:** fixed-height scrolling layouts no longer shrink their content panels. Titles, descriptions and report export/brief/print actions remain accessible.
3. **Fly-in during resize:** the comparison follower could interrupt the primary map's animation during a resize. Both maps now resize together with camera synchronization paused, then synchronize from the primary. Only tagged animation events advance the fly-in; its final fit measures the current container size.
4. **Phone map controls:** Replay no longer overlaps Explore features. The active flight status/Skip control uses a separate row, outside the zoom-control gutter.

The SAR Lab source remains unchanged: its SHA-256 is still `22DE17B985E87A2BB839FB99897FB76B5BE900864EF95154993C17085C7998BB`. No scientific input, source artifact or numerical algorithm was changed.

## Verification record

- The complete 55-scenario browser run exercised navigation, six-stage Evidence review, field records, measured imagery/date pairing, aligned maps, Decision Desk, model workspaces, source exports, assistant flows, About, SAR Lab, and the responsive matrix. Its initial mobile framing failure led to the resize correction above; the other 54 scenarios passed.
- After the correction, both normal-motion fly-in/resize and the mobile map/drawer case were repeated five times: **10/10 passed**.
- The related assistant and Observatory suites were rerun after the correction: **12/12 passed**. The Skip test starts a controlled replay so it does not race an automatic intro that may already have finished during initial loading.
- After the final phone-control spacing fix, the complete Observatory suite passed **5/5**, including an explicit zero-overlap check for Replay and Explore features.
- Scientific API and assistant checks: **24 passed**.
- Production TypeScript/Vite build: **passed**.
- Production preview: **30 page/viewport/theme spot-checks passed**, with no page errors; dedicated production fly-in resizing also passed **3/3** (1440→390, 1366→360 and 360→1920 px).

These are Chromium browser/viewport checks, supplemented by visual screenshot review. They do not constitute testing on every physical device or browser engine. Live generative-provider access requires the server credential described in the assistant guide; the data-backed assistant and controlled provider fallback are covered by the tests. Satellite basemap tiles outside the retained observation footprint depend on the external imagery service.

To repeat the layout matrix:

```powershell
cd fluvisar-next/apps/web
npx playwright test tests/responsive-audit.spec.ts --workers=2
```

To run the full browser suite, use `npm run test:e2e -- --workers=2`.


## Map-first Observatory follow-up - 8 November 2026

The two Observatory routes now use a full-width map with horizontal desktop
investigation controls, on-demand feature panels and a collapsible/resizable
finding inspector. The feature panel opens below comparison controls. Six dates,
radar layers, all six Evidence stages, Live Analysis and scoped chat are retained.

The dated optical display now includes 12 source-linked detail pyramids containing
4,116 lossless tiles generated from original 10 m Sentinel-2 TCI COGs. Date changes
recreate the detail source, clearing cached parent tiles from the prior date.
Image and tile readiness are recorded after rendering instead of relying solely
on source events that precede the renderer's cache update.

Verification:

- The 100 page/viewport/theme layout combinations passed again.
- Production preview: 12 map checks passed across both regions, dark/light mode,
  and 1920 x 1080, 1366 x 768 and 390 x 844 viewports; zero page errors.
- The final combined 27-case Observatory/history/assistant/Evidence run passed
  26 cases and exposed one optical readiness flag failure. After fixing renderer
  readiness tracking, that optical timeline/comparison case passed three
  consecutive reruns. Earlier targeted checks also verified every date's detail
  requests, provenance and absence of missing tile responses in both regions.
- The original-data validator passed 4,254 numeric/display SHA-256 checks,
  independently recomputed all 28 non-default selectable pairs, and retained the
  same 759 polygon/area invariants.
- Deep catalogue comparison verified that every original record, label, date,
  metric and geometry is unchanged; only four optical detail metadata fields
  were added per observation. The cached builder explicitly preserves UTF-8.
- Production build passed. SAR Lab source retains its original SHA-256:
  `22de17b985e87a2bb839fb99897fb76b5be900864ef95154993c17085c7998bb`.

These remain Chromium viewport checks and screenshot review, rather than physical
phone testing. The retained source detail is 10 m; zooming further enlarges those
pixels. Context beyond retained dated coverage depends on the external basemap.


## Restored rail and regional views - 8 November 2026

The desktop left panel is restored, with compact cards on shorter laptop screens.
Jamuna opens at 89.75, 25.575, zoom 10.9 and pitch 55 degrees (phone: 10.2 and 45).
Date comparisons return both cameras to the same top-down study framing.
Sundarbans defaults to detailed Esri context, explicitly not date-matched; date
selection opens retained Sentinel-2 observations. Initial optical pairs use the
two least-cloudy available scenes. The white areas in the June 4 Sundarbans scene
are retained source clouds (21.59% ROI cloud/shadow), now explained in the UI.
A bottom-right assistant launcher has reserved timeline space and opens the same
source-connected dialog.

The 25-case focused regression run initially passed 22 cases. Three checks needed
updates for the requested camera and rendering contract: tolerance for floating
point pitch, awaiting the retained imagery after the camera intro, and accepting
ready native detail rather than requiring the older context preview. The four
related date/detail/theme/camera reruns passed. The final two regional UI checks
passed again after compact-rail styling; a further context/split check passed
with the detailed basemap fully loaded. Screenshots were reviewed at 1920, 1366
and 390 px widths. The production build passed. All observation files and SAR Lab
source remain unchanged. The suite now registers 63 tests in eleven files.


## Comparison drag and satellite data visibility - 8 November 2026

Both regional defaults now use the requested zoom 11.4 / pitch 55 on desktop and
phone; Sundarbans focuses on its estuary at 89.74, 21.83. Mouse/touch comparison
uses window pointer tracking and continues after leaving the grip or losing
native capture. Home/End reach 0/100%; Shift+arrows move 5%. Drag does not pan the
map. The grip SVG/label cannot select text or intercept the gesture.

Measured transition polygons and markers now render over Satellite as well as
Radar, with the actual radar pair displayed separately from image dates. Water
mask selection can preserve Satellite and retains its Sentinel-1 observation
date. The legend opens on desktop, locates the largest retained finding, and
links to comparison of the measured radar water pair. Old pixel samples clear
when imagery/lens changes. Redundant external basemap downloads are suppressed
under fully retained dated coverage during close inspection.

The initial three interaction tests passed. A wider 23-case map/assistant run
passed 21 cases and hit two loading/time-budget failures during the concurrent
production build. After the retained-coverage loading change, five targeted
checks passed serially, including both affected cases, mouse capture-loss,
Chromium touch input, and actual satellite/water/geometry handoffs. The final
regional camera/data case passed again while waiting for the appropriate imagery
source before screenshots. Default and located-change screenshots were visually
reviewed. Retained observation files and the original SAR Lab source are unchanged.
The browser suite now registers 66 tests in twelve files.

The final three interaction cases passed together after the readability/layout
adjustment. Their checks include a 1366 x 768 viewport assertion that the expanded
change legend leaves the zoom rail clear, plus full mouse/touch gestures and the
measured-radar-water handoff. Radar dates in the legend use larger type.
