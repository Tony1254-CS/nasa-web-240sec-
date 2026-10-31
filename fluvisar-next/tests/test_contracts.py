"""
Tests for Canonical Data Contracts & Invariants.
Authority: plan.md Section 15 & Section 20.1
"""

import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "packages" / "contracts"))

import models

def test_models_import_and_schema():
    assert models.Region is not None
    assert models.Observation is not None
    assert models.LayerArtifact is not None
    assert models.AnalysisRun is not None
    assert models.Finding is not None
    assert models.Metric is not None
    assert models.Claim is not None

def test_json_schemas_exist():
    schemas_dir = BASE_DIR / "packages" / "contracts" / "schemas"
    assert schemas_dir.exists()
    index_file = schemas_dir / "index.json"
    assert index_file.exists()
    with open(index_file, "r", encoding="utf-8") as f:
        schemas = json.load(f)
    assert len(schemas) == 16
    assert "Region" in schemas
    assert "Observation" in schemas
    assert "Metric" in schemas

def test_metric_validation_rule():
    # Per plan.md Section 15.2: value null requires a reason
    metric = models.Metric(
        id="M-01",
        value=None,
        unit="dB",
        definition_id="mean-backscatter",
        run_id="run-1",
        support_id="ROI-1",
        origin=models.Origin.DERIVED_OBSERVATION,
        reason="Cloud mask obscured support"
    )
    assert metric.value is None
    assert metric.reason == "Cloud mask obscured support"

    try:
        models.Metric(
            id="M-02",
            value=None,
            unit="dB",
            definition_id="mean-backscatter",
            run_id="run-1",
            support_id="ROI-1",
            origin=models.Origin.DERIVED_OBSERVATION,
            reason=None
        )
        assert False, "Should have failed validation when both value and reason are null"
    except ValueError:
        pass

def test_region_configs_parseable():
    from ruamel.yaml import YAML
    yaml = YAML(typ='safe')
    for region_id in ["jamuna", "sundarbans"]:
        cfg_path = BASE_DIR / "configs" / "regions" / f"{region_id}.yaml"
        assert cfg_path.exists()
        with open(cfg_path, "r", encoding="utf-8") as f:
            data = yaml.load(f)
        assert data["id"] == region_id
        assert len(data["search_bbox"]) == 4
        assert len(data["centre"]) == 2
        assert len(data["views"]) >= 4

if __name__ == "__main__":
    test_models_import_and_schema()
    test_json_schemas_exist()
    test_metric_validation_rule()
    test_region_configs_parseable()
    print("All contract unit tests PASSED successfully.")
