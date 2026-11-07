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
