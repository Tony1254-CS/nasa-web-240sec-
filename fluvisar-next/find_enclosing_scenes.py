import json
import urllib.request

JAMUNA_BBOX = [89.60, 25.40, 89.90, 25.75]

payload = json.dumps({
    'collections': ['sentinel-2-c1-l2a'],
    'bbox': JAMUNA_BBOX,
    'datetime': '2024-01-01T00:00:00Z/2024-12-31T23:59:59Z',
    'limit': 150,
    'sortby': [{'field': 'properties.eo:cloud_cover', 'direction': 'asc'}]
}).encode()

req = urllib.request.Request('https://earth-search.aws.element84.com/v1/search', data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'FluviSAR/1.0'})
res = urllib.request.urlopen(req)
feats = json.loads(res.read())['features']

full_scenes = []
for f in feats:
    coords = f['geometry']['coordinates'][0]
    min_lon = min(c[0] for c in coords)
    max_lon = max(c[0] for c in coords)
    min_lat = min(c[1] for c in coords)
    max_lat = max(c[1] for c in coords)
    
    # Strictly encloses Jamuna bounding box:
    if min_lon <= 89.60 and max_lon >= 89.90 and min_lat <= 25.40 and max_lat >= 25.75:
        dt = f['properties']['datetime'][:10]
        cloud = f['properties']['eo:cloud_cover']
        full_scenes.append({'id': f['id'], 'date': dt, 'cloud': cloud, 'url': f['assets']['visual']['href']})

print(f"Total scenes fully enclosing Jamuna AOI: {len(full_scenes)}")
for s in full_scenes:
    print(f"{s['date']} | {s['id']} | cloud={s['cloud']:.1f}%")

with open('c:/Users/sakib/OneDrive/Desktop/NASA-web/fluvisar-next/enclosing_scenes.json', 'w') as out:
    json.dump(full_scenes, out, indent=2)

