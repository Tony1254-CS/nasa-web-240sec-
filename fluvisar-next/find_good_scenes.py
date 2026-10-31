import json
import urllib.request
import rasterio
from rasterio.warp import transform_bounds
from rasterio.windows import from_bounds
import numpy as np

def check_scene(visual_url):
    try:
        with rasterio.open('/vsicurl/' + visual_url) as ds:
            bbox_proj = transform_bounds('EPSG:4326', ds.crs, 89.60, 25.40, 89.90, 25.75)
            win = from_bounds(*bbox_proj, transform=ds.transform)
            data = ds.read([1, 2, 3], window=win, out_shape=(3, 40, 40))
            zeros = np.all(data == 0, axis=0)
            return float(np.mean(zeros))
    except Exception as e:
        return 1.0

payload = json.dumps({
    'collections': ['sentinel-2-c1-l2a'],
    'bbox': [89.60, 25.40, 89.90, 25.75],
    'datetime': '2024-01-01T00:00:00Z/2024-12-31T23:59:59Z',
    'limit': 80,
    'sortby': [{'field': 'properties.eo:cloud_cover', 'direction': 'asc'}]
}).encode()

req = urllib.request.Request('https://earth-search.aws.element84.com/v1/search', data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'FluviSAR/1.0'})
res = urllib.request.urlopen(req)
feats = json.loads(res.read())['features']

print(f"Total candidate scenes: {len(feats)}")
good_scenes = []
for f in feats:
    cloud = f['properties'].get('eo:cloud_cover', 100)
    dt = f['properties'].get('datetime')[:10]
    visual_url = f.get('assets', {}).get('visual', {}).get('href')
    if not visual_url:
        continue
    z = check_scene(visual_url)
    if z == 0.0:
        print(f"MATCH: {f['id']} | Date: {dt} | Cloud: {cloud:.1f}%")
        good_scenes.append({'id': f['id'], 'date': dt, 'cloud': cloud, 'url': visual_url})
    if len(good_scenes) >= 12:
        break

print(f"\nFound {len(good_scenes)} scenes with 100% full rectangle coverage (0% black).")
with open('c:/Users/sakib/OneDrive/Desktop/NASA-web/fluvisar-next/good_scenes.json', 'w') as out:
    json.dump(good_scenes, out, indent=2)

