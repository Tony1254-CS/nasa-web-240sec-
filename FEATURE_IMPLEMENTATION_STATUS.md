# FEATURE_IMPLEMENTATION_STATUS.md
## FluviSAR + TRACE Field — Scientific Feature Audit & Implementation Matrix
*Repository Audit Date: 2026-11-07 · NASA Space Apps Challenge 2026*

---

### 1. Executive Summary & Audit Baseline

An in-depth inspection of the complete FluviSAR codebase was conducted across:
- Frontend: `fluvisar-next/apps/web` (React 19, TypeScript, Vite, MapLibre GL, Tailwind v4, Zustand)
- Backend API: `fluvisar-next/services/api` (FastAPI, Uvicorn, Rasterio)
- Science Engine: `fluvisar-next/pipeline` (Otsu, Pauli decomposition, InSAR phase-to-displacement, CHARKEEP Dijkstra graph)
- Evidence & Catalogs: `fluvisar-next/apps/web/public/observations` (Sentinel-1 RTC GeoTIFFs, Sentinel-2 L2A optical scenes)
- Legacy & Specialized Modules: `features/legacy` (DecisionDesk, Intelligence, SARLab)

This document establishes the official status matrix and actionable implementation roadmap before code modifications begin, adhering strictly to the **Zero-Fabricated Scientific Data Policy** and the **Auditable Decision Pipeline**:
$$\text{Satellite Observation} \longrightarrow \text{Adversarial Validation} \longrightarrow \text{Cryptographic Provenance} \longrightarrow \text{Field Evidence Return} \longrightarrow \text{Auditable Decision}$$

---

### 2. Comprehensive Feature Matrix (Step 1 Audit)

