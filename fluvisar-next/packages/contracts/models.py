"""
FluviSAR Canonical Data Contracts
Authority: plan.md Version 2.0 (Sections 15.1, 15.2)
"""

from enum import Enum
from typing import Any, Dict, List, Literal, Optional, Tuple, Union
from pydantic import BaseModel, Field, model_validator


# --- Shared Enums & Literals ---

class Origin(str, Enum):
    SOURCE_OBSERVATION = "source-observation"
    DERIVED_OBSERVATION = "derived-observation"
    MODELED_SCENARIO = "modeled-scenario"
    EDUCATIONAL_SIMULATION = "educational-simulation"
    EXTERNAL_REFERENCE = "external-reference"


class Assessment(str, Enum):
    SUPPORTED = "supported"
    LIMITED = "limited"
    INCONCLUSIVE = "inconclusive"
    REFUTED = "refuted"


class ReviewState(str, Enum):
    UNREVIEWED = "unreviewed"
    AWAITING_REVIEW = "awaiting-review"
    REVIEWED = "reviewed"


class CheckStatus(str, Enum):
    PASS = "pass"
    WARN = "warn"
    FAIL = "fail"
    NOT_EVALUATED = "not-evaluated"
    NOT_APPLICABLE = "not-applicable"


class ReadinessState(str, Enum):
    NOT_SEARCHED = "not-searched"
    METADATA_FOUND = "metadata-found"
    ACCESS_REQUIRED = "access-required"
    DOWNLOADED = "downloaded"
    INSPECTED = "inspected"
    PROCESSED = "processed"
    EVALUATED = "evaluated"
    UNSUITABLE = "unsuitable"
    UNAVAILABLE = "unavailable"


# --- Bilingual Text Support ---

class BilingualText(BaseModel):
    en: str = Field(..., description="English text")
    bn: str = Field(..., description="Reviewed Bangla text in Noto Sans Bengali")


# --- Entities ---

class Region(BaseModel):
    id: str = Field(..., description="Unique region identifier: jamuna or sundarbans")
    name: BilingualText = Field(..., description="Bilingual region name")
    search_bbox: Tuple[float, float, float, float] = Field(
        ..., description="[west, south, east, north] discovery window in EPSG:4326"
    )
    centre: Tuple[float, float] = Field(..., description="Initial map centre [longitude, latitude]")
    study_geometry: Optional[Dict[str, Any]] = Field(None, description="Approved pilot polygon GeoJSON")
    preferred_analysis_crs: str = Field("EPSG:32645", description="Target projected CRS (UTM 45N)")
    case_ids: List[str] = Field(default_factory=list, description="Associated case identifiers")
    views: List[str] = Field(default_factory=list, description="Available view modes (e.g. J1, J2, S1)")
    capabilities: Dict[str, str] = Field(default_factory=dict, description="Capabilities and readiness mapping")
    readiness: ReadinessState = Field(ReadinessState.METADATA_FOUND, description="Overall region input readiness")


class Case(BaseModel):
    id: str = Field(..., description="Case identifier e.g. river-memory or wetland-pulse")
    region_id: str = Field(..., description="Parent region ID")
    question: BilingualText = Field(..., description="Plain human question for the case")
    goal: BilingualText = Field(..., description="Investigation objective")
    pilot_unit_ids: List[str] = Field(default_factory=list, description="Approved pilot/char unit IDs")
    approved_run_ids: List[str] = Field(default_factory=list, description="Immutable run IDs attached to this case")
    default_view: str = Field(..., description="Default map view mode: J1, J2, J3, S1, S2, X1, C1")


class Observation(BaseModel):
    id: str = Field(..., description="Unique observation ID")
    source_collection: str = Field(..., description="Collection short name e.g. NISAR_L2_GCOV_PROVISIONAL_V1")
    item_id: str = Field(..., description="Source granule / asset identifier")
    acquisition_start_utc: str = Field(..., description="ISO 8601 acquisition start time in UTC")
    acquisition_end_utc: str = Field(..., description="ISO 8601 acquisition end time in UTC")
    sensor: str = Field(..., description="Sensor/instrument name e.g. NISAR-L, Sentinel-2A")
    product_maturity: str = Field("PROVISIONAL_V1", description="Product maturity/version")
    track: Optional[str] = Field(None, description="Orbit track identifier")
    direction: Optional[str] = Field(None, description="Ascending (A) or Descending (D)")
    frame: Optional[str] = Field(None, description="Frame number")
    mode: Optional[str] = Field(None, description="Acquisition mode (e.g. DHDH, QPDH)")
    available_terms: List[str] = Field(default_factory=list, description="Available polarization / covariance terms")
    crs: str = Field("EPSG:32645", description="Spatial reference system")
    safe_source_link: str = Field(..., description="Safe, credential-free resolvable source URL")
    readiness: ReadinessState = Field(ReadinessState.METADATA_FOUND)


