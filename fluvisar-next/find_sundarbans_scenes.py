import json
import urllib.request
from pathlib import Path

STAC_URL = 'https://earth-search.aws.element84.com/v1/search'
BBOX = [89.55, 21.75, 89.85, 22.00]

payload = json.dumps({
    'collections': ['sentinel-2-c1-l2a'],
    'bbox': BBOX,
    'datetime': '2024-01-01T00:00:00Z/2024-12-31T23:59:59Z',
    'limit': 100,
    'sortby': [{'field': 'properties.eo:cloud_cover', 'direction': 'asc'}]
}).encode('utf-8')

req = urllib.request.Request(STAC_URL, data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'FluviSAR/1.0'})
with urllib.request.urlopen(req, timeout=15) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    feats = data.get('features', [])
    print(f'Found {len(feats)} scenes for Sundarbans')
    scenes = []
    for f in feats:
        props = f['properties']
        tci = f['assets'].get('visual', {}).get('href') or f['assets'].get('tci', {}).get('href')
        bbox = f['bbox']
        # check if it fully encloses BBOX
        encloses = (bbox[0] <= BBOX[0] and bbox[1] <= BBOX[1] and bbox[2] >= BBOX[2] and bbox[3] >= BBOX[3])
        scenes.append({
            'id': f['id'],
            'date': props.get('datetime')[:10],
            'cloud': props.get('eo:cloud_cover'),
            'encloses': encloses,
            'url': tci
        })
    
    enclosing = [s for s in scenes if s['encloses']]
    print(f"Total enclosing scenes: {len(enclosing)}")
    for s in enclosing[:15]:
        print(s['date'], f"cloud: {s['cloud']:.2f}%", s['id'], s['url'])

    with open('fluvisar-next/sundarbans_scenes.json', 'w') as out:
        json.dump(enclosing, out, indent=2)
