"""Archive real NASA rainfall and NISAR discovery records for the Decision Desk.

No credentials are required. NISAR browse imagery is qualitative context, never
substituted for the numerical Sentinel-1 observations used for change metrics.
"""
import hashlib
import json
from datetime import datetime, timezone, timedelta
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'apps/web/public'
CUTOFF = '2026-11-07'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def fetch_json(url, params, target):
    response = requests.get(url, params=params, timeout=90)
    response.raise_for_status()
    value = response.json()
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(response.content)
    return value, response.url, digest(target)


def run():
    catalogue = json.loads((PUBLIC / 'observations/index.json').read_text())
    for region, bundle in catalogue['regions'].items():
        raw = ROOT / 'data/raw' / region / 'decision-context'
        raw.mkdir(parents=True, exist_ok=True)
        west, south, east, north = bundle['bbox']
        start = (datetime.fromisoformat(min(o['date'] for o in bundle['observations'])) - timedelta(days=7)).strftime('%Y%m%d')
        end = max(o['date'] for o in bundle['observations']).replace('-', '')
        rain, rain_url, rain_hash = fetch_json('https://power.larc.nasa.gov/api/temporal/daily/point', {
            'parameters': 'IMERG_PRECTOT', 'community': 'AG', 'longitude': (west+east)/2,
            'latitude': (south+north)/2, 'start': start, 'end': end, 'format': 'JSON',
            'time-standard': 'UTC'}, raw / 'imerg.json')
        parameter = rain['properties']['parameter']['IMERG_PRECTOT']
        fill = rain['header']['fill_value']
        fallback, fallback_url, fallback_hash = fetch_json('https://power.larc.nasa.gov/api/temporal/daily/point', {
            'parameters': 'PRECTOTCORR', 'community': 'AG', 'longitude': (west+east)/2,
            'latitude': (south+north)/2, 'start': start, 'end': end, 'format': 'JSON',
            'time-standard': 'UTC'}, raw / 'geosit.json')
        fallback_rows = fallback['properties']['parameter']['PRECTOTCORR']
        rows = []
        for day, value in sorted(parameter.items()):
            imerg = value if value != fill and value >= 0 else None
            context_value = fallback_rows.get(day, -999)
            rows.append({'date': f'{day[:4]}-{day[4:6]}-{day[6:]}', 'imerg_mm': imerg,
                         'mm': imerg if imerg is not None else context_value if context_value >= 0 else None,
                         'source': 'IMERG' if imerg is not None else 'POWER_PRECTOTCORR'})
        records, search_url, search_hash = fetch_json('https://api.daac.asf.alaska.edu/services/search/param', {
            'platform': 'NISAR', 'processingLevel': 'GCOV', 'bbox': ','.join(map(str, bundle['bbox'])),
            'start': '2026-06-01T00:00:00Z', 'end': CUTOFF+'T23:59:59Z',
            'output': 'json', 'maxResults': 250}, raw / 'nisar-search.json')
        records = records[0] if records and isinstance(records[0], list) else records
        observations = []
        for record in records:
            observations.append({
                'id': record.get('granuleName', record.get('sceneName')),
                'datetime': record.get('startTime'), 'endtime': record.get('stopTime'),
                'polarization': record.get('polarization') or '/'.join(record.get('nisar',{}).get('mainBandPolarization') or []) or record.get('granuleName','').split('_')[9], 'orbit_direction': record.get('flightDirection'),
                'track': record.get('track'), 'frame': record.get('frameNumber'),
                'browse_urls': record.get('browse', []), 'download_url': record.get('downloadUrl'),
                'processing_level': record.get('processingLevel'),
                'source_url': 'https://search.asf.alaska.edu/#/?searchType=List%20Search&searchList='+str(record.get('granuleName',record.get('sceneName',''))),
            })
        observations.sort(key=lambda row: row['datetime'] or '')
        # Retain at most two most recent acquisitions with matching track/frame/polarization.
        groups = {}
        for row in observations:
            groups.setdefault((row['track'], row['frame'], row['polarization'], row['orbit_direction']), []).append(row)
        compatible = [group for group in groups.values() if len({row['datetime'][:10] for row in group}) >= 2]
        preview_pair = []
        if compatible:
            group = max(compatible, key=lambda values: values[-1]['datetime'])
            dates = sorted({row['datetime'][:10] for row in group})[-2:]
            preview_pair = [next(row for row in reversed(group) if row['datetime'].startswith(date)) for date in dates]
        for i, row in enumerate(preview_pair):
            url = next((u for u in row['browse_urls'] if u.endswith('_LATLON.png')), None)
            if url:
                response = requests.get(url, timeout=90)
                if response.status_code != 200:
                    row.update(preview_access_status=response.status_code, preview_source_url=url)
                    continue
                path = PUBLIC / 'observations' / region / f'nisar-context-{i}.png'
                path.write_bytes(response.content)
                row.update(preview_url=f'/observations/{region}/{path.name}', preview_sha256=digest(path), preview_source_url=url)
        result = {
            'retrieved_at': datetime.now(timezone.utc).isoformat(), 'research_cutoff': CUTOFF,
            'rainfall': {'name': 'NASA GPM IMERG via POWER', 'parameter': 'IMERG_PRECTOT',
                        'units': rain['parameters']['IMERG_PRECTOT']['units'], 'time_standard': rain['header']['time_standard'],
                        'source_products': rain['header']['sources'], 'grid_degrees': 0.1,
                        'point': [(west+east)/2, (south+north)/2], 'rows': rows,
                        'source_url': rain_url, 'raw_path': str((raw/'imerg.json').relative_to(ROOT)), 'sha256': rain_hash,
                        'fallback_source_url': fallback_url, 'fallback_sha256': fallback_hash, 'fallback_sources': fallback['header']['sources'],
                        'documentation_url': 'https://power.larc.nasa.gov/docs/methodology/data/sources_meteorology/#imerg-integrated-multi-satellite-retrievals-for-gpm',
                        'interpretation': 'Daily UTC regional grid-cell precipitation; not parcel-scale rainfall or evidence of flood causation.'},
            'nisar': {'name': 'NASA–ISRO NISAR L-band GCOV', 'query_url': search_url,
                      'sha256': search_hash, 'records': observations, 'preview_pair': preview_pair,
                      'record_count': len(observations), 'search_limit': 250,
                      'interpretation': 'Provisional GCOV discovery and qualitative full-scene browse context. Numerical NISAR HDF5 analysis is not included in Sentinel-1 transition metrics.',
                      'documentation_url': 'https://nisar-docs.asf.alaska.edu/gcov/'}}
        target = PUBLIC / 'observations' / region / 'nasa-context.json'
        target.write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':')), encoding='utf8')
        print(region, 'rain days', len(rows), 'NISAR records', len(observations), 'previews', len(preview_pair), flush=True)


if __name__ == '__main__':
    run()
