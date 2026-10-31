# FluviSAR External Data Sources & Sensor Integration

This document provides a comprehensive scientific and operational overview of all external datasets, satellite sensors, and in-situ hydrological monitoring networks integrated into the **FluviSAR** observatory for the NASA Space Apps Challenge 2026.

---

## 🛰️ 1. Spaceborne Satellite Remote Sensing Missions

### 1.1 NASA-ISRO Synthetic Aperture Radar (NISAR)
*Governing Spec: `plan.md` Section 3.1, 4.1, 7.1*
- **Agency:** NASA (Jet Propulsion Laboratory) & ISRO (Indian Space Research Organisation).
- **Sensor:** L-band Synthetic Aperture Radar ($\lambda = 23.84$ cm, frequency $1.25$ GHz).
- **Repeat Orbit:** 12-day exact repeat cycle (descending track 142 over Jamuna, ascending track 071 over Sundarbans).
- **Core Product Formats:**
  1. **L2 GCOV (Geocoded Co-pol Backscatter):** Calibrated backscatter power ($\gamma^0$ in dB) at 20 m spatial posting in dual polarization ($\text{HH}$ and $\text{HV}$). Used for open water thresholding ($\gamma^0 \le -14.0$ dB) and sub-canopy root returns.
  2. **L2 GUNW (Geocoded Unwrapped Interferograms):** Repeat-pass interferometric phase ($\Delta\phi$) measuring line-of-sight displacement in millimeters ($\text{mm/yr}$).
  3. **L2 SME2 (Soil Moisture Estimation):** Native 200 m resolution volumetric soil moisture ($\text{m}^3/\text{m}^3$) for pre-saturation analysis preceding riverbank slumping.
- **Why NISAR L-band is critical:** Unlike optical cameras, L-band microwave radar penetrates through dense monsoon cloud cover and tropical tree foliage, revealing water underneath the Sundarbans mangrove canopy and mapping riverbank erosion during peak monsoon storms.

---

### 1.2 NASA Global Precipitation Measurement (GPM IMERG)
*Governing Spec: `plan.md` Section 3.1, 4.4*
- **Agency:** NASA Goddard Space Flight Center & JAXA.
- **Product:** IMERG (Integrated Multi-satellitE Retrievals for GPM) Final Run V07B.
- **Resolution:** 0.1° ($\sim 10$ km), half-hourly accumulated precipitation.
- **Role in FluviSAR:**
  - 7-day upstream watershed accumulated precipitation (mm).
  - Rainfall anomaly rates for antecedent precipitation indices ($API_7$).
  - Serves as the primary hydrological driver in the Jamuna Hydro-Morphological Risk Matrix ($E_{12}$).

---

### 1.3 NASA / CNES Surface Water and Ocean Topography (SWOT)
*Governing Spec: `plan.md` Section 3.1, 6.1*
- **Agency:** NASA & Centre National d'Études Spatiales (CNES).
- **Sensor:** KaRIn (Ka-band Radar Interferometer, 35.75 GHz).
- **Product:** L2 KaRIn Reach-Averaged Water Surface Elevation ($h_w$ in meters WGS84) and Reach Water Slope ($\partial h_w / \partial s$ in $\text{cm/km}$).
- **Role in FluviSAR:**
  - Constrains hydrodynamic shear stress on Chilmari western bend.
  - Cross-validates BWDB gauge stage ladders when physical telemetry fails during high flood crests.

---

### 1.4 ESA Copernicus Sentinel-1 & Sentinel-2
*Governing Spec: `plan.md` Section 3.1, 4.2, 5.3*
- **Agency:** European Space Agency (ESA) Copernicus Programme.
- **Sensors:**
  - **Sentinel-1 (C-band SAR, $\lambda = 5.55$ cm):** Cross-sensor comparison against NISAR L-band. C-band scatters directly off the top of dense mangrove canopies, whereas L-band penetrates to the flooded forest floor (double-bounce return).
  - **Sentinel-2 (MSI Optical Multispectral):** 10 m Red and Near-Infrared (NIR) bands for cloud-screened Normalized Difference Vegetation Index ($\text{NDVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}$).
