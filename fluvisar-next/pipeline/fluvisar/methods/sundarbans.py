"""
FluviSAR Sundarbans Remote Sensing Methods
Authority: plan.md Section 6.2, 10.5, 11.1
Multi-polarization (HH/HV), Pauli decomposition, optical NDVI, and tidal matching.
"""

import numpy as np
from typing import Dict, Any, List, Tuple, Optional

def compute_polarization_ratio(hh_db: np.ndarray, hv_db: np.ndarray, valid_mask: np.ndarray) -> np.ndarray:
    """
    Computes cross-polarization ratio in dB:
    Ratio_dB = 10 * log10(P_HH / P_HV) = HH_dB - HV_dB
    Authority: plan.md Section 11.0
    """
    ratio_db = np.full(hh_db.shape, -9999.0, dtype=np.float32)
    ratio_db[valid_mask] = hh_db[valid_mask] - hv_db[valid_mask]
    return ratio_db

def compute_pauli_decomposition(
    c_hhhh: np.ndarray,
    c_vvvv: np.ndarray,
    c_hvhv: np.ndarray,
    re_c_hhvv: np.ndarray,
    valid_mask: np.ndarray
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Computes real Pauli RGB decomposition powers from covariance terms:
      R (Double-Bounce) = (C_HHHH + C_VVVV - 2*Re(C_HHVV)) / 2
      G (Volume / Canopy) = 2 * C_HVHV
      B (Surface / Water) = (C_HHHH + C_VVVV + 2*Re(C_HHVV)) / 2
    Authority: plan.md Section 11.1
    """
    r = np.zeros(c_hhhh.shape, dtype=np.float32)
    g = np.zeros(c_hhhh.shape, dtype=np.float32)
    b = np.zeros(c_hhhh.shape, dtype=np.float32)

    # Calculate only on valid covariance support
    valid = valid_mask & (c_hhhh > 0) & (c_vvvv > 0) & (c_hvhv > 0)
    
    r_power = 0.5 * (c_hhhh[valid] + c_vvvv[valid] - 2.0 * re_c_hhvv[valid])
    g_power = 2.0 * c_hvhv[valid]
    b_power = 0.5 * (c_hhhh[valid] + c_vvvv[valid] + 2.0 * re_c_hhvv[valid])

    # Guard against negative values due to numerical precision
    r[valid] = np.maximum(0.0, r_power)
    g[valid] = np.maximum(0.0, g_power)
    b[valid] = np.maximum(0.0, b_power)

    return r, g, b

def compute_ndvi(red: np.ndarray, nir: np.ndarray, valid_mask: np.ndarray) -> np.ndarray:
    """
    Computes Normalized Difference Vegetation Index:
    NDVI = (NIR - Red) / (NIR + Red)
    Authority: plan.md Section 10.5, 11.0
    """
    ndvi = np.full(red.shape, -9999.0, dtype=np.float32)
    denom = nir + red
    valid = valid_mask & (denom > 0)

    ndvi[valid] = (nir[valid] - red[valid]) / denom[valid]
    return ndvi

def filter_by_tide(
    observations: List[Dict[str, Any]],
    condition: str = "high-tide",
    tide_split_threshold_m: float = 2.2
) -> List[Dict[str, Any]]:
    """
    Filters SAR observations by tidal condition.
    Authority: plan.md Section 6.2, 13.1 (R11)
    """
    if condition == "all":
        return observations

    filtered = []
    for obs in observations:
        tide_m = obs.get("tide_height_m", 0.0)
        if condition == "high-tide" and tide_m >= tide_split_threshold_m:
            filtered.append(obs)
        elif condition == "low-tide" and tide_m < tide_split_threshold_m:
            filtered.append(obs)

    return filtered

def compute_joint_trajectory_fingerprint(
    ndvi_val: float,
    hv_db: float,
    baseline_ndvi: float = 0.65,
    baseline_hv: float = -14.0
) -> Dict[str, Any]:
    """
    Computes physical response quadrant for the joint optical-radar trajectory.
    Authority: plan.md Section 6.2, 13.1 (R10)
    """
    delta_ndvi = ndvi_val - baseline_ndvi
    delta_hv = hv_db - baseline_hv

    if delta_hv > 1.5 and abs(delta_ndvi) < 0.10:
        quadrant = "Q1_TIDAL_SUB_CANOPY_INUNDATION"
        label = "Tidal Sub-Canopy Inundation (High Double-Bounce, Intact Greenness)"
    elif delta_hv < -2.0 and delta_ndvi < -0.15:
        quadrant = "Q2_CANOPY_LOSS_OR_CLEARING"
        label = "Canopy Loss / Disturbance (Reduced Volume Scattering & Loss of Greenness)"
    elif delta_hv < -2.0 and delta_ndvi >= 0.0:
        quadrant = "Q3_DRYING_OR_GEOMETRIC_EFFECT"
        label = "Soil/Foliage Moisture Deficit (Reduced Dielectric Constant)"
    else:
        quadrant = "Q4_STABLE_MANGROVE_BASELINE"
        label = "Stable Mangrove Baseline (Nominal Tidal Response)"

    return {
        "delta_ndvi": round(delta_ndvi, 3),
        "delta_hv_db": round(delta_hv, 2),
        "quadrant": quadrant,
        "descriptive_label": label
    }

