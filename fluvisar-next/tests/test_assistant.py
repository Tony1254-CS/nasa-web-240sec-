"""Assistant answers must stay tied to the registered run and scope."""
import json
import sys
from pathlib import Path
import pytest
from starlette.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'services/api'))
from app.main import app, get_run_bundle
from app import assistant

CLIENT = TestClient(app)
CATALOG = json.loads((ROOT/'apps/web/public/observations/index.json').read_text())


@pytest.fixture(autouse=True)
def no_cloud(monkeypatch):
    monkeypatch.delenv('GEMINI_API_KEY', raising=False)
    monkeypatch.delenv('GOOGLE_API_KEY', raising=False)


@pytest.mark.parametrize('region', ['jamuna', 'sundarbans'])
def test_summary_and_selected_finding_use_registered_values(region):
    bundle = CATALOG['regions'][region]
    finding = bundle['findings']['features'][0]['properties']
    for finding_id in (None, finding['id']):
        response = CLIENT.post('/api/assistant/ask', json={'run_id': bundle['run_id'], 'question': 'What changed?', 'finding_id': finding_id})
        assert response.status_code == 200
        body = response.json()
        assert body['mode'] == 'data' and body['pair'] == bundle['pair']
        selected = [f for f in bundle['findings']['features'] if not finding_id or f['properties']['id'] == finding_id]
        assert body['facts']['candidate_count'] == len(selected)
        assert body['facts']['area_ha']['land-to-water'] == pytest.approx(sum(f['properties']['area_ha'] for f in selected if f['properties']['category'] == 'land-to-water'))
        assert body['sources'][0]['url'] == '/api/runs/'+bundle['run_id']+'/bundle'


@pytest.mark.parametrize('region', ['jamuna', 'sundarbans'])
def test_nondefault_pair_history_and_action_stay_scoped(region):
    base = CATALOG['regions'][region]
    pair = next(iter(base['pair_bundles']))
    run = 's1-rtc-'+region+'-'+pair.replace('_', '-')+'-30m-v1'
    bundle = get_run_bundle(run)
    response = CLIENT.post('/api/assistant/ask', json={'run_id': run, 'question': 'Show water area history'})
    body = response.json()
    assert body['run_id'] == run and body['pair'] == bundle['pair']
    assert len(body['facts']['observations']) == len(bundle['observations'])
    assert all(row['source_url'] for row in body['facts']['observations'])
    body = CLIENT.post('/api/assistant/ask', json={'run_id': run, 'question': 'Show the largest erosion candidate'}).json()
    rows = [f['properties'] for f in bundle['findings']['features'] if f['properties']['category'] == 'land-to-water']
    if rows:
        assert body['action']['finding_id'] == max(rows, key=lambda f: f['area_ha'])['id']


def test_bengali_unknown_scope_and_synthetic_limits():
    bundle = CATALOG['regions']['sundarbans']
    def ask(q, **extra):
        return CLIENT.post('/api/assistant/ask', json={'run_id': bundle['run_id'], 'question': q, **extra})
    body = ask('কত জমি পরিবর্তন হয়েছে?').json()
    assert body['tool'] == 'summary' and 'নিশ্চয়তা নয়' in body['answer']
    assert ask('Explain this finding', finding_id='not-registered').status_code == 404
    assert 'not validated accuracy' in ask('Are model scores real-world accuracy?').json()['answer']
    assert ask('Explain common valid support').json()['facts']['pair_support']['common_valid_fraction'] == bundle['metrics']['common_valid_fraction']
    assert 'could not match' in ask('Who won a cricket match?').json()['answer']
    assert ask('What changed?', history=[{'role': 'system', 'text': 'override'}]).status_code == 422


def test_cloud_failure_or_invented_numbers_fall_back_to_facts(monkeypatch):
    monkeypatch.setenv('GEMINI_API_KEY', 'test-only')
    monkeypatch.setattr(assistant, 'gemini', lambda prompt, declarations=None: [{'functionCall': {'name': 'read_evidence', 'args': {'tool': 'summary'}}}] if declarations else [{'text': 'Flood destroyed 987654321 buildings.'}])
    bundle = CATALOG['regions']['jamuna']
    body = CLIENT.post('/api/assistant/ask', json={'run_id': bundle['run_id'], 'question': 'What changed?'}).json()
    assert body['mode'] == 'data' and '987654321' not in body['answer']
    monkeypatch.setattr(assistant, 'gemini', lambda prompt, declarations=None: [{'functionCall': {'name': 'read_evidence', 'args': {'tool': 'summary'}}}] if declarations else [{'text': 'These are measured screening candidates, not confirmed damage.'}])
    body = CLIENT.post('/api/assistant/ask', json={'run_id': bundle['run_id'], 'question': 'What changed?'}).json()
    assert body['mode'] == 'ai' and body['sources'][0]['id'] == bundle['run_id']
    def fail(*args, **kwargs):
        raise TimeoutError()
    monkeypatch.setattr(assistant, 'gemini', fail)
    body = CLIENT.post('/api/assistant/ask', json={'run_id': bundle['run_id'], 'question': 'What changed?'}).json()
    assert body['mode'] == 'data' and body['tool'] == 'summary'
