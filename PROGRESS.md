# FluviSAR Build & Progress Tracker

> **Governing Authority:** `plan.md` (Version 2.0 · 31 October 2026)  
> **Strict Policy:** All locked decisions in `plan.md` Section 1 are binding. No feature, formula, boundary, or requirement is to be omitted or altered.

---

## 📊 Live Progress Dashboard

| Metric | Status |
|---|---|
| **Overall Progress** | `[████████░░] 67%` (8 / 12 Milestones Complete) |
| **Current Phase** | **Phase 4: Intelligence, Stories & Decision Lab** |
| **Active Milestone** | **B08 — Evidence, Passport and Reports** |
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

- [ ] **B08 — Evidence, Passport and Reports**
  - [ ] Change Passport: immutable finding lineage and claim records
  - [ ] Evidence review workspace with revision history
  - [ ] One-page bilingual Decision Brief generator (HTML/print-ready PDF)
  - [ ] Complete reproducible manifest and export package

- [ ] **B09 — Stories, Learn and Translation**
  - [ ] Five localized story chapters (River change, Agriculture, Service, Mangrove, Motion)
  - [ ] Audience Switcher: Public Bangla, Decision Maker, Analyst
  - [ ] SAR Lab 4 mini-experiments: Cloud Blindness, Polarization Match, Speckle Filter, Fringe Counter
  - [ ] Web sonification / audio sample representation
  - [ ] Future NISAR panel

- [ ] **B10 — Scenarios and Comprehension Improvements**
  - [ ] Decision & educational radar response simulator
  - [ ] N01: Historical context bridge (GMW long-term mangrove context)
  - [ ] N02: Coverage curtain (valid/unobserved/quality masks)
  - [ ] N03: Assumption receipt for scenario exports
  - [ ] N04: Guided comparison prompts
  - [ ] N05: Multi-clock timestamp display

---

### Phase 5: Verification & Production Release (Milestone B11)
*Goal: Scientific invariants verification, accessibility, performance tuning, and release package.*

- [ ] **B11 — Verification and Release Package**
  - [ ] Unit & integration tests (pytest for science invariants, Vitest for frontend)
  - [ ] End-to-end journey tests with Playwright
  - [ ] WCAG 2.2 accessibility & contrast compliance verification
  - [ ] Performance benchmark validation (sub-3s shell, sub-500ms cached date switch)
  - [ ] Docker Compose setup & reproduction verification
  - [ ] Final documentation: `README.md`, `feature-status.csv`, source registry

---

## 📝 How to Read & Update

- **Every milestone directly references `plan.md` sections.**
- When a task is completed, update the checkbox to `[x]` and adjust the progress meter.
- Ask anytime: `"status"` or `"কতদূর কাজ হলো?"` for an immediate live report.
