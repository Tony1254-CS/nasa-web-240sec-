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


---

### ADR-006: Decision Flip Engine & CHARKEEP Service Graph (Milestone B06)
* **Status:** ACCEPTED
* **Context:** Flood damage assessment often produces large lists of severed paths and flooded chars that exceed emergency response budgets. In addition, critical access cuts (such as the Chilmari–Roumari ferry link) isolate deep communities even when local roads remain dry.
* **Decision:**
  - Build the **CHARKEEP** topological network graph modeling roads, ferry crossings, community clinic hubs, and primary schools across Chilmari and Roumari.
  - Implement a budget-constrained **Decision Flip Engine**: given an inspection quota (e.g., $15,000 / 3 teams), prioritize sites where an erroneous satellite classification (e.g. wet sand misclassified as open water) would flip an aid or evacuation decision.
  - Compute verifiable **Decision Flip Receipts** displaying topological impact, cost, and people safeguarded.


---

### ADR-007: InSAR Phase-to-Motion, SWOT Reach Heights, and Decoupled Compound View (Milestone B07)
* **Status:** ACCEPTED
* **Context:** InSAR interferometry and altimetry provide high-value motion and surface water elevations, but suffer from phase decorrelation over water/vegetation and overpasses restricted by orbital tracks. Presenting combined "multi-hazard vulnerability" scores obscures the distinct physical limits of each sensor.
* **Decision:**
  - Standardize phase-to-LOS displacement on $\Delta d = -\frac{\lambda}{4\pi} \Delta \phi$ with explicit wavelength parameters ($\lambda = 0.2384$ m for NISAR L-band, $\lambda = 0.0555$ m for Sentinel-1 C-band).
  - Mask decorrelated pixels ($\gamma < 0.35$) and enforce connected component boundaries so relative displacement is never projected across ambiguous phase steps.
  - Implement transect profiler with explicit break markers for river crossings.
  - Retain SWOT KaRIn water surface elevations at reach level, explicitly declaring pending dependencies outside overpass windows.
  - Implement a 3-axis decoupled Compound Observation Profile (Radar backscatter, Optical greenness, LOS motion) without uncalibrated aggregate risk formulas.


---

### ADR-008: Change Passport Cryptographic Lineage & Impact Ledger (Milestone B08)
* **Status:** ACCEPTED
* **Context:** Remote sensing platforms frequently suffer from unverifiable claims or silent data alterations. Furthermore, damage assessments often project arbitrary per-hectare loss formulas without identifying specific named infrastructure.
* **Decision:**
  - Implement **Change Passport** (`W10`): every finding has an immutable cryptographic SHA-256 lineage hash binding observation granules, Otsu threshold, Robust Core vs Contested Fringe hectares, and the 7 Check Groups audit.
  - Implement **Append-Only Revision Ledger** (`R18`): field validation or expert comments are appended with unique revision IDs and prior state preservation. Prior versions cannot be overwritten or deleted.
  - Implement **Impact Ledger** (`W09`, `E16`): directly intersect candidate inundation masks with OSM primary schools, clinics, and severed road segments. Population is derived from BBS 2022 Census Mauza bounds with explicit uncertainty caveats rather than speculative per-hectare multipliers.
  - Generate one-page print-ready bilingual **Decision Brief** (`E17`, `W14`) with embedded mobile field inspection task QR contracts (`A01–A12`).


---

### ADR-009: Localized Scientific Stories, Multi-Audience Translation, and SAR Physics Lab (Milestone B09)
* **Status:** ACCEPTED
* **Context:** Communicating remote sensing observations requires bridging three distinct audiences (the public, disaster managers, and remote sensing scientists). In addition, complex physics concepts (penetration, polarimetry, speckle, fringes) are best understood through hands-on interaction rather than static text.
* **Decision:**
  - Structure **Scientific Story Mode** (`W12`, `E19`) into exactly 5 localized chapters across our two active biomes:
    1. River Change (Jamuna J1)
    2. Floodplain Recovery (Jamuna J2)
    3. Service Continuity (Jamuna J3)
    4. Mangrove Wetland Response (Sundarbans S1)
    5. Relative Motion (Jamuna X1)
  - Retain foreign hazard cases (Glacier Bay, NorCal wildfires, Mexico City earthquakes) exclusively in educational reference modules within `Learn`.
  - Implement **Audience Switcher** (`E10`): renders identically grounded satellite facts in Public Bangla/English, Decision Maker register, or Technical Analyst terminology.
  - Implement **SAR Lab** (`E18`) with 4 interactive mini-experiments: Cloud Blindness, Polarization Match, Speckle Noise Filtering, and InSAR Fringe Counter.
  - Implement **Web Audio Sonification** (`E22`): maps backscatter dB into acoustic frequencies ($f = 220 \cdot 2^{(\text{dB}+25)/12}\text{ Hz}$) for multi-sensory and accessible map reading.


---

