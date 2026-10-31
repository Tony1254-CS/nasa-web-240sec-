# FluviSAR Build & Progress Tracker

> **Governing Authority:** `plan.md` (Version 2.0 · 31 October 2026)  
> **Strict Policy:** All locked decisions in `plan.md` Section 1 are binding. No feature, formula, boundary, or requirement is to be omitted or altered.

---

## 📊 Live Progress Dashboard

| Metric | Status |
|---|---|
| **Overall Progress** | `[██████████] 100%` (12 / 12 Milestones Complete) |
| **Current Phase** | **Phase 5: Verification & Production Release — COMPLETE** |
| **Active Milestone** | **All Milestones Completed & Verified (B00–B11)** |
| **Active Directory** | `fluvisar-next/` |
| **Blockers / Open Issues** | None |

---

## 🔒 Locked Decisions Checklist (Section 1 of `plan.md`)

- [x] **Fresh Start:** Build in `fluvisar-next/`, keeping root cleanly separated.
- [x] **Active Regions:** Exactly two (`jamuna` & `sundarbans`).
- [x] **Jamuna Recovery Area:** Chilmari–Roumari floodplain/char agricultural units inside Jamuna.
- [x] **Foreign / Polder Sites:** Educational/Learn mode only (no foreign active analysis sites).
- [x] **Feature Retention:** All 14 Core (W01–W14), 22 Extended (E01–E22), 18 Research (R01–R18), 5 Targeted (N01–N05), and 24 Mobile contracts (A01–A12, AX01–AX12) preserved.
- [x] **Data Integrity:** Immutable analysis runs, no fabricated scientific numbers or synthetic truth.
- [x] **Mobile Scope:** Web endpoints, schemas, QR/task contracts implemented; phone APK deferred.

---

## 🗺️ Phases & Milestones Roadmap

### Phase 1: Foundation & Architecture (Milestones B00 – B01)
*Goal: System skeleton, Pydantic/TypeScript contract generation, two-region Atlas and layout shell.*

- [x] **B00 — Contracts and Inventory**
  - [x] Initialize workspace `fluvisar-next/`
  - [x] Configure Python environment and lockfile
  - [x] Implement Pydantic models (`models.py`)
  - [x] Generate TypeScript interfaces / JSON schemas (`packages/contracts/`)
  - [x] Write region configurations (`configs/regions/jamuna.yaml`, `configs/regions/sundarbans.yaml` & pilot geojsons)
  - [x] Build `fluvisar doctor` CLI command
  - [x] Contract unit tests & validation tests (`tests/test_contracts.py`)

- [x] **B01 — Visual Shell with Real Geography**
  - [x] Setup React + Vite + Tailwind + MapLibre GL JS (`apps/web/`)
  - [x] M0 Atlas view: Bangladesh locator map with Jamuna & Sundarbans footprints
  - [x] Bilingual support (English & Noto Sans Bengali typography)
  - [x] Desktop (1440px) & Mobile (390px) responsive layout skeleton
  - [x] Navigation tabs: Atlas, Investigate, Stories, Learn, Reports
  - [x] Left view switcher, Right inspector (4-step lead narrative), Rhythm player timeline
  - [x] Production build passes cleanly with zero TypeScript errors

---

### Phase 2: Core Observation & Change Engine (Milestones B02 – B04)
*Goal: Satellite raster rendering, true time playback, and the signature Break My Finding engine.*

- [x] **B02 — Actual Source-to-Map Branch**
  - [x] Pipeline: GCOV adapter (linear power to $10\log_{10}$ dB, geocoding & masks)
  - [x] Point sampling algorithm with spatial bounds verification (`gcov.py`)
  - [x] FastAPI `/api/artifacts/{id}/sample` endpoint for authoritative point inspection (`services/api/app/main.py`)
  - [x] Interactive map click point sampling wired to RightInspector with real-time dB feedback
  - [x] Automated tests for GCOV transformation and API endpoints (`tests/test_b02_source_and_api.py`)

