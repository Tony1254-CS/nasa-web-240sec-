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

## Atlas cases, outlook and docked chat - 8 November 2026

The Atlas now scrolls from its geographic introduction to two actual regional
case studies, an experimental water-area outlook, a review workflow and quality
verdict guidance. Source windows, support/processed area and sensor metadata are
preserved. The outlook exposes six observations, three rolling-origin checks,
method selection, 6/12/24-day horizons, historical errors and JSON export. It is
explicitly uncalibrated and does not claim a spatial flood or damage forecast.

The shared assistant opens above the bottom-left launcher without a modal
backdrop, inert background or card resizing. Observatory visits repeat the wide
view-to-study zoom-in even with an old session seen flag. Final regional camera
values remain zoom 11.4 and pitch 55 degrees.

The combined Atlas/assistant/map-first/satellite regression run passed all 23
cases. After visual review, dark text contrast was corrected and phone Atlas
framing was adjusted to the intro's measured height, keeping both location pins
clear of the intro and attribution/options. The final five-case Atlas suite
passed again, including eight viewport/theme combinations (1920, 1366, 390 and
360 px widths, each dark/light), loaded context imagery, marker placement,
non-modal interaction and colour checks. Forecast tests cover irregular gaps,
chronological validation without future leakage, physical bounds and export.
Screenshots were visually reviewed at desktop/laptop and phone sizes. Observation
files and the original SAR Lab component remain unchanged. The suite registers
71 tests in thirteen files; this entry reports targeted checks, not a fresh run
of all 71 cases.

The production build also passed. Its preview rendered both case cards and the
non-modal chat without browser page errors; card and chat screenshots were
reviewed. The temporary preview process was stopped after verification.

## Radar camera continuity and place watch - 8 November 2026

Observatory defaults to measured Radar in both regions at the existing
zoom 11.4 / pitch 55 camera. Imagery switches update layers without refitting
the camera. Recenter and comparison framing retain their explicit actions.
The non-modal chatbot and launcher dock at bottom right, with phone timeline
space reserved. Atlas keeps its geographic satellite overview.

Atlas adds source-backed place proximity and a separately labelled conditional
timing sandbox. Sixty Jamuna and fourteen Sundarbans records retain OSM links,
snapshot metadata, input hashes, actual matched transition geometry and measured
nearest-point connectors. All 74 distances were independently recomputed against
every original land-to-water polygon. No bank-failure dates or hazard
probabilities are inferred from water-area totals.

The nine-case place-watch/outlook run passed. In the wider 22-case assistant,
map-first, place-watch and satellite run, 21 passed; the remaining older test
still expected Sundarbans to default to Esri. Its expectation was updated to the
actual latest radar acquisition and the targeted fly-in test passed again.
Together these cover all 27 distinct targeted cases. Checks include the live
camera before/after all imagery switches, source hashes, exports and filters,
mouse/touch swipes, retained optical dates, chat scoping and responsive themes.
Watchlist and timing screenshots were reviewed at laptop and phone sizes;
the UI test covers 1920, 1366 and 390 px in both themes. Original observation
files and SAR Lab source remain unchanged. There are now 75 registered tests
in fourteen files; this was not a fresh run of the whole suite.

The production TypeScript/Vite build passed after these changes.

## Shared brief rendering and restored Satellite arrival - 8 November 2026

The shared Decision Brief previously inherited legacy resets, oversize headings,
low-contrast text and clipped ancestor layouts. It now renders through a body
portal in a native dialog with isolated paper styles, persistent actions and a
scrollable preview. The same component serves Reports, the Observatory feature
panel and finding inspector. A finding inspector passes its actual displayed
finding ID even when it is the default inspected candidate. Reports explicitly
uses the study/default comparison scope.

The former demo figures, sensor/approval claims and decorative QR were replaced
with the registered comparison, actual transition/sensitivity/QC values,
source-linked exposure analysis and a generated comparison QR. Source SHA-256s
use the actual VV hash rather than rendering the hash object as text. Print
isolates the paper from the underlying page and preserves its entire content.

The 14-case brief/assistant/place-watch run passed after correcting finding scope.
Brief coverage includes all three entry points in both regions, 1920/1366/390/360
px widths in both themes, scroll/actions, source values and A4 exports. Both
regional PDFs were confirmed to contain exactly one page, rasterized with
PyMuPDF and visually reviewed alongside the phone preview. The targeted print
case passed again after the final report scope fix.

The user explicitly chose the previous Satellite default. Zoom 11.4, pitch 55
and bearing 0 are retained, together with camera-preserving Radar switches.
Map readiness now belongs to its current instance generation, preventing stale
loaded flags from cancelling a replacement map's arrival. The fly-in waits for
initial geographic imagery before starting, remains skippable/interruption-safe
and respects reduced motion. Three targeted camera tests passed after these
changes: replay/skip alignment, repeat fresh visits and live region changes.
The restored regional satellite arrival screenshot was reviewed. There are 79
registered tests in fifteen files; this entry describes targeted runs.

The production build passed. Production preview loaded the generated QR chunk
and source-linked briefs in both regions without page errors. Both exported A4
PDFs were again confirmed as one complete page with lineage/footer text present;
their rasterized layouts were reviewed. The temporary preview was stopped.

## Full-height Observatory rail - 8 November 2026

The feature panel now belongs to the full Observatory workspace rather than
only the map stage. This fills the former empty strip beside the signal tracks
and timeline without changing the map's frame or camera. Its body has more
scrollable room; a compact footer presents actual radar-pass count and valid
support alongside the existing provenance message. Phones retain the feature
drawer and its close control.

All three targeted map-first cases passed (both regional feature panels and the
desktop/laptop/phone camera/chat check). The production build passed. Production
preview verified both regions in dark/light at 1920, 1366 and 390 px widths,
including full-height desktop bounds, the mobile drawer, real footer values and
absence of horizontal overflow or page errors. Expanding signal tracks also
retained full-height rail alignment. Screenshots were reviewed and the temporary
preview was stopped. No additional tests were added for this layout adjustment.

## Executive Insights - 9 November 2026

Added `/insights` using the registered regional comparison, measured transition
areas, mapped exposure, source records and acquisition history. Sendai cards
distinguish screening evidence from confirmed damage. Economic values require
explicit user-supplied rates and remain conditional planning scenarios.

The 13-case Insights, Decision Brief and Decision Desk run passed. The responsive
audit and existing Evidence workflows passed all 14 cases, covering eleven pages
at five viewport sizes in both themes (110 layout combinations). Four Insights
cases passed again after the chart-axis refinement. These were targeted runs;
the complete registered suite contains 83 tests in sixteen files.

The host blocked the native GDAL DLL through Windows Application Control. A
restricted read-only GeoTIFF runtime recomputed the original files without
changing OS policy or accepting stale cache signatures. All eight comparison
and selected-finding parity checks matched the earlier native results exactly;
four Python tests passed for georeferencing, masks, coordinate conversion and
both regions' actual context/pixel responses. Ingestion still requires GDAL.

Browser checks used installed Chrome through the optional Playwright channel;
bundled Chromium could not initialize WebGL on this host. The production build
passed. Production preview checked real regional data, scenario arithmetic,
briefs and export availability at 1920, 1366 and 390 px, including both themes.
The final chart, six indicator cards and malformed local-storage recovery were
also verified. Screenshots were reviewed without page errors. Observatory data
assets and SAR Lab source were unchanged.
