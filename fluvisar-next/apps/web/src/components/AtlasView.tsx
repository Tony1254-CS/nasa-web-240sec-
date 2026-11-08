import { useState, useMemo } from 'react';
import '../styles/atlas.css';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Globe,
  Layers,
  Eye,
  Search,
  X,
  ShieldCheck,
  FileText,
  Activity,
  Sliders,
  Flame,
  Mountain,
  Droplets,
  Satellite,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useEvidence, number, readableDate } from '../data/evidence';
import { useWorkspaceStore } from '../store/workspaceStore';
import { SensorRaceModal } from './SensorRaceModal';
import { ChangePassportModal } from './ChangePassportModal';
import { CardImageSwipe } from './CardImageSwipe';
import { PlanetaryTelemetryMap, type TelemetrySite } from './PlanetaryTelemetryMap';
import { PageIntro } from './EvidenceUI';
import { AtlasOutlook } from './AtlasOutlook';
import { AtlasPlaceWatch } from './AtlasPlaceWatch';

interface GlobalCase {
  id: string;
  name: string;
  location: string;
  category: string;
  categoryTag: string;
  status: 'Verified Analysis' | 'Derived Example' | 'Contextual Case' | 'Illustrative Simulation';
  phenomenon: string;
  processingMethod: string;
  coords: [number, number];
  coordsDisplay: string;
  sensor: string;
  metric1: { label: string; value: string };
  metric2: { label: string; value: string };
  metric3: { label: string; value: string };
  description: string;
  physicsDetails: string;
  whyOtsuRejected: string;
  statusBadge: string;
  themeColor: string;
  iconType: 'mountain' | 'droplet' | 'flame';
}