- **Role in FluviSAR:**
  - Separates genuine agricultural sandbar silt emergence ($\Delta \text{NDVI} > +0.25$) from temporary river channel splits.
  - Validates forest defoliation vs normal tidal inundation in Sundarbans.

---

### 1.5 JAXA / Global Mangrove Watch (GMW)
*Governing Spec: `plan.md` Section 3.1, 11.0*
- **Agency:** Japan Aerospace Exploration Agency (JAXA) & Aberystwyth University.
- **Product:** GMW Decadal Mangrove Baselines (1996–2025 vector polygons).
- **Role in FluviSAR:**
  - Historical context bridge preventing short-term tidal flooding from being falsely flagged as long-term mangrove habitat loss.

---

### 1.6 High-Resolution True-Color Satellite Imagery (Esri / Maxar / NASA)
- **Provider:** Esri World Imagery (Maxar, Earthstar Geographics, NASA/USGS).
- **Resolution:** Up to 0.5 m spatial resolution true-color optical imagery.
- **Role in FluviSAR:**
  - Integrated directly into MapLibre GL as a 1-click basemap toggle (`🛰️ Real Satellite`).
  - Powers the **Swipe Comparison Engine** (`SwipeCompareMap.tsx`), allowing users to compare photographic Earth surface imagery with NASA NISAR radar backscatter and water classification masks.

---

## 🌊 2. In-Situ Hydrological & Ground Telemetry

### 2.1 Bangladesh Water Development Board (BWDB) - FFWC
- **Gauge Station:** Chilmari Gauge (`SW46.9`), Jamuna River.
- **Datum & Metrics:**
  - Danger Level ($DL$): $19.50$ m PWD.
  - Recorded 2026 Monsoon Peak (Aug 26): $18.90$ m (Rising stage $+0.32\text{ m/day}$).
  - Post-Flood Transition (Sep 19): $16.40$ m (Receding stage $-0.18\text{ m/day}$).
- **Role:** Real-time hydrograph rendering on the synchronized temporal axis (`ContextTracks.tsx`) and flood stage validation.

### 2.2 Bangladesh Inland Water Transport Authority (BIWTA)
- **Tidal Station:** Dublar Char Outer Bay Station (`TD12.4`), Sundarbans.
- **Datum & Metrics:**
  - Spring High Tide Level: $+2.20$ m CD.
  - Neap Low Tide Level: $+0.40$ m CD.
- **Role:** Provides tidal stage filtering (`All Passes`, `High Tide`, `Low Tide`) in the Sundarbans Radar Switchboard to confirm sub-canopy root returns.

---

## 🏘️ 3. Socioeconomic & Infrastructure Exposure Data

### 3.1 OpenStreetMap (OSM) Road & Asset Network
- Primary schools (`amenity=school`), Community health clinics (`amenity=clinic`), and Ferry terminals (`amenity=ferry_terminal`) across Chilmari and Roumari Upazilas.
- Rendered on the map as interactive alert pins with distance-to-bank buffers ($<50$ m critical hazard buffer).

### 3.2 Bangladesh Bureau of Statistics (BBS 2022 Census)
- Mauza-level population density and household vulnerability statistics.
- Linked to the **Impact Ledger** and **C-Band CHARKEEP Network** to determine evacuation staging points and school relocation priorities.

---

## 🔄 4. How the Dynamic Remote Sensing Layers Work in the UI

1. **Dual Basemaps:** Switch instantaneously between high-resolution photographic satellite imagery (`🛰️ Real Satellite`) and cartographic vector roadmaps (`🗺️ Carto Map`).
2. **Interactive Swipe Divider (`↔`):**
   - **Dates Mode:** Compares August 26 Pre-Peak Inundation (large flood water mask) on the left against September 19 Post-Monsoon Receded Channels + Red Erosion Zone (145.8 ha) + Green Sandbar Accretion (88.4 ha) on the right.
   - **Satellite vs SAR Mode:** Compares true-color optical satellite imagery from space on the left against NASA-ISRO NISAR L-band penetrating radar microwave backscatter on the right.
3. **Point Sampling Tool:** Clicking anywhere inside the study regions returns calibrated backscatter ($\gamma^0$ in dB) and classification metadata.

