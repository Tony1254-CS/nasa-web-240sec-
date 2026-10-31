# FluviSAR Build & Progress Tracker

> **Governing Authority:** `plan.md` (Version 2.0 · 31 October 2026)  
> **Strict Policy:** All locked decisions in `plan.md` Section 1 are binding. No feature, formula, boundary, or requirement is to be omitted or altered.

---

## 📊 Live Progress Dashboard

| Metric | Status |
|---|---|
| **Overall Progress** | `[█░░░░░░░░░] 8%` (1 / 12 Milestones Complete) |
| **Current Phase** | **Phase 1: Foundation & Architecture** |
| **Active Milestone** | **B01 — Visual Shell with Real Geography** |
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

- [ ] **B01 — Visual Shell with Real Geography**
  - [ ] Setup React + Vite + Tailwind/Tokens + MapLibre GL JS
  - [ ] M0 Atlas view: Bangladesh locator map with Jamuna & Sundarbans footprints
  - [ ] Bilingual support (English & Noto Sans Bengali typography)
  - [ ] Desktop (1440px) & Mobile (390px) responsive layout skeleton
  - [ ] Navigation tabs: Atlas, Investigate, Stories, Learn, Reports
  - [ ] Empty state / Data-readiness badges for unpopulated data

---

### Phase 2: Core Observation & Change Engine (Milestones B02 – B04)
*Goal: Satellite raster rendering, true time playback, and the signature Break My Finding engine.*

- [ ] **B02 — Actual Source-to-Map Branch**
  - [ ] Pipeline: GCOV adapter (linear power to $10\log_{10}$ dB, geocoding & masks)
  - [ ] Generate numeric COG and PMTiles for Jamuna & Sundarbans
  - [ ] FastAPI `/api/artifacts/{id}/sample` endpoint for authoritative point inspection
  - [ ] MapLibre PMTiles raster integration with fixed scientific color stretch

- [ ] **B03 — Time and Linked Comparison**
  - [ ] Rhythm Player with true time spacing and explicit gap markers
  - [ ] Dual-pane synchronized map comparison (swipe / split-screen)
  - [ ] Context tracks: rainfall (IMERG), water fraction, NDVI, water-level context
  - [ ] Patch biography and temporal observation ledger

- [ ] **B04 — Change Detection & "Break My Finding"**
  - [ ] Otsu exploratory thresholding with real pixel histogram
  - [ ] Water/non-water candidate classification and transition classes
  - [ ] Minimum Mapping Unit (MMU) area filtering
  - [ ] **Break My Finding:** Threshold offsets `[-2, -1, 0, +1, +2]` dB and filter variants
  - [ ] Robust Core vs. Contested Fringe calculation
  - [ ] 7 Check Groups (product/geometry, alignment, classification sensitivity, hydrology, subsequent observations, independent comparison, controls)

---

### Phase 3: Regional Missions & Deep Science (Milestones B05 – B07)
*Goal: Specialized algorithms for Sundarbans mangrove dynamics, Jamuna char connectivity, and InSAR.*

- [ ] **B05 — Sundarbans Investigation**
  - [ ] Dual-pol (HH/HV) channel switcher & ratio analysis
  - [ ] Pauli RGB covariance composite implementation (from valid co-pol/cross-pol terms)
  - [ ] Sentinel-2 optical quality screening & NDVI calculation
  - [ ] Joint optical–radar patch trajectories
  - [ ] Tide-context filtering & matched-condition comparison adapter
  - [ ] Forest boundary metrics and patch configuration

- [ ] **B06 — Jamuna Recovery and Service Decisions**
  - [ ] Floodplain water recurrence ($N_{wet} / N_{valid}$)
  - [ ] Comparative recession analysis (RE:FLOW)
  - [ ] OSM road, clinic, and school exposure extraction
  - [ ] Service continuity network graph (CHARKEEP)
  - [ ] **Decision Flip Engine:** Budget-constrained inspection shortlist & assumption flip

- [ ] **B07 — Specialty and Research Cases**
  - [ ] Local InSAR (GUNW) wrapped/unwrapped phase & coherence inspector (X1)
  - [ ] Transect profiler with source-resolution sampling
  - [ ] SWOT water-elevation adapter (if observation matches)
  - [ ] Compound observation view (water + vegetation + LOS motion)
  - [ ] NISAR contribution benchmark protocol (baseline vs. added NISAR)

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