class LayerArtifact(BaseModel):
    id: str = Field(..., description="Layer artifact identifier")
    run_id: str = Field(..., description="Parent analysis run ID")
    kind: Literal["raster", "vector", "pmtiles", "mask", "thumbnail"] = Field(..., description="Layer kind")
    render_url: str = Field(..., description="Relative URL to renderable tile / GeoJSON")
    numeric_artifact_id: Optional[str] = Field(None, description="Reference to backend numeric COG for sampling")
    bounds: Tuple[float, float, float, float] = Field(..., description="[west, south, east, north] bounds")
    source_ids: List[str] = Field(default_factory=list, description="Source observation IDs")
    dates: List[str] = Field(default_factory=list, description="Acquisition dates represented")
    unit: str = Field(..., description="Measurement unit (e.g. dB, ratio, class)")
    legend: Dict[str, Any] = Field(default_factory=dict, description="Color ramp and class labels")
    nodata_policy: str = Field("masked", description="Policy for invalid/unobserved support")
    content_hash: str = Field(..., description="SHA-256 integrity hash")


class SensitivitySummary(BaseModel):
    min: float = Field(..., description="Minimum value across evaluated variants")
    max: float = Field(..., description="Maximum value across evaluated variants")
    unit: str = Field(..., description="Measurement unit")
    variant_family_id: str = Field(..., description="Tested parameter family (e.g. water-sensitivity)")
    evaluated_variant_count: int = Field(..., description="Number of parameter variants evaluated")


class Metric(BaseModel):
    id: str = Field(..., description="Unique metric identifier")
    value: Optional[float] = Field(None, description="Numeric value, null if reason is provided")
    unit: str = Field(..., description="Measurement unit")
    definition_id: str = Field(..., description="Method / calculation definition ID")
    run_id: str = Field(..., description="Analysis run ID")
    input_ids: List[str] = Field(default_factory=list, description="Input artifact IDs")
    observation_ids: List[str] = Field(default_factory=list, description="Source observation IDs")
    support_id: str = Field(..., description="Polygon or spatial support ID")
    origin: Origin = Field(..., description="Origin taxonomy of this quantity")
    reason: Optional[str] = Field(None, description="Reason if value is null")
    sensitivity: Optional[SensitivitySummary] = Field(None, description="Evaluated parameter sensitivity")

    @model_validator(mode="after")
    def validate_value_or_reason(self):
        if self.value is None and not self.reason:
            raise ValueError("When value is null, an explicit reason must be provided.")
        return self


class Finding(BaseModel):
    id: str = Field(..., description="Immutable finding identifier e.g. J-2026-F01")
    run_id: str = Field(..., description="Analysis run ID")
    geometry: Dict[str, Any] = Field(..., description="GeoJSON Polygon/MultiPolygon of the candidate finding")
    category: str = Field(..., description="Candidate category e.g. land-to-water-candidate")
    pair_observation_ids: Tuple[str, str] = Field(..., description="[date_a_obs_id, date_b_obs_id]")
    metric_ids: List[str] = Field(default_factory=list, description="Associated metric IDs")
    claim_ids: List[str] = Field(default_factory=list, description="Associated claim IDs")


class Claim(BaseModel):
    id: str = Field(..., description="Claim identifier")
    statement: BilingualText = Field(..., description="Precise factual statement")
    metric_ids: List[str] = Field(default_factory=list, description="Supporting metric IDs")
    finding_id: Optional[str] = Field(None, description="Associated finding ID")
    run_id: str = Field(..., description="Parent run ID")
    origin: Origin = Field(..., description="Observation, scenario, or reference origin")
    assessment: Assessment = Field(Assessment.INCONCLUSIVE, description="Current scientific assessment")
    supporting_evidence_ids: List[str] = Field(default_factory=list)
    conflicting_evidence_ids: List[str] = Field(default_factory=list)
    missing_evidence_ids: List[str] = Field(default_factory=list)
    review_state: ReviewState = Field(ReviewState.UNREVIEWED)
    revision_id: str = Field("rev-1", description="Current revision identifier")


class AnalysisRun(BaseModel):
    id: str = Field(..., description="Immutable run ID e.g. run-2026-10-31-01")
    region_id: str = Field(..., description="Target region ID")
    case_id: str = Field(..., description="Target case ID")
    input_ids: List[str] = Field(default_factory=list, description="Granule IDs and configuration inputs")
    input_hashes: Dict[str, str] = Field(default_factory=dict, description="Input content hashes")
    config_hash: str = Field(..., description="SHA-256 of configuration parameters")
    code_version: str = Field(..., description="Git commit SHA or release tag")
    method_version: str = Field("1.0.0", description="Methodology version")
    created_at_utc: str = Field(..., description="Creation timestamp in UTC")
    artifact_ids: List[str] = Field(default_factory=list, description="Output layer artifact IDs")
    metric_ids: List[str] = Field(default_factory=list, description="Calculated metric IDs")
    evaluation_state: Literal["not-evaluated", "limited", "evaluated", "unsuitable"] = Field(
        "not-evaluated", description="Scientific validation state"
    )


