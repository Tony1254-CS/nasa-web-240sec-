# Graph Report - NASA-web  (2026-11-07)

## Corpus Check
- 209 files · ~276,155 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 76 file(s) not represented in the graph (top: .tif 54, .css 13, (none) 4)

## Summary
- 2354 nodes · 4589 edges · 154 communities (132 shown, 22 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 229 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `55c0a351`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- maplibre-gl-worker.mjs
- useWorkspaceStore
- fe
- l
- createIndex
- package.json
- gl
- j
- Yi
- ay
- models.py
- scenarios_and_improvements.py
- writeTag
- jamuna.yaml
- sundarbans.yaml
- readPackedEnd
- insar.py
- evidence_passport.py
- n
- types.ts
- numpy
- 🛰️ 1. Spaceborne Satellite Remote Sensing Missions
- constructor
- 🌟 Signature Scientific Innovations
- test_b02_source_and_api.py
- test_b04_change_and_checks.py
- compilerOptions
- subdividePolygonInternal
- cr
- compilerOptions
- data/types.ts
- hx
- api
- ac
- Header.tsx
- Architecture & Technical Decision Records (ADR)
- main.py
- clone
- evaluate
- Intelligence.tsx
- hasDebugData
- react
- ai
- sf
- fh
- pathlib
- FluviSAR — Antigravity-ready project specification
- vm
- ingest_sentinel1.py
- 🗺️ Phases & Milestones Roadmap
- 🚀 Quick Start
- DecisionDesk.tsx
- MapWorkspace.tsx
- sy
- workspaceStore.ts
- z
- fire
- scripts
- 10. Scientific pipeline and published artifacts
- useEvidence
- radarSonifier
- jamuna
- addFeature
- sundarbans
- SARLab.tsx
- determineLineBreaks
- parse
- metrics
- dependencies
- fromLngLat
- 7. Shared interaction contracts
- .oxlintrc.json
- af
- fb
- LegacyPageLayout.tsx
- fg
- overwriteGetter
- 16. Architecture and implementation choices
- 20. Verification plan and scientific acceptance
- pair_bundles
- nd
- pair_bundles
- layout
- 11. Measurement and decision definitions
- 18. Frontend state and performance specification
- 19. Antigravity execution instructions and milestones
- 9. Acquisition recipes and the first real-data milestone
- geometryType
- method
- i
- React + TypeScript + Vite
- 12. Mandatory PDF feature coverage: complete traceability
- 13. Research additions, prior-project retention and useful improvements
- 14. TRACE Field scope and full requirement preservation
- 15. Canonical data contracts
- 22. Demonstration and positioning
- 23. Team explanation, sources and final coverage statement
- 4. Visual research translated into a concrete design
- 5. Navigation, screens and shared layout
- 6. Exact map views and regional representation
- 8. Exact source registry and current access status
- sortFeatures
- empty
- evidence.tsx
- withinInto
- patchUpdatedImage
- tsconfig.json
- 1. Locked decisions and completion rules
- angleWith
- bn
- containsMaxSafeIntegerValues
- crossFadingFactor
- deserializeCollisionBoxes
- dist
- expandBy
- getGlobalStateRefs
- getIlluminationProperties
- hasOffscreenPass
- Ho
- interpolationFactor
- ja
- meterInMercatorCoordinateUnits
- push
- loadTile
- rn
- ud
- PROMPT.md
- eu
- observation-history.spec.ts
- w
- bc
- dev.mjs
- populate
- O
- kx
- po
- S
- E
- MapWorkspace.tsx
- load.ts
- cy
- lngLatFromWorld
- vite.config.ts
- hp
- _setPaintValues
- pg
- Cc
- processTask
- observatory-controls.spec.ts
- bS
- _forEachCell
- dy
- findings
- Kp

## God Nodes (most connected - your core abstractions)
1. `useWorkspaceStore` - 58 edges
2. `constructor()` - 53 edges
3. `n()` - 46 edges
4. `react` - 35 edges
5. `useEvidence()` - 35 edges
6. `lucide-react` - 34 edges
7. `l()` - 30 edges
8. `number()` - 29 edges
9. `i()` - 28 edges
10. `readableDate()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `ObservatoryFeaturePanel()` --indirect_call--> `readableDate()`  [INFERRED]
  fluvisar-next/apps/web/src/components/ObservatoryFeaturePanel.tsx → fluvisar-next/apps/web/src/data/evidence.tsx
- `ObservatoryHeader()` --indirect_call--> `readableDate()`  [INFERRED]
  fluvisar-next/apps/web/src/components/ObservatoryHeader.tsx → fluvisar-next/apps/web/src/data/evidence.tsx
- `PairSelectorModal()` --calls--> `useWorkspaceStore`  [EXTRACTED]
  fluvisar-next/apps/web/src/components/PairSelectorModal.tsx → fluvisar-next/apps/web/src/store/workspaceStore.ts
- `test_immutable_revision_history()` --calls--> `append_revision_event()`  [INFERRED]
  fluvisar-next/tests/test_b08_evidence_and_reports.py → fluvisar-next/pipeline/fluvisar/methods/evidence_passport.py
- `test_decision_brief_manifest()` --calls--> `generate_finding_passport()`  [INFERRED]
  fluvisar-next/tests/test_b08_evidence_and_reports.py → fluvisar-next/pipeline/fluvisar/methods/evidence_passport.py

## Import Cycles
- None detected.

## Communities (154 total, 22 thin omitted)

### Community 0 - "maplibre-gl-worker.mjs"
Cohesion: 0.01
Nodes (45): Ae, ah, Al, aS, au, cm, dv, Ed (+37 more)

### Community 1 - "useWorkspaceStore"
Cohesion: 0.19
Nodes (16): App(), DecisionDesk, IntelligencePage, ObservatoryRoute(), SARLabPage, ContextTracks(), CoverageCurtainOverlay(), FindingInspectorDrawer() (+8 more)

### Community 2 - "fe"
Cohesion: 0.22
Nodes (17): nh(), b(), d(), _e(), f(), fe(), Qt(), Zt() (+9 more)

### Community 3 - "l"
Cohesion: 0.12
Nodes (19): ai(), anchorPoint(), eg(), ex(), gd(), getTilePoint(), getVertex(), Gi() (+11 more)

### Community 4 - "createIndex"
Cohesion: 0.10
Nodes (27): addTileFeatures(), ap(), clipToWorld(), cluster(), cp(), createIndex(), createTree(), dp() (+19 more)

### Community 5 - "package.json"
Cohesion: 0.14
Nodes (19): devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @types/geojson@^7946.0.16, @types/node@^24.19.2, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@~7.0.2 (+11 more)

### Community 6 - "gl"
Cohesion: 0.07
Nodes (34): Bl(), bu(), cl(), cu, du(), fu(), gl(), gu() (+26 more)

### Community 7 - "j"
Cohesion: 0.09
Nodes (22): addFeatures(), addImageSection(), addTextSection(), _appendSection(), C(), _colorRampChanged(), _createColorRamp(), createNewSegment() (+14 more)

### Community 8 - "Yi"
Cohesion: 0.08
Nodes (38): A, aa(), ba(), bi(), ca(), da(), ea(), d() (+30 more)

### Community 9 - "ay"
Cohesion: 0.06
Nodes (35): Av(), ay(), bb(), bv(), Cv(), Ev(), Fv(), Gv() (+27 more)

### Community 10 - "models.py"
Cohesion: 0.06
Nodes (30): AnalysisRun, Assessment, BilingualText, Case, CheckStatus, Claim, DecisionScenario, EvidenceRecord (+22 more)

### Community 11 - "scenarios_and_improvements.py"
Cohesion: 0.10
Nodes (10): build_multi_clock_display(), evaluate_coverage_curtain(), generate_assumption_receipt(), get_gmw_historical_epochs(), get_guided_comparison_prompts(), test_assumption_receipt_n03(), test_coverage_curtain_n02(), test_gmw_historical_bridge_n01() (+2 more)

### Community 12 - "writeTag"
Cohesion: 0.07
Nodes (40): Ih(), jh(), kh(), realloc(), Th(), wh(), writeBoolean(), writeBooleanField() (+32 more)

### Community 13 - "jamuna.yaml"
Cohesion: 0.08
Nodes (25): capabilities, gcov, gunw, network_graph, optical, polarimetry, soil_moisture, stage_context (+17 more)

### Community 14 - "sundarbans.yaml"
Cohesion: 0.08
Nodes (25): capabilities, gcov, gunw, optical, polarimetry, restoration, soil_moisture, tide_context (+17 more)

### Community 15 - "readPackedEnd"
Cohesion: 0.10
Nodes (25): nextField(), readBoolean(), readBytes(), readDouble(), readFields(), readFixed32(), readFixed64(), readFloat() (+17 more)

### Community 16 - "insar.py"
Cohesion: 0.08
Nodes (16): adapt_swot_water_elevation(), build_compound_observation_profile(), compute_wrapped_phase(), count_fringes(), evaluate_nisar_contribution_benchmark(), mask_by_coherence(), phase_to_los_displacement(), reference_displacement_to_point() (+8 more)

### Community 17 - "evidence_passport.py"
Cohesion: 0.14
Nodes (6): compute_impact_ledger(), generate_decision_brief_manifest(), test_decision_brief_manifest(), test_finding_passport_generation(), test_immutable_revision_history(), test_impact_ledger_computation()

### Community 18 - "n"
Cohesion: 0.18
Nodes (11): dn(), fn(), getClusterLeaves(), hn(), mn(), _n, n(), pn() (+3 more)

### Community 19 - "types.ts"
Cohesion: 0.09
Nodes (22): AnalysisRun, Assessment, BilingualText, Case, CheckStatus, Claim, DecisionScenario, EvidenceRecord (+14 more)

### Community 20 - "numpy"
Cohesion: 0.12
Nodes (10): compute_joint_trajectory_fingerprint(), compute_ndvi(), compute_pauli_decomposition(), compute_polarization_ratio(), filter_by_tide(), test_joint_trajectory_fingerprint(), test_ndvi_calculation(), test_pauli_rgb_decomposition() (+2 more)

### Community 21 - "🛰️ 1. Spaceborne Satellite Remote Sensing Missions"
Cohesion: 0.09
Nodes (20): 🛰️ External Data Sources & Basemaps, FluviSAR System Architecture & Design, 🏗️ High-Level System Architecture, High-Resolution Basemap Engine & Swipe Comparison, 🗺️ Workspace Map Views, 1.1 NASA-ISRO Synthetic Aperture Radar (NISAR), 1.2 NASA Global Precipitation Measurement (GPM IMERG), 1.3 NASA / CNES Surface Water and Ocean Topography (SWOT) (+12 more)

### Community 22 - "constructor"
Cohesion: 0.06
Nodes (43): ad(), addImages(), backfillBorder(), Bh(), constructor(), _down(), ei(), ft() (+35 more)

### Community 23 - "🌟 Signature Scientific Innovations"
Cohesion: 0.09
Nodes (21): 1. "Break My Finding" & 7 Check Groups (`W04–W06`, `E03–E07`), 1. Run All Scientific Tests (100% Passing), 2. Dual-Pol Ratios & Real Pauli RGB Decomposition (`W03`, `E06`, `E09`, `R09–R12`), 2. Launch the Web Frontend, 3. CHARKEEP Topological Graph & Decision Flip Engine (`R04–R07`, `B06`), 3. Launch the Backend API Service, 4. Local InSAR Phase-to-Displacement & SWOT Elevation (`E15`, `R08`, `R14–R16`), 4. Run via Docker Compose (+13 more)

### Community 24 - "test_b02_source_and_api.py"
Cohesion: 0.13
Nodes (6): compute_raster_statistics(), GCOVAdapter, linear_power_to_db(), test_compute_raster_statistics(), test_gcov_adapter_point_sampling(), test_linear_power_to_db_conversion()

### Community 25 - "test_b04_change_and_checks.py"
Cohesion: 0.15
Nodes (13): classify_water(), compute_otsu_threshold(), compute_pairwise_transitions(), compute_robust_core_and_fringe(), evaluate_seven_checks(), display_array(), save_gray(), save_mask() (+5 more)

### Community 26 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 27 - "subdividePolygonInternal"
Cohesion: 0.14
Nodes (19): _ensureNoPoleVertices(), _fillPoles(), _generateInterEdgeVertices(), _generateIntraEdgeVertices(), _generateOutline(), _generatePoleQuad(), _getKey(), _handlePoles() (+11 more)

### Community 28 - "cr"
Cohesion: 0.21
Nodes (17): ar(), br(), cr(), dr(), fr(), gr(), hr(), ir() (+9 more)

### Community 29 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 30 - "data/types.ts"
Cohesion: 0.02
Nodes (105): AcqPoint, Acquisitions, AcquisitionStatus, AcqUtc, AcqUtc1, AllModels, AreaHa, Bbox (+97 more)

### Community 31 - "hx"
Cohesion: 0.16
Nodes (18): ax(), cx(), dx(), eS(), gx(), hb(), hx(), iS() (+10 more)

### Community 32 - "api"
Cohesion: 0.15
Nodes (15): build, environment, ports, restart, context, dockerfile, target, services (+7 more)

### Community 33 - "ac"
Cohesion: 0.17
Nodes (16): ac(), Gs(), Ic(), jc(), jd(), kc(), kd(), Lc() (+8 more)

### Community 34 - "Header.tsx"
Cohesion: 0.17
Nodes (13): BreakMyFindingModal(), BreakMyFindingModalProps, CheckItem, CHECKS_DATA, ChangePassportModal(), ChangePassportModalProps, RevisionItem, DecisionBriefModal() (+5 more)

### Community 35 - "Architecture & Technical Decision Records (ADR)"
Cohesion: 0.14
Nodes (13): ADR-001: Two Active Study Regions (Jamuna & Sundarbans), ADR-002: Zero-Fabricated Data Policy & Explicit Dependency States, ADR-003: MapLibre GL JS + PMTiles Over Paid SDKs, ADR-004: Dual-Tier Architecture (Python Pipeline + TypeScript Web SPA), ADR-005: "Break My Finding" Scientific Interaction, ADR-005: High-Resolution Satellite Imagery Basemap & Dual Synchronized Swipe Engine, ADR-006: Authentic SAR Remote Sensing Visualization & Dual-Map Swipe Synchronization, ADR-006: Decision Flip Engine & CHARKEEP Service Graph (Milestone B06) (+5 more)

### Community 36 - "main.py"
Cohesion: 0.27
Nodes (8): evidence_catalog(), get_case(), get_region(), get_regions(), get_run_bundle(), health_check(), read_catalog(), sample_numeric_artifact()

### Community 37 - "clone"
Cohesion: 0.14
Nodes (14): add(), clone(), div(), divByPoint(), mag(), matMult(), mult(), multByPoint() (+6 more)

### Community 38 - "evaluate"
Cohesion: 0.16
Nodes (16): Bt(), di(), dt(), Er(), et(), evaluate(), Ht(), interpolate() (+8 more)

### Community 39 - "Intelligence.tsx"
Cohesion: 0.05
Nodes (78): blendGamma0Db(), CLASS_COLORS, compactDate(), EvidenceGate(), featureRings(), FeatureSpace(), fmt(), getPrediction() (+70 more)

### Community 40 - "hasDebugData"
Cohesion: 0.17
Nodes (13): _addCollisionDebugVertex(), addCollisionDebugVertices(), addDebugCollisionBoxes(), destroy(), destroyDebugData(), generateCollisionDebugBuffers(), getVertexAttributes(), hasDebugData() (+5 more)

### Community 41 - "react"
Cohesion: 0.38
Nodes (12): InSARSpecialtyPanel(), JamunaDecisionPanel(), LeftPanel(), ObservatoryFeaturePanel(), Tab, names, ObservatoryLensGuide(), ScenarioLabPanel() (+4 more)

### Community 42 - "ai"
Cohesion: 0.14
Nodes (15): at(), ct(), Hi(), ii(), it(), lt, ni(), oi() (+7 more)

### Community 43 - "sf"
Cohesion: 0.14
Nodes (16): cf(), df(), Ef(), ff(), gf(), hf(), kf(), lf() (+8 more)

### Community 44 - "fh"
Cohesion: 0.13
Nodes (16): ch(), dh(), fh(), gh(), $h(), hh(), lh(), mh() (+8 more)

### Community 45 - "pathlib"
Cohesion: 0.10
Nodes (7): generate_json_schemas(), main(), run_doctor(), main(), test_audience_separation(), test_five_localized_story_chapters_contract(), test_sar_physics_formulas()

### Community 46 - "FluviSAR — Antigravity-ready project specification"
Cohesion: 0.17
Nodes (11): 17.1 Report and Passport outputs, 17.2 Share URL, 17. API, persistence, sharing and exports, 21. Two-to-four-week execution with five people, 2.1 The strongest testable contribution, 2.2 What makes the demonstration competitive, 2. NASA challenge analysis and the contribution to demonstrate, 3. Geographic and user specification (+3 more)

### Community 47 - "vm"
Cohesion: 0.18
Nodes (11): am(), bm(), gm(), hm(), mm(), nm(), rm(), sm (+3 more)

### Community 48 - "ingest_sentinel1.py"
Cohesion: 0.09
Nodes (24): append_revision_event(), generate_finding_passport(), expand(), main(), discover(), main(), optical(), pair_bundle() (+16 more)

### Community 49 - "🗺️ Phases & Milestones Roadmap"
Cohesion: 0.18
Nodes (10): FluviSAR Build & Progress Tracker, 📝 How to Read & Update, 📊 Live Progress Dashboard, 🔒 Locked Decisions Checklist (Section 1 of `plan.md`), Phase 1: Foundation & Architecture (Milestones B00 – B01), Phase 2: Core Observation & Change Engine (Milestones B02 – B04), Phase 3: Regional Missions & Deep Science (Milestones B05 – B07), Phase 4: Intelligence, Stories & Decision Lab (Milestones B08 – B10) (+2 more)

### Community 50 - "🚀 Quick Start"
Cohesion: 0.20
Nodes (9): 1. Prerequisites, 2. Directory Structure, 3. Running the Web Application, 4. Running Backend Services, Code Style, Developer Onboarding & Contribution Guide, 🛠️ Development Standards & Git Workflow, Feature-Level Atomic Commits & Instant Push (+1 more)

### Community 51 - "DecisionDesk.tsx"
Cohesion: 0.11
Nodes (31): analysisImage(), compactDate(), ImageCorners, isoDate(), reachForRegion(), regionForReach(), loadReachBundle(), ChangeFeature (+23 more)

### Community 52 - "MapWorkspace.tsx"
Cohesion: 0.18
Nodes (10): GeoFeatureCollection, JAMUNA_ACCRETION_ZONES, JAMUNA_ASSETS, JAMUNA_EROSION_ZONES, JAMUNA_WATER_AUG26, JAMUNA_WATER_SEP19, SUNDARBANS_ASSETS, SUNDARBANS_PAULI_CANOPY (+2 more)

### Community 53 - "sy"
Cohesion: 0.26
Nodes (12): ab(), Cb(), db(), eb, gb(), Hs, nx(), ob() (+4 more)

### Community 54 - "workspaceStore.ts"
Cohesion: 0.12
Nodes (15): JAMUNA_PAIRS, PairCandidate, PairSelectorModal(), PairSelectorProps, ActiveTab, Audience, BasemapType, Language (+7 more)

### Community 55 - "z"
Cohesion: 0.33
Nodes (6): ce(), ie(), re(), se(), vr(), z()

### Community 56 - "fire"
Cohesion: 0.12
Nodes (17): bo(), de(), fe(), fire(), gradientExpression(), _handleOverridablePaintPropertyUpdate(), _handleSpecialPaintPropertyUpdate(), listens() (+9 more)

### Community 57 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test:e2e

### Community 58 - "10. Scientific pipeline and published artifacts"
Cohesion: 0.22
Nodes (9): 10.1 Processing stages, 10.2 Product inspection and gridding, 10.3 Water, transition and recurrence branch, 10.4 Actual robustness variants, 10.5 Vegetation, forest response and restoration branch, 10.6 Phase / Fringe Stage branch, 10.7 SME2, rainfall, stage/tide and SWOT, 10.8 Artifacts per run (+1 more)

### Community 59 - "useEvidence"
Cohesion: 0.20
Nodes (19): AtlasRoute(), WorkspaceApp(), AgenticCopilotDrawer(), AtlasView(), MetricCard(), PageIntro(), QualityChecks(), SourceList() (+11 more)

### Community 61 - "jamuna"
Cohesion: 0.09
Nodes (23): bbox, change_sha256, change_url, common_mask_path, connectivity, crs, findings_url, interpretation (+15 more)

### Community 62 - "addFeature"
Cohesion: 0.27
Nodes (10): addCurrentVertex(), addFeature(), addHalfVertex(), addLine(), Dc(), lineFeatureClips(), Tc(), updateDistance() (+2 more)

### Community 63 - "sundarbans"
Cohesion: 0.09
Nodes (23): sundarbans, bbox, change_sha256, change_url, common_mask_path, connectivity, crs, findings_url (+15 more)

### Community 64 - "SARLab.tsx"
Cohesion: 0.24
Nodes (22): BANDS, FeatureCloudePottier(), FeatureDielectric(), FeatureDualFrequency(), FeatureFloodMechanisms(), FeaturePauliRGB(), FeaturePipelineWalkthrough(), FeatureRadarGeometry() (+14 more)

### Community 65 - "determineLineBreaks"
Cohesion: 0.12
Nodes (21): copy(), determineLineBreaks(), determineTotalWidth(), dl(), eh(), em(), fl(), freeBufferAfterUpload() (+13 more)

### Community 66 - "parse"
Cohesion: 0.15
Nodes (17): b(), _calculate(), checkSubtype(), ci(), concat(), error(), I, je (+9 more)

### Community 67 - "metrics"
Cohesion: 0.22
Nodes (17): metrics, candidate_count, common_valid_area_ha, common_valid_fraction, common_valid_pixel_count, land_to_water_count, land_to_water_ha, land_to_water_pixel_count (+9 more)

### Community 68 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, clsx@^2.1.1, lucide-react@^1.65.0, maplibre-gl@^6.16.0, pmtiles@^4.5.0, react@^19.3.1, react-dom@^19.3.1, react-router-dom@^7.18.5 (+8 more)

### Community 69 - "fromLngLat"
Cohesion: 0.29
Nodes (7): fd(), fromLngLat(), hd(), md(), pd(), toAltitude(), vd()

### Community 70 - "7. Shared interaction contracts"
Cohesion: 0.29
Nodes (7): 7.1 Timeline / Rhythm Player / Stage Ladder, 7.2 Radar-to-Reality / Sensor Race, 7.3 Break My Finding, 7.4 Selection / patch biography / transect, 7.5 Human Translation and evidence navigation, 7.6 Sonification / FEEL on web, 7. Shared interaction contracts

### Community 71 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 72 - "af"
Cohesion: 0.12
Nodes (18): af(), appendLeaves(), bf(), filterUpdate(), getChildren(), getClusterExpansionZoom(), getData(), getLeaves() (+10 more)

### Community 73 - "fb"
Cohesion: 0.19
Nodes (16): by(), fb(), hy(), ib, jy(), ky(), lb(), pb() (+8 more)

### Community 75 - "fg"
Cohesion: 0.21
Nodes (15): ag(), calculateGlyphDependencies(), cg(), dg(), fg(), ig(), jg(), kg() (+7 more)

### Community 76 - "overwriteGetter"
Cohesion: 0.33
Nodes (6): hcl(), lab(), overwriteGetter(), qe(), rgb(), Ye()

### Community 77 - "16. Architecture and implementation choices"
Cohesion: 0.33
Nodes (6): 16.1 Selected stack, 16.2 New project structure, 16.3 Render data versus numeric data, 16.4 Pipeline command contract, 16.5 Storage and job behavior, 16. Architecture and implementation choices

### Community 78 - "20. Verification plan and scientific acceptance"
Cohesion: 0.33
Nodes (6): 20.1 Meaningful scientific checks, 20.2 End-to-end product journeys, 20.3 Evaluation that supports the problem-solving claim, 20.4 Visual and accessibility acceptance, 20.5 Project handover artifacts, 20. Verification plan and scientific acceptance

### Community 79 - "pair_bundles"
Cohesion: 0.13
Nodes (15): pair_bundles, 2026-07-03_2026-08-20, 2026-07-03_2026-09-25, 2026-07-03_2026-10-07, 2026-07-03_2026-10-19, 2026-07-03_2026-10-31, 2026-08-20_2026-09-25, 2026-08-20_2026-10-07 (+7 more)

### Community 80 - "nd"
Cohesion: 0.40
Nodes (5): geometry(), nd(), projectLine(), projectPoint(), rd()

### Community 81 - "pair_bundles"
Cohesion: 0.13
Nodes (15): 2026-07-06_2026-08-23, 2026-07-06_2026-09-28, 2026-07-06_2026-10-10, 2026-07-06_2026-10-22, 2026-07-06_2026-11-03, 2026-08-23_2026-09-28, 2026-08-23_2026-10-10, 2026-08-23_2026-10-22 (+7 more)

### Community 82 - "layout"
Cohesion: 0.40
Nodes (5): layout(), Ld(), qu(), tl(), zp()

### Community 83 - "11. Measurement and decision definitions"
Cohesion: 0.40
Nodes (5): 11.1 Real Pauli capability, 11.2 Inspection-budget and Decision Flip engine, 11.3 NISAR contribution experiment, 11.4 Scenario / Future Dance model, 11. Measurement and decision definitions

### Community 84 - "18. Frontend state and performance specification"
Cohesion: 0.40
Nodes (5): 18.1 One workspace state, 18.2 Bounded interactive processing, 18.3 Planned performance targets, 18.4 Required interface states, 18. Frontend state and performance specification

### Community 85 - "19. Antigravity execution instructions and milestones"
Cohesion: 0.40
Nodes (5): 19.1 Paste-ready starter instruction, 19.2 Milestone backlog, 19.3 Build workflow discipline, 19.4 Definition of the full current web release, 19. Antigravity execution instructions and milestones

### Community 86 - "9. Acquisition recipes and the first real-data milestone"
Cohesion: 0.40
Nodes (5): 9.1 NISAR search, grouping and download, 9.2 Layer extraction options, 9.3 Sentinel-2 and supplementary search, 9.4 Initial input-readiness gate, 9. Acquisition recipes and the first real-data milestone

### Community 87 - "geometryType"
Cohesion: 0.50
Nodes (4): containsPolygonGeometry(), geometryType(), getGeometries(), sx()

### Community 88 - "method"
Cohesion: 0.14
Nodes (13): generated_at, method, classification, connectivity, id, minimum_component_pixels, pixel_area_m2, resolution_m (+5 more)

### Community 89 - "i"
Cohesion: 0.26
Nodes (13): emplaceBack(), ey(), f(), g(), loadGeometry(), m(), pm(), queryIntersectsFeature() (+5 more)

### Community 90 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

### Community 91 - "12. Mandatory PDF feature coverage: complete traceability"
Cohesion: 0.50
Nodes (4): 12.1 Core web requirements (PDF pages 1–3), 12.2 Extended web requirements and retained aliases, 12.3 Coverage interpretation and acceptance links, 12. Mandatory PDF feature coverage: complete traceability

### Community 92 - "13. Research additions, prior-project retention and useful improvements"
Cohesion: 0.50
Nodes (4): 13.1 Every accepted research capability, 13.2 Existing project capabilities: retain intent, rebuild data binding, 13.3 Five targeted improvements to the previous plan, 13. Research additions, prior-project retention and useful improvements

### Community 93 - "14. TRACE Field scope and full requirement preservation"
Cohesion: 0.50
Nodes (4): 14.1 Core mobile requirements (PDF pages 4–5), 14.2 Extended mobile requirements and aliases (PDF pages 8–24), 14.3 Field handoff contract, 14. TRACE Field scope and full requirement preservation

### Community 94 - "15. Canonical data contracts"
Cohesion: 0.50
Nodes (4): 15.1 Entities, 15.2 Separate meaning, assessment and readiness, 15.3 Region configuration, 15. Canonical data contracts

### Community 95 - "22. Demonstration and positioning"
Cohesion: 0.50
Nodes (4): 22.1 Demonstration sequence, 22.2 Five Dances, localized, 22.3 Suggested pitch, 22. Demonstration and positioning

### Community 96 - "23. Team explanation, sources and final coverage statement"
Cohesion: 0.50
Nodes (4): 23.1 একদম সহজভাবে পুরো project, 23.2 Local decision history and inputs, 23.3 Final retention and status contract, 23. Team explanation, sources and final coverage statement

### Community 97 - "4. Visual research translated into a concrete design"
Cohesion: 0.50
Nodes (4): 4.1 First 30 seconds, 4.2 Visual system, 4.3 Map semantics and legends, 4. Visual research translated into a concrete design

### Community 98 - "5. Navigation, screens and shared layout"
Cohesion: 0.50
Nodes (4): 5.1 Desktop wireframe, 5.2 Screen contracts, 5.3 Inspector information order, 5. Navigation, screens and shared layout

### Community 99 - "6. Exact map views and regional representation"
Cohesion: 0.50
Nodes (4): 6.1 Jamuna visual sequence, 6.2 Sundarbans visual sequence, 6.3 Geographic accuracy rules, 6. Exact map views and regional representation

### Community 100 - "8. Exact source registry and current access status"
Cohesion: 0.50
Nodes (4): 8.1 Primary NISAR products, 8.2 Supplementary sources, 8.3 Actual discovery evidence, 8. Exact source registry and current access status

### Community 101 - "sortFeatures"
Cohesion: 0.67
Nodes (3): addIndicesForPlacedSymbol(), getSortedSymbolIndexes(), sortFeatures()

### Community 102 - "empty"
Cohesion: 0.67
Nodes (3): covers(), empty(), intersects()

### Community 103 - "evidence.tsx"
Cohesion: 0.21
Nodes (11): missions, comparisonCache, EvidenceContext, EvidenceIndex, EvidenceProvider(), loadEvidence(), ObservedFinding, OpticalObservation (+3 more)

### Community 104 - "withinInto"
Cohesion: 0.67
Nodes (3): ep(), within(), withinInto()

### Community 105 - "patchUpdatedImage"
Cohesion: 0.67
Nodes (3): patchUpdatedImage(), patchUpdatedImages(), zh()

### Community 107 - "1. Locked decisions and completion rules"
Cohesion: 0.67
Nodes (3): 1.1 What is already known, and what remains to do, 1.2 One coherent product statement, 1. Locked decisions and completion rules

### Community 123 - "loadTile"
Cohesion: 0.24
Nodes (12): _filterGeoJSON(), _finishRequestTiming(), _getEtagUnmodifiedResult(), _getExpiryData(), _getFilterPredicate(), _getOverzoomTile(), loadAndProcessGeoJSON(), loadData() (+4 more)

### Community 128 - "observation-history.spec.ts"
Cohesion: 0.20
Nodes (4): @playwright/test@^1.65.0, catalogue, catalogue, @playwright/test

### Community 129 - "w"
Cohesion: 0.29
Nodes (10): ao(), eo(), io(), no(), oo(), ro(), te(), to() (+2 more)

### Community 130 - "bc"
Cohesion: 0.24
Nodes (10): bc(), ee(), Fc(), getId(), loadMatchingFeature(), loadVTLayers(), lookupSymbolFeatures(), query() (+2 more)

### Community 131 - "dev.mjs"
Cohesion: 0.20
Nodes (5): children, project, python, vite, web

### Community 132 - "populate"
Cohesion: 0.22
Nodes (9): addLineDashDependencies(), Cd(), hasLineDasharray(), km(), Ml(), Nl(), populate(), Sd() (+1 more)

### Community 133 - "O"
Cohesion: 0.28
Nodes (9): applyGlobalStateChange(), bg(), O(), _propertyRootKey(), retainPriorGlobalState(), setTransition(), setValue(), setValues() (+1 more)

### Community 134 - "kx"
Cohesion: 0.22
Nodes (9): Bx(), jx(), kx(), Lx(), Mx(), Rx(), Ux(), Wx() (+1 more)

### Community 135 - "po"
Cohesion: 0.33
Nodes (9): co(), fo(), le(), lo(), mo(), ne(), po(), sendAsync() (+1 more)

### Community 136 - "S"
Cohesion: 0.25
Nodes (9): cS(), ec(), fS(), oS(), S(), setUniform(), sS(), vS() (+1 more)

### Community 137 - "E"
Cohesion: 0.25
Nodes (9): D(), decodeDictionary(), E(), getTransition(), getValue(), getValueFromBuffer(), k(), offsetToLengthBuffer() (+1 more)

### Community 138 - "MapWorkspace.tsx"
Cohesion: 0.39
Nodes (8): actualRadarUrl(), Corners, coverStudyArea(), MapWorkspace(), opticalCorners(), selectedObservation(), selectedOpticalObservation(), Side

### Community 139 - "load.ts"
Cohesion: 0.44
Nodes (8): ReachBundle, Bounds, ChangeFeatureCollection, Manifest, QC, ReachDetail, Stage, DecisionMapProps

### Community 140 - "cy"
Cohesion: 0.29
Nodes (8): cy(), jb(), kb(), ly(), nS(), tb, ub(), xS()

### Community 141 - "lngLatFromWorld"
Cohesion: 0.32
Nodes (8): _findLatitudeLimit(), _finiteInverse(), hasLngLat(), _inverse(), _inverseTowardCenter(), latitudeRange(), lngLatFromWorld(), _meridianStretch()

### Community 142 - "vite.config.ts"
Cohesion: 0.29
Nodes (6): @tailwindcss/vite@^4.3.3, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 143 - "hp"
Cohesion: 0.38
Nodes (7): bp(), gp(), hp(), _p(), vp(), xp(), yp()

### Community 144 - "_setPaintValues"
Cohesion: 0.38
Nodes (7): emplace(), getPositionIds(), getPositions(), populatePaintArray(), _setPaintValue(), _setPaintValues(), updatePaintArray()

### Community 145 - "pg"
Cohesion: 0.33
Nodes (7): gg(), hg(), mg(), ng(), pg(), rg(), tg()

### Community 146 - "Cc"
Cohesion: 0.40
Nodes (6): Cc(), Dd(), _generateSideFaces(), Od(), processPolygon(), wc()

### Community 147 - "processTask"
Cohesion: 0.33
Nodes (6): completeTask(), loadVectorTile(), process(), processTask(), receive(), y()

### Community 148 - "observatory-controls.spec.ts"
Cohesion: 0.60
Nodes (3): aligned(), cameras(), footprintFits()

### Community 149 - "bS"
Cohesion: 0.50
Nodes (4): bS(), dS(), lS(), uS()

### Community 150 - "_forEachCell"
Cohesion: 0.50
Nodes (4): _convertFromCellCoord(), _convertToCellCoord(), _forEachCell(), insert()

### Community 151 - "dy"
Cohesion: 0.50
Nodes (4): dy(), fy(), nb, uy()

### Community 152 - "findings"
Cohesion: 0.67
Nodes (4): features, type, findings, findings

### Community 153 - "Kp"
Cohesion: 0.67
Nodes (3): Kp(), queryRadius(), Uc()

## Knowledge Gaps
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `nh()` connect `fe` to `maplibre-gl-worker.mjs`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `constructor()` (e.g. with `n()` and `v()`) actually correct?**
  _`constructor()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `maplibre-gl-worker.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.007462686567164179 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Header.tsx` to `SARLab.tsx`, `useWorkspaceStore`, `dependencies`, `package.json`, `evidence.tsx`, `Intelligence.tsx`, `react`, `MapWorkspace.tsx`, `LegacyPageLayout.tsx`, `DecisionDesk.tsx`, `workspaceStore.ts`, `useEvidence`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Are the 45 inferred relationships involving `n()` (e.g. with `ac()` and `add()`) actually correct?**
  _`n()` has 45 INFERRED edges - model-reasoned connections that need verification._
- **Should `l` be split into smaller, more focused modules?**
  _Cohesion score 0.11695906432748537 - nodes in this community are weakly interconnected._
- **Why does `fe()` connect `fe` to `w`, `O`, `gl`, `po`, `S`, `E`, `j`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._