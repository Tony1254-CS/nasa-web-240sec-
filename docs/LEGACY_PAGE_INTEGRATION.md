# Legacy page integration

**Superseded data status:** the application now has a common site-wide design and actual downloaded Sentinel-1 RTC observations. See [current implementation and real-data verification](REAL_OBSERVATIONS.md). The static/demo adapter described below records the earlier integration stage and is no longer the active analytical source.

Implemented in `fluvisar-next/apps/web` on 2026-11-06.

## Routes and presentation

- `/impact` renders the original full Decision Desk, including the map, review ledger, comparison, scenarios, QC, local review state, and JSON exports.
- `/intelligence` renders the original full ML Intelligence page, including synthetic model exercises and a separate workspace evidence tab.
- `/sar-lab` renders the original full SAR Lab and its interactive experiments, canvases, charts, and simulations.
- `/imact` redirects to `/impact`.
- Existing workspace routes, including `/learn`, remain available. Header navigation opens the new full SAR Lab.

The original page components and CSS were ported into `src/features/legacy`. Original CSS selectors, resets, themes, and tokens are scoped under `.legacy-pages`; the imported pages have their own visual shell and navbar. Shared application selection still lives in `useWorkspaceStore`. The old application's store, service worker, and static data bundles were not copied.

Page components load lazily. Existing Observatory and Atlas routes retain their workspace shell. Region/date-pair changes remount the imported page content to discard incompatible transient state. Display-date inspection uses `setDisplayDate` to preserve the active analysis pair; the existing date-selection behavior elsewhere remains available.

## Data connection

`src/data/analysisRegistry.ts` is the shared artifact resolver for Observatory rasters and imported-page imagery. It centralizes registered dates, region footprints, raster URLs, and the current workspace vector layers. It does not infer calibration or source provenance from filenames.

`src/features/legacy/data/load.ts` adapts the existing new-project static geometry into the imported pages' display bundle. It does not fetch `/data/v1` or use the simulated numeric sampling API. Stable candidate IDs match the workspace IDs, and metrics are labeled as educational simulations. Review keys include region and run identity. Exports include run identity and origin.

- The registered default Jamuna pair is 2026-08-26 to 2026-09-19. Its two demo candidate areas are 145.8 ha and 88.4 ha, taken from the current project's geometry properties.
- Other pairs and Sundarbans do not acquire invented river-erosion findings: the full page remains available with absent metrics and an explanation.
- Water and change display images are generated from the same workspace vector geometry at the registered footprint. They are display artifacts, not numeric raster measurements.
- SAR Lab and Intelligence comparison views resolve the selected region and pair instead of hardcoded Jamuna paths.
- Missing gauge, orbit, channel calibration, independent OPERA products, and quality results are shown as unavailable/not evaluated.
- Decision Desk registers local map imagery on `style.load`, so loading it does not wait for the external basemap's tile requests.

The current API still returns a placeholder run bundle and simulated pixel samples. Connecting a future persisted/calibrated backend requires replacing the static bundle adapter and registering actual render/numeric artifacts, findings, metrics, and QC. No backend completeness or scientific validation is implied by this UI integration.

## Verification

From `fluvisar-next/apps/web`:

```powershell
npm run build
npx playwright install chromium
npm run test:e2e -- --workers=1
```

The browser suite covers routes and existing-workspace navigation, map raster loading, review persistence and JSON download, date inspection, scenario and comparison views, region switching, missing metrics for unsupported pairs, shared selection/deep-link restoration, synthetic/evidence tab separation, SAR scan completion, theme changes, and mobile navigation/overflow. Screenshots are written into ignored `test-results/` for visual inspection.

Desktop and mobile screenshots of the imported pages were inspected. The original components/styles were reused, but an automated pixel-diff baseline against a running legacy app was not established. Data-dependent values, availability messages, navigation destinations, and case-specific narrative were intentionally adapted to the new workspace.

Build emits the existing large-main-chunk advisory. Lint runs with warnings in existing code and the imported educational components. `SARLab.tsx` retains the original file's `@ts-nocheck`; its main paths are exercised in browser tests. A full TypeScript cleanup of that original educational page is separate from the integration.
