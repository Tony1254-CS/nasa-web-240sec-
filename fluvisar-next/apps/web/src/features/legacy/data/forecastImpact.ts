/* ── Synthetic but scientifically-grounded forecast data per reach ── */
export const FORECAST_DATA: Record<string, {
  model: string;
  horizon: string;
  confidence: number;
  erosionRisk: { label: string; area_ha: number; probability: number }[];
  accretionExpected: { label: string; area_ha: number; probability: number }[];
  drivers: string[];
  methodology: string;
}> = {
  'jamuna-chilmari': {
    model: 'LSTM-SAR Temporal + BWDB Gauge Regression',
    horizon: 'Next 90 days (Oct–Dec 2026)',
    confidence: 72,
    erosionRisk: [
      { label: 'Northern bank, Chilmari char', area_ha: 480, probability: 0.78 },
      { label: 'Western channel, mid-reach', area_ha: 220, probability: 0.65 },
      { label: 'Southern embankment approach', area_ha: 150, probability: 0.52 },
    ],
    accretionExpected: [
      { label: 'Eastern mid-channel bar', area_ha: 310, probability: 0.71 },
      { label: 'Downstream point bar', area_ha: 180, probability: 0.58 },
    ],
    drivers: ['Post-monsoon discharge decline', 'Channel migration trend (NW)', 'Upstream sediment load from Teesta'],
    methodology: 'Trained on 5 years of Sentinel-1 C-band time series (2019–2024) + BWDB gauge records. NISAR L-band observations used for calibration in 2026. Erosion probability derived from bank retreat velocity vectors.',
  },
  'glacier-bay-alaska': {
    model: 'Ice Velocity + Terminus Position Regression',
    horizon: 'Next 12 months (Oct 2026 – Sep 2027)',
    confidence: 84,
    erosionRisk: [
      { label: 'Muir Glacier terminus', area_ha: 65, probability: 0.88 },
      { label: 'East tributary confluence', area_ha: 28, probability: 0.72 },
    ],
    accretionExpected: [
      { label: 'Proglacial lake expansion', area_ha: 42, probability: 0.81 },
      { label: 'Outwash plain sediment', area_ha: 15, probability: 0.65 },
    ],
    drivers: ['Summer melt season acceleration', 'Marine-terminating calving dynamics', 'Regional temperature anomaly +1.8°C'],
    methodology: 'Terminus position tracked via SAR backscatter change. Retreat rate extrapolated from ITS_LIVE ice velocity dataset and USGS historical benchmark data.',
  },
  'norcal-wildfire': {
    model: 'Post-Fire Recovery + NDVI Trajectory',
    horizon: 'Next 6 months (Jul–Dec 2026)',
    confidence: 68,
    erosionRisk: [
      { label: 'Northern perimeter expansion risk', area_ha: 340, probability: 0.45 },
      { label: 'Debris flow corridors', area_ha: 120, probability: 0.62 },
    ],
    accretionExpected: [
      { label: 'Low-severity burn recovery', area_ha: 180, probability: 0.74 },
      { label: 'Riparian vegetation regrowth', area_ha: 65, probability: 0.59 },
    ],
    drivers: ['Post-fire soil hydrophobicity', 'Atmospheric river risk (Nov–Jan)', 'Vegetation recovery lag in high-severity zones'],
    methodology: 'Burn severity classified from pre/post SAR backscatter ratio. Recovery trajectory modeled using dNBR time series from Landsat 8/9. Debris flow risk from USGS post-fire model.',
  },
  'sundarbans-mangrove': {
    model: 'Mangrove Canopy Loss + Tidal Regression',
    horizon: 'Next 6 months (Oct 2026 – Mar 2027)',
    confidence: 61,
    erosionRisk: [
      { label: 'Western channel mangrove fringe', area_ha: 95, probability: 0.58 },
      { label: 'Dublar Char shoreline', area_ha: 72, probability: 0.67 },
      { label: 'Northern tidal creek expansion', area_ha: 45, probability: 0.44 },
    ],
    accretionExpected: [
      { label: 'Eastern mudflat sedimentation', area_ha: 110, probability: 0.72 },
      { label: 'Southern bar accretion', area_ha: 55, probability: 0.51 },
    ],
    drivers: ['Cyclone season (Oct–Nov)', 'Sea level rise trend (+3.2mm/yr)', 'Upstream freshwater reduction'],
    methodology: 'Mangrove canopy height modeled from NISAR L-band HV polarization. Tidal aliasing corrected using BIWTA tidal gauge records. Loss rate validated against SPARRSO decadal survey.',
  },
};

export const IMPACT_DATA: Record<string, {
  populationAtRisk: number;
  homesAtRisk: number;
  agriLandHa: number;
  economicLossUSD: number;
  emergencyActions: string[];
  vulnerabilityIndex: number; // 0-100
}> = {
  'jamuna-chilmari': {
    populationAtRisk: 45200,
    homesAtRisk: 8900,
    agriLandHa: 2840,
    economicLossUSD: 12500000,
    emergencyActions: ['Evacuate 3 riverside chars', 'Deploy BWDB mobile embankment units', 'Activate FFWC flood early warning'],
    vulnerabilityIndex: 87,
  },
  'glacier-bay-alaska': {
    populationAtRisk: 120,
    homesAtRisk: 15,
    agriLandHa: 0,
    economicLossUSD: 850000,
    emergencyActions: ['Update maritime navigation charts', 'Restrict calving zone access', 'Monitor proglacial lake outburst risk'],
    vulnerabilityIndex: 32,
  },
  'norcal-wildfire': {
    populationAtRisk: 12800,
    homesAtRisk: 3200,
    agriLandHa: 450,
    economicLossUSD: 89000000,
    emergencyActions: ['Activate CAL FIRE suppression teams', 'Issue debris flow warnings for burned watersheds', 'Coordinate FEMA emergency housing'],
    vulnerabilityIndex: 74,
  },
  'sundarbans-mangrove': {
    populationAtRisk: 28500,
    homesAtRisk: 5600,
    agriLandHa: 1200,
    economicLossUSD: 4200000,
    emergencyActions: ['Reinforce coastal embankments', 'Deploy mangrove restoration crews', 'Activate cyclone early warning system'],
    vulnerabilityIndex: 79,
  },
};

