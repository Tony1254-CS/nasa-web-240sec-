"""Read-only fallback for this project's north-up WGS84/UTM GeoTIFF grids.

Uses TIFF decoding, UTM equations and GEOS pixel-centre membership rather than
loading GDAL. Unsupported projections or grid types fail explicitly.
"""
from types import SimpleNamespace
import math
import numpy as np
from affine import Affine
import tifffile
import utm
from shapely import intersects_xy
from shapely.geometry import shape, mapping
from shapely.ops import transform as map_geometry


class CRS:
    def __init__(self, code):
        self.code = int(code)

    def to_string(self):
        return f'EPSG:{self.code}'

    def __str__(self):
        return self.to_string()


def _epsg(value):
    return value.code if isinstance(value, CRS) else int(str(value).split(':')[-1])


def transform(src, dst, xs, ys):
    src, dst = _epsg(src), _epsg(dst)
    x, y = np.asarray(xs, dtype=float), np.asarray(ys, dtype=float)
    if src == dst:
        return x, y
    if src != 4326:
        if not 32601 <= src <= 32660:
            raise ValueError('Portable runtime supports WGS84 and northern UTM only')
        y, x = utm.to_latlon(x, y, src - 32600, northern=True, strict=False)
    if dst == 4326:
        return x, y
    if not 32601 <= dst <= 32660:
        raise ValueError('Portable runtime supports WGS84 and northern UTM only')
    east, north, _, _ = utm.from_latlon(y, x, force_zone_number=dst - 32600, force_northern=True)
    return east, north


def transform_geom(src, dst, geometry):
    return mapping(map_geometry(lambda x, y, z=None: transform(src, dst, x, y), shape(geometry)))


class Dataset:
    def __init__(self, path):
        with tifffile.TiffFile(path) as source:
            tags = source.geotiff_metadata or {}
            scale, tie = tags.get('ModelPixelScale'), tags.get('ModelTiepoint')
            if not scale or not tie or tags.get('ModelTransformation') or int(tags.get('GTRasterTypeGeoKey', 0)) != 1:
                raise ValueError('Portable reader requires a north-up pixel-area GeoTIFF')
            self.crs = CRS(tags['ProjectedCSTypeGeoKey'])
            self.transform = Affine(scale[0], 0, tie[3] - tie[0] * scale[0], 0, -scale[1], tie[4] + tie[1] * scale[1])
            self.array = source.asarray()
            if self.array.ndim != 2:
                raise ValueError('Portable reader requires a single registered raster band')
            nodata = source.pages[0].tags.get('GDAL_NODATA')
            self.nodata = float(nodata.value) if nodata else None
        self.height, self.width = self.array.shape

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self, band=1, window=None, masked=False):
        if band != 1:
            raise ValueError('Only the registered first band is supported')
        result = self.array
        if window:
            (r0, r1), (c0, c1) = window
            result = result[r0:r1, c0:c1]
        if masked:
            invalid = ~np.isfinite(result)
            if self.nodata is not None and math.isfinite(self.nodata):
                invalid |= result == self.nodata
            return np.ma.array(result, mask=invalid)
        return result

    def index(self, x, y):
        col, row = ~self.transform * (x, y)
        return math.floor(row), math.floor(col)


def rasterize(shapes, out_shape, transform, fill=0, dtype='uint8'):
    if transform.b or transform.d or transform.a <= 0 or transform.e >= 0:
        raise ValueError('Portable rasterization requires a north-up grid')
    output = np.full(out_shape, fill, dtype=dtype)
    height, width = out_shape
    for geometry, value in shapes:
        polygon = shape(geometry)
        if polygon.geom_type not in ('Polygon', 'MultiPolygon'):
            raise ValueError('Portable rasterization supports polygon masks only')
        west, south, east, north = polygon.bounds
        c0 = max(0, math.floor((west - transform.c) / transform.a) - 1)
        c1 = min(width, math.ceil((east - transform.c) / transform.a) + 1)
        r0 = max(0, math.floor((north - transform.f) / transform.e) - 1)
        r1 = min(height, math.ceil((south - transform.f) / transform.e) + 1)
        if c1 <= c0 or r1 <= r0:
            continue
        xs = transform.c + (np.arange(c0, c1) + .5) * transform.a
        ys = transform.f + (np.arange(r0, r1) + .5) * transform.e
        mask = intersects_xy(polygon, xs[None, :], ys[:, None])
        output[r0:r1, c0:c1][mask] = value
    return output


rasterio = SimpleNamespace(open=Dataset)
