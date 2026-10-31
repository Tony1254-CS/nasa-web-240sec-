# FluviSAR: Radar Earth Observatory

> **NASA Space Apps Challenge 2026** · *Track: Earth Observation, Synthetic Aperture Radar (SAR), and Water Transitions*  
> **Governing Specification:** `plan.md` (Version 2.0 · 31 October 2026)  
> **Progress Tracker:** `PROGRESS.md` (100% Complete · Milestones B00–B11)  
> **Architecture & Decision Records:** `docs/DECISIONS.md` | `docs/ARCHITECTURE.md` | `docs/feature-status.csv`

---

## 🛰️ Executive Overview

**FluviSAR** is an open-source, dual-region satellite radar observatory and decision-intelligence platform built for NASA Space Apps Challenge 2026. It monitors water transitions, seasonal flood recession, riverbank erosion, and mangrove wetland dynamics across two contrasting biomes in Bangladesh:

1. **Jamuna River Reach (Chilmari–Roumari):** Dynamic braided sandbar (char) migrations, severe monsoon bank cutting, floodplain recovery, and community isolation routing.
2. **Sundarbans Coastal Reach (Dublar–Passur):** Tidal inundation cycles, sub-canopy microwave double-bounce penetration, and decadal mangrove extent baselines.

---

## 🔒 Foundational Invariants & Non-Negotiables

* **Two Active Study Biomes:** Active operational observation is strictly bounded to `jamuna` and `sundarbans`. Remote foreign hazard sites (Glacier Bay, NorCal fire, Mexico City earthquake) are preserved exclusively as attributed educational teaching references in `Learn` to prevent uncalibrated analysis of remote environments.
* **Zero-Fabricated Scientific Data Policy:** FluviSAR never generates synthetic "filler" metrics, fictional confidence percentages, or simulated ground-truth validations. Any missing overpass or pending sensor series is explicitly surfaced with its exact dependency requirements.
* **Full Feature Preservation:** Implements all **14 Core requirements (W01–W14)**, **22 Extended features (E01–E22)**, **18 Research capabilities (R01–R18)**, **5 Targeted improvements (N01–N05)**, and preserves **24 Mobile field contracts (A01–A12, AX01–AX12)**.

---

## 🌟 Signature Scientific Innovations

### 1. "Break My Finding" & 7 Check Groups (`W04–W06`, `E03–E07`)
Rather than presenting a single false boundary, FluviSAR's **Break My Finding** engine perturbs the Otsu segmentation threshold across $[-2, -1, 0, +1, +2]$ dB offsets to reveal the **Robust Core** (stable land/water pixels that persist across all parameter settings) versus the **Contested Fringe** (uncertain edge pixels). Every finding undergoes an automated **7 Check Groups audit** spanning geometry, co-registration, threshold sensitivity, hydrological stage matching, subsequent overpass persistence, independent cross-sensor comparison, and stable spatial controls.

### 2. Dual-Pol Ratios & Real Pauli RGB Decomposition (`W03`, `E06`, `E09`, `R09–R12`)
For the Sundarbans mangrove wetland, FluviSAR extracts cross-polarization ratios ($10\log_{10}(P_{\text{HH}}/P_{\text{HV}})$) and synthesizes true Pauli RGB covariance composites:
$$\text{Red (Double-Bounce)} = \frac{C_{\text{HHHH}} + C_{\text{VVVV}} - 2\text{Re}(C_{\text{HHVV}})}{2}$$
$$\text{Green (Volume / Canopy)} = 2 C_{\text{HVHV}}$$
$$\text{Blue (Surface Specular)} = \frac{C_{\text{HHHH}} + C_{\text{VVVV}} + 2\text{Re}(C_{\text{HHVV}})}{2}$$
Coupled with the **ROOTRETURN** 4-quadrant response fingerprint, this distinguishes high-tide sub-canopy water presence (+2.3 dB HV with stable optical NDVI 0.68) from permanent defoliation.

### 3. CHARKEEP Topological Graph & Decision Flip Engine (`R04–R07`, `B06`)
Models 12 interconnected infrastructure nodes (primary schools, clinics, roads, and engine boat ferries) across Chilmari and Roumari. Given a disaster response budget (e.g. $15,000 / 3 teams), the **Decision Flip Engine** prioritizes field inspections where a possible misclassification would change an aid or evacuation decision, delivering verifiable **Decision Flip Receipts** with safeguarded population counts.

### 4. Local InSAR Phase-to-Displacement & SWOT Elevation (`E15`, `R08`, `R14–R16`)
Converts unwrapped interferometric phase (radians) to Line-Of-Sight (LOS) displacement:
$$\Delta d = -\frac{\lambda}{4\pi} \Delta \phi$$
Supports NISAR L-band ($\lambda = 0.2384$ m) and Sentinel-1 C-band ($\lambda = 0.0555$ m). Incorporates coherence masking ($\gamma \ge 0.35$), connected component anchoring, and a **Transect Profiler** with explicit break markers across unobservable river crossings. Integrates SWOT KaRIn reach water surface elevation ($h_w$) and cross-sectional slope.

### 5. Change Passport & One-Page Bilingual Decision Brief (`W10`, `W14`, `E11`, `E16`, `E17`, `R18`)
* **Change Passport:** Generates an immutable cryptographic SHA-256 lineage hash binding granules, thresholds, core/fringe areas, and 7-check audits.
* **Append-Only Revision Ledger:** Field teams and researchers can append reviews and survey notes with unique revision IDs; prior history cannot be rewritten or deleted.
* **Impact Ledger & Decision Brief:** Generates clean, print-ready, bilingual (English & Bangla) one-page briefs detailing exposed schools, clinics, severed roads, and BBS census population. Includes scannable QR code contracts for offline mobile field task handoff.

