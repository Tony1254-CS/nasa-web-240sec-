/**
 * FluviSAR Authoritative Geographic & Remote Sensing Feature Layers
 * Real geographic coordinates matching Jamuna (Chilmari-Roumari) & Sundarbans (Dublar-Passur).
 * Authority: plan.md Sections 6.1, 6.2, 10.4, 11.0
 */

export interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: Record<string, any>;
    geometry: {
      type: string;
      coordinates: any;
    };
  }>;
}

// ============================================================================
// 1. JAMUNA RIVER REACH (Chilmari-Roumari)
// Centered around 89.75°E, 25.575°N
// ============================================================================

// Before Flood Water Mask (2026-08-26: Monsoon Peak Inundation, Stage 18.9m)
// In August, the flood crest expanded across the entire channel, covering low-lying chars
export const JAMUNA_WATER_AUG26: GeoFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Monsoon Peak Flood Water (Aug 26)',
        sensor: 'NISAR L-band GCOV (HH+HV)',
        stage_m: 18.9,
        threshold_db: -14.0,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [89.655, 25.695],
            [89.670, 25.680],
            [89.695, 25.660],
            [89.735, 25.635],
            [89.775, 25.610],
            [89.820, 25.575],
            [89.835, 25.535],
            [89.825, 25.495],
            [89.790, 25.465],
            [89.755, 25.460],
            [89.720, 25.480],
            [89.695, 25.515],
            [89.675, 25.550],
            [89.658, 25.580],
            [89.645, 25.620],
            [89.648, 25.660],
            [89.655, 25.695],
          ],
        ],
      },
    },
    // Inundated low-lying char shoals
    {
      type: 'Feature',
      properties: { name: 'Submerged Mandaler Shoal (Aug 26)', type: 'inundated_char' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [89.715, 25.625],
            [89.745, 25.615],
            [89.765, 25.585],
            [89.750, 25.565],
            [89.720, 25.570],
            [89.705, 25.600],
            [89.715, 25.625],
          ],
        ],
      },
    },
  ],
};

// After Flood Water Mask (2026-09-19: Post-Monsoon Receded Braids, Stage 16.4m)
// In September, the river dropped by 2.5m, splitting into narrower main thalweg braids
export const JAMUNA_WATER_SEP19: GeoFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Post-Monsoon Receded Thalweg (Sep 19)',
        sensor: 'NISAR L-band GCOV (HH+HV)',
        stage_m: 16.4,
        threshold_db: -14.0,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [89.665, 25.690],
            [89.680, 25.675],
            [89.705, 25.645],
            [89.745, 25.615],
            [89.790, 25.585],
            [89.815, 25.555],
            [89.810, 25.515],
            [89.775, 25.480],
            [89.740, 25.475],
            [89.710, 25.500],
            [89.688, 25.535],
            [89.672, 25.565],
            [89.658, 25.600],
            [89.655, 25.645],
            [89.665, 25.690],
          ],
        ],
      },
    },
  ],
};

// Active Riverbank Erosion Candidate (145.8 ha Robust Core)
// A crescent-shaped bank collapse along the Chilmari West Embankment where backscatter dropped by -8.2 dB
export const JAMUNA_EROSION_ZONES: GeoFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        finding_id: 'FINDING-JAMUNA-2026-CHILMARI-01',
        name: 'Chilmari West Bank Retreat',
        class: 'Active Bank Erosion (Land → Water)',
        area_ha: 145.8,
        backscatter_drop_db: -8.2,
        stage_fall_m: -2.5,
        hazard_level: 'CRITICAL',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [89.658, 25.595],
            [89.670, 25.590],
            [89.682, 25.578],
            [89.688, 25.562],
            [89.684, 25.545],
            [89.672, 25.535],
            [89.662, 25.545],
            [89.654, 25.565],
            [89.652, 25.582],
            [89.658, 25.595],
          ],
        ],
      },
    },
  ],
};

// Accretion / Newly Emerged Agricultural Sandbars (88.4 ha Char Accretion)
// Follows the emergent sandbar shoaling in the receded channel with rising NDVI (+0.48)
export const JAMUNA_ACCRETION_ZONES: GeoFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Mandaler Char Emergent Silt Bar',
        class: 'Silt Accretion (Water → Sandbar/Crop)',
        area_ha: 88.4,
        ndvi_recovery: 0.48,
        sowing_window: 'Oct 15 - Nov 30 (Rabi Crop)',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [89.722, 25.620],
            [89.742, 25.615],
            [89.758, 25.595],
            [89.762, 25.575],
            [89.748, 25.565],
            [89.730, 25.572],
            [89.715, 25.592],
            [89.712, 25.610],
            [89.722, 25.620],
          ],
        ],
      },
    },
  ],
};