class QualityCheck(BaseModel):
    id: str = Field(..., description="Check identifier e.g. CHK-GEOM-01")
    group: Literal[
        "product-geometry",
        "alignment",
        "classification-sensitivity",
        "hydrological-context",
        "subsequent-observations",
        "independent-comparison",
        "controls-plausibility"
    ] = Field(..., description="One of the 7 documented check groups")
    status: CheckStatus = Field(..., description="pass, warn, fail, not-evaluated, not-applicable")
    name: str = Field(..., description="Human-readable check name")
    reason: str = Field(..., description="Detailed diagnostic reason")
    impact_on_claim: str = Field(..., description="Consequence if this check warns or fails")


class DecisionScenario(BaseModel):
    id: str = Field(..., description="Unique scenario ID")
    base_run_id: str = Field(..., description="Immutable baseline run ID")
    objective: str = Field(..., description="Planning objective e.g. inspection-shortlist")
    declared_alternatives: Dict[str, Any] = Field(default_factory=dict, description="Tested alternative assumptions")
    actual_inputs: List[str] = Field(default_factory=list, description="Observed real input IDs")
    scenario_inputs: List[str] = Field(default_factory=list, description="Hypothetical input descriptions")
    outputs: Dict[str, Any] = Field(default_factory=dict, description="Recomputed decision consequences")
    assumption_receipt: Dict[str, Any] = Field(
        default_factory=dict, description="Exact record of changed inputs and decision flip"
    )


class EvidenceRecord(BaseModel):
    id: str = Field(..., description="Unique evidence ID")
    source_type: Literal["field-photo", "gauge-csv", "interviewer-note", "satellite-crosscheck", "reference-map"]
    target_claim_id: str = Field(..., description="Claim this evidence addresses")
    observation_time_utc: Optional[str] = Field(None, description="Actual time of field observation")
    geometry: Optional[Dict[str, Any]] = Field(None, description="Location GeoJSON Point")
    media_url: Optional[str] = Field(None, description="Relative URL to media file if applicable")
    answer: Optional[str] = Field(None, description="Structured answer or measurement")
    attribution: str = Field(..., description="Author or observer attribution")
    quality: Dict[str, Any] = Field(default_factory=dict, description="GPS accuracy, sensor info, etc.")
    permissions: str = Field("public-use", description="License or consent record")
    review_state: ReviewState = Field(ReviewState.AWAITING_REVIEW)


class RevisionEvent(BaseModel):
    id: str = Field(..., description="Revision event ID")
    claim_id: str = Field(..., description="Target claim ID")
    reviewer_identity: str = Field(..., description="Reviewer name or role")
    evidence_ids: List[str] = Field(default_factory=list, description="Evidence triggering the revision")
    old_assessment: Assessment = Field(...)
    new_assessment: Assessment = Field(...)
    rationale: str = Field(..., description="Detailed justification for revision")
    timestamp_utc: str = Field(...)
    superseded_revision_id: Optional[str] = Field(None)


class StoryStep(BaseModel):
    step_index: int = Field(..., description="Step order in chapter")
    camera: Dict[str, Any] = Field(..., description="Map camera: center [lon, lat], zoom, pitch, bearing")
    active_layer_ids: List[str] = Field(default_factory=list, description="Layers enabled in this step")
    focused_finding_id: Optional[str] = Field(None, description="Finding to highlight")
    narrative: BilingualText = Field(..., description="Story narrative")


class Story(BaseModel):
    id: str = Field(..., description="Story chapter ID e.g. chapter-1-river-memory")
    chapter_number: int = Field(..., ge=1, le=5, description="One of the Five localized dances (1-5)")
    region_id: str = Field(..., description="jamuna or sundarbans")
    case_id: str = Field(..., description="Associated case ID")
    run_id: str = Field(..., description="Associated run ID")
    title: BilingualText = Field(...)
    steps: List[StoryStep] = Field(default_factory=list)
    published: bool = Field(False)


class FieldTask(BaseModel):
    id: str = Field(..., description="Task ID e.g. TASK-J01")
    region_id: str = Field(...)
    case_id: str = Field(...)
    run_id: str = Field(...)
    finding_id: Optional[str] = Field(None)
    question: BilingualText = Field(...)
    target_dates: List[str] = Field(default_factory=list)
    target_geometry: Dict[str, Any] = Field(...)
    structured_answers: List[str] = Field(default_factory=list)
    guide: BilingualText = Field(...)
    pack_version: str = Field("1.0.0")
    lifecycle: Literal["open", "in-progress", "submitted", "reviewed", "closed"] = Field("open")

