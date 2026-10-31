# Graph Report - NASA-web  (2026-10-31)

## Corpus Check
- 83 files · ~78,888 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .css 2, .geojson 2)

## Summary
- 1827 nodes · 3418 edges · 128 communities (107 shown, 21 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 219 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `174ef777`
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
- pathlib
- i
- api
- queryIntersectsFeature
- determineLineBreaks
- Architecture & Technical Decision Records (ADR)
- main.py
- clone
- evaluate
- test_b07_specialty.py
- hasDebugData
- writeMessage
- ai
- sf
- fh
- sys
- FluviSAR — Antigravity-ready project specification
- vm
- json
- 🗺️ Phases & Milestones Roadmap
- 🚀 Quick Start
- test_b09_stories_and_learn.py
- bS
- S
- sy
- populate
- fire
- fb
- 10. Scientific pipeline and published artifacts
- _getByteView
- bc
- lb
- Cc
- lngLatFromWorld
- xv
- update
- it
- _setPaintValues
- qx
- fromLngLat
- 7. Shared interaction contracts
- .oxlintrc.json
- af
- zx
- getColorRampTextures
- jb
- overwriteGetter
- 16. Architecture and implementation choices
- 20. Verification plan and scientific acceptance
- once
- nd
- Ic
- layout
- 11. Measurement and decision definitions
- 18. Frontend state and performance specification
- 19. Antigravity execution instructions and milestones
- 9. Acquisition recipes and the first real-data milestone
- geometryType
- _forEachCell
- qh
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
- ti
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
- recalculate
- rn
- ud
- PROMPT.md
- eu

## God Nodes (most connected - your core abstractions)
1. `constructor()` - 53 edges
2. `n()` - 46 edges
3. `useWorkspaceStore` - 39 edges
4. `l()` - 30 edges
5. `i()` - 28 edges
6. `FluviSAR — Antigravity-ready project specification` - 25 edges
7. `react` - 23 edges
8. `emplaceBack()` - 23 edges
9. `lucide-react` - 21 edges
10. `fe()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `test_phase_to_los_displacement_physics()` --calls--> `phase_to_los_displacement()`  [INFERRED]
  fluvisar-next/tests/test_b07_specialty.py → fluvisar-next/pipeline/fluvisar/methods/insar.py
- `test_connected_component_referencing()` --calls--> `reference_displacement_to_point()`  [INFERRED]
  fluvisar-next/tests/test_b07_specialty.py → fluvisar-next/pipeline/fluvisar/methods/insar.py
- `test_sample_transect_profile()` --calls--> `sample_transect_profile()`  [INFERRED]
  fluvisar-next/tests/test_b07_specialty.py → fluvisar-next/pipeline/fluvisar/methods/insar.py
- `test_swot_water_elevation()` --calls--> `adapt_swot_water_elevation()`  [INFERRED]
  fluvisar-next/tests/test_b07_specialty.py → fluvisar-next/pipeline/fluvisar/methods/insar.py
- `test_decision_flip_solver()` --calls--> `solve_decision_flip()`  [INFERRED]
  fluvisar-next/tests/test_b06_jamuna_decisions.py → fluvisar-next/pipeline/fluvisar/methods/jamuna_decisions.py

## Import Cycles
- None detected.

## Communities (128 total, 21 thin omitted)

### Community 0 - "maplibre-gl-worker.mjs"
Cohesion: 0.01
Nodes (45): Ae, ah, Al, aS, au, cm, dv, Ed (+37 more)

### Community 1 - "useWorkspaceStore"
Cohesion: 0.07
Nodes (59): App(), AtlasView(), BreakMyFindingModal(), BreakMyFindingModalProps, CheckItem, CHECKS_DATA, ChangePassportModal(), ChangePassportModalProps (+51 more)

### Community 2 - "fe"
Cohesion: 0.05
Nodes (67): ao(), applyGlobalStateChange(), co(), completeTask(), D(), eo(), _filterGeoJSON(), _finishRequestTiming() (+59 more)

### Community 3 - "l"
Cohesion: 0.06
Nodes (49): ag(), anchorPoint(), b(), bg(), calculateGlyphDependencies(), cg(), db(), dg() (+41 more)

### Community 4 - "createIndex"
Cohesion: 0.06
Nodes (46): addTileFeatures(), ap(), appendLeaves(), bp(), clipToWorld(), cluster(), cp(), createIndex() (+38 more)

### Community 5 - "package.json"
Cohesion: 0.06
Nodes (43): dependencies, clsx@^2.1.1, lucide-react@^1.65.0, maplibre-gl@^6.16.0, pmtiles@^4.5.0, react@^19.3.1, react-dom@^19.3.1, tailwind-merge@^3.7.0 (+35 more)

### Community 6 - "gl"
Cohesion: 0.05
Nodes (45): Bl(), bu(), cl(), copy(), cu, dl(), du(), fl() (+37 more)

### Community 7 - "j"
Cohesion: 0.06
Nodes (42): addCurrentVertex(), addFeature(), addFeatures(), addHalfVertex(), addImageSection(), addLine(), Bt(), C() (+34 more)

### Community 8 - "Yi"
Cohesion: 0.08
Nodes (38): A, aa(), ba(), bi(), ca(), da(), ea(), d() (+30 more)

### Community 9 - "ay"
Cohesion: 0.07
Nodes (30): Av(), ay(), bb(), bv(), Cv(), decodeDictionary(), Ev(), getValueFromBuffer() (+22 more)

### Community 10 - "models.py"
Cohesion: 0.13
Nodes (22): AnalysisRun, Assessment, BilingualText, Case, CheckStatus, Claim, DecisionScenario, EvidenceRecord (+14 more)

### Community 11 - "scenarios_and_improvements.py"
Cohesion: 0.10
Nodes (10): build_multi_clock_display(), evaluate_coverage_curtain(), generate_assumption_receipt(), get_gmw_historical_epochs(), get_guided_comparison_prompts(), test_assumption_receipt_n03(), test_coverage_curtain_n02(), test_gmw_historical_bridge_n01() (+2 more)

### Community 12 - "writeTag"
Cohesion: 0.11
Nodes (27): realloc(), Th(), wh(), writeBoolean(), writeBooleanField(), writeBytes(), writeBytesField(), writeDouble() (+19 more)

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
Cohesion: 0.13
Nodes (10): adapt_swot_water_elevation(), build_compound_observation_profile(), compute_wrapped_phase(), count_fringes(), evaluate_nisar_contribution_benchmark(), phase_to_los_displacement(), reference_displacement_to_point(), sample_transect_profile() (+2 more)

### Community 17 - "evidence_passport.py"
Cohesion: 0.13
Nodes (8): append_revision_event(), compute_impact_ledger(), generate_decision_brief_manifest(), generate_finding_passport(), test_decision_brief_manifest(), test_finding_passport_generation(), test_immutable_revision_history(), test_impact_ledger_computation()

### Community 18 - "n"
Cohesion: 0.11
Nodes (22): ce(), dn(), f(), ff(), fn(), getClusterLeaves(), gf(), hn() (+14 more)

### Community 19 - "types.ts"
Cohesion: 0.09
Nodes (22): AnalysisRun, Assessment, BilingualText, Case, CheckStatus, Claim, DecisionScenario, EvidenceRecord (+14 more)

### Community 20 - "numpy"
Cohesion: 0.14
Nodes (10): compute_joint_trajectory_fingerprint(), compute_ndvi(), compute_pauli_decomposition(), compute_polarization_ratio(), filter_by_tide(), test_joint_trajectory_fingerprint(), test_ndvi_calculation(), test_pauli_rgb_decomposition() (+2 more)

### Community 21 - "🛰️ 1. Spaceborne Satellite Remote Sensing Missions"
Cohesion: 0.09
Nodes (20): 🛰️ External Data Sources & Basemaps, FluviSAR System Architecture & Design, 🏗️ High-Level System Architecture, High-Resolution Basemap Engine & Swipe Comparison, 🗺️ Workspace Map Views, 1.1 NASA-ISRO Synthetic Aperture Radar (NISAR), 1.2 NASA Global Precipitation Measurement (GPM IMERG), 1.3 NASA / CNES Surface Water and Ocean Topography (SWOT) (+12 more)

### Community 22 - "constructor"
Cohesion: 0.10
Nodes (22): ad(), addImages(), Bh(), constructor(), _down(), _getAvailableImages(), _getDEMWorkerSource(), _getGlobalState() (+14 more)

### Community 23 - "🌟 Signature Scientific Innovations"
Cohesion: 0.09
Nodes (21): 1. "Break My Finding" & 7 Check Groups (`W04–W06`, `E03–E07`), 1. Run All Scientific Tests (100% Passing), 2. Dual-Pol Ratios & Real Pauli RGB Decomposition (`W03`, `E06`, `E09`, `R09–R12`), 2. Launch the Web Frontend, 3. CHARKEEP Topological Graph & Decision Flip Engine (`R04–R07`, `B06`), 3. Launch the Backend API Service, 4. Local InSAR Phase-to-Displacement & SWOT Elevation (`E15`, `R08`, `R14–R16`), 4. Run via Docker Compose (+13 more)

### Community 24 - "test_b02_source_and_api.py"
Cohesion: 0.13
Nodes (6): compute_raster_statistics(), GCOVAdapter, linear_power_to_db(), test_compute_raster_statistics(), test_gcov_adapter_point_sampling(), test_linear_power_to_db_conversion()

### Community 25 - "test_b04_change_and_checks.py"
Cohesion: 0.15
Nodes (10): classify_water(), compute_otsu_threshold(), compute_pairwise_transitions(), compute_robust_core_and_fringe(), evaluate_seven_checks(), test_otsu_bimodal_threshold(), test_pairwise_transitions(), test_robust_core_and_fringe_invariant() (+2 more)

### Community 26 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 27 - "subdividePolygonInternal"
Cohesion: 0.14
Nodes (19): _ensureNoPoleVertices(), _fillPoles(), _generateInterEdgeVertices(), _generateIntraEdgeVertices(), _generateOutline(), _generatePoleQuad(), _getKey(), _handlePoles() (+11 more)

### Community 28 - "cr"
Cohesion: 0.19
Nodes (18): ar(), br(), cr(), dr(), Er(), fr(), gr(), hr() (+10 more)

### Community 29 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 30 - "pathlib"
Cohesion: 0.15
Nodes (6): calculate_water_recurrence(), solve_decision_flip(), solve_graph_reachability(), test_decision_flip_solver(), test_service_graph_reachability(), test_water_recurrence()

### Community 31 - "i"
Cohesion: 0.16
Nodes (16): ax(), Cb(), cx(), dx(), hx(), ix(), jx(), kx() (+8 more)

### Community 32 - "api"
Cohesion: 0.15
Nodes (15): build, environment, ports, restart, context, dockerfile, target, services (+7 more)

### Community 33 - "queryIntersectsFeature"
Cohesion: 0.17
Nodes (15): ac(), ee(), Fc(), Gs(), jc(), kc(), Kp(), Mc() (+7 more)

### Community 34 - "determineLineBreaks"
Cohesion: 0.18
Nodes (15): addTextSection(), _appendSection(), determineLineBreaks(), determineTotalWidth(), eh(), em(), getMaxImageSize(), getSection() (+7 more)

### Community 35 - "Architecture & Technical Decision Records (ADR)"
Cohesion: 0.14
Nodes (13): ADR-001: Two Active Study Regions (Jamuna & Sundarbans), ADR-002: Zero-Fabricated Data Policy & Explicit Dependency States, ADR-003: MapLibre GL JS + PMTiles Over Paid SDKs, ADR-004: Dual-Tier Architecture (Python Pipeline + TypeScript Web SPA), ADR-005: "Break My Finding" Scientific Interaction, ADR-005: High-Resolution Satellite Imagery Basemap & Dual Synchronized Swipe Engine, ADR-006: Authentic SAR Remote Sensing Visualization & Dual-Map Swipe Synchronization, ADR-006: Decision Flip Engine & CHARKEEP Service Graph (Milestone B06) (+5 more)

### Community 36 - "main.py"
Cohesion: 0.20
Nodes (6): get_case(), get_region(), get_regions(), get_run_bundle(), health_check(), sample_numeric_artifact()

### Community 37 - "clone"
Cohesion: 0.14
Nodes (14): add(), clone(), div(), divByPoint(), mag(), matMult(), mult(), multByPoint() (+6 more)

### Community 38 - "evaluate"
Cohesion: 0.18
Nodes (14): _calculate(), di(), dt(), et(), evaluate(), interpolate(), jn(), jo() (+6 more)

### Community 39 - "test_b07_specialty.py"
Cohesion: 0.14
Nodes (6): mask_by_coherence(), test_coherence_masking(), test_connected_component_referencing(), test_phase_to_los_displacement_physics(), test_sample_transect_profile(), test_swot_water_elevation()

### Community 40 - "hasDebugData"
Cohesion: 0.17
Nodes (13): _addCollisionDebugVertex(), addCollisionDebugVertices(), addDebugCollisionBoxes(), destroy(), destroyDebugData(), generateCollisionDebugBuffers(), getVertexAttributes(), hasDebugData() (+5 more)

### Community 41 - "writeMessage"
Cohesion: 0.15
Nodes (13): Ih(), jh(), kh(), writeMessage(), writePackedBoolean(), writePackedDouble(), writePackedFixed32(), writePackedFixed64() (+5 more)

### Community 42 - "ai"
Cohesion: 0.17
Nodes (12): ai(), Gi(), Hi(), ii(), ki(), ni(), oi(), ri() (+4 more)

### Community 43 - "sf"
Cohesion: 0.18
Nodes (12): cf(), df(), Ef(), hf(), kf(), lf(), mf(), of() (+4 more)

### Community 44 - "fh"
Cohesion: 0.18
Nodes (12): ch(), dh(), fh(), gh(), $h(), hh(), lh(), mh() (+4 more)

### Community 45 - "sys"
Cohesion: 0.27
Nodes (3): main(), run_doctor(), main()

### Community 46 - "FluviSAR — Antigravity-ready project specification"
Cohesion: 0.17
Nodes (11): 17.1 Report and Passport outputs, 17.2 Share URL, 17. API, persistence, sharing and exports, 21. Two-to-four-week execution with five people, 2.1 The strongest testable contribution, 2.2 What makes the demonstration competitive, 2. NASA challenge analysis and the contribution to demonstrate, 3. Geographic and user specification (+3 more)

### Community 47 - "vm"
Cohesion: 0.18
Nodes (11): am(), bm(), gm(), hm(), mm(), nm(), rm(), sm (+3 more)

### Community 48 - "json"
Cohesion: 0.22
Nodes (3): generate_json_schemas(), test_json_schemas_exist(), test_metric_validation_rule()

### Community 49 - "🗺️ Phases & Milestones Roadmap"
Cohesion: 0.18
Nodes (10): FluviSAR Build & Progress Tracker, 📝 How to Read & Update, 📊 Live Progress Dashboard, 🔒 Locked Decisions Checklist (Section 1 of `plan.md`), Phase 1: Foundation & Architecture (Milestones B00 – B01), Phase 2: Core Observation & Change Engine (Milestones B02 – B04), Phase 3: Regional Missions & Deep Science (Milestones B05 – B07), Phase 4: Intelligence, Stories & Decision Lab (Milestones B08 – B10) (+2 more)

### Community 50 - "🚀 Quick Start"
Cohesion: 0.20
Nodes (9): 1. Prerequisites, 2. Directory Structure, 3. Running the Web Application, 4. Running Backend Services, Code Style, Developer Onboarding & Contribution Guide, 🛠️ Development Standards & Git Workflow, Feature-Level Atomic Commits & Instant Push (+1 more)

### Community 51 - "test_b09_stories_and_learn.py"
Cohesion: 0.20
Nodes (3): test_audience_separation(), test_five_localized_story_chapters_contract(), test_sar_physics_formulas()

### Community 52 - "bS"
Cohesion: 0.20
Nodes (10): bS(), cy(), dS(), kb(), lS(), ly(), tb, ub() (+2 more)

### Community 53 - "S"
Cohesion: 0.22
Nodes (10): cS(), E(), ec(), fS(), oS(), S(), setUniform(), sS() (+2 more)

### Community 54 - "sy"
Cohesion: 0.33
Nodes (9): ab(), eb, gb(), Hs, ob(), q_(), sb(), sy() (+1 more)

### Community 55 - "populate"
Cohesion: 0.22
Nodes (9): addLineDashDependencies(), Cd(), hasLineDasharray(), km(), Ml(), Nl(), populate(), Sd() (+1 more)

### Community 56 - "fire"
Cohesion: 0.25
Nodes (9): bo(), fire(), _handleOverridablePaintPropertyUpdate(), listens(), recalculateVisibility(), setLayoutProperty(), setPaintProperty(), _validate() (+1 more)

### Community 57 - "fb"
Cohesion: 0.31
Nodes (9): fb(), hy(), jy(), pb(), qy(), rb, vy(), wy() (+1 more)

### Community 58 - "10. Scientific pipeline and published artifacts"
Cohesion: 0.22
Nodes (9): 10.1 Processing stages, 10.2 Product inspection and gridding, 10.3 Water, transition and recurrence branch, 10.4 Actual robustness variants, 10.5 Vegetation, forest response and restoration branch, 10.6 Phase / Fringe Stage branch, 10.7 SME2, rainfall, stage/tide and SWOT, 10.8 Artifacts per run (+1 more)

### Community 59 - "_getByteView"
Cohesion: 0.29
Nodes (8): backfillBorder(), get(), _getByteView(), getPixels(), _idx(), sampleBilinear(), unpack(), _unpackAtIndex()

### Community 60 - "bc"
Cohesion: 0.32
Nodes (8): bc(), getId(), loadMatchingFeature(), loadVTLayers(), lookupSymbolFeatures(), query(), Vc(), xc()

### Community 61 - "lb"
Cohesion: 0.32
Nodes (8): by(), hb(), ib, ky(), lb(), mb(), vb, zy()

### Community 62 - "Cc"
Cohesion: 0.29
Nodes (8): Cc(), Dd(), _generateSideFaces(), jd(), kd(), Od(), processPolygon(), wc()

### Community 63 - "lngLatFromWorld"
Cohesion: 0.32
Nodes (8): _findLatitudeLimit(), _finiteInverse(), hasLngLat(), _inverse(), _inverseTowardCenter(), latitudeRange(), lngLatFromWorld(), _meridianStretch()

### Community 64 - "xv"
Cohesion: 0.25
Nodes (8): Fv(), Hv(), Iv(), Nv(), Pv(), Rv(), xv(), zv()

### Community 65 - "update"
Cohesion: 0.32
Nodes (8): hl(), qi(), replace(), update(), _updateDomImage(), _updateRawData(), _uploadDomImage(), _uploadRawData()

### Community 66 - "it"
Cohesion: 0.33
Nodes (7): at(), ct(), it(), lt, ot(), st(), tt()

### Community 67 - "_setPaintValues"
Cohesion: 0.38
Nodes (7): emplace(), getPositionIds(), getPositions(), populatePaintArray(), _setPaintValue(), _setPaintValues(), updatePaintArray()

### Community 68 - "qx"
Cohesion: 0.43
Nodes (7): eS(), gx(), iS(), nS(), qx(), rS(), tS()

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
Cohesion: 0.40
Nodes (6): af(), bf(), If(), jf(), uf(), xf()

### Community 73 - "zx"
Cohesion: 0.33
Nodes (6): Bx(), Lx(), Rx(), Ux(), Wx(), zx()

### Community 74 - "getColorRampTextures"
Cohesion: 0.33
Nodes (6): _colorRampChanged(), _createColorRamp(), getColorRampTextures(), getUnpackVector(), Ol(), pack()

### Community 75 - "jb"
Cohesion: 0.33
Nodes (6): dy(), fy(), jb(), nb, uy(), zb()

### Community 76 - "overwriteGetter"
Cohesion: 0.33
Nodes (6): hcl(), lab(), overwriteGetter(), qe(), rgb(), Ye()

### Community 77 - "16. Architecture and implementation choices"
Cohesion: 0.33
Nodes (6): 16.1 Selected stack, 16.2 New project structure, 16.3 Render data versus numeric data, 16.4 Pipeline command contract, 16.5 Storage and job behavior, 16. Architecture and implementation choices

### Community 78 - "20. Verification plan and scientific acceptance"
Cohesion: 0.33
Nodes (6): 20.1 Meaningful scientific checks, 20.2 End-to-end product journeys, 20.3 Evaluation that supports the problem-solving claim, 20.4 Visual and accessibility acceptance, 20.5 Project handover artifacts, 20. Verification plan and scientific acceptance

### Community 79 - "once"
Cohesion: 0.40
Nodes (5): de(), fe(), off(), on(), once()

### Community 80 - "nd"
Cohesion: 0.40
Nodes (5): geometry(), nd(), projectLine(), projectPoint(), rd()

### Community 81 - "Ic"
Cohesion: 0.40
Nodes (5): Ic(), Lc(), oC(), Qg(), Rc()

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

### Community 88 - "_forEachCell"
Cohesion: 0.50
Nodes (4): _convertFromCellCoord(), _convertToCellCoord(), _forEachCell(), insert()

### Community 89 - "qh"
Cohesion: 0.50
Nodes (4): qh(), Um(), wm(), Xh()

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

### Community 103 - "ti"
Cohesion: 0.67
Nodes (3): ei(), ft(), ti()

### Community 104 - "withinInto"
Cohesion: 0.67
Nodes (3): ep(), within(), withinInto()

### Community 105 - "patchUpdatedImage"
Cohesion: 0.67
Nodes (3): patchUpdatedImage(), patchUpdatedImages(), zh()

### Community 107 - "1. Locked decisions and completion rules"
Cohesion: 0.67
Nodes (3): 1.1 What is already known, and what remains to do, 1.2 One coherent product statement, 1. Locked decisions and completion rules

## Knowledge Gaps
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `nh()` connect `fe` to `maplibre-gl-worker.mjs`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `constructor()` (e.g. with `n()` and `v()`) actually correct?**
  _`constructor()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `maplibre-gl-worker.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.007462686567164179 - nodes in this community are weakly interconnected._
- **Why does `FluviSAR — Antigravity-ready project specification` connect `FluviSAR — Antigravity-ready project specification` to `10. Scientific pipeline and published artifacts`, `7. Shared interaction contracts`, `16. Architecture and implementation choices`, `20. Verification plan and scientific acceptance`, `11. Measurement and decision definitions`, `18. Frontend state and performance specification`, `19. Antigravity execution instructions and milestones`, `9. Acquisition recipes and the first real-data milestone`, `12. Mandatory PDF feature coverage: complete traceability`, `13. Research additions, prior-project retention and useful improvements`, `14. TRACE Field scope and full requirement preservation`, `15. Canonical data contracts`, `22. Demonstration and positioning`, `23. Team explanation, sources and final coverage statement`, `4. Visual research translated into a concrete design`, `5. Navigation, screens and shared layout`, `6. Exact map views and regional representation`, `8. Exact source registry and current access status`, `1. Locked decisions and completion rules`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Are the 45 inferred relationships involving `n()` (e.g. with `ac()` and `add()`) actually correct?**
  _`n()` has 45 INFERRED edges - model-reasoned connections that need verification._
- **Should `useWorkspaceStore` be split into smaller, more focused modules?**
  _Cohesion score 0.06562819203268641 - nodes in this community are weakly interconnected._
- **Are the 4 inferred relationships involving `l()` (e.g. with `maplibre-gl-worker.mjs` and `emplaceBack()`) actually correct?**
  _`l()` has 4 INFERRED edges - model-reasoned connections that need verification._