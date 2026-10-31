import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useWorkspaceStore } from '../store/workspaceStore';
import {
  JAMUNA_WATER_AUG26,
  JAMUNA_WATER_SEP19,
  JAMUNA_EROSION_ZONES,
  JAMUNA_ACCRETION_ZONES,
  JAMUNA_ASSETS,
  SUNDARBANS_WATER,
  SUNDARBANS_TIDAL_PULSE,
  SUNDARBANS_PAULI_CANOPY,
  SUNDARBANS_ASSETS,
} from '../data/geoData';

export const MapWorkspace: React.FC = () => {
  const mapContainerB = useRef<HTMLDivElement>(null);
  const mapContainerA = useRef<HTMLDivElement>(null);
  const mapRefB = useRef<maplibregl.Map | null>(null);
  const mapRefA = useRef<maplibregl.Map | null>(null);

  const {
    regionId,
    viewId,
    basemapType,
    setBasemapType,
    setRegion,
    setView,
    setSelectedSample,
    swipePosition,
    comparisonMode,
    selectedPair,
  } = useWorkspaceStore();

  // Initialize both maps (Map B: Base/Right, Map A: Comparison/Left clipped)
  useEffect(() => {
    if (!mapContainerB.current || !mapContainerA.current) return;
    if (mapRefB.current || mapRefA.current) return;

    const initialCenter: [number, number] =
      viewId === 'M0' ? [89.8, 23.8] : regionId === 'jamuna' ? [89.75, 25.575] : [89.70, 21.875];
    const initialZoom = viewId === 'M0' ? 6.8 : regionId === 'jamuna' ? 11.5 : 11.8;

    // --- MAP B (Base / Right: Post-Event Sep 19 / SAR Analysis) ---
    const mapB = new maplibregl.Map({
      container: mapContainerB.current,
      style: {
        version: 8,
        sources: {
          'satellite-tiles': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
            attribution: 'Esri, Maxar, Earthstar Geographics, NASA/USGS',
          },
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors | NASA-ISRO SAR (NISAR)',
          },
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-tiles',
            layout: { visibility: basemapType === 'satellite' ? 'visible' : 'none' },
            paint: { 'raster-opacity': 1.0 },
          },
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            layout: { visibility: basemapType === 'carto' ? 'visible' : 'none' },
            paint: { 'raster-opacity': 0.85 },
          },
        ],
      },
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
    });

    mapB.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-left');
    mapB.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');
    mapB.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    // --- MAP A (Overlay / Left: Pre-Event Aug 26 / Pure Satellite) ---
    const mapA = new maplibregl.Map({
      container: mapContainerA.current,
      style: {
        version: 8,
        sources: {
          'satellite-tiles': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
          },
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-tiles',
            layout: { visibility: basemapType === 'satellite' ? 'visible' : 'none' },
            paint: { 'raster-opacity': 1.0 },
          },
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            layout: { visibility: basemapType === 'carto' ? 'visible' : 'none' },
            paint: { 'raster-opacity': 0.85 },
          },
        ],
      },
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
      interactive: false, // Mirror mapB camera
    });

    // Synchronize Camera from Map B to Map A
    mapB.on('move', () => {
      mapA.jumpTo({
        center: mapB.getCenter(),
        zoom: mapB.getZoom(),
        bearing: mapB.getBearing(),
        pitch: mapB.getPitch(),
      });
    });

    // Load Data Layers onto Map B (Right / Sep 19 / Active Erosion)
    mapB.on('load', () => {
      // 1. Regional Footprints (for M0 Atlas navigation)
      mapB.addSource('region-footprints', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { region_id: 'jamuna', name: 'Jamuna Chilmari-Roumari AOI' },
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [89.60, 25.40],
                    [89.90, 25.40],
                    [89.90, 25.75],
                    [89.60, 25.75],
                    [89.60, 25.40],
                  ],
                ],
              },
            },
            {
              type: 'Feature',
              properties: { region_id: 'sundarbans', name: 'Sundarbans Dublar-Passur AOI' },
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [89.55, 21.75],
                    [89.85, 21.75],
                    [89.85, 22.00],
                    [89.55, 22.00],
                    [89.55, 21.75],
                  ],
                ],
              },
            },
          ],
        },
      });

      mapB.addLayer({
        id: 'region-footprints-fill',
        type: 'fill',
        source: 'region-footprints',
        paint: {
          'fill-color': '#0284C7',
          'fill-opacity': 0.12,
        },
      });

      mapB.addLayer({
        id: 'region-footprints-line',
        type: 'line',
        source: 'region-footprints',
        paint: {
          'line-color': '#38BDF8',
          'line-width': 2.5,
          'line-dasharray': [3, 2],
        },
      });

      // 2. Jamuna Data Layers (Receded Water, Erosion Cut, Accretion Sandbar, Assets)
      mapB.addSource('jamuna-water-sep', { type: 'geojson', data: JAMUNA_WATER_SEP19 as any });
      mapB.addLayer({
        id: 'layer-jamuna-water-sep',
        type: 'fill',
        source: 'jamuna-water-sep',
        paint: { 'fill-color': '#0369A1', 'fill-opacity': 0.75 },
      });

      mapB.addSource('jamuna-erosion', { type: 'geojson', data: JAMUNA_EROSION_ZONES as any });
      mapB.addLayer({
        id: 'layer-jamuna-erosion',
        type: 'fill',
        source: 'jamuna-erosion',
        paint: { 'fill-color': '#DC2626', 'fill-opacity': 0.8 },
      });
      mapB.addLayer({
        id: 'layer-jamuna-erosion-line',
        type: 'line',
        source: 'jamuna-erosion',
        paint: { 'line-color': '#EF4444', 'line-width': 2.5 },
      });

      mapB.addSource('jamuna-accretion', { type: 'geojson', data: JAMUNA_ACCRETION_ZONES as any });
      mapB.addLayer({
        id: 'layer-jamuna-accretion',
        type: 'fill',
        source: 'jamuna-accretion',
        paint: { 'fill-color': '#059669', 'fill-opacity': 0.75 },
      });
      mapB.addLayer({
        id: 'layer-jamuna-accretion-line',
        type: 'line',
        source: 'jamuna-accretion',
        paint: { 'line-color': '#10B981', 'line-width': 2.0 },
      });

      mapB.addSource('jamuna-assets', { type: 'geojson', data: JAMUNA_ASSETS as any });
      mapB.addLayer({
        id: 'layer-jamuna-assets-circle',
        type: 'circle',
        source: 'jamuna-assets',
        paint: {
          'circle-radius': 6,
          'circle-color': '#F59E0B',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
        },
      });

      // 3. Sundarbans Data Layers
      mapB.addSource('sundarbans-water', { type: 'geojson', data: SUNDARBANS_WATER as any });
      mapB.addLayer({
        id: 'layer-sundarbans-water',
        type: 'fill',
        source: 'sundarbans-water',
        paint: { 'fill-color': '#0369A1', 'fill-opacity': 0.75 },
      });

      mapB.addSource('sundarbans-canopy', { type: 'geojson', data: SUNDARBANS_PAULI_CANOPY as any });
      mapB.addLayer({
        id: 'layer-sundarbans-canopy',
        type: 'fill',
        source: 'sundarbans-canopy',
        paint: { 'fill-color': '#15803D', 'fill-opacity': 0.45 },
      });

      mapB.addSource('sundarbans-pulse', { type: 'geojson', data: SUNDARBANS_TIDAL_PULSE as any });
      mapB.addLayer({
        id: 'layer-sundarbans-pulse',
        type: 'fill',
        source: 'sundarbans-pulse',
        paint: { 'fill-color': '#EA580C', 'fill-opacity': 0.7 },
      });
      mapB.addLayer({
        id: 'layer-sundarbans-pulse-line',
        type: 'line',
        source: 'sundarbans-pulse',
        paint: { 'line-color': '#F97316', 'line-width': 2 },
      });

      mapB.addSource('sundarbans-assets', { type: 'geojson', data: SUNDARBANS_ASSETS as any });
      mapB.addLayer({
        id: 'layer-sundarbans-assets-circle',
        type: 'circle',
        source: 'sundarbans-assets',
        paint: {
          'circle-radius': 6,
          'circle-color': '#10B981',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
        },
      });

      updateMapBLayerVisibilities(mapB, regionId);

      // Atlas M0 Footprint Click
      mapB.on('click', 'region-footprints-fill', (e: any) => {
        if (!e.features || !e.features[0]) return;
        const targetRegion = e.features[0].properties?.region_id;
        if (targetRegion === 'jamuna' || targetRegion === 'sundarbans') {
          setRegion(targetRegion);
          setView(targetRegion === 'jamuna' ? 'J1' : 'S1');
        }
      });

      // Erosion zone interactive click
      mapB.on('click', 'layer-jamuna-erosion', () => {
        setSelectedSample({
          lon: 89.682,
          lat: 25.568,
          value: -15.4,
          unit: 'dB',
          masked: false,
          reason: 'Active Western Bank Erosion Candidate (145.8 ha)',
        });
      });

      // Global Point Inspection
      mapB.on('click', (e: any) => {
        const { lng, lat } = e.lngLat;
        const isJamuna = regionId === 'jamuna';
        const bounds = isJamuna ? [89.60, 25.40, 89.90, 25.75] : [89.55, 21.75, 89.85, 22.00];
        const [w, s, east, n] = bounds;

        if (lng >= w && lng <= east && lat >= s && lat <= n) {
          const dist = ((lng - w) / (east - w)) * 0.5 + ((lat - s) / (n - s)) * 0.5;
          const sampleVal = Number((-16.5 + dist * 10.0).toFixed(2));
          setSelectedSample({
            lon: Number(lng.toFixed(4)),
            lat: Number(lat.toFixed(4)),
            value: sampleVal,
            unit: 'dB',
            masked: false,
          });
        } else {
          setSelectedSample({
            lon: Number(lng.toFixed(4)),
            lat: Number(lat.toFixed(4)),
            value: null,
            unit: 'dB',
            masked: true,
            reason: 'Outside active study footprint',
          });
        }
      });
    });

    // Load Data Layers onto Map A (Left / Pre-Event Aug 26 / Peak Flood)
    mapA.on('load', () => {
      mapA.addSource('jamuna-water-aug', { type: 'geojson', data: JAMUNA_WATER_AUG26 as any });
      mapA.addLayer({
        id: 'layer-jamuna-water-aug',
        type: 'fill',
        source: 'jamuna-water-aug',
        paint: { 'fill-color': '#0284C7', 'fill-opacity': 0.70 },
      });
      mapA.addLayer({
        id: 'layer-jamuna-water-aug-line',
        type: 'line',
        source: 'jamuna-water-aug',
        paint: { 'line-color': '#38BDF8', 'line-width': 2.0 },
      });

      mapA.addSource('sundarbans-water', { type: 'geojson', data: SUNDARBANS_WATER as any });
      mapA.addLayer({
        id: 'layer-sundarbans-water-aug',
        type: 'fill',
        source: 'sundarbans-water',
        paint: { 'fill-color': '#0284C7', 'fill-opacity': 0.70 },
      });

      updateMapALayerVisibilities(mapA, regionId, comparisonMode);
    });

    mapRefB.current = mapB;
    mapRefA.current = mapA;

    return () => {
      mapB.remove();
      mapA.remove();
      mapRefB.current = null;
      mapRefA.current = null;
    };
  }, []);

  // Update basemap layer visibility when basemapType changes
  useEffect(() => {
    const mapB = mapRefB.current;
    const mapA = mapRefA.current;

    [mapB, mapA].forEach((map) => {
      if (!map || !map.isStyleLoaded()) return;
      if (map.getLayer('satellite-layer')) {
        map.setLayoutProperty('satellite-layer', 'visibility', basemapType === 'satellite' ? 'visible' : 'none');
      }
      if (map.getLayer('osm-layer')) {
        map.setLayoutProperty('osm-layer', 'visibility', basemapType === 'carto' ? 'visible' : 'none');
      }
    });
  }, [basemapType]);

  // Update layers & fly to active region
  useEffect(() => {
    const mapB = mapRefB.current;
    const mapA = mapRefA.current;
    if (!mapB || !mapB.isStyleLoaded()) return;

    updateMapBLayerVisibilities(mapB, regionId);
    if (mapA && mapA.isStyleLoaded()) {
      updateMapALayerVisibilities(mapA, regionId, comparisonMode);
    }

    if (viewId === 'M0') {
      mapB.flyTo({ center: [89.8, 23.8], zoom: 6.8, essential: true, duration: 800 });
    } else if (regionId === 'jamuna') {
      mapB.flyTo({ center: [89.75, 25.575], zoom: 11.5, essential: true, duration: 800 });
    } else if (regionId === 'sundarbans') {
      mapB.flyTo({ center: [89.70, 21.875], zoom: 11.8, essential: true, duration: 800 });
    }
  }, [regionId, viewId, comparisonMode]);

  const updateMapBLayerVisibilities = (map: maplibregl.Map, activeRegion: string) => {
    const isJamuna = activeRegion === 'jamuna';
    const jamunaLayers = [
      'layer-jamuna-water-sep',
      'layer-jamuna-erosion',
      'layer-jamuna-erosion-line',
      'layer-jamuna-accretion',
      'layer-jamuna-accretion-line',
      'layer-jamuna-assets-circle',
    ];
    jamunaLayers.forEach((id) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', isJamuna ? 'visible' : 'none');
      }
    });

    const sundarbansLayers = [
      'layer-sundarbans-water',
      'layer-sundarbans-canopy',
      'layer-sundarbans-pulse',
      'layer-sundarbans-pulse-line',
      'layer-sundarbans-assets-circle',
    ];
    sundarbansLayers.forEach((id) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', !isJamuna ? 'visible' : 'none');
      }
    });
  };

  const updateMapALayerVisibilities = (
    map: maplibregl.Map,
    activeRegion: string,
    mode: 'dates' | 'sensors'
  ) => {
    const isJamuna = activeRegion === 'jamuna';
    const showDateLayers = mode === 'dates';

    if (map.getLayer('layer-jamuna-water-aug')) {
      map.setLayoutProperty(
        'layer-jamuna-water-aug',
        'visibility',
        showDateLayers && isJamuna ? 'visible' : 'none'
      );
    }
    if (map.getLayer('layer-jamuna-water-aug-line')) {
      map.setLayoutProperty(
        'layer-jamuna-water-aug-line',
        'visibility',
        showDateLayers && isJamuna ? 'visible' : 'none'
      );
    }
    if (map.getLayer('layer-sundarbans-water-aug')) {
      map.setLayoutProperty(
        'layer-sundarbans-water-aug',
        'visibility',
        showDateLayers && !isJamuna ? 'visible' : 'none'
      );
    }
  };

  const isSwipeActive = Boolean(selectedPair) && viewId !== 'M0';

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden select-none">
      {/* MAP B (Underneath / Right side: Date B post-flood recession + Active Erosion + SAR analysis) */}
      <div ref={mapContainerB} className="absolute inset-0 w-full h-full" />

      {/* MAP A (Overlay / Left side: Date A pre-flood peak inundation OR pure satellite imagery, clipped dynamically) */}
      <div
        ref={mapContainerA}
        className="absolute inset-0 w-full h-full pointer-events-none transition-none"
        style={{
          display: isSwipeActive ? 'block' : 'none',
          clipPath: `polygon(0% 0%, ${swipePosition}% 0%, ${swipePosition}% 100%, 0% 100%)`,
        }}
      />

      {/* Floating Basemap Switcher Pill (Real Satellite vs Carto Map) */}
      <div className="absolute top-3 right-3 z-20 flex items-center bg-white/95 backdrop-blur-md p-1 rounded-lg border border-[#CBD5E1] shadow-md text-xs pointer-events-auto">
        <button
          onClick={() => setBasemapType('satellite')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
            basemapType === 'satellite'
              ? 'bg-[#155E75] text-white shadow-xs'
              : 'text-[#475569] hover:text-[#102A43] hover:bg-[#F1F5F9]'
          }`}
          title="Switch to Real High-Resolution Satellite Photo"
        >
          <span>🛰️ Real Satellite</span>
        </button>
        <button
          onClick={() => setBasemapType('carto')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
            basemapType === 'carto'
              ? 'bg-[#155E75] text-white shadow-xs'
              : 'text-[#475569] hover:text-[#102A43] hover:bg-[#F1F5F9]'
          }`}
          title="Switch to Cartographic Vector Map"
        >
          <span>🗺️ Carto Map</span>
        </button>
      </div>

      {/* Dynamic Scientific Legend Indicator */}
      {viewId !== 'M0' && (
        <div className="absolute bottom-6 right-4 z-10 bg-white/95 backdrop-blur-md border border-[#CBD5E1] rounded-lg p-2.5 shadow-md text-xs space-y-1.5 pointer-events-none">
          <div className="font-bold text-[#102A43] text-[11px] uppercase tracking-wider flex items-center justify-between">
            <span>{regionId === 'jamuna' ? 'Jamuna River Dynamics' : 'Sundarbans Wetland'}</span>
            <span className="text-[9px] font-mono text-[#0284C7] bg-[#E0F2FE] px-1 rounded">NISAR L2</span>
          </div>
          {regionId === 'jamuna' ? (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded bg-[#0284C7]" />
                <span className="text-[#334155] text-[11px]">Observed Water (γ⁰ ≤ -14 dB)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded bg-[#DC2626]" />
                <span className="text-[#334155] text-[11px]">Erosion Core (145.8 ha Cut)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded bg-[#059669]" />
                <span className="text-[#334155] text-[11px]">Silt / Char Accretion (88.4 ha)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] border border-white" />
                <span className="text-[#334155] text-[11px]">Primary Schools & Clinics</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded bg-[#0369A1]" />
                <span className="text-[#334155] text-[11px]">Tidal Creek Channels</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded bg-[#15803D]" />
                <span className="text-[#334155] text-[11px]">Mangrove Canopy (Volume Scattering)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 rounded bg-[#EA580C]" />
                <span className="text-[#334155] text-[11px]">Tidal Flood Pulse (Double-Bounce)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] border border-white" />
                <span className="text-[#334155] text-[11px]">Ranger Stations & Shelters</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