- [x] **B03 — Time and Linked Comparison**
  - [x] Rhythm Player with true time spacing and explicit gap markers (`TimelinePlayer.tsx`)
  - [x] Dual-pane synchronized map comparison with swipe & split-screen toggle (`SwipeCompareMap.tsx`)
  - [x] Linked context tracks: radar power, stage ladder with danger line, NDVI, rainfall (`ContextTracks.tsx`)
  - [x] Compatible pair selector with orbit geometry matching and stage $\Delta h$ limits (`PairSelectorModal.tsx`)

- [x] **B04 — Change Detection & "Break My Finding"**
  - [x] Otsu exploratory thresholding with real pixel histogram (`water.py`)
  - [x] 4-class transition detection (Stable Water, Stable Land, Erosion Candidate, Accretion Candidate)
  - [x] Break My Finding threshold perturbation $[-2, -1, 0, +1, +2]$ dB variants
  - [x] Robust Core vs. Contested Fringe calculation
  - [x] 7 Check Groups engine (product/geometry, alignment, classification sensitivity, hydrology, subsequent observations, independent comparison, controls)
  - [x] Interactive Break My Finding modal with live histogram and check breakdown (`BreakMyFindingModal.tsx`)
  - [x] Automated tests for Otsu, transitions, core/fringe invariant, and checks (`tests/test_b04_change_and_checks.py`)

---

### Phase 3: Regional Missions & Deep Science (Milestones B05 – B07)
*Goal: Specialized algorithms for Sundarbans mangrove dynamics, Jamuna char connectivity, and InSAR.*

- [x] **B05 — Sundarbans Investigation**
  - [x] Dual-pol (HH/HV) cross-polarization ratio in dB (`sundarbans.py`)
  - [x] Real Pauli RGB covariance composite implementation per Section 11.1
  - [x] Optical NDVI quality screening and reflectance extraction
  - [x] Tidal stage observation filter (High Tide vs Low Tide matched conditions)
  - [x] ROOTRETURN 4-quadrant response fingerprint (tidal sub-canopy vs disturbance)
  - [x] Interactive Sundarbans Radar Switchboard in frontend LeftPanel (`SundarbansPolarizationPanel.tsx`)
  - [x] Automated tests for dual-pol, Pauli, NDVI, and tide filtering (`tests/test_b05_sundarbans.py`)

- [x] **B06 — Jamuna Recovery and Service Decisions**
  - [x] Floodplain water recurrence ($N_{wet} / N_{valid}$)
  - [x] Comparative recession analysis (RE:FLOW)
  - [x] OSM road, clinic, and school exposure extraction
  - [x] Service continuity network graph (CHARKEEP)
  - [x] **Decision Flip Engine:** Budget-constrained inspection shortlist & assumption flip
  - [x] Interactive Jamuna Decision Panel in frontend LeftPanel (`JamunaDecisionPanel.tsx`)
  - [x] Automated tests for recurrence, CHARKEEP network, and Decision Flip engine (`tests/test_b06_jamuna_decisions.py`)

- [x] **B07 — Specialty and Research Cases**
  - [x] Local InSAR (GUNW) wrapped/unwrapped phase & coherence inspector (X1) (`pipeline/fluvisar/methods/insar.py`)
  - [x] Transect profiler with source-resolution sampling and water-break markers
  - [x] SWOT water-elevation adapter with explicit quality flags and pending overpass handling
  - [x] Compound observation view (water + vegetation + LOS motion) on independent physical axes
  - [x] NISAR contribution benchmark protocol (Sentinel-1 C-band baseline vs. added NISAR L-band)
  - [x] Interactive InSAR & Specialty panel in frontend LeftPanel (`InSARSpecialtyPanel.tsx`)
  - [x] Automated tests for phase conversion, coherence, referencing, transects, SWOT, and benchmark (`tests/test_b07_specialty.py`)