### ADR-010: Scenario Laboratory & Comprehension Improvements N01–N05 (Milestone B10)
* **Status:** ACCEPTED
* **Context:** Remote sensing platforms can mislead decision-makers if long-term trends are conflated with short-term observations, if satellite data gaps are hidden by smooth styling, or if simulated projections are presented as measured facts.
* **Decision:**
  - **N01 Historical Context Bridge:** Display approved Global Mangrove Watch (GMW) decadal epochs (1996–2025) side-by-side with 2026 NISAR observations, explicitly distinguishing decadal baselines from 12-day tidal flood cycles.
  - **N02 Coverage Curtain:** Implement a persistent one-click overlay showing the exact observable support denominator (78%) versus excluded pixels (radar shadow, antenna roll-off, specular water absorption) with click explanations.
  - **N03 Assumption Receipt:** Every scenario run generates a downloadable JSON receipt detailing changed inputs, baseline vs simulated metrics, and remaining uncertainties with an explicit simulation disclaimer.
  - **N04 Guided Comparison Prompts:** Metadata-driven prompts guide users directly to subsequent satellite passes, Break My Finding audits, or low-tide condition comparisons.
  - **N05 Evidence Multi-Clock:** Inspector separately displays satellite radar acquisition (UTC), river gauge/tidal measurement, pipeline processing, and ground field survey times, preventing false assumptions of contemporaneous ground truth.
  - **W13 / E21 Scenario Lab:** Hydro-topological response simulator with surge $\Delta h$ sliders and ferry cutoffs, strictly watermarked as `DECLARED SIMULATION`.


---

### ADR-005: High-Resolution Satellite Imagery Basemap & Dual Synchronized Swipe Engine
* **Status:** ACCEPTED / IMPLEMENTED
* **Context:** Cartographic street vector tiles alone can feel abstract and static when analyzing dynamic river braiding and coastal tidal wetlands. Users and scientific reviewers need to see actual Earth surface conditions from orbit and compare optical photographs with microwave radar backscatter.
* **Decision:**
  1. Integrated real high-resolution true-color satellite imagery tiles (Esri World Imagery / Maxar / NASA) alongside OpenStreetMap cartographic tiles, toggleable with a 1-click basemap pill (`🛰️ Real Satellite` vs `🗺️ Carto Map`).
  2. Implemented dual synchronized MapLibre viewports with CSS polygon clipping (`clipPath`) for the swipe comparison engine:
     - Left map (Date A pre-flood peak or Optical Satellite imagery) is dynamically clipped to `swipePosition%`.
     - Right map (Date B post-flood recession + active erosion cut + SAR radar classification) handles primary interactions.
     - Both camera viewports are locked via 60 FPS WebGL mirroring (`mapB.on('move', ...)`).
  3. Added a comparison mode selector:
     - **Dates Mode:** August 26 Pre-Peak Inundation vs September 19 Post-Monsoon Recession & Active Erosion.
     - **Satellite vs SAR Mode:** True-color optical satellite photograph vs NASA NISAR L-band penetrating radar mask.
* **Consequence:** Immediate visual confirmation of real morphological changes, eliminating static appearance while maintaining 60 FPS client rendering and zero proprietary mapping API dependencies.

---

### ADR-006: Authentic SAR Remote Sensing Visualization & Dual-Map Swipe Synchronization
* **Status:** LOCKED / ACCEPTED
* **Context:** Presenting arbitrary solid geometric color blocks (such as flat opaque diamonds or polygons) misrepresents synthetic aperture radar (SAR) data, confuses users, and undermines the scientific rigor required for NASA Space Apps Challenge 2026. Furthermore, comparing temporal acquisitions requires a robust swipe slider that hardware-clips WebGL canvases with zero compositing artifacts.
* **Decision:**
  1. **Authentic Remote Sensing Overlays:** Replace cartoonish geometric shapes with authentic, multi-vertex geomorphological features:
     - Water masks styled with semi-transparent marine blue (`#0284C7` at 0.28 opacity), preserving natural riverbed and sandbar textures.
     - Active bankline erosion styled as a Damage Proxy Map (DPM) with dashed crimson cutlines (`#EF4444`, `[4, 2]`) and interactive callout markers displaying backscatter drops ($\Delta \gamma^0 = -8.2\text{ dB}$).
     - Sundarbans sub-canopy tidal pulse rendered in glowing amber (`#EA580C`, 0.35 opacity) highlighting L-band trunk-ground double bounce return (+3.5 dB HH).
  2. **WebGL Hardware Compositor Synchronization:**
     - Enforce `position: absolute` via inline styles on both map containers (`mapContainerA` z-index 10, `mapContainerB` z-index 0) to override `.maplibregl-map` relative layout conflicts.
     - Employ `ResizeObserver` to guarantee dynamic WebGL canvas buffer resizing to full container dimensions (e.g. 752x466) rather than fallback unrendered dimensions.
     - Set `canvasContextAttributes: { preserveDrawingBuffer: true }` to enable 1-click high-resolution PNG snapshot exports.
  3. **Dual Comparison Modes:**
     - `Dates` Mode: Compares Monsoon Flood Crest (Aug 26, Stage 18.9m) on the left against Post-Monsoon Recession (Sep 19, Stage 16.4m) on the right.
     - `Sat vs Radar` Mode: Compares True-Color Optical Satellite imagery on the left against Grayscale NISAR Microwave Radar backscatter on the right, providing an authentic "X-Ray" canopy and cloud penetration experience.