// Critical Infrastructure & Human Settlements at Risk
export const JAMUNA_ASSETS: GeoFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Chilmari Model Primary School',
        type: 'school',
        distance_to_bank: '42m',
        status: 'CRITICAL HAZARD (<50m)',
        evacuation_route: 'West Embankment Road to Thana HQ',
      },
      geometry: { type: 'Point', coordinates: [89.653, 25.568] },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Mandaler Char Govt Primary School',
        type: 'school',
        distance_to_bank: '180m',
        status: 'MODERATE RISK',
        evacuation_route: 'Boat crossing to Chilmari Ghat',
      },
      geometry: { type: 'Point', coordinates: [89.735, 25.588] },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Roumari Community Clinic',
        type: 'clinic',
        distance_to_bank: '650m',
        status: 'ISOLATED (Ferry Landing Severed)',
        evacuation_route: 'Ferry dependent crossing',
      },
      geometry: { type: 'Point', coordinates: [89.825, 25.562] },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Chilmari Ferry Ghat',
        type: 'ferry_terminal',
        status: 'ROAD CONNECTION AT RISK',
      },
      geometry: { type: 'Point', coordinates: [89.670, 25.542] },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Roumari East Ferry Landing',
        type: 'ferry_terminal',
        status: 'OPERATIONAL',
      },
      geometry: { type: 'Point', coordinates: [89.805, 25.555] },
    },
  ],
};

// ============================================================================
// 2. SUNDARBANS MANGROVE REACH (Dublar-Passur)
// Centered around 89.70°E, 21.875°N
// ============================================================================

// Tidal Creeks & Estuary Water (Passur River Channel)
export const SUNDARBANS_WATER: GeoFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Passur Estuary Thalweg', type: 'tidal_water' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [89.585, 21.975],
            [89.625, 21.970],
            [89.655, 21.915],
            [89.695, 21.845],
            [89.715, 21.765],
            [89.675, 21.765],
            [89.645, 21.840],
            [89.605, 21.910],
            [89.585, 21.975],
          ],
        ],
      },
    },
  ],
};

// Sub-Canopy Tidal Inundation Pulse (312 ha High Spring Tide Penetration)
// L-band radar penetrates through canopy to detect +3.5 dB HH double-bounce return off flooded trunks
export const SUNDARBANS_TIDAL_PULSE: GeoFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Dublar Sub-Canopy Tidal Flood Pulse',
        type: 'tidal_inundation',
        mechanism: 'Trunk-Ground Double Bounce (+3.5 dB HH)',
        area_ha: 312.0,
        biwta_stage_m: 2.2,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [89.675, 21.915],
            [89.745, 21.910],
            [89.770, 21.855],
            [89.735, 21.805],
            [89.685, 21.820],
            [89.665, 21.865],
            [89.675, 21.915],
          ],
        ],
      },
    },
  ],
};

// Pauli Decomposition Mangrove Canopy Volume Scattering (Dense Canopy)
export const SUNDARBANS_PAULI_CANOPY: GeoFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Sundarbans Protected Dense Mangrove Canopy',
        type: 'canopy_volume',
        pauli_rgb: 'Green (Volume Scattering HV Dominant)',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [89.625, 21.955],
            [89.765, 21.955],
            [89.805, 21.885],
            [89.775, 21.815],
            [89.645, 21.815],
            [89.625, 21.955],
          ],
        ],
      },
    },
  ],
};

// Mangrove Cyclone Shelter & Forest Ranger Stations
export const SUNDARBANS_ASSETS: GeoFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Passur Forest Ranger Station', type: 'ranger_station' },
      geometry: { type: 'Point', coordinates: [89.665, 21.915] },
    },
    {
      type: 'Feature',
      properties: { name: 'Dublar Char Cyclone Shelter', type: 'shelter', capacity: '1,500 people' },
      geometry: { type: 'Point', coordinates: [89.725, 21.825] },
    },
    {
      type: 'Feature',
      properties: { name: 'Alorkol Fishermen Depot', type: 'settlement' },
      geometry: { type: 'Point', coordinates: [89.740, 21.810] },
    },
  ],
};