export function AtlasView() {
  const { index } = useEvidence();
  const navigate = useNavigate();
  const [showSensorRace, setShowSensorRace] = useState(false);
  const [showPassport, setShowPassport] = useState(false);
  const [previewCase, setPreviewCase] = useState<GlobalCase | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPlanetaryMap, setShowPlanetaryMap] = useState<boolean>(true);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  const globalCases: GlobalCase[] = [
    {
      id: 'glacier-bay',
      name: 'Glacier Bay (Muir Inlet)',
      location: 'Southeast Alaska, USA',
      category: 'Cryospheric Ice',
      categoryTag: 'GLACIER TERMINUS RETREAT',
      status: 'Contextual Case',
      phenomenon: 'Cryospheric Ice-Calving & Tidewater Melt',
      processingMethod: 'Dual-pass velocity tracking & surface crevasse roughness correlation',
      coords: [-136.0, 58.8],
      coordsDisplay: '58.80°N, 136.00°W',
      sensor: 'Sentinel-1 SLC Interferometry',
      metric1: { label: 'Calving Speed', value: '4.2 km/yr' },
      metric2: { label: 'Inlet Area', value: '84,200 ha' },
      metric3: { label: 'Coherence', value: 'γ ≥ 0.42' },
      description: 'Educational reference for tidewater glacier terminus retreat. Cryospheric ice deformation requires coherent phase correlation rather than Otsu open-water thresholding.',
      physicsDetails: 'Glacier ice presents highly anisotropic dielectric properties and rapid temporal decorrelation due to surface melting. Terminus retreat is tracked via feature-tracking on SAR intensity and cross-track interferometry.',
      whyOtsuRejected: 'Glacial ice, slush, and sediment-rich meltwater share overlapping backscatter ranges (-14 dB to -20 dB). Applying a scalar threshold misclassifies solid ice shelves as open water.',
      statusBadge: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
      themeColor: 'cyan',
      iconType: 'mountain'
    },
    {
      id: 'mexico-city',
      name: 'Mexico City Basin (Texcoco)',
      location: 'Valley of Mexico',
      category: 'Aquifer InSAR',
      categoryTag: 'AQUIFER GROUND SUBSIDENCE',
      status: 'Derived Example',
      phenomenon: 'Volcanic Lacustrine Clay Soil Compaction',
      processingMethod: 'Differential InSAR phase-to-displacement Δd = -λ/(4π)·Δφ (38 cm/yr compaction)',
      coords: [-99.13, 19.43],
      coordsDisplay: '19.43°N, 99.13°W',
      sensor: 'Sentinel-1 InSAR C-Band',
      metric1: { label: 'Subsidence Rate', value: '-38 cm/yr' },
      metric2: { label: 'Basin Extent', value: '120,000 ha' },
      metric3: { label: 'Phase Coherence', value: 'γ ≥ 0.35' },
      description: 'Sub-surface groundwater over-extraction causes severe land compaction. Processed with unwrapped interferometric phase conversion and coherence masking.',
      physicsDetails: 'Unconsolidated lacustrine clay pore pressure drops under municipal over-extraction. The line-of-sight (LOS) phase change translates to millimetric vertical displacement per orbit.',
      whyOtsuRejected: 'Ground compaction produces negligible change in SAR radar intensity (backscatter stays near -8 to -12 dB for urban surfaces). Otsu water-intensity thresholding detects zero displacement.',
      statusBadge: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
      themeColor: 'purple',
      iconType: 'droplet'
    },
    {
      id: 'norcal-fire',
      name: 'Northern California (Dixie Scar)',
      location: 'Sierra Nevada, California',
      category: 'Wildfire Recovery',
      categoryTag: 'WILDFIRE BURN SCAR & VEGETATION',
      status: 'Illustrative Simulation',
      phenomenon: 'Canopy Pyrolysis & Post-Fire Regrowth',
      processingMethod: 'Normalized Burn Ratio (NBR) + Cross-Pol Volume Depolarization loss',
      coords: [-121.2, 40.0],
      coordsDisplay: '40.00°N, 121.20°W',
      sensor: 'Sentinel-2 MSI + NISAR L-Band',
      metric1: { label: 'Depolarization Loss', value: '-14.2 dB' },
      metric2: { label: 'Burned Perimeter', value: '389,837 ha' },
      metric3: { label: 'Recovery Index', value: 'dNDVI +0.18' },
      description: 'Multi-temporal wildfire canopy damage. Preserved as an attributed educational teaching reference to illustrate optical vs radar burn severity.',
      physicsDetails: 'Healthy forest generates dense volume scattering in cross-polarization (HV/VH). Severe burn destroys the canopy crown, shifting the radar echo to bare-ground surface scattering.',
      whyOtsuRejected: 'Burn scars increase dielectric dryness rather than creating standing specular water. Otsu water classifiers confuse exposed ash beds with shallow water puddles.',
      statusBadge: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
      themeColor: 'amber',
      iconType: 'flame'
    }
  ];

  // Global Telemetry Sites for the Map
  const telemetrySites: TelemetrySite[] = useMemo(() => [
    {
      id: 'jamuna',
      name: 'Jamuna River Basin',
      location: 'Bangladesh (Chilmari - Sirajganj)',
      coords: [89.65, 25.30],
      coordsDisplay: '25.30°N, 89.65°E',
      category: 'Braided River Morphology',
      status: 'Verified Analysis',
      sensor: 'Sentinel-1 RTC + NISAR',
      color: 'emerald',
      phenomenon: 'Monsoon Dynamic Sandbar Accretion & Bankline Erosion',
      isFlagship: true
    },
    {
      id: 'sundarbans',
      name: 'Sundarbans Mangrove Forest',
      location: 'Bangladesh (Passur Estuary - Hiron Point)',
      coords: [89.18, 21.95],
      coordsDisplay: '21.95°N, 89.18°E',
      category: 'Mangrove Tidal Pulse',
      status: 'Verified Analysis',
      sensor: 'Sentinel-1 RTC Cross-Pol (VH/VV)',
      color: 'emerald',
      phenomenon: 'Sub-canopy Tidal Inundation & Volume Scattering',
      isFlagship: true
    },
    {
      id: 'glacier-bay',
      name: 'Glacier Bay (Muir Inlet)',
      location: 'Southeast Alaska, USA',
      coords: [-136.0, 58.8],
      coordsDisplay: '58.80°N, 136.00°W',
      category: 'Cryospheric Ice',
      status: 'Contextual Case',
      sensor: 'Sentinel-1 SLC Interferometry',
      color: 'cyan',
      phenomenon: 'Cryospheric Ice-Calving & Tidewater Melt'
    },
    {
      id: 'mexico-city',
      name: 'Mexico City Basin (Texcoco)',
      location: 'Valley of Mexico',
      coords: [-99.13, 19.43],
      coordsDisplay: '19.43°N, 99.13°W',
      category: 'Aquifer InSAR',
      status: 'Derived Example',
      sensor: 'Sentinel-1 InSAR C-Band',
      color: 'purple',
      phenomenon: 'Volcanic Lacustrine Clay Soil Compaction'
    },
    {
      id: 'norcal-fire',
      name: 'Northern California (Dixie Scar)',
      location: 'Sierra Nevada, California',
      coords: [-121.2, 40.0],
      coordsDisplay: '40.00°N, 121.20°W',
      category: 'Wildfire Recovery',
      status: 'Illustrative Simulation',
      sensor: 'Sentinel-2 MSI + NISAR L-Band',
      color: 'amber',
      phenomenon: 'Canopy Pyrolysis & Post-Fire Regrowth'
    }
  ], []);

  // Filter chips
  const filterChips = [
    { id: 'all', label: 'All Landscapes', count: 5 },
    { id: 'active', label: 'Active Radar Biomes', count: 2 },
    { id: 'cryo', label: 'Glacier & Ice', count: 1 },
    { id: 'insar', label: 'InSAR Subsidence', count: 1 },
    { id: 'fire', label: 'Wildfire Recovery', count: 1 }
  ];

  // Filtering
  const activeRegions = useMemo(() => {
    return Object.values(index.regions).filter(region => {
      if (selectedFilter !== 'all' && selectedFilter !== 'active') return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        region.name.toLowerCase().includes(q) ||
        region.region_id.toLowerCase().includes(q) ||
        'braided river mangrove estuary bangladesh chilmari passur'.includes(q)
      );
    });
  }, [index.regions, selectedFilter, searchQuery]);

  const filteredGlobalCases = useMemo(() => {
    return globalCases.filter(site => {
      if (selectedFilter === 'active') return false;
      if (selectedFilter === 'cryo' && site.id !== 'glacier-bay') return false;
      if (selectedFilter === 'insar' && site.id !== 'mexico-city') return false;
      if (selectedFilter === 'fire' && site.id !== 'norcal-fire') return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        site.name.toLowerCase().includes(q) ||
        site.category.toLowerCase().includes(q) ||
        site.location.toLowerCase().includes(q) ||
        site.phenomenon.toLowerCase().includes(q) ||
        site.sensor.toLowerCase().includes(q)
      );
    });
  }, [globalCases, selectedFilter, searchQuery]);

  const totalVisibleCount = activeRegions.length + filteredGlobalCases.length;

  const handleStationSelect = (siteId: string) => {
    setSelectedStationId(siteId);
    if (siteId === 'jamuna' || siteId === 'sundarbans') {
      if (selectedFilter !== 'all' && selectedFilter !== 'active') {
        setSelectedFilter('active');
      }
      setTimeout(() => {
        const el = document.getElementById(`card-${siteId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-cyan-400');
          setTimeout(() => el.classList.remove('ring-2', 'ring-cyan-400'), 2200);
        }
      }, 50);
    } else {
      const site = globalCases.find(c => c.id === siteId);
      if (site) {
        setPreviewCase(site);
      }
    }
  };

  return (
    <div className="atlas-panel min-h-full w-full bg-[#0f171b] text-slate-100 flex flex-col items-center overflow-y-auto">
      {/* Inner centered container with generous horizontal space */}
      <div className="w-full max-w-[1340px] space-y-8 flex-1">

        {/* 1. COMPACT ELEGANT MISSION CONTROL HEADER */}
        <header className="rounded-2xl bg-[#151e22] border border-[#2a383e] p-7 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-[11px] font-mono tracking-wider">
                <Satellite size={13} className="text-cyan-400 animate-pulse" />
                <span>NASA SPACE APPS 2026 · PLANETARY RADAR ATLAS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Earth Change Atlas & Regional Observatory
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Operational multi-temporal SAR ingestion mathematically validated across Jamuna and Sundarbans. Comparative global hazard sites are preserved as attributed educational benchmarks with declared validation status.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowPlanetaryMap(!showPlanetaryMap)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  showPlanetaryMap
                    ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/70 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="Toggle Planetary Orbital Telemetry Grid Map"
              >
                <Globe size={15} className={showPlanetaryMap ? 'text-cyan-400' : 'text-slate-400'} />
                <span>{showPlanetaryMap ? 'Hide Orbit Map' : 'Planetary Orbit Map'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSensorRace(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-semibold text-xs shadow-lg shadow-cyan-950/50 transition-all cursor-pointer border border-cyan-400/40"
              >
                <Layers size={15} />
                <span>Sensor Race Benchmark</span>
              </button>

              <Link
                to="/reports"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                <FileText size={15} className="text-slate-400" />
                <span>Methods & Proofs</span>
              </Link>
            </div>
          </div>

          {/* Interactive Planetary Telemetry Map (Integrated inside Mission Control Header) */}
          {showPlanetaryMap && (
            <div className="pt-2 animate-in fade-in duration-300">
              <PlanetaryTelemetryMap
                sites={telemetrySites}
                selectedSiteId={selectedStationId}
                onSelectSite={handleStationSelect}
              />
            </div>
          )}

          {/* Symmetrical 4-Metric Telemetry Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-slate-800/80 font-mono text-xs">
            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/70 flex items-center gap-3.5">
              <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Active Ingestion</span>
                <strong className="text-white text-xs font-bold block mt-0.5 truncate">2 Flagship Biomes</strong>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/70 flex items-center gap-3.5">
              <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 shrink-0">
                <Activity size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Repeat Orbit</span>
                <strong className="text-white text-xs font-bold block mt-0.5 truncate">12-Day Nominal Pass</strong>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/70 flex items-center gap-3.5">
              <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-400 shrink-0">
                <Sliders size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Grid Sampling</span>
                <strong className="text-white text-xs font-bold block mt-0.5 truncate">10m – 30m RTC</strong>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/70 flex items-center gap-3.5">
              <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Verification</span>
                <strong className="text-white text-xs font-bold block mt-0.5 truncate">100% SHA-256 Provenance</strong>
              </div>
            </div>
          </div>
        </header>

        {/* 2. CATEGORY CHIPS & LIVE SEARCH ROW */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151e22] p-2.5 rounded-2xl border border-[#2a383e]">
            {/* YouTube-style Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {filterChips.map(chip => (
                <button
                  type="button"
                  key={chip.id}
                  onClick={() => setSelectedFilter(chip.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 ${
                    selectedFilter === chip.id
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <span>{chip.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedFilter === chip.id ? 'bg-cyan-800 text-cyan-100' : 'bg-slate-950 text-slate-400'
                  }`}>
                    {chip.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Live Search Input */}
            <div className="relative min-w-[240px] sm:max-w-xs w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter by name, sensor, or physics..."
                className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {(selectedFilter !== 'all' || searchQuery) && (
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
              <span>
                Showing <strong className="text-white font-mono">{totalVisibleCount}</strong> of 5 registered landscapes
              </span>
              <button
                type="button"
                onClick={() => { setSelectedFilter('all'); setSearchQuery(''); }}
                className="text-cyan-400 hover:underline cursor-pointer text-[11px]"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* 3. OPERATIONAL FLAGSHIP BIOMES (BALANCED 2-COLUMN GRID WITH INTERACTIVE RADAR SWIPE) */}
        {activeRegions.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <div>
                  <h2 className="font-bold text-base text-white tracking-tight">
                    Active Study Biomes
                  </h2>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Continuous SAR observation pipeline · 12-day orbital revisit
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/90 px-3 py-1 rounded-full font-semibold uppercase self-start sm:self-auto">
                Verified SAR Ingestion
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
              {activeRegions.map(region => {
                const isJamuna = region.region_id === 'jamuna';
                const coordsStr = isJamuna ? '25.30°N, 89.65°E' : '21.95°N, 89.18°E';
                const mainTitle = isJamuna ? 'Jamuna River Basin' : 'Sundarbans Mangrove Forest';
                const subTitle = isJamuna
                  ? 'Chilmari to Sirajganj Braided Reach · Bangladesh'
                  : 'Passur Estuary & Hiron Point Tidal Coast · Bangladesh';

                return (
                  <article
                    key={region.region_id}
                    id={`card-${region.region_id}`}
                    className="group relative flex flex-col justify-between rounded-2xl bg-[#151e22] border border-[#2a383e] hover:border-cyan-500/50 shadow-2xl overflow-hidden transition-all duration-300"
                  >
                    {/* Visual Interactive Before/After Radar Swipe Component */}
                    <CardImageSwipe
                      regionId={region.region_id}
                      opticalSrc={isJamuna ? '/rasters/jamuna_optical_2026-08-26.png' : '/rasters/sundarbans_optical_2026-08-26.png'}
                      sarSrc={isJamuna ? '/rasters/jamuna_sar_2026-08-26.png' : '/rasters/sundarbans_sar_2026-08-26.png'}
                      title={mainTitle}
                      coordsStr={coordsStr}
                      scenesCount={region.observations.length}
                      dbValue={isJamuna ? -19.2 : -11.5}
                      dbLabel={isJamuna ? '-19.2 dB Water' : '-11.5 dB Canopy'}
                      categoryTag={isJamuna ? 'BRAIDED RIVER MORPHOLOGY' : 'MANGROVE TIDAL PULSE'}
                    />

                    {/* Card Content Body */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {mainTitle}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400">
                            {region.pair.map(readableDate).join(' → ')}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-cyan-400 font-medium block">
                          {subTitle}
                        </span>

                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pt-1">
                          {isJamuna
                            ? 'Dynamic multi-channel braided river system. Tracks monsoon flood surges, sandbar (char) accretion, and bankline erosion via calibrated VV/VH backscatter thresholding.'
                            : 'Tidal mangrove wetland and estuary. Measures sub-canopy tidal inundation, volume scattering attenuation, and cyclonic storm surge penetration.'}
                        </p>
                      </div>

                      {/* Symmetrical 3-Column Fact Grid */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Valid Support</span>
                          <strong className="text-cyan-300 font-bold text-sm block mt-0.5">
                            {number(region.metrics.common_valid_fraction * 100)}%
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Analysis Grid</span>
                          <strong className="text-white font-bold text-sm block mt-0.5">
                            {number(region.metrics.common_valid_area_ha)} ha
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Sensor Engine</span>
                          <strong className="text-slate-200 font-medium text-xs truncate block mt-0.5">
                            Sentinel-1 RTC
                          </strong>
                        </div>
                      </div>

                      {/* Symmetrical Action Buttons */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            useWorkspaceStore.getState().setRegion(region.region_id);
                            navigate('/observatory/' + region.region_id);
                          }}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border border-cyan-400/40"
                        >
                          <span>Launch Interactive Observatory</span>
                          <ArrowUpRight size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            useWorkspaceStore.getState().setRegion(region.region_id);
                            setShowPassport(true);
                          }}
                          className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                          title="View Change Passport & Traceable Manifest"
                        >
                          <ShieldCheck size={14} className="text-emerald-400" />
                          <span>Passport</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. COMPARATIVE GLOBAL BENCHMARKS (BALANCED 3-COLUMN GRID) */}
        {filteredGlobalCases.length > 0 && (
          <section className="space-y-4 pt-6 mt-6 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Globe size={18} className="text-cyan-400" />
                <div>
                  <h2 className="font-bold text-base text-white tracking-tight">
                    Comparative Global Study Sites
                  </h2>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Educational references for non-fluvial cryospheric, tectonic, and burn regimes
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-amber-400/90 bg-amber-950/50 border border-amber-800/80 px-3 py-1 rounded-full font-mono self-start sm:self-auto">
                Strict Guardrail: River Otsu logic rejected over non-fluvial biomes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
              {filteredGlobalCases.map(site => (
                <article
                  key={site.id}
                  id={`card-${site.id}`}
                  className="group relative flex flex-col justify-between rounded-2xl bg-[#151e22] border border-[#2a383e] hover:border-slate-700 shadow-xl overflow-hidden transition-all duration-300"
                >
                  {/* Schematic Visual Header */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-950 flex items-center justify-center border-b border-slate-800">
                    <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

                    {site.iconType === 'mountain' && (
                      <div className="relative flex flex-col items-center justify-center text-cyan-400">
                        <Mountain size={44} className="stroke-[1.5]" />
                        <span className="text-[9px] font-mono mt-1 text-cyan-300 tracking-wider">CRYO CALVING FRONT · 58.8°N</span>
                      </div>
                    )}

                    {site.iconType === 'droplet' && (
                      <div className="relative flex flex-col items-center justify-center text-purple-400">
                        <Droplets size={44} className="stroke-[1.5]" />
                        <span className="text-[9px] font-mono mt-1 text-purple-300 tracking-wider">InSAR FRINGE PHASE · 19.4°N</span>
                      </div>
                    )}

                    {site.iconType === 'flame' && (
                      <div className="relative flex flex-col items-center justify-center text-amber-400">
                        <Flame size={44} className="stroke-[1.5]" />
                        <span className="text-[9px] font-mono mt-1 text-amber-300 tracking-wider">VOLUME DEPOLARIZATION · 40.0°N</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded bg-slate-950/90 border border-slate-700 text-[9px] font-mono font-bold text-slate-300 uppercase">
                        {site.categoryTag}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded border text-[9px] font-mono font-bold uppercase ${site.statusBadge}`}>
                        {site.status}
                      </span>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{site.coordsDisplay}</span>
                      <span className="text-slate-300 truncate max-w-[160px]">{site.sensor}</span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                        {site.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        {site.location}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                        {site.description}
                      </p>
                    </div>

                    {/* Symmetrical 3-Column Fact Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px]">
                      <div>
                        <span className="text-slate-400 block text-[9px]">{site.metric1.label}</span>
                        <strong className="text-cyan-300 font-bold text-xs">{site.metric1.value}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">{site.metric2.label}</span>
                        <strong className="text-white font-bold text-xs">{site.metric2.value}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">{site.metric3.label}</span>
                        <strong className="text-slate-300 font-medium text-xs">{site.metric3.value}</strong>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
                      <div className="truncate">Phenomenon: <span className="text-slate-200">{site.phenomenon}</span></div>
                      <div className="truncate">Method: <span className="text-cyan-300">{site.processingMethod}</span></div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewCase(site)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 transition-colors"
                    >
                      <Eye size={13} className="text-cyan-400" />
                      <span>Inspect Scientific Preview</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 5. INTERACTIVE SCIENTIFIC PREVIEW MODAL */}
        {previewCase && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 pt-16 sm:pt-20 pb-6 select-text animate-in fade-in duration-150">
            <div className="bg-[#151e22] border border-[#2a383e] rounded-2xl p-6 max-w-xl w-full text-xs space-y-4 text-slate-100 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[84vh] flex flex-col overflow-hidden">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3 shrink-0">
                <div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${previewCase.statusBadge}`}>
                    {previewCase.status}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{previewCase.name}</h3>
                  <span className="text-[10px] font-mono text-cyan-400">{previewCase.coordsDisplay} · {previewCase.location}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewCase(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Physical Mechanism
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-xs">{previewCase.physicsDetails}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sensor Constellation:</span>
                    <span className="text-white font-semibold">{previewCase.sensor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Analytical Pipeline:</span>
                    <span className="text-cyan-300">{previewCase.processingMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Coordinates:</span>
                    <span className="text-slate-300">{previewCase.coords[0]}°E, {previewCase.coords[1]}°N</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-800/80 text-amber-200 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <AlertTriangle size={13} />
                    <span>Scientific Guardrail — Why Otsu River Logic is Rejected:</span>
                  </div>
                  <p className="leading-relaxed text-amber-200/90">{previewCase.whyOtsuRejected}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewCase(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer transition-colors text-xs"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <SensorRaceModal isOpen={showSensorRace} onClose={() => setShowSensorRace(false)} />
        <ChangePassportModal isOpen={showPassport} onClose={() => setShowPassport(false)} />

        {/* Look Ahead Outlook & Place Watch */}
        <div className="pt-6 border-t border-slate-800/80 space-y-8">
          <AtlasOutlook />
          <AtlasPlaceWatch />
        </div>

        {/* FOOTER */}
        <footer className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-800/80 pt-5 pb-3">
          <Link to="/reports" className="text-cyan-400 hover:underline flex items-center gap-1 font-medium">
            <span>Explore calibration, math equations, and source manifests</span>
            <ArrowUpRight size={13} />
          </Link>
          <span className="text-[11px] font-mono text-slate-400">
            NASA Space Apps Challenge 2026 · Dancing with the SARs
          </span>
        </footer>

      </div>
    </div>
  );
}

export function AtlasHero() {
  const { index } = useEvidence();
  const regions = Object.values(index.regions);
  return (
    <PageIntro
      eyebrow="REGIONAL ATLAS"
      title="Two landscapes. Real observations."
      description="Choose a study area to inspect downloaded radar scenes, processing results and source records."
    >
      <div className="atlas-hero-stats">
        <div><b>{regions.length}</b><span>study areas</span></div>
        <div><b>{regions.reduce((n, r) => n + r.observations.length, 0)}</b><span>radar passes</span></div>
        <div><b>{regions.reduce((n, r) => n + (r.optical_observations?.length ?? 0), 0)}</b><span>optical scenes</span></div>
      </div>
      <a className="atlas-hero-scroll" href="#atlas-investigations">
        Choose your investigation <ArrowUpRight size={15} />
      </a>
    </PageIntro>
  );
}

