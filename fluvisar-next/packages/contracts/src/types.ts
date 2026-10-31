/**
 * AUTO-GENERATED from Pydantic Models (plan.md Section 15).
 * DO NOT EDIT MANUALLY. Run python generate_schemas.py to update.
 */

export type Origin =
  | 'source-observation'
  | 'derived-observation'
  | 'modeled-scenario'
  | 'educational-simulation'
  | 'external-reference';

export type Assessment = 'supported' | 'limited' | 'inconclusive' | 'refuted';
export type ReviewState = 'unreviewed' | 'awaiting-review' | 'reviewed';
export type CheckStatus = 'pass' | 'warn' | 'fail' | 'not-evaluated' | 'not-applicable';
export type ReadinessState =
  | 'not-searched'
  | 'metadata-found'
  | 'access-required'
  | 'downloaded'
  | 'inspected'
  | 'processed'
  | 'evaluated'
  | 'unsuitable'
  | 'unavailable';

export interface BilingualText {
  en: string;
  bn: string;
}

export interface Region {
  id: string;
  name: BilingualText;
  search_bbox: [number, number, number, number];
  centre: [number, number];
  study_geometry?: Record<string, any> | null;
  preferred_analysis_crs: string;
  case_ids: string[];
  views: string[];
  capabilities: Record<string, string>;
  readiness: ReadinessState;
}

export interface Case {
  id: string;
  region_id: string;
  question: BilingualText;
  goal: BilingualText;
  pilot_unit_ids: string[];
  approved_run_ids: string[];
  default_view: string;
}

export interface Observation {
  id: string;
  source_collection: string;
  item_id: string;
  acquisition_start_utc: string;
  acquisition_end_utc: string;
  sensor: string;
  product_maturity: string;
  track?: string | null;
  direction?: string | null;
  frame?: string | null;
  mode?: string | null;
  available_terms: string[];
  crs: string;
  safe_source_link: string;
  readiness: ReadinessState;
}

export interface LayerArtifact {
  id: string;
  run_id: string;
  kind: 'raster' | 'vector' | 'pmtiles' | 'mask' | 'thumbnail';
  render_url: string;
  numeric_artifact_id?: string | null;
  bounds: [number, number, number, number];
  source_ids: string[];
  dates: string[];
  unit: string;
  legend: Record<string, any>;
  nodata_policy: string;
  content_hash: string;
}

export interface SensitivitySummary {
  min: number;
  max: number;
  unit: string;
  variant_family_id: string;
  evaluated_variant_count: number;
}

export interface Metric {
  id: string;
  value: number | null;
  unit: string;
  definition_id: string;
  run_id: string;
  input_ids: string[];
  observation_ids: string[];
  support_id: string;
  origin: Origin;
  reason?: string | null;
  sensitivity?: SensitivitySummary | null;
}

export interface Finding {
  id: string;
  run_id: string;
  geometry: Record<string, any>;
  category: string;
  pair_observation_ids: [string, string];
  metric_ids: string[];
  claim_ids: string[];
}

export interface Claim {
  id: string;
  statement: BilingualText;
  metric_ids: string[];
  finding_id?: string | null;
  run_id: string;
  origin: Origin;
  assessment: Assessment;
  supporting_evidence_ids: string[];
  conflicting_evidence_ids: string[];
  missing_evidence_ids: string[];
  review_state: ReviewState;
  revision_id: string;
}

export interface AnalysisRun {
  id: string;
  region_id: string;
  case_id: string;
  input_ids: string[];
  input_hashes: Record<string, string>;
  config_hash: string;
  code_version: string;
  method_version: string;
  created_at_utc: string;
  artifact_ids: string[];
  metric_ids: string[];
  evaluation_state: 'not-evaluated' | 'limited' | 'evaluated' | 'unsuitable';
}

export interface QualityCheck {
  id: string;
  group:
    | 'product-geometry'
    | 'alignment'
    | 'classification-sensitivity'
    | 'hydrological-context'
    | 'subsequent-observations'
    | 'independent-comparison'
    | 'controls-plausibility';
  status: CheckStatus;
  name: string;
  reason: string;
  impact_on_claim: string;
}

export interface DecisionScenario {
  id: string;
  base_run_id: string;
  objective: string;
  declared_alternatives: Record<string, any>;
  actual_inputs: string[];
  scenario_inputs: string[];
  outputs: Record<string, any>;
  assumption_receipt: Record<string, any>;
}

export interface EvidenceRecord {
  id: string;
  source_type: 'field-photo' | 'gauge-csv' | 'interviewer-note' | 'satellite-crosscheck' | 'reference-map';
  target_claim_id: string;
  observation_time_utc?: string | null;
  geometry?: Record<string, any> | null;
  media_url?: string | null;
  answer?: string | null;
  attribution: string;
  quality: Record<string, any>;
  permissions: string;
  review_state: ReviewState;
}

export interface RevisionEvent {
  id: string;
  claim_id: string;
  reviewer_identity: string;
  evidence_ids: string[];
  old_assessment: Assessment;
  new_assessment: Assessment;
  rationale: string;
  timestamp_utc: string;
  superseded_revision_id?: string | null;
}

export interface StoryStep {
  step_index: number;
  camera: Record<string, any>;
  active_layer_ids: string[];
  focused_finding_id?: string | null;
  narrative: BilingualText;
}

export interface Story {
  id: string;
  chapter_number: number;
  region_id: string;
  case_id: string;
  run_id: string;
  title: BilingualText;
  steps: StoryStep[];
  published: boolean;
}

export interface FieldTask {
  id: string;
  region_id: string;
  case_id: string;
  run_id: string;
  finding_id?: string | null;
  question: BilingualText;
  target_dates: string[];
  target_geometry: Record<string, any>;
  structured_answers: string[];
  guide: BilingualText;
  pack_version: string;
  lifecycle: 'open' | 'in-progress' | 'submitted' | 'reviewed' | 'closed';
}
