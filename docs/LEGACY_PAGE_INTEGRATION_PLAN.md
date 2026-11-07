# Integrating the legacy pages into FluviSAR Next

Reviewed: 2026-11-06. Original scope: source review of both local projects and the existing architecture graph. Implementation now follows this plan; see [implementation details and verification](LEGACY_PAGE_INTEGRATION.md) for the delivered scope and current data limitations.

## Recommendation

Port the original page components and their visual dependencies into the new React app. Preserve their DOM structure, styles, charts, controls, animations, and page-specific map composition. Replace their old data access and global state dependencies with a shared repository and typed page adapters backed by the new project's contracts.

Use one data source for the Observatory and the imported pages. Do not keep two independently maintained datasets, embed the old application in an iframe, or reconstruct these pages using the current simplified panels.

The target is identical presentation and interaction with current project data. The underlying map imagery, feature shapes, numbers, dates, and evidence-dependent text will necessarily reflect the selected dataset. Exact old map pixels require the same old assets, bounds, selected date, and rendering settings; that is a separate reference configuration for visual comparison.

## Actual route mapping

Source: `nasa-2026-web/web/src/App.tsx`.

| Requested route | Actual source component | Target route |
| --- | --- | --- |
| `/impact` (user wrote `/imact`) | `pages/DecisionDesk.tsx` | `/impact` |
| `/intelligence` | `pages/Intelligence.tsx` | `/intelligence` |
| `/sar-lab` | `pages/SARLab.tsx` | `/sar-lab` |

`pages/Impact.tsx` actually serves `/insights`. Porting that file for `/impact` would produce the wrong page. Optionally redirect `/imact` to `/impact` for typo compatibility.

The new app currently has `/learn` and `/learn/:experimentId` rendering `SarLabView`, but does not register the three target routes. Keep those existing URLs functional and add the full pages explicitly.

## Findings that affect integration

### The frontend stack is compatible, with migration work

Both apps use React, TypeScript, Vite, Zustand, Lucide, and MapLibre. The old package declares React 18 / Zustand 4 / MapLibre 5; the new package declares React 19 / Zustand 5 / MapLibre 6. Retain the new app's versions and fix type/API differences during the port rather than downgrading the project or importing the entire old dependency tree. Add dependencies only if the imported components actually require them.

### The current data contracts differ substantially

The legacy `data/load.ts` assembles `ReachBundle` from seven resources: reach, manifest, stage, bounds, QC, erosion GeoJSON, and accretion GeoJSON. Pages and maps also construct image URLs directly.

The new contracts describe `Region`, `Case`, `AnalysisRun`, `Observation`, `LayerArtifact`, `Finding`, `Metric`, `Claim`, and `QualityCheck`. They carry run IDs, origin, evidence support, readiness, artifact bounds, and nullable metrics. Preserve this richer model; do not make the legacy bundle the new backend's authoritative schema.

### The new API cannot yet supply a complete authoritative page bundle

In `fluvisar-next/services/api/app/main.py`:

- `/api/runs/{run_id}/bundle` returns a fixed response with two Jamuna artifact descriptors, without render URLs, findings, metrics, claims, or full QC. The response accepts a run ID but does not resolve a persisted run.
- `/api/artifacts/{artifact_id}/sample` computes a deterministic simulated backscatter value from coordinates. It does not read a calibrated numeric raster.

The inspected `data/derived` directory contained no files. The map currently reads static PNGs from `/rasters` and vector constants from `src/data/geoData.ts`. A working initial repository can register these current assets explicitly, with honest provenance, while the persisted backend is completed. Merely changing the pages' fetch URL to `/api/runs/.../bundle` will not work.

### Asset provenance needs resolution

`generate_satellite_rasters.py` generates SAR PNGs from geometry, random noise, and simulated scene states. Other download scripts target real optical imagery, and the map also has an Esri imagery tile source. File names alone do not establish which generation/download path produced each current public asset.

Before treating a raster as a measured SAR observation, identify its actual source, date, footprint, numeric companion artifact, and processing record. Synthetic assets remain usable for educational simulations, with their origin declared. A grayscale optical basemap is not a calibrated SAR raster.

