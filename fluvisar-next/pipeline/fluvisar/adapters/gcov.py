"""
FluviSAR NISAR L2 GCOV Adapter
Authority: plan.md Section 8.1, 10.2, 11.0
Calibrated gamma-zero power conversion, masking, and statistics.
"""

import math
from typing import Dict, Any, Tuple, Optional
import numpy as np

def linear_power_to_db(power_array: np.ndarray, nodata_val: float = -9999.0) -> Tuple[np.ndarray, np.ndarray]:
    """
    Converts linear calibrated radar power to gamma-zero in dB.
    Formula: gamma0_dB = 10 * log10(positive calibrated power)
    Returns: (db_array, valid_mask)
    """
    valid_mask = (power_array > 0) & (power_array != nodata_val) & (~np.isnan(power_array))
    
    db_array = np.full(power_array.shape, nodata_val, dtype=np.float32)
    db_array[valid_mask] = 10.0 * np.log10(power_array[valid_mask])
    
    return db_array, valid_mask

def compute_raster_statistics(db_array: np.ndarray, valid_mask: np.ndarray) -> Dict[str, Any]:
    """
    Computes rigorous raster diagnostics over valid support.
    """
    valid_values = db_array[valid_mask]
    if len(valid_values) == 0:
        return {
            "valid_pixel_count": 0,
            "total_pixels": int(db_array.size),
            "valid_fraction": 0.0,
            "min_db": None,
            "max_db": None,
            "mean_db": None,
            "median_db": None,
            "std_db": None
        }

    return {
        "valid_pixel_count": int(len(valid_values)),
        "total_pixels": int(db_array.size),
        "valid_fraction": float(len(valid_values) / db_array.size),
        "min_db": float(np.min(valid_values)),
        "max_db": float(np.max(valid_values)),
        "mean_db": float(np.mean(valid_values)),
        "median_db": float(np.median(valid_values)),
        "std_db": float(np.std(valid_values))
    }

class GCOVAdapter:
    """Adapter for querying and inspecting NISAR GCOV datasets."""
    
    def __init__(self, region_id: str, crs: str = "EPSG:32645"):
        self.region_id = region_id
        self.crs = crs
        
    def sample_point(self, lon: float, lat: float, bounds: Tuple[float, float, float, float], db_grid: np.ndarray) -> Dict[str, Any]:
        """
        Samples a specific geographic coordinate from the numeric array.
        Bounds format: (west, south, east, north)
        """
        west, south, east, north = bounds
        if not (west <= lon <= east and south <= lat <= north):
            return {
                "value": None,
                "unit": "dB",
                "masked": True,
                "reason": "Outside spatial support window"
            }
            
        rows, cols = db_grid.shape
        col = int(((lon - west) / (east - west)) * (cols - 1))
        row = int(((north - lat) / (north - south)) * (rows - 1))
        
        row = max(0, min(rows - 1, row))
        col = max(0, min(cols - 1, col))
        
        val = float(db_grid[row, col])
        if val <= -9000 or np.isnan(val):
            return {
                "value": None,
                "unit": "dB",
                "masked": True,
                "reason": "Pixel masked or unobserved nodata support"
            }
            
        return {
            "value": round(val, 2),
            "unit": "dB",
            "masked": False,
            "pixel_coords": [col, row],
            "reason": None
        }
