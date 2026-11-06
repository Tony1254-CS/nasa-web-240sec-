export type ReachId = string;
export type Name = string;
export type River = string;
export type Bbox = number[];
export type Verdict = "SUPPORTED" | "LIMITED" | "INCONCLUSIVE";
export type DataFrozenAt = string;
export type BundleVersion = string;
export type Reaches = ReachListItem[];
export type ReachId1 = string;
export type Name1 = string;
export type River1 = string;
export type Bbox1 = number[];
export type CrsAnalysis = string;
export type RelativeOrbit = number | null;
export type Direction = "A" | "D" | null;
export type Frame = number | null;
export type Date = string;
export type AcqUtc = string;
export type Status = "ok" | "rfi" | "rejected" | "implausible";
export type StageM = number | null;
export type StageSource = "FFWC" | "proxy" | "null";
export type Dates = AcquisitionStatus[];
export type T0 = string;
export type T1 = string;
export type Type = "equal_stage" | "later_lower" | "unavailable" | "compatible_orbit";
export type DhM = number | null;
export type Verdict1 = "SUPPORTED" | "LIMITED" | "INCONCLUSIVE";
export type VerdictReasons = string[];
export type HeadlineMetricId = string;
export type ReachId2 = string;
export type GeneratedAt = string;
export type CodeCommit = string;
export type Id = string;
export type Label = string;
export type Value = number;
export type Low = number | null;
export type High = number | null;
export type Unit = string;
export type Definition = string | null;
export type MethodRef = string | null;
export type Inputs = InputInfo[] | null;
export type Kind = string;
export type Granule = string | null;
export type AcqUtc1 = string | null;
export type Layer = string | null;
export type Doi = string | null;
export type Station = string | null;
export type ValueM = number | null;
export type TimeLocal = string | null;
export type SourceUrl = string | null;
export type ThresholdDbT0 = number | null;
export type ThresholdDbT1 = number | null;
export type MedianFilter = number | null;
export type MmuPx = number | null;
export type HandMaxM = number | null;
export type PixelAreaM2 = number | null;
export type PixelCount = number | null;
export type QcRefs = string[] | null;
export type Metrics = Metric[];
export type Id1 = string;
export type Name2 = string;
export type River2 = string;
export type DangerLevelM = number | null;
export type Source = string;
export type T = string;
export type H = number;
export type Series = SeriesPoint[];
export type Date1 = string;
export type T2 = string;
export type H1 = number;
export type Status1 = string;
export type Acquisitions = AcqPoint[];
export type Mode = "gauge" | "proxy" | "unavailable";
export type Id2 = string;
export type Label1 = string | null;
export type Value1 = number | null;
export type Unit1 = string | null;
export type Status2 = "PASS" | "WARN" | "FAIL" | "NOT_EVALUATED" | "INFO";
export type Rule = string | null;
export type Explanation = string | null;
export type Inputs1 = InputInfo[] | null;
export type Checks = QCCheck[];
export type Coordinates = number[][];
export type Id3 = string;
export type Class = "erosion" | "accretion";
export type AreaHa = number;
export type PixelCount1 = number | null;
export type T01 = string;
export type T11 = string;
export type ConfirmedByDswx = boolean | null;
export type Centroid = number[];
export type NearestPlace = string | null;
export type InCegisReach = string | null;

export interface AllModels {
  reaches: Reaches;
  reach: ReachDetail;
  manifest: Manifest;
  stage: Stage;
  qc: QC;
  bounds: Bounds;
  erosion_props: ErosionProperties;
  [k: string]: unknown;
}
export interface ReachListItem {
  reach_id: ReachId;
  name: Name;
  river: River;
  bbox: Bbox;
  verdict: Verdict;
  data_frozen_at: DataFrozenAt;
  bundle_version: BundleVersion;
  [k: string]: unknown;
}
export interface ReachDetail {
  reach_id: ReachId1;
  name: Name1;
  river: River1;
  bbox: Bbox1;
  crs_analysis: CrsAnalysis;
  track: Track;
  dates: Dates;
  primary_pair: PrimaryPair;
  verdict: Verdict1;
  verdict_reasons: VerdictReasons;
  headline_metric_id: HeadlineMetricId;
  [k: string]: unknown;
}
export interface Track {
  relative_orbit: RelativeOrbit;
  direction: Direction;
  frame: Frame;
  [k: string]: unknown;
}
export interface AcquisitionStatus {
  date: Date;
  acq_utc: AcqUtc;
  status: Status;
  stage_m: StageM;
  stage_source: StageSource;
  [k: string]: unknown;
}
export interface PrimaryPair {
  t0: T0;
  t1: T1;
  type: Type;
  dh_m: DhM;
  [k: string]: unknown;
}
export interface Manifest {
  reach_id: ReachId2;
  generated_at: GeneratedAt;
  code_commit: CodeCommit;
  metrics: Metrics;
  [k: string]: unknown;
}
export interface Metric {
  id: Id;
  label: Label;
  value: Value;
  low?: Low;
  high?: High;
  unit: Unit;
  definition?: Definition;
  method_ref?: MethodRef;
  inputs?: Inputs;
  params?: Params | null;
  pixel_area_m2?: PixelAreaM2;
  pixel_count?: PixelCount;
  qc_refs?: QcRefs;
  [k: string]: unknown;
}
export interface InputInfo {
  kind: Kind;
  granule?: Granule;
  acq_utc?: AcqUtc1;
  layer?: Layer;
  doi?: Doi;
  station?: Station;
  value_m?: ValueM;
  time_local?: TimeLocal;
  source_url?: SourceUrl;
  [k: string]: unknown;
}
export interface Params {
  threshold_db_t0?: ThresholdDbT0;
  threshold_db_t1?: ThresholdDbT1;
  median_filter?: MedianFilter;
  mmu_px?: MmuPx;
  hand_max_m?: HandMaxM;
  [k: string]: unknown;
}
export interface Stage {
  station: Station1;
  series: Series;
  acquisitions: Acquisitions;
  mode: Mode;
  [k: string]: unknown;
}
export interface Station1 {
  id: Id1;
  name: Name2;
  river: River2;
  danger_level_m?: DangerLevelM;
  source: Source;
  [k: string]: unknown;
}
export interface SeriesPoint {
  t: T;
  h: H;
  [k: string]: unknown;
}
export interface AcqPoint {
  date: Date1;
  t: T2;
  h: H1;
  status: Status1;
  [k: string]: unknown;
}
export interface QC {
  checks: Checks;
  [k: string]: unknown;
}
export interface QCCheck {
  id: Id2;
  label?: Label1;
  value?: Value1;
  unit?: Unit1;
  status: Status2;
  rule?: Rule;
  explanation?: Explanation;
  inputs?: Inputs1;
  [k: string]: unknown;
}
export interface Bounds {
  coordinates: Coordinates;
  [k: string]: unknown;
}
export interface ErosionProperties {
  id: Id3;
  class: Class;
  area_ha: AreaHa;
  pixel_count: PixelCount1;
  t0: T01;
  t1: T11;
  confirmed_by_dswx?: ConfirmedByDswx;
  centroid: Centroid;
  nearest_place?: NearestPlace;
  in_cegis_reach?: InCegisReach;
  [k: string]: unknown;
}

export interface ChangeFeature {
  type: "Feature";
  id?: string | number;
  geometry: { type: string; coordinates: unknown };
  properties: ErosionProperties;
}

export interface ChangeFeatureCollection {
  type: "FeatureCollection";
  features: ChangeFeature[];
}
