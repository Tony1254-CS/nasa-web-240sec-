"""Precompute all registered Decision Desk comparisons for immediate review."""
import json
import sys
import time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'services/api'))
from app.decision import decision_context

catalog=json.loads((ROOT/'apps/web/public/observations/index.json').read_text())
for region,bundle in catalog['regions'].items():
    runs=[bundle['run_id']]
    for path in bundle['pair_bundles'].values():
        pair=json.loads((ROOT/'apps/web/public'/path.lstrip('/')).read_text())
        runs.append(pair['run_id'])
    for run in dict.fromkeys(runs):
        started=time.monotonic()
        result=decision_context(run)
        print(run, 'candidates',len(result['candidate_review']),'seconds',round(time.monotonic()-started,2),flush=True)
