# FluviSAR External Data Sources & Sensor Integration
> **Authority:** Derived from `plan.md` (Version 2.0) and NASA Space Apps Challenge 2026.  
> This document provides a comprehensive scientific and operational overview of all external datasets, satellite sensors, and in-situ hydrological monitoring networks integrated into the **FluviSAR** web observatory, complete with direct access links.

---

## 🛰️ 1. Spaceborne Satellite Remote Sensing Missions

### 1.1 NASA-ISRO Synthetic Aperture Radar (NISAR)
*Governing Spec: `plan.md` Section 3.1, 4.1, 7.1*
* **Agency:** [NASA Jet Propulsion Laboratory (JPL)](https://www.jpl.nasa.gov/) & [Indian Space Research Organisation (ISRO)](https://www.isro.gov.in/).
* **Official Mission Portal:** [https://nisar.jpl.nasa.gov/](https://nisar.jpl.nasa.gov/)
* **Data Archive & DAAC:** [Alaska Satellite Facility (ASF) DAAC NISAR Portal](https://asf.alaska.edu/data-sets/sar-data-sets/nisar/)
* **Catalog Search:** [NASA Earthdata Search](https://search.earthdata.nasa.gov/search?q=NISAR)
* **Sensor Characteristics:**
  * L-band Synthetic Aperture Radar ($\lambda = 23.84\text{ cm}$, center frequency $1.25\text{ GHz}$).
  * Repeat Orbit: 12-day exact repeat cycle (descending track 142 over Jamuna, ascending track 071 over Sundarbans).
* **Core Product Formats Integrated:**
  1. **L2 GCOV (Geocoded Co-pol Backscatter):** Calibrated backscatter power ($\gamma^0$ in dB) at 20 m spatial posting in dual polarization ($\text{HH}$ and $\text{HV}$). Used for open water thresholding ($\gamma^0 \le -14.0\text{ dB}$) and sub-canopy root returns.
  2. **L2 GUNW (Geocoded Unwrapped Interferograms):** Repeat-pass interferometric phase ($\Delta\phi$) measuring line-of-sight displacement in millimeters ($\text{mm/yr}$).
  3. **L2 SME2 (Soil Moisture Estimation):** Native 200 m resolution volumetric soil moisture ($\text{m}^3/\text{m}^3$) for pre-saturation analysis preceding riverbank slumping.
* **Why NISAR L-band is critical:** Unlike optical sensors, L-band microwave radar penetrates through dense monsoon cloud cover and tropical tree foliage, revealing water underneath the Sundarbans mangrove canopy and mapping riverbank erosion during peak monsoon storms.

---

### 1.2 NASA Global Precipitation Measurement (GPM IMERG)
*Governing Spec: `plan.md` Section 3.1, 4.4*
* **Agency:** [NASA Goddard Space Flight Center](https://www.nasa.gov/goddard/) & [JAXA](https://global.jaxa.jp/).
* **Official Data Portal:** [NASA GPM IMERG Overview](https://gpm.nasa.gov/data/imerg)
* **Direct Data Repository:** [NASA GES DISC IMERG V07B Access](https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGHH_07/summary)
* **Product:** IMERG (Integrated Multi-satellitE Retrievals for GPM) Final Run V07B.
* **Resolution:** $0.1^\circ$ ($\sim 10\text{ km}$), half-hourly accumulated precipitation.
* **Role in FluviSAR:**
  * 7-day upstream watershed accumulated precipitation ($\text{mm}$).
  * Rainfall anomaly rates for antecedent precipitation indices ($API_7$).
  * Primary hydrological driver in the Jamuna Hydro-Morphological Risk Matrix ($E_{12}$).

---

### 1.3 NASA / CNES Surface Water and Ocean Topography (SWOT)
*Governing Spec: `plan.md` Section 3.1, 6.1*
* **Agency:** [NASA JPL](https://www.jpl.nasa.gov/) & [Centre National d'Études Spatiales (CNES)](https://cnes.fr/en).
* **Official Mission Portal:** [https://swot.jpl.nasa.gov/](https://swot.jpl.nasa.gov/)
* **Direct Data Repository:** [PO.DAAC SWOT Mission Data Archive](https://podaac.jpl.nasa.gov/SWOT)
* **Sensor:** KaRIn (Ka-band Radar Interferometer, $35.75\text{ GHz}$).
* **Product:** L2 KaRIn Reach-Averaged Water Surface Elevation ($h_w$ in meters WGS84) and Reach Water Slope ($\partial h_w / \partial s$ in $\text{cm/km}$).
* **Role in FluviSAR:**
  * Constrains hydrodynamic shear stress on Chilmari western bend.
  * Cross-validates BWDB gauge stage ladders when physical telemetry fails during high flood crests.

---

### 1.4 ESA Copernicus Sentinel-1 & Sentinel-2
*Governing Spec: `plan.md` Section 3.1, 4.2, 5.3*
* **Agency:** [European Space Agency (ESA) Copernicus Programme](https://www.esa.int/).
* **Official Data Portal:** [Copernicus Data Space Ecosystem](https://dataspace.copernicus.eu/)
* **Interactive Browser:** [Copernicus Browser (dataspace.copernicus.eu)](https://browser.dataspace.copernicus.eu/)
* **Cloud STAC API (AWS Open Data):** [AWS Earth Search STAC API (Element 84)](https://earth-search.aws.element84.com/v1)
* **Registry of Open Data:** [Sentinel-2 on AWS Open Data Registry](https://registry.opendata.aws/sentinel-2/)
* **Sensors:**
  * **Sentinel-1 (C-band SAR, $\lambda = 5.55\text{ cm}$):** Cross-sensor comparison against NISAR L-band. C-band scatters directly off the top of dense mangrove canopies, whereas L-band penetrates to the flooded forest floor (double-bounce return).
  * **Sentinel-2 (MSI Optical Multispectral Level-2A):** 10 m Red, Green, Blue, and Near-Infrared (NIR) bands for cloud-screened true-color rendering and Normalized Difference Vegetation Index ($\text{NDVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}$).
* **Role in FluviSAR:**
  * Provides date-indexed true-color satellite imagery (`jamuna_optical_*.png` and `sundarbans_optical_*.png`) for all 6 target observation dates ($0.00\%$ cloud coverage).
  * Separates genuine agricultural sandbar silt emergence ($\Delta \text{NDVI} > +0.25$) from temporary river channel splits.
  * Validates forest defoliation vs normal tidal inundation in Sundarbans.

---

### 1.5 JAXA / Global Mangrove Watch (GMW)
*Governing Spec: `plan.md` Section 3.1, 11.0*
* **Agency:** [Japan Aerospace Exploration Agency (JAXA)](https://global.jaxa.jp/) & [Aberystwyth University](https://www.aber.ac.uk/).
* **Official Portal:** [Global Mangrove Watch Online Platform](https://www.globalmangrovewatch.org/)
* **Dataset Download:** [JAXA ALOS Kyoto & Carbon Initiative Mangrove Datasets](https://www.eorc.jaxa.jp/ALOS/en/dataset/gmw_e.htm)
* **Product:** GMW Decadal Mangrove Baselines (1996–2025 vector polygons).
* **Role in FluviSAR:**
  * Historical context bridge preventing short-term tidal flooding from being falsely flagged as long-term mangrove habitat loss.

---

### 1.6 High-Resolution True-Color Satellite Basemap (Esri / Maxar / NASA)
* **Provider:** [Esri World Imagery](https://livingatlas.arcgis.com/en/browse/#d=2&q=world%20imagery) (Maxar, Earthstar Geographics, NASA/USGS).
* **Direct Tile Server Endpoint:** [https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}](https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer)
* **Resolution:** Up to 0.5 m spatial resolution photographic optical imagery.
* **Role in FluviSAR:**
  * Integrated directly into MapLibre GL as a 1-click basemap toggle (`🛰️ Real Satellite`).
  * Powers the **Swipe Comparison Engine** (`SwipeCompareMap.tsx`), allowing users to compare photographic Earth surface imagery with NASA NISAR radar backscatter and water classification masks.

---

## 🌊 2. In-Situ Hydrological & Ground Telemetry

### 2.1 Bangladesh Water Development Board (BWDB) - FFWC
* **Agency:** [Flood Forecasting and Warning Centre (FFWC)](http://www.ffwc.gov.bd/) & [Bangladesh Water Development Board (BWDB)](http://www.bwdb.gov.bd/).
* **Online Hydrology Portal:** [BWDB Hydrology Archive](http://www.hydrology.bwdb.gov.bd/)
* **Gauge Station:** Chilmari Gauge (`SW46.9`), Jamuna River.
* **Datum & Metrics:**
  * Danger Level ($DL$): $19.50\text{ m}$ PWD.
  * Recorded 2026 Monsoon Peak (Aug 26): $18.90\text{ m}$ (Rising stage $+0.32\text{ m/day}$).
  * Post-Flood Transition (Sep 19): $16.40\text{ m}$ (Receding stage $-0.18\text{ m/day}$).
* **Role:** Real-time hydrograph rendering on the synchronized temporal axis (`ContextTracks.tsx`) and flood stage validation.

### 2.2 Bangladesh Inland Water Transport Authority (BIWTA)
* **Agency:** [Bangladesh Inland Water Transport Authority (BIWTA)](http://www.biwta.gov.bd/).
* **Tidal Station:** Dublar Char Outer Bay Station (`TD12.4`), Sundarbans.
* **Datum & Metrics:**
  * Spring High Tide Level: $+2.20\text{ m}$ CD.
  * Neap Low Tide Level: $+0.40\text{ m}$ CD.
* **Role:** Provides tidal stage filtering (`All Passes`, `High Tide`, `Low Tide`) in the Sundarbans Radar Switchboard to confirm sub-canopy root returns.

---

## 🏘️ 3. Socioeconomic & Infrastructure Exposure Data

### 3.1 OpenStreetMap (OSM) Road & Asset Network
* **Provider:** [OpenStreetMap Foundation](https://www.openstreetmap.org/)
* **Direct Query API:** [Overpass Turbo Interactive Query Platform](https://overpass-turbo.eu/)
* **Features Extracted:**
  * Primary schools (`amenity=school`)
  * Community health clinics (`amenity=clinic`)
  * Ferry terminals (`amenity=ferry_terminal`)
* **Role:** Rendered on the map as interactive alert pins with distance-to-bank buffers ($<50\text{ m}$ critical hazard buffer).

### 3.2 WorldPop Spatial Demographic Datasets
* **Provider:** [WorldPop Research Programme, University of Southampton](https://www.worldpop.org/)
* **Direct Data Repository:** [WorldPop High-Resolution Population Data for Bangladesh](https://hub.worldpop.org/geodata/listing?id=29)
* **Resolution:** 100 m unconstrained population distribution rasters.
* **Role in FluviSAR:** Informs the Sendai-aligned **Impact Ledger**, calculating exposed population tallies across eroded char communities.

### 3.3 Bangladesh Bureau of Statistics (BBS 2022 Census)
* **Agency:** [Bangladesh Bureau of Statistics (BBS)](http://www.bbs.gov.bd/)
* **Data Publication:** [BBS Population and Housing Census 2022 Report](http://www.bbs.gov.bd/site/page/47856ad7-7e1c-443f-b161-16aa5555cd0e)
* **Metrics:** Mauza-level population density and household vulnerability statistics.
* **Role:** Linked to the **Impact Ledger** and **CHARKEEP Network** to determine evacuation staging points and school relocation priorities.

---

## 🔄 4. How the Dynamic Remote Sensing Layers Work in the UI

1. **Dual Basemaps:** Switch instantaneously between high-resolution photographic satellite imagery (`🛰️ Real Satellite`), calibrated radar microwave imagery (`📡 Radar`), and cartographic vector roadmaps (`🗺️ Carto Map`).
2. **Interactive Swipe Divider (`↔`):**
   * **Dates Mode:** Compares earlier inundation (e.g., August 26 peak flood crest) on the left against later recession (e.g., September 19 receded channels + red cutbank erosion) on the right.
   * **Satellite vs SAR Mode:** Compares genuine true-color optical satellite imagery from space on the left against NASA-ISRO NISAR L-band penetrating radar microwave backscatter on the right.
3. **Point Sampling Tool:** Clicking anywhere inside the study regions returns calibrated backscatter ($\gamma^0$ in dB) and classification metadata.
