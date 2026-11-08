"""Portable reader/mask contract. Runs without loading the blocked GDAL runtime."""
import sys
import tempfile
import unittest
import json
from pathlib import Path
import numpy as np
import tifffile
from affine import Affine

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'services/api'))
from app.portable_raster import Dataset, rasterize, transform, transform_geom
from shapely.geometry import shape


class PortableRasterTests(unittest.TestCase):
    def test_api_reads_real_history_exposure_and_pixel_sources(self):
        from starlette.testclient import TestClient
        from app.main import app
        catalogue = json.loads((ROOT / 'apps/web/public/observations/index.json').read_text(encoding='utf8'))
        with TestClient(app) as client:
            for region in catalogue['regions'].values():
                response = client.get(f"/api/runs/{region['run_id']}/decision-context")
                self.assertEqual(response.status_code, 200, response.text)
                result = response.json()
                self.assertEqual(len(result['history']), 6)
                for row in result['history']:
                    source = next(o for o in region['observations'] if o['id'] == row['id'])
                    self.assertAlmostEqual(row['water_area_ha'], source['water_area_ha'], places=6)
                west, south, east, north = region['bbox']
                sample = client.get(f"/api/artifacts/{region['observations'][0]['id']}/sample", params={'lon': (west+east)/2, 'lat': (south+north)/2, 'channel': 'vv'})
                self.assertEqual(sample.status_code, 200, sample.text)
                self.assertEqual(sample.json()['source_observation_id'], region['observations'][0]['id'])
                self.assertFalse(sample.json()['masked'])
                self.assertTrue(np.isfinite(sample.json()['value']))
                if region['region_id'] == 'jamuna':
                    self.assertEqual(result['exposure']['assets']['land-to-water']['building'], 36)
                    self.assertAlmostEqual(result['exposure']['assets']['land-to-water']['road_length_m'], 393.83)

    def test_tiff_georeferencing_values_window_and_mask(self):
        values = np.arange(20, dtype='float32').reshape(4, 5)
        values[1, 2] = np.nan
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'grid.tif'
            tifffile.imwrite(path, values, metadata=None, extratags=[
                (33550, 'd', 3, (30, 30, 0), False),
                (33922, 'd', 6, (0, 0, 0, 500000, 3000000, 0), False),
                (34735, 'H', 12, (1, 1, 0, 2, 1025, 0, 1, 1, 3072, 0, 1, 32645), False),
            ])
            with Dataset(path) as dataset:
                np.testing.assert_equal(dataset.read(), values)
                self.assertEqual(dataset.crs.to_string(), 'EPSG:32645')
                self.assertEqual(dataset.transform, Affine(30, 0, 500000, 0, -30, 3000000))
                self.assertEqual(dataset.index(500075, 2999955), (1, 2))
                self.assertTrue(dataset.read(window=((1, 2), (2, 3)), masked=True).mask[0, 0])
                self.assertEqual(dataset.read(window=((2, 3), (3, 4)))[0, 0], 13)

    def test_polygon_centres_holes_and_label_replacement(self):
        geometry = {'type': 'Polygon', 'coordinates': [[[0, 0], [90, 0], [90, 90], [0, 90], [0, 0]], [[30, 30], [60, 30], [60, 60], [30, 60], [30, 30]]]}
        result = rasterize([(geometry, 2)], (4, 4), Affine(30, 0, 0, 0, -30, 120), dtype='int32')
        expected = np.zeros((4, 4), dtype='int32');expected[1:, :3] = 2;expected[2, 1] = 0
        np.testing.assert_equal(result, expected)
        replaced = rasterize([(geometry, 2), (geometry, 7)], (4, 4), Affine(30, 0, 0, 0, -30, 120), dtype='int32')
        np.testing.assert_equal(replaced, np.where(expected, 7, 0))
        with self.assertRaises(ValueError):
            rasterize([(geometry, 1)], (4, 4), Affine(30, 1, 0, 0, -30, 120))

    def test_utm_reference_and_prior_native_distance(self):
        x, y = transform('EPSG:4326', 'EPSG:32645', [87], [0])
        self.assertAlmostEqual(x[0], 500000, places=5);self.assertAlmostEqual(y[0], 0, places=5)
        record = json.loads((ROOT / 'apps/web/public/place-watch.json').read_text(encoding='utf8'))['regions']['jamuna']['rows'][0]
        a = {'type': 'Point', 'coordinates': record['coordinates']}
        b = {'type': 'Point', 'coordinates': record['changeCoordinates']}
        distance = shape(transform_geom('EPSG:4326', 'EPSG:32645', a)).distance(shape(transform_geom('EPSG:4326', 'EPSG:32645', b)))
        self.assertLess(abs(distance - record['distanceM']), .01)
        with self.assertRaises(ValueError):
            transform('EPSG:4326', 'EPSG:3857', [89], [25])


if __name__ == '__main__':
    unittest.main()