### Scientific interpretation cannot be copied as fixed text

The old Jamuna reach bundle reports two acquisitions, relative orbit 19 / frame 76, proxy stage context, and an `INCONCLUSIVE` verdict. The new provenance registry advertises different track and stage details. These sources must not be combined into one apparent observation record.

The imported pages contain case-specific narrative, including fixed sensitivity ranges and evidence gaps. Derive such text from the selected run or retain it only inside a clearly identified historical reference case. Never substitute zero or a fabricated success status when a new field is missing. Handle `refuted`, `not-applicable`, and nullable metrics explicitly; the old status enums do not cover all new states.

## Proposed implementation structure

```text
apps/web/src/
  features/legacy-pages/
    LegacyPageLayout.tsx
    LegacyNavbar.tsx
    pages/DecisionDesk.tsx
    pages/Intelligence.tsx
    pages/SARLab.tsx
    map/DecisionMap.tsx
    demos/                     # existing synthetic ML / SAR exercises
    styles/                    # scoped original visual dependencies
  data/analysis/
    AnalysisRepository.ts
    StaticAnalysisRepository.ts
    ApiAnalysisRepository.ts
    useAnalysisBundle.ts
    pageAdapters.ts
    artifactResolver.ts
```

These paths are proposed, not existing modules.

Data flow:

```text
Workspace selection: region + case + run + date/pair + finding
                         |
               Shared analysis repository
                         |
          Validated canonical data + artifact registry
                         |
          Typed page adapters / shared map sources
             /           |            \
       Observatory   Imported pages   Reports
```

Use the existing `useWorkspaceStore` as the single source of shared selection. Keep transient page state such as active experiment, chart sliders, ledger filter, and panel expansion local. Do not copy the old global store wholesale or synchronize two independent stores with effects.

The repository must resolve a consistent region/case/run bundle. Key caches by run and pair where applicable; cancel or ignore stale responses after selection changes. Reset incompatible selections and prevent findings from one run being shown with metrics from another.

Initially use a static repository over registered project assets if needed. Add the API implementation against the same interface when real persisted bundles are available. Both must expose provenance and capability gaps consistently; an adapter cannot manufacture absent data.

## Page-by-page changes

### `/impact`: Decision Desk

Port `DecisionDesk.tsx`, `DecisionMap.tsx`, `decision-desk.css`, and required shared styling/navbar dependencies.

Preserve ledger sorting/filtering, candidate selection, top-N map layers, timeline playback, comparison images, scenario envelope controls, review workflow, and exports.

Replace:

- Fixed `REACH_ID` and two-date defaults with workspace/run selection.
- Legacy `loadReachBundle` with the shared repository and a Decision Desk adapter.
- Direct image naming and fixed OPERA footprint/date with artifact descriptors.
- Fixed Jamuna camera/max bounds with selected artifact/support geometry.
- `/app?reach=...&feature=...` links with supported Observatory navigation that actually restores region, run, pair, and finding.
- Review storage keys containing only a reach with keys containing run/finding identity. Local storage is acceptable for local drafts; shared review history needs persistence.
- Fixed Jamuna-specific explanatory text with run-driven content.

Keep the page-specific `DecisionMap` renderer initially: replacing it with the full Observatory workspace would change map layout and controls. Share artifact resolution, geometry, selection IDs, and source creation helpers between map renderers. The legacy map initializes sources only once, so region/run changes need reliable source replacement or an explicit remount; changing props alone is insufficient.

The original OSM scenario context query uses the public Overpass service. Preserve attribution, request lifecycle, and unavailable/error states. For repeatable production results, cache or proxy queries by area and retain query time/source separately from the analytical run.

### `/intelligence`

Port the full page, `intelligence.css`, and `sarForestDemo.ts`, `temporalMlpDemo.ts`, `sarSpeckleDemo.ts`, `sarAdvancedDiagnostics.ts`.

The model sandbox generates synthetic samples and trains demonstration models in the browser. Keep its educational behavior and synthetic labels. Wire the evidence tab separately to selected run observations, metrics, QC, and actual raster artifacts. It currently loads Jamuna explicitly; remove this hardcoding. Do not describe synthetic model metrics as validation of the selected real-world case.

