"""Prefer GDAL; use the restricted read-only runtime if its import is blocked."""
try:
    import rasterio
    from rasterio.features import rasterize
    from rasterio.warp import transform_geom, transform
    RUNTIME = 'rasterio-gdal'
except ImportError:
    from app.portable_raster import rasterio, rasterize, transform_geom, transform
    RUNTIME = 'tifffile-utm-shapely'
