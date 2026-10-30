# FluviSAR System Architecture & Design

> **Authority:** Derived from `plan.md` (Version 2.0)

FluviSAR is a dual-region web observatory designed for the **NASA Space Apps Challenge 2026** ("Dancing with the SARs"). It tracks, visualizes, and challenges river and coastal landscape changes across **Jamuna** and **Sundarbans** using NASA-ISRO Synthetic Aperture Radar (NISAR) and complementary optical/hydrological data.

---

## 🏗️ High-Level System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA INGESTION PIPELINE                         │
│  • NASA NISAR L2 GCOV (L-band Backscatter Power)                       │
│  • Copernicus Sentinel-2 L2A (Multispectral Optical / NDVI)            │
│  • GLO-30 DEM, IMERG Rain, FFWC Stage Gauges, OSM Infrastructure      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Python 3.11 / Rasterio / NumPy
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      IMMUTABLE ARTIFACT ENGINE                         │
│  • GeoTIFF / Cloud Optimized GeoTIFFs (COG) & PMTiles Overlays        │
│  • Otsu Thresholding, MMU Filtering, Robust Core vs Fringe Masks       │
│  • Canonical JSON Contracts (manifest.json, metrics.json, findings)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API & Static Range-Serving
                                    ▼
┌───────────────────────────────────┴────────────────────────────────────┐
│                    BACKEND API (FastAPI + SQLite)                      │
│  • /api/regions, /api/cases/{id}, /api/runs/{id}/bundle               │
│  • Authoritative numeric pixel sampling (/api/artifacts/{id}/sample)   │
│  • Scenario persistence, inspection budget solver, evidence review     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JSON Contracts & PMTiles
                                    ▼
┌───────────────────────────────────┴────────────────────────────────────┐
│                  FRONTEND WEB OBSERVATORY (React + Vite)               │
│  • MapLibre GL JS + PMTiles: High-performance satellite map views       │
│  • D3.js: Stage ladder, linked time-series, radar-optical trajectories │
│  • Zustand: Workspace state, comparison swipe, timeline sync           │
│  • Bilingual: English & reviewed Noto Sans Bengali                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Workspace Map Views
- **M0 (Atlas):** Dual-region Bangladesh locator showing Jamuna and Sundarbans footprints.
- **J1 (River Memory):** Multi-temporal GCOV radar, Otsu waterline transitions, and riverbank history.
- **J2 (Floodplain Recovery):** Water recurrence ($N_{wet}/N_{valid}$), recovery trajectories, and crop context.
- **J3 (Service Continuity):** OSM road/clinic exposure and accessibility under uncertain crossings.
- **S1 (Wetland Pulse):** Dual-pol (HH/HV) channel exploration, tide-filtered water masks.
- **S2 (Forest Response):** Mangrove canopy optical–radar scatter plots and boundary tracking.
- **X1 (Motion & Fringe):** InSAR line-of-sight displacement and interferometric coherence.
- **C1 (Scenario Lab):** Side-by-side comparison of baseline vs. NISAR-added decisions.