### `/sar-lab`

Port the full `SARLab.tsx` and its complete style dependencies; the current `SarLabView` is a smaller, different experience.

Replace every direct `/data/v1/...` reference, including hardcoded Jamuna paths inside individual experiments. Keep sliders, charts, canvases, section navigation, simulations, and animations.

Resolve radar/water/change assets by region, run, channel, date/pair, and artifact kind. Define capability-aware states when a region lacks an experiment input. Canvas pixel access needs same-origin assets or suitable CORS configuration. Display PNG brightness thresholds as an image exercise; calibrated dB thresholds and scientific areas require numeric artifacts and geospatial support, not display RGB values.

## Asset and state mapping

| Legacy dependency | New source / rule |
| --- | --- |
| `reach_id` | Explicit region/reach mapping; region IDs alone do not encode run or case |
| `YYYYMMDD` strings | Normalize internally to ISO dates; format only at boundaries |
| `img/radar_DATE.png` | Registered radar `LayerArtifact.render_url` for date/channel |
| `img/water_DATE.png` | Actual water artifact or supported vector representation |
| `img/change_A_B.png` | Pair-specific registered change artifact |
| `bounds.coordinates` | Artifact-specific WGS84 corners in TL/TR/BR/BL order |
| `erosion/accretion.geojson` | Findings plus linked metrics and claims; preserve stable feature IDs |
| `manifest.metrics` | Canonical metrics including units, origin, missing reason, and support |
| `qc.checks` | Explicit status mapping with no silent promotion to PASS |
| stage / verdict | Evidence-backed hydrological context and claim assessment |

Do not stretch a new raster over the old bounds or invent an erosion category for a wetland-canopy finding. Sundarbans needs declared page capabilities and relevant labels; unsupported erosion-only analysis should show a reason within the preserved layout.

## Preserving the exact visual presentation

The old app uses global `base.css`, `tokens.css`, `agentic.css`, `globe.css`, navbar styles, and global background elements. The new app has Tailwind and a light workspace theme. Blind global CSS imports will change existing pages and may also cause Tailwind preflight to change the imported pages.

Use a dedicated route layout with one legacy navbar, original background elements, original fonts/tokens, and a page-owned scroll area. Render it outside the current universal header/fixed workspace shell. Scope original resets, tokens, theme selectors, and page styling under a stable wrapper, and explicitly address Tailwind cascade/reset interference. Preserve viewport-relative and fixed-position behavior during scoping.

Do not copy the old service worker: its root registration/cache behavior is unrelated to these pages and could serve stale new-app assets. Rewrite internal links to routes that exist in the new app; copying all old nav destinations would introduce broken navigation.

## Implementation order and acceptance checks

1. Capture reference screenshots and interaction states from the actual legacy routes at agreed desktop/mobile sizes, with known dates, assets, fonts, and theme. Source review alone does not establish pixel parity.
2. Audit/register existing new-project assets and define the repository contract, provenance, capabilities, and run-consistent page adapters.
3. Port the visual shell and SAR Lab, preserving existing new-project routes.
4. Port Intelligence and connect its evidence tab while keeping simulations distinct.
5. Port Decision Desk and its map composition; connect shared selection, review state, and exports.
6. Make the Observatory consume the same registered bundle and artifact resolver, so the imported pages and map cannot disagree about active evidence.
7. Compare reference-driven views with identical reference inputs for visual parity, then verify new-data views for correct changes in imagery, geometry, values, dates, and evidence-dependent copy.

Required verification: production TypeScript/Vite build; direct URL refresh/navigation; no missing assets; desktop/mobile screenshots; map alignment and source replacement; shared selection across routes; stale request handling; missing-data states; filtering/selection/timeline/compare/scenario controls; review and export identity; and regression checks on existing Observatory/Atlas routes. Use focused adapter/geometry tests where silent errors would alter results, plus browser checks for interaction and visual fidelity.

Completion means all three full pages are available in the new app, visually match their reference presentation, and use one consistent selected dataset with the Observatory. Merely copying old assets, changing headings, or linking the old app does not satisfy the integration.
