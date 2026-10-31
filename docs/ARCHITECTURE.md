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


---

## 🛰️ External Data Sources & Basemaps
For a full scientific and technical inventory of all external datasets (NASA NISAR, GPM IMERG, SWOT, Copernicus Sentinel-1/2, JAXA GMW, BWDB FFWC, BIWTA, BBS 2022 Census), see [`docs/EXTERNAL_DATA_SOURCES.md`](EXTERNAL_DATA_SOURCES.md).

### High-Resolution Basemap Engine & Swipe Comparison
- **Real Satellite Basemap:** Integrated global true-color optical satellite imagery (Esri World Imagery / Maxar / NASA) toggleable with the `🛰️ Real Satellite` vs `🗺️ Carto Map` switcher.
- **Dual Synchronized Viewports:** `MapWorkspace.tsx` manages two synchronized MapLibre canvases:
  - **Map B (Primary / Interactive):** Renders Date B post-monsoon channels, active red erosion zones (145.8 ha), green accretion sandbars (88.4 ha), and asset risk pins.
  - **Map A (Comparison / Clipped):** Renders Date A pre-flood peak inundation or pure optical satellite imagery, clipped via CSS polygon mask according to the user's `swipePosition`.
  - **Synchronization:** 60 FPS WebGL camera mirroring ensures zero lag during pan and zoom.

### Date-Indexed Sentinel-2 & SAR Raster Engine
- **AWS Earth Search STAC Pipeline:** Pulls genuine ESA Copernicus Sentinel-2 Level-2A surface reflectance tiles for Jamuna (`45RYJ`) and Sundarbans (`45QYE`) across all six target observation dates with $0.00\%$ cloud cover.
- **Dynamic MapLibre ImageSource Streaming:**
  - Date-indexed optical rasters (`jamuna_optical_*.png`, `sundarbans_optical_*.png`) and matching SAR rasters (`jamuna_sar_*.png`, `sundarbans_sar_*.png`) are streamed into MapLibre GL canvases via georeferenced bounding box coordinates.
  - Client-side WebGL handles image updates asynchronously without full page reloads, ensuring instantaneous 60 FPS transitions during timeline playback and swipe comparisons.
