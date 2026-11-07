"""Check published real observation lineage, masks, areas and georeferencing."""
import hashlib
import json
import math
from pathlib import Path

import numpy as np
import rasterio
from rasterio.warp import transform_geom
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]


def polygon_area(geometry):
    polygons=[geometry['coordinates']] if geometry['type']=='Polygon' else geometry['coordinates']
    def ring_area(ring):
        return abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(ring,ring[1:])))/2
    return sum(ring_area(poly[0])-sum(ring_area(ring) for ring in poly[1:]) for poly in polygons)


def main():
    source=ROOT/'apps/web/src/data/observations.json'
    registry=json.loads(source.read_text(encoding='utf8'))
    assert set(registry['regions'])=={'jamuna','sundarbans'}
    for name in ('index.json','manifest.json'):
        assert json.loads((ROOT/'apps/web/public/observations'/name).read_text(encoding='utf8'))==registry
    assert 'sig=' not in source.read_text(encoding='utf8')
    checksums=0
    for region,record in registry['regions'].items():
        assert record['pair'][0]<record['pair'][1]
        assert all(obs['date']==obs['datetime'][:10] for obs in record['observations'])
        optical_dates=set()
        for obs in record.get('optical_observations', []):
            assert obs['date']==obs['datetime'][:10]
            assert obs['bbox']==record['bbox']
            assert obs['id'].startswith('S2') and obs['source_url'].startswith('https://earth-search.aws.element84.com/')
            assert 0<=obs['cloud_fraction']<=1
            path=ROOT/'apps/web/public'/obs['url'].lstrip('/')
            assert hashlib.sha256(path.read_bytes()).hexdigest()==obs['display_sha256']
            if obs.get('display_bbox'):
                w,s,e,n=obs['display_bbox'];rw,rs,re,rn=record['bbox']
                assert w<=rw and s<=rs and e>=re and n>=rn
                assert Image.open(path).size==(2048,2048)
                roi_path=ROOT/'apps/web/public'/obs['roi_url'].lstrip('/')
                assert hashlib.sha256(roi_path.read_bytes()).hexdigest()==obs['roi_display_sha256'];checksums+=1
            checksums+=1
            if obs.get('detail_tiles_url'):
                detail_root=ROOT/'apps/web/public/observations'/region/'optical'/obs['date']
                detail=json.loads((detail_root/'detail.json').read_text())
                assert detail['source_url']==obs['source_assets']['visual']
                assert detail['source_id']==obs['id'] and detail['bbox']==record['bbox']
                assert detail['source_gsd_m']==obs['source_gsd_m']==10
                tiles=sorted(detail_root.glob('*/*/*.webp'),key=lambda p:tuple(int(v) for v in (p.parent.parent.name,p.parent.name,p.stem)))
                assert len(tiles)==detail['tile_count']
                digest=hashlib.sha256()
                for tile in tiles:
                    digest.update(tile.read_bytes())
                assert digest.hexdigest()==detail['tiles_sha256']
                assert Image.open(tiles[-1]).size==(256,256)
                checksums+=len(tiles)
            optical_dates.add(obs['date'])
        if record.get('optical_observations'):
            assert len(optical_dates)>=6 and len(record['observations'])>=6
            assert set(record['optical_pair'])<=optical_dates
        assert len({obs['relative_orbit'] for obs in record['observations']})==1
        assert len({obs['platform'] for obs in record['observations']})==1
        assert len({obs['orbit_direction'] for obs in record['observations']})==1
        arrays=[]
        for obs in record['observations']:
            bands={}
            for band,pathkey in [('vv','numeric_path'),('vh','vh_numeric_path')]:
                path=ROOT/obs[pathkey]
                assert hashlib.sha256(path.read_bytes()).hexdigest()==obs['numeric_sha256'][band]
                checksums+=1
                with rasterio.open(path) as data:
                    assert data.crs.to_string()==record['crs']
                    assert abs(data.transform.a)==abs(data.transform.e)==30
                    assert data.nodata==-9999
                    array=data.read(1)
                    assert np.isfinite(array).all()
                    bands[band]=array
            valid=(bands['vv']!=-9999)&(bands['vh']!=-9999)
            assert int(valid.sum())==obs['valid_pixel_count']
            assert math.isclose(float(bands['vv'][valid].mean()),obs['mean_vv_db'],abs_tol=0.00001)
            assert math.isclose(float(bands['vh'][valid].mean()),obs['mean_vh_db'],abs_tol=0.00001)
            water=valid&(bands['vv']<record['threshold_db'])
            assert math.isclose(water.sum()*0.09,obs['water_area_ha'],abs_tol=1e-6)
            arrays.append((valid,water))
            for band in ('vv','vh','water'):
                path=ROOT/'apps/web/public'/obs[f'{band}_url'].lstrip('/')
                assert hashlib.sha256(path.read_bytes()).hexdigest()==obs['display_sha256'][band]
                checksums+=1
                assert Image.open(path).size==(1024,1024)
            for band, expected_hash in obs.get('polarization_display_sha256', {}).items():
                path=ROOT/'apps/web/public'/obs[f'{band}_url'].lstrip('/')
                assert hashlib.sha256(path.read_bytes()).hexdigest()==expected_hash
                assert Image.open(path).size==(1024,1024)
                checksums+=1
        if record.get('pair_bundles'):
            from ingest_sentinel1 import components
            by_date={obs['date']:array for obs,array in zip(record['observations'],arrays)}
            for key,url in record['pair_bundles'].items():
                bundle=json.loads((ROOT/'apps/web/public'/url.lstrip('/')).read_text(encoding='utf8'))
                a,b=bundle['pair'];assert key==a+'_'+b and a<b
                valid0,water0=by_date[a];valid1,water1=by_date[b];support=valid0&valid1
                metrics=bundle['metrics'];assert int(support.sum())==metrics['common_valid_pixel_count']
                for category,mask,prefix in [('land-to-water',support&~water0&water1,'land_to_water'),('water-to-land',support&water0&~water1,'water_to_land')]:
                    labels,_=components(mask);count=int((labels>0).sum())
                    features=[f for f in bundle['findings']['features'] if f['properties']['category']==category]
                    assert count==metrics[prefix+'_pixel_count']==sum(f['properties']['pixel_count'] for f in features)
                    assert math.isclose(count*.09,metrics[prefix+'_ha'],abs_tol=1e-6)
                change=ROOT/'apps/web/public'/bundle['change_url'].lstrip('/')
                assert hashlib.sha256(change.read_bytes()).hexdigest()==bundle['change_sha256'];checksums+=1
            print(f"{region}: {len(record['pair_bundles'])} selectable comparisons independently recomputed from source pixels PASS")
        common=arrays[0][0]&arrays[1][0]
        metrics=record['metrics']
        assert int(common.sum())==metrics['common_valid_pixel_count']
        assert math.isclose(metrics['common_valid_fraction'],common.sum()/metrics['roi_pixel_count'],abs_tol=1e-6)
        assert math.isclose(metrics['common_valid_area_ha'],common.sum()*0.09,abs_tol=1e-6)
        assert math.isclose(metrics['water_area_t0_ha'],(arrays[0][1]&common).sum()*0.09,abs_tol=1e-6)
        assert math.isclose(metrics['water_area_t1_ha'],(arrays[1][1]&common).sum()*0.09,abs_tol=1e-6)
        errors=[]
        for category,key in [('land-to-water','land_to_water'),('water-to-land','water_to_land')]:
            features=[f for f in record['findings']['features'] if f['properties']['category']==category]
            assert len(features)==metrics[f'{key}_count']
            assert sum(f['properties']['pixel_count'] for f in features)==metrics[f'{key}_pixel_count']
            assert math.isclose(sum(f['properties']['area_ha'] for f in features),metrics[f'{key}_ha'],abs_tol=1e-6)
            for feature in features:
                props=feature['properties']
                assert props['pixel_count']>=record['minimum_component_pixels']
                assert math.isclose(props['pixel_count']*0.09,props['area_ha'],abs_tol=1e-6)
                geometry=transform_geom('EPSG:4326',record['crs'],feature['geometry'])
                error=abs(polygon_area(geometry)/10000-props['area_ha'])
                assert error<0.03,(props['id'],error)
                errors.append(error)
        assert len(record['findings']['features'])==metrics['candidate_count']
        for row in record['threshold_sensitivity']:
            if row['threshold_db']==record['threshold_db']:
                assert row['land_to_water_ha']==metrics['land_to_water_ha']
                assert row['water_to_land_ha']==metrics['water_to_land_ha']
        change=ROOT/'apps/web/public'/record['change_url'].lstrip('/')
        assert hashlib.sha256(change.read_bytes()).hexdigest()==record['change_sha256']
        checksums+=1
        print(f'{region}: numerical masks, {len(errors)} polygons, pixel areas, common support, hashes PASS; max polygon round-trip error {max(errors,default=0):.6f} ha')
    print(f'{checksums} numeric/display SHA-256 checks PASS; no signed URLs persisted')


if __name__=='__main__':
    main()
