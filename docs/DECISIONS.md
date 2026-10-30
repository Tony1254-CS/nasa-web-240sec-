# Architecture & Technical Decision Records (ADR)

This document records the foundational architectural, scientific, and product decisions governing the **FluviSAR** codebase. These decisions are locked per `plan.md` Section 1.

---

### ADR-001: Two Active Study Regions (Jamuna & Sundarbans)
* **Status:** LOCKED / ACCEPTED
* **Context:** The original challenge allows any global location. An earlier exploration scattered focus across 7 diverse regions (Glacier Bay, NorCal fire, Mexico City, etc.).
* **Decision:** Consolidate active scientific analysis into exactly two contrasting Bangladesh biomes:
  1. `jamuna`: Braided river dynamics, seasonal flooding, bank erosion, and community connectivity.
  2. `sundarbans`: Mangrove wetlands, tidal inundation, and optical vs. SAR canopy penetration.
* **Consequence:** Foreign hazard sites (glaciers, earthquakes, fires) are retained exclusively as educational reference material in `Learn`, preventing superficial or fabricated analysis of remote areas.

---

### ADR-002: Zero-Fabricated Data Policy & Explicit Dependency States
* **Status:** LOCKED / ACCEPTED
* **Context:** Remote sensing platforms frequently fail gracefully or encounter missing data (clouds, pending satellite passes, missing stream gauges).
* **Decision:** Under no circumstance will the system generate synthetic "filler" numbers, fake confidence percentages, or simulated ground-truth validation.
* **Consequence:** Every UI component has explicit states: `loading`, `ready`, `partial`, `access-required`, or `unavailable`. If a gauge or product is pending, it displays the exact missing dependency.

---

### ADR-003: MapLibre GL JS + PMTiles Over Paid SDKs
* **Status:** LOCKED / ACCEPTED
* **Context:** Mapping needs to be fast, offline-capable, cost-free, and support multi-band raster overlays without proprietary vendor lock-in.
* **Decision:** Use open-source **MapLibre GL JS** paired with **Protomaps PMTiles** for raster and vector tile archiving.
* **Consequence:** No Mapbox access tokens, zero per-tile API costs, and full compatibility with standard static web hosts (Vercel, Nginx, GitHub Pages).

---

### ADR-004: Dual-Tier Architecture (Python Pipeline + TypeScript Web SPA)
* **Status:** LOCKED / ACCEPTED
* **Context:** Heavy remote sensing operations (HDF5 reading, radiometric calibration, georeferencing) are impractical directly in client-side JavaScript.
* **Decision:**
  - **Offline/Backend Pipeline (Python):** Ingests raw NISAR HDF5/GCOV, converts linear power to dB, executes Otsu thresholding, and publishes immutable static bundles.
  - **Client Application (React + Vite + TS):** Consumes static PMTiles/JSON or connects to a lightweight FastAPI service for point-level sampling.
* **Consequence:** Fast sub-3s browser load times without bogging down the browser with multi-gigabyte satellite granules.

---

### ADR-005: "Break My Finding" Scientific Interaction
* **Status:** LOCKED / ACCEPTED
* **Context:** Remote sensing algorithms are sensitive to parameter tuning (e.g. Otsu thresholds, speckle filters). Presenting a single boundary creates a false sense of certainty.
* **Decision:** Implement **Break My Finding** (`W06`), allowing the user to dynamically perturb parameters (threshold offsets $[-2, -1, 0, +1, +2]$ dB) to reveal the **Robust Core** (pixels that remain classified across all settings) versus the **Contested Fringe**.
