# FluviSAR Observatory — Complete Feature Catalog & User Guide
> **Document Purpose:** Comprehensive reference of all features specified in `features.pdf` alongside additional platform features implemented in FluviSAR, with scientific explanations and step-by-step instructions for use on the web observatory.

---

## 📑 Table of Contents
1. [Overview & Architecture Alignment](#overview--architecture-alignment)
2. [Part 1: Features from features.pdf (Core & Differentiating Features)](#part-1-features-from-featurespdf)
   - [Tier 1: Core Observatory Features (W1–W5)](#tier-1-core-observatory-features)
   - [Tier 2: Differentiating Features (W6–W10)](#tier-2-differentiating-features)
   - [Tier 3: High-Impact Experience (W11–W14)](#tier-3-high-impact-experience)
   - [Specialized Scientific Modules (Modules 1–9)](#specialized-scientific-modules)
3. [Part 2: Additional Platform Features Beyond features.pdf](#part-2-additional-platform-features-beyond-featurespdf)
4. [Quick Reference Feature Navigation Matrix](#quick-reference-feature-navigation-matrix)

---

## Overview & Architecture Alignment

FluviSAR is a dual-region web observatory developed for the **NASA Space Apps Challenge 2026** under the challenge theme *"Dancing with the SARs"*. It operates across two primary active study regions in Bangladesh:
* **The Jamuna River:** Braided river dynamic migration, monsoonal flash inundation, severe cutbank erosion, and char accretion.
* **The Sundarbans Mangrove Forest:** Tidal inundation pulses, sub-canopy double-bounce microwave radar penetration, and coastal ecosystem monitoring.

All features are designed to fulfill the challenge's core directive: *translate complex microwave radar data into transparent, actionable, and human-legible insights*.

---

# Part 1: Features from `features.pdf`

## Tier 1: Core Observatory Features

### W1. Earth Change Atlas
* **Explanation:** An interactive geospatial switchboard that situates localized investigations within a macro geographic context, enabling users to jump between Jamuna, Sundarbans, and global benchmark sites.
* **How to Use on the Website:**
  1. Click the **`Atlas`** tab on the top navigation header (or select **`M0`** from the view selector).
  2. Click on the **Jamuna River** or **Sundarbans Mangrove** card to immediately transition the camera and load date-indexed observations for that ecosystem.

### W2. SAR Time Machine
* **Explanation:** A multi-temporal synchronized comparison engine with a draggable swipe divider, temporal timeline playback, and observation pairs showing physical landscape evolution over time.
* **How to Use on the Website:**
  1. In the central map workspace, locate the vertical white divider line with the circular handle (**`↔`**).
  2. Drag the handle horizontally across the river or mangrove forest to inspect the Before state on the left and After state on the right.
  3. Use the bottom timeline bar to scrub through acquisition dates or click the **`Play (▶)`** button to trigger automatic time-series progression.

### W3. Radar Lens & Polarization Switchboard
* **Explanation:** Allows users to inspect calibrated SAR backscatter power ($\gamma^0$ in dB) across polarization channels ($\text{HH}$, $\text{HV}$, $\text{Pauli RGB}$) to distinguish between surface roughness, volume scattering, and double-bounce returns.
* **How to Use on the Website:**
  1. Select **Sundarbans Mangrove** from the region switcher.
  2. In the left panel under **`Sundarbans Radar Switchboard`**, click **`HH`**, **`HV`**, or **`Pauli`** to switch polarization channels.
  3. Notice how $\text{HH}$ highlights flooded vegetation underneath the canopy, while $\text{HV}$ exposes the forest crown structure.

### W4. Change Detection Engine
* **Explanation:** A rigorous algorithmic classifier that segments landscape transitions into 4 distinct categories: persistent water, emergent sandbars (accretion), collapsing cutbanks (erosion), and stable land.
* **How to Use on the Website:**
  1. In the Jamuna view, locate the prominent red-dashed zone along the western bank (Chilmari) or tan-dashed zone in the middle channel (Mandaler Char).
  2. Click directly on any colored polygon to open its specific area measurement (e.g., $145.8\text{ ha}$ retreat), affected dates, and classification boundary.

### W5. Evidence & Confidence Inspector
* **Explanation:** A dedicated right-hand audit panel explaining the observation dates, sensor platform, processing parameters, and 7-point scientific verification check for each selected change candidate.
* **How to Use on the Website:**
  1. Click on any finding callout or polygon on the map.
  2. Review the right sidebar (**`Observed Finding Inspector`**), which reveals the **`7 Check Groups`** (radiometric drops, rainfall anomaly exclusion, stage match, etc.) and explicit confidence flags.

---

## Tier 2: Differentiating Features

### W6. Break My Finding (Change Robustness Laboratory)
* **Explanation:** A counterfactual stress-testing tool where users can dynamically alter Otsu classification thresholds ($\pm 2.0\text{ dB}$) to see which erosion hotspots remain stable (**Robust Core**) versus ambiguous (**Contested Fringe**).
* **How to Use on the Website:**
  1. On the right inspector panel, click the blue **`🧪 Break My Finding`** button.
  2. A modal dialog will appear displaying the bimodal backscatter histogram.
  3. Drag the threshold slider left and right to observe how water polygons expand or contract, proving that the finding survives parameter variations.

### W7. River Memory
* **Explanation:** Displays simultaneous historical river boundaries, animates braided thalweg migration, and charts cumulative bank retreat through successive satellite passes against the official danger level ($19.50\text{ m}$).
* **How to Use on the Website:**
  1. In the left panel, click on the **`River Memory (J1)`** lens.
  2. Observe the historical ghost boundaries etched onto the map.
  3. Look at the hydrograph chart below the map to see the flood peak cresting above $18.9\text{ m}$ followed by rapid recession.

### W8. Environmental Context Fusion
* **Explanation:** Fuses SAR radar observations with multi-sensor environmental telemetry: NASA GPM precipitation, FFWC river stage, and Sentinel-2 NDVI vegetation health.
* **How to Use on the Website:**
  1. Scroll down to the **`Multisensor Environmental Tracks`** strip directly below the map.
  2. View synchronized plots showing radar power ($\gamma^0\text{ dB}$), river gauge stage ($\text{m}$), Sentinel-2 NDVI, and 7-day GPM rainfall anomaly on a shared time axis.

### W9. Exposure & Impact Lens
* **Explanation:** Overlays OpenStreetMap (OSM) community infrastructure (primary schools, clinics, severed roads, ferry terminals) onto the erosion polygon to quantify human exposure estimates.
* **How to Use on the Website:**
  1. In the right panel, inspect the **`What Changed for Whom`** / **`Sendai-Aligned Impact Ledger`** section.
  2. Review the verified asset tallies (e.g., *1 school at critical risk, 120m severed embankment road, 8,200 people exposed*).

### W10. The Change Passport
* **Explanation:** An immutable digital evidence dossier capturing granule identifiers, processing settings, cryptographic SHA-256 hashes, and a machine-readable JSON manifest for full reproducibility.
* **How to Use on the Website:**
  1. In the right inspector panel, click **`🛂 Change Passport`**.
  2. A cryptographic passport modal will open displaying granule lineage, audit history, and a **`Download Manifest (JSON)`** button for peer-review.

---

## Tier 3: High-Impact Experience

### W11. Radar-to-Reality
* **Explanation:** A linked, synchronized multi-sensor view showing original optical satellite photography side-by-side with microwave SAR penetration, highlighting identical geographic pixels.
* **How to Use on the Website:**
  1. In the floating top control pill, click **`Sat vs Radar`**.
  2. Drag the center swipe handle across the river or mangrove; the left side displays true-color optical satellite photography while the right side displays penetrating L-band radar.

### W12. Scientific Story Mode
* **Explanation:** A cinematic, chapter-based narrative investigation guiding users through 5 localized stories of climate resilience, river dynamics, and mangrove pulse.
* **How to Use on the Website:**
  1. Click **`Stories`** in the top navigation bar.
  2. Select any chapter (e.g., *Chilmari Riverbank Retreat* or *Dublar Char Mangrove Pulse*).
  3. Click **`Next Chapter`** to follow the sequential guided tour complete with human narratives and satellite findings.

### W13. Scenario Laboratory
* **Explanation:** An interactive exploration simulator that models hypothetical environmental changes (such as $+1.0\text{ m}$ flood surge or embankment breach) without confusing scenarios with forecasts.
* **How to Use on the Website:**
  1. In the left panel, select **`Compare & Scenario`** (or open the Scenario Lab).
  2. Toggle scenario parameters (e.g., *High Water Stage $+1\text{m}$*).
  3. The map displays a labeled simulation layer tagged explicitly as **`DECLARED SIMULATION`** to maintain scientific honesty.

### W14. Decision Brief Generator & Field QR Bridge
* **Explanation:** Compiles the entire investigation into an official one-page printable decision brief with Sendai Framework impact metrics and an embedded QR code linking to TRACE Field mobile tasks.
* **How to Use on the Website:**
  1. In the right inspector panel, click **`📄 Generate Decision Brief`**.
  2. A print-ready briefing modal will open containing recommended actions, authority contacts, and a scannable QR code.
  3. Click **`Print / Save PDF`** to export the brief.

---

## Specialized Scientific Modules (from `features.pdf` pages 16–23)

### Module 1: Stage-Matched Pair Selector (Equal-Stage Twin)
* **Explanation:** Queries river gauge archives (BWDB/FFWC) to find SAR observation pairs with identical water heights ($\Delta h \le 0.1\text{ m}$), preventing seasonal floods from being misclassified as erosion.
* **How to Use on the Website:** Click the **`Comparison Pair`** button on the bottom timeline bar; the modal displays recommended pairs with their $\Delta\text{stage}$ and $\Delta\text{days}$ compatibility.

### Module 2: Live Otsu Threshold with Histogram
* **Explanation:** Calculates the bimodal histogram of radar backscatter live and identifies the optimal valley threshold dividing water from dry ground.
* **How to Use on the Website:** Open **`Break My Finding`** to view the live histogram with the vertical threshold cutoff indicator.

### Module 3: Change Mask with Uncertainty Band
* **Explanation:** Reports area changes with honest scientific confidence intervals (e.g., $145.8\text{ ha} \pm 18.2\text{ ha}$) derived from threshold sensitivity rather than single naked numbers.
* **How to Use on the Website:** Displayed on the right panel under **`Robustness Profile`** and within the **`Change Passport`**.

### Module 4: The Rejection Engine / Null Result Room
* **Explanation:** Transparently explains why the system rejected certain areas as false positives (e.g., wind roughening, radar shadow, stage mismatch).
* **How to Use on the Website:** Scroll down in the right inspector to the **`Null Result Room`** section to inspect the flipped rejection cards.

### Module 5: Cross-Sensor Evidence Wall
* **Explanation:** Shows independent corroborating evidence from NASA FIRMS, GPM precipitation, and Sentinel-1 C-band.
* **How to Use on the Website:** Located in the right inspector panel under the **`Cross-Sensor Verification`** cards.

### Module 6: What Changed for Whom
* **Explanation:** Converts abstract remote sensing pixels into human-legible sentences that district administrators can act upon.
* **How to Use on the Website:** Read the summary banner in the right panel (e.g., *"Chilmari West Bank lost 145.8 ha, cutting the primary access road to the ferry ghat"*).

### Module 7–12: TRACE Field Protocol & Mobile Task Handoff
* **Explanation:** Field verification protocol connecting satellite findings to ground observations (GPS photo, one-tap YES/NO verdict, and offline cache).
* **How to Use on the Website:** Scan the QR code generated in the **`Decision Brief`** or **`Change Passport`** with any smartphone camera to open the field task contract.

---

# Part 2: Additional Platform Features Beyond `features.pdf`

Our engineering team built the following high-value enhancements to elevate FluviSAR above typical hackathon prototypes:

### 15. Real Date-Indexed Sentinel-2 & SAR Raster Engine
* **Explanation:** Streams genuine ESA Copernicus Sentinel-2 multispectral imagery (Tile `45RYJ` and `45QYE`, $0.00\%$ cloud) and calibrated Sentinel-1 SAR imagery for all 6 observation dates, ensuring the Earth surface physically updates beneath vectors.
* **How to Use on the Website:** Click any date node on the bottom timeline or toggle between **`Satellite`** and **`Radar`**; the base imagery dynamically transitions to that exact acquisition.

### 16. Instant High-Res Map Snapshot Tool
* **Explanation:** Captures the current dual-canvas WebGL map composite at native viewport resolution with scalebar and attribution watermarks, exporting a crisp PNG.
* **How to Use on the Website:** Click the **`📸 Snapshot`** button in the top-right toolbar. The file downloads immediately and the button flashes green with **`Saved!`**.

### 17. Clean Outlines Only vs. Tinted Fill Toggle
* **Explanation:** Allows users to switch between translucent thematic fills and crisp border outlines, ensuring zero obstruction of underlying satellite photography.
* **How to Use on the Website:** Click the **`✏️ Outlines Only / 🎨 Tinted`** pill in the top-right toolbar. In outlines mode, river channels and sandbars remain $100\%$ visible without blue or red color wash.

### 18. Audience Switcher (Three Perspective Modes)
* **Explanation:** Dynamically restructures the entire UI vocabulary between three user personas: **`Public`** (plain language, local bigha units), **`Decision Maker`** (Sendai risk metrics, budget), and **`Analyst`** (raw dB backscatter, coherence, and polarimetry).
* **How to Use on the Website:** Toggle between **`Public`**, **`Decision Maker`**, and **`Analyst`** in the top-right corner of the header.

### 19. Full Bilingual Localization Engine (English & Bengali)
* **Explanation:** Provides instantaneous one-click switching between English and natural, culturally reviewed Bengali (*Noto Sans Bengali*), ensuring accessibility for local char dwellers and disaster managers.
* **How to Use on the Website:** Click the **`EN / BN`** button in the header navigation to switch the entire application interface into Bengali.

### 20. Web Audio Sonification Engine ("Feel the River")
* **Explanation:** Synthesizes calibrated radar backscatter power ($\text{dB}$) into real-time audio frequencies using the Web Audio API, allowing visually impaired researchers to "hear" river depth and vegetation density.
* **How to Use on the Website:**
  1. Click the speaker icon (**`🔊`**) in the top header to unmute audio sonification.
  2. Click anywhere on the map (water, sandbar, or collapsing bank); a tone will play with frequency and modulation mapped to that pixel's radar backscatter.

### 21. Coverage Curtain Support Mask (N02)
* **Explanation:** Visualizes the true $78\%$ observable satellite swath geometry, orbit inclination angle, and radar shadow blindspots over the target reach.
* **How to Use on the Website:** Click the floating **`Coverage Curtain (N02)`** badge on the upper-left corner of the map to toggle the orbital support mask.

### 22. InSAR Fringe Stage & Centimeter Displacement Profiler
* **Explanation:** Renders interactive interferometric phase fringes ($\Delta\phi$) measuring line-of-sight ground displacement at $11.9\text{ cm}$ per full $2\pi$ color fringe cycle.
* **How to Use on the Website:** Select **`Fringe Stage (InSAR)`** in the left panel to inspect the interferogram and read live deformation values.

### 23. Continuous Precision Zoom Slider
* **Explanation:** A fine-grained zoom slider allowing smooth magnification adjustments from regional overview ($6.0\times$) to bank-level detail ($16.0\times$).
* **How to Use on the Website:** Adjust the slider situated between the **`-`** and **`+`** zoom buttons in the top-right corner of the map.

### 24. Split-Screen vs. Draggable Swipe Mode Switcher
* **Explanation:** Provides the option to switch from a single-screen draggable center divider to a side-by-side synchronized dual split screen.
* **How to Use on the Website:** In the top-left comparison pill, click the **`Split / Swipe`** toggle button to choose your preferred layout.

### 25. Interactive SAR Lab Educational Suite
* **Explanation:** An educational sandbox featuring four hands-on interactive experiments: *Cloud Blindness Test*, *Polarization Matcher*, *Speckle Filter*, and *Fringe Counter*.
* **How to Use on the Website:** Click the **`Learn`** tab in the main navigation header to launch the interactive simulators.

---

## Quick Reference Feature Navigation Matrix

| Requirement / Feature | Category | Primary UI Entry Point | Key Implementation Files |
| :--- | :--- | :--- | :--- |
| **W1. Earth Change Atlas** | Core (Tier 1) | Header Tab: `Atlas` | `AtlasView.tsx`, `MapWorkspace.tsx` |
| **W2. SAR Time Machine** | Core (Tier 1) | Center Map: Swipe Divider (`↔`) | `MapWorkspace.tsx`, `SwipeCompareMap.tsx` |
| **W3. Radar Lens & Pol** | Core (Tier 1) | Left Panel: `Radar Switchboard` | `SundarbansPolarizationPanel.tsx` |
| **W4. Change Detection** | Core (Tier 1) | Interactive Map Polygons | `MapWorkspace.tsx`, `geoData.ts` |
| **W5. Evidence Inspector** | Core (Tier 1) | Right Panel: `Observed Finding` | `RightInspector.tsx` |
| **W6. Break My Finding** | Diff (Tier 2) | Right Panel: `🧪 Break My Finding` | `BreakMyFindingModal.tsx` |
| **W7. River Memory** | Diff (Tier 2) | Left Panel: `River Memory (J1)` | `MapWorkspace.tsx`, `ContextTracks.tsx` |
| **W8. Context Fusion** | Diff (Tier 2) | Bottom Strip: `Environmental Tracks` | `ContextTracks.tsx` |
| **W9. Impact Lens** | Diff (Tier 2) | Right Panel: `What Changed for Whom` | `RightInspector.tsx`, `JamunaDecisionPanel.tsx` |
| **W10. Change Passport** | Diff (Tier 2) | Right Panel: `🛂 Change Passport` | `ChangePassportModal.tsx` |
| **W11. Radar-to-Reality** | High-Impact | Top Pill: `Sat vs Radar` | `MapWorkspace.tsx`, `SwipeCompareMap.tsx` |
| **W12. Story Mode** | High-Impact | Header Tab: `Stories` | `StoryModeView.tsx` |
| **W13. Scenario Lab** | High-Impact | Left Panel: `Compare & Scenario` | `ScenarioLabPanel.tsx` |
| **W14. Decision Brief** | High-Impact | Right Panel: `📄 Generate Decision Brief` | `DecisionBriefModal.tsx` |
| **Real Sentinel-2 Rasters** | Extra Platform | Timeline & Basemap Switcher | `download_full_enclosing_scenes.py` |
| **Instant Snapshot** | Extra Platform | Top Toolbar: `📸 Snapshot` | `MapWorkspace.tsx` |
| **Audience Switcher** | Extra Platform | Top Header: `Public/Decision/Analyst` | `Header.tsx`, `workspaceStore.ts` |
| **Bilingual Toggle** | Extra Platform | Top Header: `EN / BN` | `Header.tsx`, `translations.ts` |
| **Web Audio Sonifier** | Extra Platform | Top Header: Speaker Icon (`🔊`) | `sonification.ts`, `App.tsx` |
| **Coverage Curtain** | Extra Platform | Map Badge: `Coverage Curtain (N02)` | `CoverageCurtainOverlay.tsx` |
| **InSAR Fringe Stage** | Extra Platform | Left Panel: `Fringe Stage (X1)` | `InSARSpecialtyPanel.tsx` |
| **SAR Lab Experiments** | Extra Platform | Header Tab: `Learn` | `SarLabView.tsx` |
