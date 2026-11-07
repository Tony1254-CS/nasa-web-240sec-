# ML Intelligence — observations, model behaviour and review

Route: `/intelligence`. The default workspace is **Real observations**. Direct workspace links use `?view=playground`, `?view=robustness` or `?view=evaluation`.

## Four workspaces, existing tools preserved

| Workspace | Tools |
| --- | --- |
| Real observations | Registered radar-pair comparison, VV/VH, dated optical context, water masks, all six acquisitions, georeferenced candidate polygons, class/size filters, largest patches, numerical statistics, QC and source lineage |
| Model playground | RF/MLP selector, presets, linked generated pixels and feature-space points, input sliders, three-time-step schematic, predicted class and entropy maps, raw score distributions and scene perturbation |
| Robustness & review | Gamma-speckle Monte Carlo experiment, resampling, temporal CUSUM onset/duration controls, novelty/domain-distance check, connected-component filtering, IoU/Dice/precision/recall and selective-review coverage/error curve |
| Model evaluation | Both models' generated holdout results, MLP training/validation trace, epoch inspection, RF training description, interactive confusion matrix and class metrics, permutation sensitivity, architecture/data card and interpretation limits |

## Real evidence

The route uses `useObservatoryEvidence`, so every registered radar pair can be selected. Images, metrics, candidate geometry, original acquisition IDs and exported data follow that same pair. Observation history is chronological. The two analysis acquisitions are distinguished from the six available historical passes.

The existing Decision Desk numerical service provides scoped history and exact per-candidate mapped-asset/threshold-review statistics. Candidate ordering can use area, mapped intersections, threshold sensitivity or the absence of a browser-local field record. These orderings are not hazard probabilities or damage estimates.

The inspector explains why a finding needs review with its area, source pixels, location, threshold-stable core, follow-up observations and interpretation limits. Jamuna copy describes river stage and bank review; Sundarbans copy describes tide and habitat/shoreline review. All operational backscatter labels are **VV/VH**. Generated HH examples remain in the model workspaces.

Links to Observatory and Decision Desk carry the region, selected comparison and finding. Evidence JSON includes the selected run, pair-specific acquisitions, metrics, geometry, QC, available decision context and field metadata. Field records are local and await independent review; photos are not silently embedded in this export.

## Reproducible generated experiments

The original model algorithms and seeds are retained:

- 720 generated examples, 180 per class, sample seed 2609.
- Stratified split seed 2031, using the existing per-class floor cutoffs: **500 training, 112 validation, 108 test** examples.
- 31 bootstrap CART trees, seed 941; two randomly selected inputs per split.
- Temporal MLP 4 → 16 → 8 → 4, seed 4021; ReLU hidden units, softmax output, mini-batch SGD and validation-loss early stopping.

Both models receive the same scenario parameters. The forest uses the raw feature vector. The MLP normalizes pre/event HH, derives a follow-up HH value from persistence by averaging linear power and converting to dB, and encodes the stage index. The derived T2 is not an independently measured acquisition. Follow-up information cannot support an event-time forecast.

The playground now compares both model outputs simultaneously. Top-score agreement/disagreement is explicit, along with each raw score distribution and the selected review threshold. Random Forest tree-vote share and MLP softmax score are not labelled as calibrated probabilities. Comparison with the original experiment shows output changes from the original input.

Save/restore uses `fluvisar-intelligence-experiments-v1` in localStorage, retaining up to eight named experiments. Snapshots include features, scene perturbations, model choice, review cutoffs, speckle looks/seed, CUSUM settings, novelty percentile, component filtering, selective-review cutoff and inspected training epoch. JSON export includes the settings, seeds, split sizes and both model outputs. Reset restores the original scenario and diagnostic defaults. No observations are invented or uploaded by this feature.

Diagnostic panels load on first visit, then retain their state while switching workspace tabs. A five-step walkthrough covers scenario choice, pixel inspection, model comparison, speckle noise and review decisions.

## Presentation and consistency

The page shares Decision Desk surfaces and theme tokens. All diagnostic rows use the same outer container and gutter. Legacy 920/1080-pixel width limits are overridden within this route. The MLP training columns and evaluation cards have consistent column boundaries and spacing; diagram labels and charts are enlarged. Desktop uses adjacent visualization/inspector panes; mobile stacks them without page overflow. Existing modules are scoped to the new workspace to prevent style changes elsewhere.

## Interpretation boundaries

Real satellite screening and generated-data model diagnostics are separate evidence classes. Generated accuracy/F1, class-score entropy, novelty distances and stress-test frequencies do not establish real-case classification accuracy. Independent labels, appropriate spatial/temporal validation and calibration would be required before a deployed real-data model evaluation.

## Verification

`apps/web/tests/intelligence-workspace.spec.ts` checks both regions, acquisition identity, numerical summaries, real-pair export/handoff consistency, saved settings, model-score normalization, every retained diagnostic, the walkthrough, desktop panel alignment and mobile light-theme overflow.

The existing public-route smoke test now expects measured evidence as the default entry point and the model playground to remain explicitly synthetic.