---

### ADR-011: Transparent Vector Outlines Mode vs Thematic Tinting and Official Graphify Architecture Integration
* **Status:** LOCKED / ACCEPTED
* **Context:** High-opacity polygon fills (e.g. 0.30 - 0.50 opacity) act like a tinted or solid veil that obscures high-resolution optical satellite textures, river sandbars, thalweg braids, and coastal creek morphology. Professional earth observation portals (NASA Worldview, USGS EarthExplorer, Copernicus Browser) default to high-contrast boundary contours (Outlines Only) to ensure 100% unobstructed visibility of underlying ground features while clearly identifying classified change boundaries. Furthermore, maintaining codebase awareness across 80+ files requires local, token-free knowledge graph navigation.
* **Decision:**
  1. **Outlines-Only Mode as Default (`overlayStyle: 'outlines'`):**
     - Set `fill-opacity` on all candidate polygons (`layer-jamuna-water-sep`, `layer-jamuna-water-aug`, `layer-jamuna-erosion`, `layer-jamuna-accretion`, `layer-sundarbans-water`, `layer-sundarbans-canopy`, `layer-sundarbans-pulse`) to `0.0`.
     - Render razor-sharp, high-contrast vector boundary contours:
       - Active Bankline Erosion: Glowing crimson dashed contour (`#EF4444`, `[4, 2]`, 2.8px) marking the 145.8 ha retreat cut.
       - Emergent Sandbars / Char Accretion: Emerald dashed contour (`#10B981`, `[3, 2]`, 2.2px) outlining newly emerged Rabi crop shoals.
       - Receded Thalweg Water: Sky blue contour (`#38BDF8`, 1.8px) tracing the active channels.
       - Sundarbans Tidal Pulse: Orange dashed line (`#F97316`, `[4, 2]`, 2.5px) tracing sub-canopy water presence.
     - Provide an interactive map toggle: `[ ✏️ Outlines Only ]` / `[ 🎨 Tinted ]` so users can switch to subtle thematic tinting (0.12 - 0.18 opacity) on demand.
     - Wire individual layer visibility toggles (`layerVisibility`) to dynamically hide/show specific features.
  2. **Official Graphify Integration:**
     - Installed official `graphify` (v0.9.99) via `uv tool install --upgrade graphifyy --python 3.11`.
     - Initialized project knowledge graph (`graphify update .`), extracting 1,827 nodes, 3,418 edges, and 128 communities (`graphify-out/graph.json` and `GRAPH_REPORT.md`).
     - Installed Git post-commit, post-checkout, post-merge hooks (`graphify hook install`) for automatic background graph synchronization.
     - Enabled local semantic graph queries (`graphify query "<query>"`) with zero external API token consumption.



---

### ADR-012: Date-Indexed Sentinel-2 Optical and Calibrated SAR Multi-Spectral Streaming
* **Status:** LOCKED / ACCEPTED
* **Context:** In satellite change monitoring, vector overlay polygons changing across time steps while the underlying basemap remains a static global satellite mosaic creates visual incongruity. Users and judges expect that when viewing a flood date (e.g. August 26), the underlying satellite photograph physically shows flooded chars and muddy water, and when transitioning to post-flood recession (e.g. September 19 or October 21), the base photograph shows dried sandbars and receding waters.
* **Decision:**
  1. Built an automated STAC extraction pipeline (`download_full_enclosing_scenes.py` and `download_sundarbans_scenes.py`) querying AWS Earth Search and Copernicus Sentinel-2 L2A collections for zero-cloud ($0.00\%$) enclosing scenes across all six study time steps for both Jamuna (`45RYJ`) and Sundarbans (`45QYE`).
  2. Generated date-indexed true-color optical rasters (`jamuna_optical_*.png`, `sundarbans_optical_*.png`) and matching calibrated SAR backscatter rasters (`jamuna_sar_*.png`, `sundarbans_sar_*.png`).
  3. Integrated dynamic MapLibre `ImageSource` streaming in `MapWorkspace.tsx`:
     - In **Satellite** mode: Map A loads Date A optical satellite photo, Map B loads Date B optical satellite photo.
     - In **Radar** mode: Map A loads Date A calibrated SAR radar backscatter, Map B loads Date B calibrated SAR radar backscatter.
     - In **Sat vs Radar** (sensors) mode: Map A loads optical true-color satellite imagery, Map B loads microwave radar penetration.
  4. Updated chronological pair sequencing in `workspaceStore.ts` so timeline stepping dynamically aligns Before and After pairs across all available dates.
* **Consequence:** 100% visual and scientific consistency between vector analytical layers and underlying orbital imagery with instant client-side WebGL switching.