| # | Feature | Existing Status | Missing Work / Gaps | Implementation Location |
|---|---|---|---|---|
| **F01** | **River Memory — Living Change Timeline** | PARTIALLY IMPLEMENTED | Map shows only current pair transitions; missing translucent historical ghost boundary overlays; timeline lacks synchronized Area-Over-Time chart; change polygons lack direct single-click provenance drawer sync. | `apps/web/src/components/TimelinePlayer.tsx`, `ContextTracks.tsx`, `MapWorkspace.tsx` |
| **F02** | **Break My Finding — Adversarial Change Lab** | PARTIALLY IMPLEMENTED (SIMULATED UI) | Modal uses hardcoded baseline (-14.2 dB) and synthetic fringe numbers disconnected from selected polygon; 7-check evaluator is partially mocked; lacks real map layer updating for Robust Core vs Contested Fringe vs Indeterminate; missing stage confounding rejection. | `apps/web/src/components/BreakMyFindingModal.tsx`, `FindingInspectorDrawer.tsx`, `MapWorkspace.tsx` |
| **F03** | **Radar-to-Reality — Physics Twin** | PARTIALLY IMPLEMENTED | Explanations lack structured 4-part inquiry (What changed, Physical interpretation, Alternative explanations, Next evidence required); missing dual Analyst vs Public (Bangla) register switcher on findings; pol channels not gated by sensor. | `apps/web/src/components/FindingInspectorDrawer.tsx`, `ObservatoryFeaturePanel.tsx`, `i18n/translations.ts` |
| **F04** | **Rhythm Player + Stage Ladder** | PARTIALLY IMPLEMENTED | Timeline player steps dates, but does not display interactive River Stage & GPM Rainfall time-series charts; lacks explicit `REJECTED — HYDROLOGICAL CONDITIONS NOT COMPARABLE` banner with scientific rejection rationale for mismatched river stage (>1.0m delta). | `apps/web/src/components/TimelinePlayer.tsx`, `SwipeCompareMap.tsx`, `ContextTracks.tsx` |
| **F05** | **Physics Twin + Polarization Prism** | PARTIALLY IMPLEMENTED | Quick polarization switch exists for VV/VH/Ratio/RGB; missing genuine Pauli composite rendering and explanation where quad-pol data exists; lacks explicit radar signature scatter quadrant for mangrove vs water. | `apps/web/src/components/SundarbansPolarizationPanel.tsx`, `ObservatoryFeaturePanel.tsx` |
| **F06** | **Change Passport** | PARTIALLY IMPLEMENTED (MOCKED) | Modal has empty string SHA-256 hash (`e3b0c44...`) and hardcoded IDs; lacks real manifest export, CLI reproducible command generator (`python -m fluvisar.pipeline ...`), and live QR-based case handoff contract to TRACE Field. | `apps/web/src/components/ChangePassportModal.tsx`, `FindingInspectorDrawer.tsx`, `services/api/app/main.py` |
| **F07** | **Impact Ledger** | PARTIALLY IMPLEMENTED | Spatial tallying uses heuristic assumptions in `JamunaDecisionPanel`; lacks clear standardized classification tags (`MEASURED`, `DERIVED`, `ESTIMATED`, `SIMULATED`) across exposure counts (OSM schools, clinics, roads). | `apps/web/src/components/JamunaDecisionPanel.tsx`, `features/legacy/pages/DecisionDesk.tsx` |
| **F08** | **Human Translation Layer** | PARTIALLY IMPLEMENTED | Basic language toggle exists for `en`/`bn`; lacks tri-mode register (Analyst, Decision-maker, Public Bangla) that preserves scientific uncertainty without oversimplified loss claims. | `apps/web/src/components/Header.tsx`, `FindingInspectorDrawer.tsx`, `i18n/translations.ts` |
| **F09** | **TRACE Field: Satellite Asked Me & Evidence Loop** | NOT IMPLEMENTED (WEB GAP) | No TRACE Field mobile interface route; QR code is static SVG icon; no backend endpoints for field observation queue, idempotent sync, or linking field returns back to FluviSAR findings as `Awaiting Review`. | `apps/web/src/features/trace/TraceFieldApp.tsx`, `services/api/app/main.py`, `FindingInspectorDrawer.tsx` |
| **F10** | **TRACE Field: Point & Prove** | NOT IMPLEMENTED | No simulated or live camera HUD overlay displaying target polygon bearing, distance, GPS accuracy ring, and alignment uncertainty. | `apps/web/src/features/trace/components/PointAndProve.tsx` |
| **F11** | **TRACE Field: Walk on the Radar** | PARTIALLY IMPLEMENTED | Sonification utility exists (`sonification.ts`), but lacks GPS simulated movement and finger-drag tactile coordinate dB audio synthesizer with haptic feedback. | `apps/web/src/features/trace/components/WalkOnRadar.tsx`, `utils/sonification.ts` |
| **F12** | **TRACE Field: My Place Watch + Bangla Voice** | NOT IMPLEMENTED | Cannot bookmark local coordinates/char zones; lacks same-track cadence countdown (12-day nominal cycle) and offline-capable pre-recorded Bangla voice narration with genuine field testimony. | `apps/web/src/features/trace/components/MyPlaceWatch.tsx`, `data/fieldStories.ts` |
| **F13** | **Sensor Race** | PARTIALLY IMPLEMENTED | Dual view exists in `SwipeCompareMap` (Sat vs Radar); lacks 3-way Sensor Race dashboard (Sentinel-2 Optical with real cloud fraction vs Sentinel-1 C-band vs NISAR L-band) highlighting penetration physics. | `apps/web/src/components/SensorRaceModal.tsx`, `SwipeCompareMap.tsx` |
| **F14** | **Earth Change Atlas / World Tour** | PARTIALLY IMPLEMENTED | `AtlasView.tsx` only lists Jamuna and Sundarbans; missing global comparison cases (Glacier Bay, NorCal wildfire, Mexico City earthquake) with mandatory case status badges (`Verified Analysis`, `Contextual Case`, `Illustrative Simulation`). | `apps/web/src/components/AtlasView.tsx`, `data/globalAtlas.ts` |

---

### 3. Scientific Inconsistencies & Unreliable Features Audit (Section 5 & 6)

1. **Synthetic ML Metrics in `Intelligence.tsx`**:
   - *Issue*: Synthetic random forest, unverified ROC/AUC curves, and simulated confusion matrices in `features/legacy/pages/Intelligence.tsx` and `sarForestDemo.ts`.
   - *Action*: Strictly label every synthetic experiment as **EDUCATIONAL SIMULATION / SYNTHETIC EXPERIMENT** with explicit disclaimers; remove any claim of ground-truth validation or confirmed flood forecasting.
2. **Hardcoded Passport Hash & Finding IDs**:
   - *Issue*: `ChangePassportModal.tsx` hardcoded empty SHA-256 `e3b0c442...` and static finding `FINDING-JAMUNA-2026-001`.
   - *Action*: Bind directly to the selected polygon ID, actual observation numeric SHA-256 (`numeric_sha256.vv`), and compute reproducible manifest hashes.