---

### Phase 4: Intelligence, Stories & Decision Lab (Milestones B08 – B10)
*Goal: Evidence management, one-page briefs, guided storytelling, and educational labs.*

- [x] **B08 — Evidence, Passport and Reports**
  - [x] Change Passport: immutable finding lineage with SHA-256 cryptographic hash (`evidence_passport.py`)
  - [x] Evidence review workspace with append-only revision history ledger (R18)
  - [x] Impact Ledger (What Changed for Whom): OSM schools, clinics, severed roads, BBS census population (W09, E16)
  - [x] One-page bilingual Decision Brief generator (print-ready PDF/HTML) with mobile task QR contract (`DecisionBriefModal.tsx`)
  - [x] Complete reproducible manifest and JSON export package (`ChangePassportModal.tsx`)
  - [x] Automated tests for passport generation, revision ledger, impact ledger, and brief manifest (`tests/test_b08_evidence_and_reports.py`)

- [x] **B09 — Stories, Learn and Translation**
  - [x] Five localized story chapters: River change, Agriculture, Service, Mangrove, Motion (`StoryModeView.tsx`)
  - [x] Audience Switcher: Public Bangla, Decision Maker, Analyst perspective adapters (E10)
  - [x] Personal Testimony qualitative context layer with attributed consent records (E13)
  - [x] SAR Lab 4 mini-experiments: Cloud Blindness, Polarization Match, Speckle Filter, Fringe Counter (`SarLabView.tsx`)
  - [x] Web Audio Sonification utility: backscatter dB mapped to real-time acoustic frequencies (E22, `sonification.ts`)
  - [x] Future NISAR capabilities horizon panel: SME2 soil moisture, forest biomass, tectonic deformation (E14)
  - [x] Automated tests for chapters contract, physics formulas, and audience separation (`tests/test_b09_stories_and_learn.py`)

- [x] **B10 — Scenarios and Comprehension Improvements**
  - [x] Decision & educational radar response simulator (`ScenarioLabPanel.tsx`, W13 / E21)
  - [x] N01: Historical context bridge (GMW 1996-2025 mangrove baseline vs 2026 NISAR tidal pulse)
  - [x] N02: Coverage curtain support denominator toggle & pixel exclusion inspector (`CoverageCurtainOverlay.tsx`)
  - [x] N03: Assumption receipt export recording changed parameters and delta impacts (`scenarios_and_improvements.py`)
  - [x] N04: Guided comparison prompts authored from metadata (subsequent overpass, threshold challenge)
  - [x] N05: Evidence multi-clock display (Satellite radar, river gauge, pipeline run, field survey)
  - [x] Automated tests for GMW bridge, curtain support, assumption receipt, guided prompts, and multi-clock (`tests/test_b10_scenarios_and_comprehension.py`)

---

### Phase 5: Verification & Production Release (Milestone B11)
*Goal: Scientific invariants verification, accessibility, performance tuning, and release package.*

- [x] **B11 — Verification and Release Package**
  - [x] Unit & integration test suite verification across all milestones (`tests/run_all_tests.py` - 9/9 passed)
  - [x] WCAG 2.2 accessibility & contrast compliance verification
  - [x] Production build and performance validation (Vite build passed with 0 errors)
  - [x] Docker Compose setup & reproducible launch configuration (`Dockerfile`, `docker-compose.yml`)
  - [x] Requirement-status matrix (`docs/feature-status.csv`) covering W01–W14, E01–E22, R01–R18, N01–N05
  - [x] Complete root `README.md` and developer documentation

---

## 📝 How to Read & Update

- **Every milestone directly references `plan.md` sections.**
- When a task is completed, update the checkbox to `[x]` and adjust the progress meter.
- Ask anytime: `"status"` or `"কতদূর কাজ হলো?"` for an immediate live report.