### 6. Five Localized Stories & Audience Switcher (`W12`, `E10`, `E13`, `E19`)
Features five thematic narrative chapters across our two active biomes:
1. *The River That Erases Its Own Banks* (Jamuna braided river dynamics & bank erosion memory)
2. *The Rhythm of Floodplain Recovery* (Recession timing, silt deposition, and winter crop recovery)
3. *Lifelines Across the Water* (Roads, ferries, clinic connectivity, and isolation routing)
4. *The Mangrove Breathing with the Tides* (Sundarbans tidal pulse & sub-canopy double bounce)
5. *Millimeters of Ground Motion* (InSAR phase coherence & LOS compaction)

Switch seamlessly between **Public** (clear metaphors), **Decision Maker** (impact & priority shortlists), and **Analyst** (calibrated decibels and coherence criteria) registers. Includes qualitative **Personal Testimony** context layers collected with informed consent.

### 7. SAR Lab Physics Twin & Web Audio Sonification (`E18`, `E22`)
* **4 Interactive Mini-Experiments:**
  1. *Cloud Blindness:* Visual comparison of optical occlusion vs. microwave radar cloud penetration.
  2. *Polarization Match:* Match surface, volume, and double-bounce scattering mechanisms.
  3. *Speckle Filter:* Test Boxcar vs. Lee adaptive filtering for edge preservation.
  4. *Fringe Counter:* Interactive phase field simulator with $\lambda/2$ cycle counting.
* **Web Audio Sonification:** Real-time Web Audio API synthesizer mapping backscatter dB to acoustic frequencies ($f = 220 \cdot 2^{(\text{dB}+25)/12}\text{ Hz}$), enabling users to listen to radar power across chars and channels.

### 8. Comprehension Improvements N01–N05 (`B10`)
* **N01 Historical Context Bridge:** Side-by-side Global Mangrove Watch (GMW) decadal epochs (1996–2025) vs. 2026 intra-annual NISAR observations.
* **N02 Coverage Curtain:** One-click toggle revealing the 78% valid observation support mask vs. pixels excluded by radar shadow, far-range roll-off, or specular absorption.
* **N03 Assumption Receipt:** Exportable JSON receipts recording declared simulation parameter changes and delta consequences.
* **N04 Guided Comparison Prompts:** Metadata-driven prompts guiding users to subsequent satellite passes, Break My Finding tests, or low-tide condition comparisons.
* **N05 Evidence Multi-Clock:** Inspector separately presents Satellite Radar (UTC), River Gauge, Pipeline Processing, and Ground Survey timestamps.

---

## 🛠️ Architecture & Technology Stack

```text
fluvisar-next/
├── apps/web/                  # React 19 + TypeScript + Vite + MapLibre GL JS + Tailwind v4 + Zustand
├── pipeline/fluvisar/         # Python remote sensing science engine
│   ├── adapters/              # GCOV, GUNW, SWOT, and IMERG raster adapters
│   └── methods/               # Water Otsu, Sundarbans Pauli, Jamuna decisions, InSAR, Passport
├── services/api/              # FastAPI high-performance tile & point sampling server
├── packages/contracts/        # Canonical Pydantic models, JSON schemas, TypeScript types
├── configs/regions/           # Jamuna & Sundarbans regional boundary configurations
├── tests/                     # 9 automated scientific invariant test suites
├── Dockerfile                 # Multi-stage production container
└── docker-compose.yml         # Containerized web and API orchestration
```

---

## ⚡ Quick Start & Reproduction

### Prerequisites
* Python 3.10+ (tested on Python 3.11 & 3.15)
* Node.js 20+ & npm

### 1. Run All Scientific Tests (100% Passing)
```bash
# Navigate to workspace
cd fluvisar-next

# Run master test suite
python tests/run_all_tests.py
```
*Executes all 9 milestone test suites covering Pydantic models, GCOV transformations, Otsu change detection, Sundarbans Pauli decomposition, Jamuna CHARKEEP graph, InSAR phase conversion, Change Passport cryptographic lineage, story chapter contracts, and N01–N05 comprehension improvements.*

### 2. Launch the Web Frontend
```bash
cd apps/web
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Launch the Backend API Service
```bash
cd fluvisar-next
pip install -r requirements.txt
uvicorn services.api.app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API documentation available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 4. Run via Docker Compose
```bash
cd fluvisar-next
docker-compose up --build
```

---

## 📄 Documentation Index

* `plan.md` — Complete 1,268-line governing specification (v2.0)
* `PROGRESS.md` — Live milestone-by-milestone progress dashboard (100% complete)
* `docs/DECISIONS.md` — Architecture Decision Records (ADR-001 through ADR-010)
* `docs/feature-status.csv` — Full requirement traceability matrix (W01–W14, E01–E22, R01–R18, N01–N05, A01–A12, AX01–AX12)
* `docs/DEVELOPER_GUIDE.md` — Pipeline extension and developer handbook

---

## ⚖️ License & Attribution

FluviSAR is developed for the **NASA Space Apps Challenge 2026**.  
Licensed under the [Apache License, Version 2.0](LICENSE).  
Satellite datasets provided by NASA, JPL/Caltech, ISRO, ESA Copernicus, and JAXA.