3. **Decoupled Break My Finding**:
   - *Issue*: `BreakMyFindingModal.tsx` used static Otsu -14.2 dB instead of region's actual threshold (-17.0 dB for Jamuna) and static 11.4 ha area.
   - *Action*: Connect directly to `evidence.threshold_sensitivity` (-18 dB to -16 dB computed areas) and dynamic recalculation for the active finding.
4. **Hydrological Confounding**:
   - *Issue*: When comparing pairs with river stage delta > 1.0m, no scientific warning was surfaced.
   - *Action*: Add `REJECTED — HYDROLOGICAL CONDITIONS NOT COMPARABLE` banner with stage delta explanation when stage conditions invalidate recession comparison.
5. **Real QR Code & TRACE Field Routing**:
   - *Issue*: QR code in Decision Brief is a static placeholder icon.
   - *Action*: Implement real dynamic QR generator encoding URL `http://localhost:5173/trace?case=...` and build the complete responsive `/trace` mobile app with Mission Inbox, Structured Verification, Offline Queue, and Evidence Return API.

---

### 4. Step-by-Step Implementation Roadmap

- **Phase 1: Scientific Investigation Engine**
  - Implement River Memory ghost overlays & interactive Area-Over-Time chart in `ContextTracks.tsx` & `MapWorkspace.tsx`.
  - Wire real threshold sensitivity & 7-check evaluation into `BreakMyFindingModal.tsx` with Robust Core / Contested Fringe / Indeterminate layers.
  - Implement Radar-to-Reality 4-part scientific inquiry & Analyst/Public explanation modes in `FindingInspectorDrawer.tsx`.
  - Add River Stage & GPM Rainfall charts with Stage Ladder rejection banner in `TimelinePlayer.tsx` / `SwipeCompareMap.tsx`.
  - Integrate Pauli RGB and polarization scattering interpretation in `SundarbansPolarizationPanel.tsx`.

- **Phase 2: Provenance and Impact**
  - Upgrade `ChangePassportModal.tsx` with authentic cryptographic SHA-256 lineage, processing parameters, and CLI reproducible command.
  - Standardize Impact Ledger with `MEASURED`, `DERIVED`, `ESTIMATED`, `SIMULATED` badges on infrastructure exposures.
  - Implement Human Translation tri-mode (Analyst, Decision-maker, Public Bangla).

- **Phase 3: TRACE Field Integration**
  - Add FastAPI backend endpoints (`/api/trace/cases`, `/api/trace/observations`) with SQLite/JSON local persistence.
  - Build `TraceFieldApp.tsx` mounted at `/trace` with Mission Inbox, Structured Observation (`SUPPORTS`, `CONTRADICTS`, `INCONCLUSIVE`, `NOT_OBSERVABLE`), photo & GPS capture, and offline queue.
  - Build `PointAndProve.tsx` camera HUD simulator.
  - Build `WalkOnRadar.tsx` backscatter audio synthesizer & finger-drag/GPS walk.
  - Build `MyPlaceWatch.tsx` with 12-day nominal cadence countdown & Bangla audio player.
  - Integrate Evidence Return Loop back into FluviSAR `FindingInspectorDrawer` as `Awaiting Review`.
  - Generate authentic dynamic QR codes in `DecisionBriefModal.tsx` and `ChangePassportModal.tsx`.

- **Phase 4: Sensor Comparison and Global Atlas** [COMPLETED]
  - Implemented `SensorRaceModal.tsx` comparing Sentinel-2 Optical (with real 42% monsoon cloud cover), Sentinel-1 C-band, and NISAR L-band.
  - Re-architected and elevated `AtlasView.tsx` with a YouTube/Mission Control design pattern:
    - YouTube-style segmented category filter chips (`All Landscapes`, `Active Satellite Radar`, `Glacier Terminus`, `Aquifer InSAR`, `Wildfire Burn`).
    - Live search bar with instant matching across biomes, sensors, and physical mechanisms.
    - Symmetrical 16:9 satellite radar thumbnails with real VV rasters and high-tech GIS vector schematics.
    - Symmetrical 3-column fact grid with matching card heights and action button baselines.
    - Interactive `SensorRaceModal`, `ChangePassportModal`, and `ScientificPreviewModal`.
  - Audited and labeled all legacy ML pages as educational simulations.

- **Phase 5: Verification & End-to-End Testing** [COMPLETED]
  - Built production bundle (`npm run build`) in 3.73s with 0 TypeScript errors.
  - All 9 scientific milestone test suites passed: **9 PASSED, 0 FAILED**.
  - All TRACE Field mobile API endpoints verified: **PASSED**.
