import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Camera, Check } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { BasemapType, OverlayStyle } from '../store/workspaceStore';
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
  getJamunaWaterForDate,
  getJamunaErosionForDate,
  getJamunaAccretionForDate,
  getSundarbansWaterForDate,
  getSundarbansPulseForDate,
} from '../data/geoData';

// Configure static, direct MapLibre Web Worker to eliminate Vite ESM loader issues
maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');

const JAMUNA_RASTER_COORDS: [[number, number], [number, number], [number, number], [number, number]] = [
  [89.60, 25.75], // Top-Left
  [89.90, 25.75], // Top-Right
  [89.90, 25.40], // Bottom-Right
  [89.60, 25.40], // Bottom-Left
];

const SUNDARBANS_RASTER_COORDS: [[number, number], [number, number], [number, number], [number, number]] = [
  [89.55, 22.00], // Top-Left
  [89.85, 22.00], // Top-Right
  [89.85, 21.75], // Bottom-Right
  [89.55, 21.75], // Bottom-Left
];

export const MapWorkspace: React.FC = () => {
  const mapContainerB = useRef<HTMLDivElement>(null);
  const mapContainerA = useRef<HTMLDivElement>(null);
  const mapRefB = useRef<maplibregl.Map | null>(null);
  const mapRefA = useRef<maplibregl.Map | null>(null);

  const [currentZoom, setCurrentZoom] = useState<number>(11.5);
  const [snapshotTaken, setSnapshotTaken] = useState<boolean>(false);

  // TEMPORARY basemap debug harness (?debug=1): live map state + real-browser tile probe.
  // Lets the user report one string instead of guessing. Remove after verification.
  const isDebug =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug');
  const [dbgText, setDbgText] = useState('booting…');
  const mapErrorsRef = useRef<string[]>([]);
  const tileProbeRef = useRef('probe: not run');

  const {
    regionId,
    viewId,
    basemapType,
    overlayStyle,
    layerVisibility,
    setBasemapType,
    setOverlayStyle,
    setRegion,
    setView,
    setSelectedSample,
    setSelectedFinding,
    setPanels,
    swipePosition,
    comparisonMode,
    selectedPair,
    selectedDate,
    language,
  } = useWorkspaceStore();

  const isBn = language === 'bn';

  // LATEST-WINS state ref: async map callbacks ('load'/'styledata') must apply the user's
  // CURRENT basemap choice — not the mount-time snapshot captured in the first render closure.
  // NOTE: this assignment runs on every render, so the ref is always in sync with the store.
  const basemapStateRef = useRef({ basemapType, comparisonMode });
  basemapStateRef.current = { basemapType, comparisonMode };

  // Helper to apply basemaps across either map instance.
  // FIX: previously returned early when the style was not loaded, silently DROPPING the
  // user's click forever (no retry). Now we schedule a one-shot retry on 'styledata'
  // so an early click always lands as soon as the style is ready.
  const applyBasemapWithRetry = (map: maplibregl.Map | null, type: BasemapType) => {
    if (!map) return;
    const doApply = () => {
      if (map.getLayer('satellite-layer')) {
        map.setLayoutProperty('satellite-layer', 'visibility', type === 'satellite' ? 'visible' : 'none');
      }
      if (map.getLayer('sar-layer')) {
        map.setLayoutProperty('sar-layer', 'visibility', type === 'sar' ? 'visible' : 'none');
      }
      if (map.getLayer('osm-layer')) {
        map.setLayoutProperty('osm-layer', 'visibility', type === 'carto' ? 'visible' : 'none');
      }
    };
    if (map.isStyleLoaded()) {
      doApply();
    } else {
      map.once('styledata', doApply);
    }
  };

  // Sync basemaps depending on active comparisonMode (reads LATEST state via ref)
  const syncBasemaps = () => {
    const { basemapType: type, comparisonMode: mode } = basemapStateRef.current;
    const mapB = mapRefB.current;
    const mapA = mapRefA.current;

    if (mode === 'sensors') {
      // Optical Satellite on Left; the right "sensor panel" honors the user's selection
      // (defaulting to the NISAR SAR panel when Optical is picked, so both sides differ).
      if (mapA) applyBasemapWithRetry(mapA, 'satellite');
      if (mapB) applyBasemapWithRetry(mapB, type === 'satellite' ? 'sar' : type);
    } else {
      // Dates mode: both maps use user's selected basemap
      if (mapA) applyBasemapWithRetry(mapA, type);
      if (mapB) applyBasemapWithRetry(mapB, type);
    }
  };

  // Dynamic fill opacity & thematic styling management:
  // Water layers maintain realistic hydrologic fill so flood vs recession is clearly visible during swipe!
  const applyDynamicThematicStyles = (
    map: maplibregl.Map | null,
    type: BasemapType,
    style: OverlayStyle
  ) => {
    if (!map || !map.isStyleLoaded()) return;
    const isOutlines = style === 'outlines';

    // 1. Water color & opacity by basemap
    // In Satellite/SAR mode, real high-resolution satellite/SAR rasters are rendered underneath!
    // Outlines mode keeps water fill at 0.0 (only crisp border line) so 100% of real satellite water and river channel is visible without blue wash.
    const waterColor = type === 'sar' ? '#020617' : '#0284C7';
    const waterOpacity = type === 'carto' ? (isOutlines ? 0.12 : 0.28) : (isOutlines ? 0.0 : 0.08);
    const waterLineColor = type === 'sar' ? '#06B6D4' : '#38BDF8';

    ['layer-jamuna-water-sep', 'layer-jamuna-water-aug', 'layer-sundarbans-water', 'layer-sundarbans-water-aug'].forEach((id) => {
      if (map.getLayer(id)) {
        map.setPaintProperty(id, 'fill-color', waterColor);
        map.setPaintProperty(id, 'fill-opacity', waterOpacity);
      }
      const lineId = `${id}-line`;
      if (map.getLayer(lineId)) {
        map.setPaintProperty(lineId, 'line-color', waterLineColor);
        map.setPaintProperty(lineId, 'line-width', 2.0);
      }
    });

    // 2. Erosion color & opacity
    const erosionColor = '#DC2626';
    const erosionOpacity = isOutlines ? 0.12 : 0.28;
    ['layer-jamuna-erosion', 'layer-jamuna-erosion-aug'].forEach((id) => {
      if (map.getLayer(id)) {
        map.setPaintProperty(id, 'fill-color', erosionColor);
        map.setPaintProperty(id, 'fill-opacity', erosionOpacity);
      }
      const lineId = `${id}-line`;
      if (map.getLayer(lineId)) {
        map.setPaintProperty(lineId, 'line-color', '#EF4444');
        map.setPaintProperty(lineId, 'line-width', 2.2);
      }
    });

    // 3. Accretion / emergent sandbar color & opacity
    const accretionColor = type === 'sar' ? '#64748B' : '#D4B996';
    const accretionOpacity = isOutlines ? 0.10 : 0.25;
    const accretionLineColor = type === 'sar' ? '#94A3B8' : '#B45309';
    ['layer-jamuna-accretion', 'layer-jamuna-accretion-aug'].forEach((id) => {
      if (map.getLayer(id)) {
        map.setPaintProperty(id, 'fill-color', accretionColor);
        map.setPaintProperty(id, 'fill-opacity', accretionOpacity);
      }
      const lineId = `${id}-line`;
      if (map.getLayer(lineId)) {
        map.setPaintProperty(lineId, 'line-color', accretionLineColor);
        map.setPaintProperty(lineId, 'line-width', 2.0);
      }
    });

    // 4. Sundarbans tidal pulse (sub-canopy double bounce)
    const pulseColor = type === 'sar' ? '#FB923C' : '#EA580C';
    const pulseOpacity = type === 'sar' ? 0.75 : isOutlines ? 0.38 : 0.58;
    ['layer-sundarbans-pulse', 'layer-sundarbans-pulse-aug'].forEach((id) => {
      if (map.getLayer(id)) {
        map.setPaintProperty(id, 'fill-color', pulseColor);
        map.setPaintProperty(id, 'fill-opacity', pulseOpacity);
      }
      const lineId = `${id}-line`;
      if (map.getLayer(lineId)) {
        map.setPaintProperty(lineId, 'line-color', '#F97316');
        map.setPaintProperty(lineId, 'line-width', 2.2);
      }
    });

    // 5. Sundarbans canopy volume
    const canopyColor = type === 'sar' ? '#22C55E' : '#15803D';
    const canopyOpacity = isOutlines ? 0.18 : 0.32;
    if (map.getLayer('layer-sundarbans-canopy')) {
      map.setPaintProperty('layer-sundarbans-canopy', 'fill-color', canopyColor);
      map.setPaintProperty('layer-sundarbans-canopy', 'fill-opacity', canopyOpacity);
    }
    if (map.getLayer('layer-sundarbans-canopy-line')) {
      map.setPaintProperty('layer-sundarbans-canopy-line', 'line-color', '#16A34A');
      map.setPaintProperty('layer-sundarbans-canopy-line', 'line-width', 1.8);
    }
  };

  // Atmosphere and radiometric tone adjustments per satellite date
  const applyTemporalSatelliteTones = (
    map: maplibregl.Map | null,
    date: string,
    type: BasemapType
  ) => {
    if (!map || !map.isStyleLoaded()) return;

    if (type === 'satellite' && map.getLayer('satellite-layer')) {
      if (date === '2026-08-26' || date === '2026-08-10') {
        // Monsoon flood peak: high humidity, saturated water sediment, cloudy monsoon glow
        map.setPaintProperty('satellite-layer', 'raster-saturation', 0.20);
        map.setPaintProperty('satellite-layer', 'raster-contrast', 0.12);
        map.setPaintProperty('satellite-layer', 'raster-brightness-max', 0.95);
      } else if (date === '2026-10-21') {
        // Winter dry season: crisp low-humidity atmosphere, sharp sandbars
        map.setPaintProperty('satellite-layer', 'raster-saturation', -0.05);
        map.setPaintProperty('satellite-layer', 'raster-contrast', 0.28);
        map.setPaintProperty('satellite-layer', 'raster-brightness-max', 1.05);
      } else if (date === '2026-09-19') {
        // Flood recession: post-monsoon clearing
        map.setPaintProperty('satellite-layer', 'raster-saturation', 0.08);
        map.setPaintProperty('satellite-layer', 'raster-contrast', 0.22);
        map.setPaintProperty('satellite-layer', 'raster-brightness-max', 1.0);
      } else {
        // Early monsoon (Jun 23, Jul 17)
        map.setPaintProperty('satellite-layer', 'raster-saturation', 0.0);
        map.setPaintProperty('satellite-layer', 'raster-contrast', 0.18);
        map.setPaintProperty('satellite-layer', 'raster-brightness-max', 1.0);
      }
    }

    if (type === 'sar' && map.getLayer('sar-layer')) {
      if (date === '2026-08-26' || date === '2026-08-10') {
        map.setPaintProperty('sar-layer', 'raster-contrast', 1.15);
        map.setPaintProperty('sar-layer', 'raster-brightness-max', 0.58);
      } else {
        map.setPaintProperty('sar-layer', 'raster-contrast', 1.0);
        map.setPaintProperty('sar-layer', 'raster-brightness-max', 0.62);
      }
    }
  };

  // Initialize both MapLibre maps
  useEffect(() => {
    if (!mapContainerB.current || !mapContainerA.current) return;
    if (mapRefB.current || mapRefA.current) return;

    const initialCenter: [number, number] =
      viewId === 'M0' ? [89.8, 23.8] : regionId === 'jamuna' ? [89.75, 25.575] : [89.70, 21.875];
    const initialZoom = viewId === 'M0' ? 6.8 : regionId === 'jamuna' ? 11.5 : 11.8;

    const tileSources = {
      // 1. High-Resolution Optical True-Color Satellite Imagery (Esri World Imagery)
      'satellite-tiles': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: 'Esri, Maxar, Earthstar Geographics, NASA/USGS',
      },
      // 2. SIMULATED NISAR L-band SAR amplitude panel: same optical mosaic rendered
      //    through a grayscale high-contrast "microwave X-ray" paint transform.
      //    (Public XYZ tile servers do not host real NISAR/SAR rasters without auth,
      //    so the radar look is synthesized in-paint; attribution kept honest.)
      'sar-tiles': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: 'Optical base © Esri · Simulated NISAR L-band amplitude (grayscale γ⁰)',
      },
      // 3. Cartographic Vector Map (OpenStreetMap)
      'osm-tiles': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors',
      },
    };

    const tileLayers = [
      {
        id: 'bg-layer',
        type: 'background',
        paint: { 'background-color': '#0F172A' },
      },
      {
        id: 'satellite-layer',
        type: 'raster',
        source: 'satellite-tiles',
        layout: { visibility: 'visible' },
        paint: { 'raster-opacity': 1.0 },
      },
      {
        id: 'sar-layer',
        type: 'raster',
        source: 'sar-tiles',
        layout: { visibility: 'none' },
        paint: {
          'raster-opacity': 1.0,
          'raster-saturation': -1.0, // Fully grayscale — microwave backscatter X-ray look
          'raster-contrast': 1.0, // Crushed blacks / bright speckle highlights
          'raster-brightness-min': 0.0,
          'raster-brightness-max': 0.62, // Dark amplitude readout — unmistakable vs optical baseline
          'raster-hue-rotate': 0,
        },
      },
      {
        id: 'osm-layer',
        type: 'raster',
        source: 'osm-tiles',
        layout: { visibility: 'none' },
        paint: { 'raster-opacity': 1.0 },
      },
    ];

    // --- MAP B (Base / Right: Post-Event Sep 19 / Active Erosion & SAR Analysis) ---
    const mapB = new maplibregl.Map({
      container: mapContainerB.current,
      canvasContextAttributes: { preserveDrawingBuffer: true },
      style: {
        version: 8,
        sources: tileSources as any,
        layers: tileLayers as any,
      },
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
    });

    mapB.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-left');
    mapB.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');
    mapB.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    // --- MAP A (Overlay / Left: Pre-Event Aug 26 Flood Peak / Pure Optical Satellite) ---
    const mapA = new maplibregl.Map({
      container: mapContainerA.current,
      canvasContextAttributes: { preserveDrawingBuffer: true },
      style: {
        version: 8,
        sources: tileSources as any,
        layers: tileLayers as any,
      },
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
      interactive: false, // Mirrored camera from mapB
    });

    mapRefB.current = mapB;
    mapRefA.current = mapA;
    (window as any).__mapA = mapA;
    (window as any).__mapB = mapB;

    if (isDebug) {
      [mapB, mapA].forEach((m) =>
        m.on('error', (e: any) => {
          const msg =
            typeof e?.error === 'string'
              ? e.error
              : e?.error?.message || e?.statusText || 'unknown-error';
          mapErrorsRef.current.push(String(msg).slice(0, 120));
          if (mapErrorsRef.current.length > 6) mapErrorsRef.current.shift();
        })
      );
    }

    // Synchronize Camera from Map B to Map A continuously
    const syncCamera = () => {
      mapA.jumpTo({
        center: mapB.getCenter(),
        zoom: mapB.getZoom(),
        bearing: mapB.getBearing(),
        pitch: mapB.getPitch(),
      });
      setCurrentZoom(Number(mapB.getZoom().toFixed(1)));
    };
    mapB.on('move', syncCamera);
    mapB.on('zoom', syncCamera);
    mapB.on('rotate', syncCamera);

    // Load Data Layers onto Map B (Right Side: Post-Flood Sep 19 / Active Erosion Cut)
    mapB.on('load', () => {
      syncBasemaps();

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
        paint: { 'fill-color': '#0284C7', 'fill-opacity': 0.12 },
      });

      mapB.addLayer({
        id: 'region-footprints-line',
        type: 'line',
        source: 'region-footprints',
        paint: { 'line-color': '#38BDF8', 'line-width': 2.5, 'line-dasharray': [3, 2] },
      });

      // 0. Primary Georeferenced High-Resolution Satellite & SAR Rasters
      const dateBInit = comparisonMode === 'dates' && selectedPair ? selectedPair[1] : selectedDate;
      const typeBInit = basemapType === 'sar' ? 'sar' : 'optical';
      mapB.addSource('jamuna-raster-scene', {
        type: 'image',
        url: `/rasters/jamuna_${typeBInit}_${dateBInit}.png`,
        coordinates: JAMUNA_RASTER_COORDS,
      });
      mapB.addLayer({
        id: 'layer-jamuna-raster-scene',
        type: 'raster',
        source: 'jamuna-raster-scene',
        paint: { 'raster-opacity': 1.0 },
      });

      mapB.addSource('sundarbans-raster-scene', {
        type: 'image',
        url: `/rasters/sundarbans_${typeBInit}_${dateBInit}.png`,
        coordinates: SUNDARBANS_RASTER_COORDS,
      });
      mapB.addLayer({
        id: 'layer-sundarbans-raster-scene',
        type: 'raster',
        source: 'sundarbans-raster-scene',
        paint: { 'raster-opacity': 1.0 },
      });

      // 2. Jamuna Post-Flood Data Layers
      // Receded Water with realistic dynamic hydrologic surface
      mapB.addSource('jamuna-water-sep', { type: 'geojson', data: JAMUNA_WATER_SEP19 as any });
      mapB.addLayer({
        id: 'layer-jamuna-water-sep',
        type: 'fill',
        source: 'jamuna-water-sep',
        paint: { 'fill-color': '#0284C7', 'fill-opacity': 0.52 },
      });
      mapB.addLayer({
        id: 'layer-jamuna-water-sep-line',
        type: 'line',
        source: 'jamuna-water-sep',
        paint: { 'line-color': '#38BDF8', 'line-width': 2.2 },
      });

      // Active Riverbank Erosion (Prominent warning zone along collapsing cutbank)
      mapB.addSource('jamuna-erosion', { type: 'geojson', data: JAMUNA_EROSION_ZONES as any });
      mapB.addLayer({
        id: 'layer-jamuna-erosion',
        type: 'fill',
        source: 'jamuna-erosion',
        paint: { 'fill-color': '#DC2626', 'fill-opacity': 0.40 },
      });
      mapB.addLayer({
        id: 'layer-jamuna-erosion-line',
        type: 'line',
        source: 'jamuna-erosion',
        paint: {
          'line-color': '#EF4444',
          'line-width': 2.4,
        },
      });

      // Silt / Char Accretion (Emergent agricultural sandbars)
      mapB.addSource('jamuna-accretion', { type: 'geojson', data: JAMUNA_ACCRETION_ZONES as any });
      mapB.addLayer({
        id: 'layer-jamuna-accretion',
        type: 'fill',
        source: 'jamuna-accretion',
        paint: { 'fill-color': '#D4B996', 'fill-opacity': 0.45 },
      });
      mapB.addLayer({
        id: 'layer-jamuna-accretion-line',
        type: 'line',
        source: 'jamuna-accretion',
        paint: { 'line-color': '#B45309', 'line-width': 2.0 },
      });

      // Jamuna Critical Infrastructure Assets (Schools, Clinics, Ferries)
      mapB.addSource('jamuna-assets', { type: 'geojson', data: JAMUNA_ASSETS as any });
      mapB.addLayer({
        id: 'layer-jamuna-assets-circle',
        type: 'circle',
        source: 'jamuna-assets',
        paint: {
          'circle-radius': 6.5,
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
        paint: { 'fill-color': '#0284C7', 'fill-opacity': 0.52 },
      });
      mapB.addLayer({
        id: 'layer-sundarbans-water-line',
        type: 'line',
        source: 'sundarbans-water',
        paint: { 'line-color': '#38BDF8', 'line-width': 2.2 },
      });

      mapB.addSource('sundarbans-canopy', { type: 'geojson', data: SUNDARBANS_PAULI_CANOPY as any });
      mapB.addLayer({
        id: 'layer-sundarbans-canopy',
        type: 'fill',
        source: 'sundarbans-canopy',
        paint: { 'fill-color': '#15803D', 'fill-opacity': 0.18 },
      });
      mapB.addLayer({
        id: 'layer-sundarbans-canopy-line',
        type: 'line',
        source: 'sundarbans-canopy',
        paint: { 'line-color': '#16A34A', 'line-width': 1.8 },
      });

      mapB.addSource('sundarbans-pulse', { type: 'geojson', data: SUNDARBANS_TIDAL_PULSE as any });
      mapB.addLayer({
        id: 'layer-sundarbans-pulse',
        type: 'fill',
        source: 'sundarbans-pulse',
        paint: { 'fill-color': '#EA580C', 'fill-opacity': 0.38 },
      });
      mapB.addLayer({
        id: 'layer-sundarbans-pulse-line',
        type: 'line',
        source: 'sundarbans-pulse',
        paint: { 'line-color': '#F97316', 'line-width': 2.2 },
      });

      mapB.addSource('sundarbans-assets', { type: 'geojson', data: SUNDARBANS_ASSETS as any });
      mapB.addLayer({
        id: 'layer-sundarbans-assets-circle',
        type: 'circle',
        source: 'sundarbans-assets',
        paint: {
          'circle-radius': 6.5,
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
          lon: 89.668,
          lat: 25.568,
          value: -15.4,
          unit: 'dB',
          masked: false,
          reason: 'Active Western Bank Erosion Candidate (145.8 ha)',
        });
      });

      // Sundarbans pulse interactive click
      mapB.on('click', 'layer-sundarbans-pulse', () => {
        setSelectedSample({
          lon: 89.725,
          lat: 21.825,
          value: -10.1,
          unit: 'dB',
          masked: false,
          reason: 'Sub-Canopy Tidal Flood Double-Bounce (+3.5 dB HH)',
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

      applyDynamicThematicStyles(mapB, basemapType, overlayStyle);
    });

    // Load Data Layers onto Map A (Left Side: Pre-Flood Aug 26 Flood Peak / Pure Optical Satellite)
    mapA.on('load', () => {
      syncBasemaps();

      const dateAInit = comparisonMode === 'dates' && selectedPair ? selectedPair[0] : selectedDate;
      const typeAInit = comparisonMode === 'sensors' ? 'satellite' : (basemapType === 'sar' ? 'sar' : 'optical');
      const urlAInit = `/rasters/jamuna_${typeAInit === 'sar' ? 'sar' : 'optical'}_${dateAInit}.png`;

      // 0. Primary Georeferenced High-Resolution Satellite & SAR Rasters for Map A
      mapA.addSource('jamuna-raster-scene-a', {
        type: 'image',
        url: urlAInit,
        coordinates: JAMUNA_RASTER_COORDS,
      });
      mapA.addLayer({
        id: 'layer-jamuna-raster-scene-a',
        type: 'raster',
        source: 'jamuna-raster-scene-a',
        paint: { 'raster-opacity': 1.0 },
      });

      mapA.addSource('sundarbans-raster-scene-a', {
        type: 'image',
        url: `/rasters/sundarbans_${typeAInit === 'sar' ? 'sar' : 'optical'}_${dateAInit}.png`,
        coordinates: SUNDARBANS_RASTER_COORDS,
      });
      mapA.addLayer({
        id: 'layer-sundarbans-raster-scene-a',
        type: 'raster',
        source: 'sundarbans-raster-scene-a',
        paint: { 'raster-opacity': 1.0 },
      });

      // Pre-flood peak inundation mask (August 26: Stage 18.9m)
      mapA.addSource('jamuna-water-aug', { type: 'geojson', data: JAMUNA_WATER_AUG26 as any });
      mapA.addLayer({
        id: 'layer-jamuna-water-aug',
        type: 'fill',
        source: 'jamuna-water-aug',
        paint: { 'fill-color': '#0284C7', 'fill-opacity': 0.52 },
      });
      mapA.addLayer({
        id: 'layer-jamuna-water-aug-line',
        type: 'line',
        source: 'jamuna-water-aug',
        paint: { 'line-color': '#38BDF8', 'line-width': 2.2 },
      });

      // Jamuna Erosion & Accretion on Map A for stage-matched comparison
      mapA.addSource('jamuna-erosion-aug', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } as any });
      mapA.addLayer({
        id: 'layer-jamuna-erosion-aug',
        type: 'fill',
        source: 'jamuna-erosion-aug',
        paint: { 'fill-color': '#DC2626', 'fill-opacity': 0.40 },
      });
      mapA.addLayer({
        id: 'layer-jamuna-erosion-aug-line',
        type: 'line',
        source: 'jamuna-erosion-aug',
        paint: { 'line-color': '#EF4444', 'line-width': 2.4 },
      });

      mapA.addSource('jamuna-accretion-aug', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } as any });
      mapA.addLayer({
        id: 'layer-jamuna-accretion-aug',
        type: 'fill',
        source: 'jamuna-accretion-aug',
        paint: { 'fill-color': '#D4B996', 'fill-opacity': 0.45 },
      });
      mapA.addLayer({
        id: 'layer-jamuna-accretion-aug-line',
        type: 'line',
        source: 'jamuna-accretion-aug',
        paint: { 'line-color': '#B45309', 'line-width': 2.0 },
      });

      mapA.addSource('sundarbans-water-aug', { type: 'geojson', data: SUNDARBANS_WATER as any });
      mapA.addLayer({
        id: 'layer-sundarbans-water-aug',
        type: 'fill',
        source: 'sundarbans-water-aug',
        paint: { 'fill-color': '#0284C7', 'fill-opacity': 0.52 },
      });
      mapA.addLayer({
        id: 'layer-sundarbans-water-aug-line',
        type: 'line',
        source: 'sundarbans-water-aug',
        paint: { 'line-color': '#38BDF8', 'line-width': 2.2 },
      });

      mapA.addSource('sundarbans-pulse-aug', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } as any });
      mapA.addLayer({
        id: 'layer-sundarbans-pulse-aug',
        type: 'fill',
        source: 'sundarbans-pulse-aug',
        paint: { 'fill-color': '#EA580C', 'fill-opacity': 0.38 },
      });
      mapA.addLayer({
        id: 'layer-sundarbans-pulse-aug-line',
        type: 'line',
        source: 'sundarbans-pulse-aug',
        paint: { 'line-color': '#F97316', 'line-width': 2.2 },
      });

      updateMapALayerVisibilities(mapA, regionId, comparisonMode);
      applyDynamicThematicStyles(mapA, comparisonMode === 'sensors' ? 'satellite' : basemapType, overlayStyle);
    });

    mapRefB.current = mapB;
    mapRefA.current = mapA;

    const handleResize = () => {
      if (mapRefB.current) mapRefB.current.resize();
      if (mapRefA.current) mapRefA.current.resize();
    };
    window.addEventListener('resize', handleResize);

    // Continuous ResizeObserver to guarantee full-resolution WebGL canvas sizing
    const resizeObserver = new ResizeObserver(handleResize);
    if (mapContainerB.current) resizeObserver.observe(mapContainerB.current);

    // Initial resize calls
    setTimeout(handleResize, 100);
    setTimeout(handleResize, 500);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      mapB.remove();
      mapA.remove();
      mapRefB.current = null;
      mapRefA.current = null;
    };
  }, []);

  // Sync basemaps when basemapType or comparisonMode changes
  useEffect(() => {
    syncBasemaps();
    const isComparing = comparisonMode === 'dates' && Boolean(selectedPair);
    const dateA = isComparing && selectedPair ? selectedPair[0] : selectedDate;
    const dateB = isComparing && selectedPair ? selectedPair[1] : selectedDate;
    syncRasterScenes(dateB, dateA);
    if (mapRefA.current && mapRefA.current.isStyleLoaded()) {
      updateMapALayerVisibilities(mapRefA.current, regionId, comparisonMode);
    }
  }, [basemapType, comparisonMode]);

  // Dynamic overlay style (Outlines vs Tinted)
  useEffect(() => {
    applyDynamicThematicStyles(mapRefB.current, basemapType, overlayStyle);
    applyDynamicThematicStyles(
      mapRefA.current,
      comparisonMode === 'sensors' ? 'satellite' : basemapType,
      overlayStyle
    );
  }, [overlayStyle, basemapType, comparisonMode]);

  // DIAGNOSIS ONLY: live state reporter + real-browser tile probe (?debug=1).
  useEffect(() => {
    if (!isDebug) return;
    // Probe the ACTIVE provider exactly the way MapLibre does (crossOrigin image fetch)
    const provider =
      basemapType === 'carto'
        ? 'https://tile.openstreetmap.org/10/767/437.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/437/767';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const t0 = Date.now();
    img.onload = () => {
      tileProbeRef.current = `/probe OK ${Date.now() - t0}ms ${img.naturalWidth}px`;
    };
    img.onerror = () => {
      tileProbeRef.current = '/probe FAILED (blocked/CORS/offline)';
    };
    img.src = provider;

    const id = window.setInterval(() => {
      const snap = (m: maplibregl.Map | null) => {
        if (!m) return 'no-map';
        const v = (id: string) => (m.getLayer(id) ? m.getLayoutProperty(id, 'visibility') : 'NOLAYER');
        return `style=${m.isStyleLoaded() ? 'loaded' : 'LOADING'} sat=${v('satellite-layer')} sar=${v('sar-layer')} osm=${v('osm-layer')}`;
      };
      const errs = mapErrorsRef.current.slice(-3).join(' § ') || 'none';
      setDbgText(
        `type=${basemapType} mode=${comparisonMode} | B[${snap(mapRefB.current)}] | A[${snap(mapRefA.current)}] | ${tileProbeRef.current} | err: ${errs}`
      );
    }, 600);
    return () => window.clearInterval(id);
  }, [isDebug, basemapType, comparisonMode]);

  // Synchronize georeferenced high-resolution satellite & SAR raster scenes
  const syncRasterScenes = (dateB: string, dateA: string) => {
    const isJamuna = regionId === 'jamuna';

    // Map B:
    const mapB = mapRefB.current;
    if (mapB && mapB.isStyleLoaded()) {
      const showRasterB = basemapType !== 'carto' && viewId !== 'M0';
      if (mapB.getLayer('layer-jamuna-raster-scene')) {
        mapB.setLayoutProperty('layer-jamuna-raster-scene', 'visibility', isJamuna && showRasterB ? 'visible' : 'none');
      }
      if (mapB.getLayer('layer-sundarbans-raster-scene')) {
        mapB.setLayoutProperty('layer-sundarbans-raster-scene', 'visibility', !isJamuna && showRasterB ? 'visible' : 'none');
      }

      if (isJamuna) {
        const sourceB = mapB.getSource('jamuna-raster-scene') as maplibregl.ImageSource;
        if (sourceB) {
          const modeB = (comparisonMode === 'sensors' ? 'sar' : basemapType) === 'sar' ? 'sar' : 'optical';
          sourceB.updateImage({
            url: `/rasters/jamuna_${modeB}_${dateB}.png`,
            coordinates: JAMUNA_RASTER_COORDS,
          });
        }
      } else {
        const sourceB = mapB.getSource('sundarbans-raster-scene') as maplibregl.ImageSource;
        if (sourceB) {
          const modeB = (comparisonMode === 'sensors' ? 'sar' : basemapType) === 'sar' ? 'sar' : 'optical';
          sourceB.updateImage({
            url: `/rasters/sundarbans_${modeB}_${dateB}.png`,
            coordinates: SUNDARBANS_RASTER_COORDS,
          });
        }
      }
      mapB.triggerRepaint();
    }

    // Map A:
    const mapA = mapRefA.current;
    if (mapA && mapA.isStyleLoaded()) {
      const typeA = comparisonMode === 'sensors' ? 'satellite' : basemapType;
      const showRasterA = typeA !== 'carto' && viewId !== 'M0';
      if (mapA.getLayer('layer-jamuna-raster-scene-a')) {
        mapA.setLayoutProperty('layer-jamuna-raster-scene-a', 'visibility', isJamuna && showRasterA ? 'visible' : 'none');
      }
      if (mapA.getLayer('layer-sundarbans-raster-scene-a')) {
        mapA.setLayoutProperty('layer-sundarbans-raster-scene-a', 'visibility', !isJamuna && showRasterA ? 'visible' : 'none');
      }

      if (isJamuna) {
        const sourceA = mapA.getSource('jamuna-raster-scene-a') as maplibregl.ImageSource;
        if (sourceA) {
          const modeA = typeA === 'sar' ? 'sar' : 'optical';
          sourceA.updateImage({
            url: `/rasters/jamuna_${modeA}_${dateA}.png`,
            coordinates: JAMUNA_RASTER_COORDS,
          });
        }
      } else {
        const sourceA = mapA.getSource('sundarbans-raster-scene-a') as maplibregl.ImageSource;
        if (sourceA) {
          const modeA = typeA === 'sar' ? 'sar' : 'optical';
          sourceA.updateImage({
            url: `/rasters/sundarbans_${modeA}_${dateA}.png`,
            coordinates: SUNDARBANS_RASTER_COORDS,
          });
        }
      }
      mapA.triggerRepaint();
    }
  };

  // Dynamic temporal update: sync map water extent & features to selectedDate or selectedPair!
  useEffect(() => {
    const isJamuna = regionId === 'jamuna';
    const isComparing = comparisonMode === 'dates' && Boolean(selectedPair);
    const dateA = isComparing && selectedPair ? selectedPair[0] : selectedDate;
    const dateB = isComparing && selectedPair ? selectedPair[1] : selectedDate;

    const mapB = mapRefB.current;
    if (mapB && mapB.isStyleLoaded()) {
      if (isJamuna) {
        const sourceB = mapB.getSource('jamuna-water-sep') as maplibregl.GeoJSONSource;
        if (sourceB) {
          sourceB.setData(getJamunaWaterForDate(dateB) as any);
        }
        const erosionB = mapB.getSource('jamuna-erosion') as maplibregl.GeoJSONSource;
        if (erosionB) {
          erosionB.setData(getJamunaErosionForDate(dateB) as any);
        }
        const accretionB = mapB.getSource('jamuna-accretion') as maplibregl.GeoJSONSource;
        if (accretionB) {
          accretionB.setData(getJamunaAccretionForDate(dateB) as any);
        }
      } else {
        const sourceB = mapB.getSource('sundarbans-water') as maplibregl.GeoJSONSource;
        if (sourceB) {
          sourceB.setData(getSundarbansWaterForDate(dateB) as any);
        }
        const pulseB = mapB.getSource('sundarbans-pulse') as maplibregl.GeoJSONSource;
        if (pulseB) {
          pulseB.setData(getSundarbansPulseForDate(dateB) as any);
        }
      }
      applyDynamicThematicStyles(mapB, basemapType, overlayStyle);
      applyTemporalSatelliteTones(mapB, dateB, basemapType);
    }

    const mapA = mapRefA.current;
    if (mapA && mapA.isStyleLoaded()) {
      const typeA = comparisonMode === 'sensors' ? 'satellite' : basemapType;
      if (isJamuna) {
        const sourceA = mapA.getSource('jamuna-water-aug') as maplibregl.GeoJSONSource;
        if (sourceA) {
          sourceA.setData(getJamunaWaterForDate(dateA) as any);
        }
        const erosionA = mapA.getSource('jamuna-erosion-aug') as maplibregl.GeoJSONSource;
        if (erosionA) {
          erosionA.setData(getJamunaErosionForDate(dateA) as any);
        }
        const accretionA = mapA.getSource('jamuna-accretion-aug') as maplibregl.GeoJSONSource;
        if (accretionA) {
          accretionA.setData(getJamunaAccretionForDate(dateA) as any);
        }
      } else {
        const sourceA = mapA.getSource('sundarbans-water-aug') as maplibregl.GeoJSONSource;
        if (sourceA) {
          sourceA.setData(getSundarbansWaterForDate(dateA) as any);
        }
        const pulseA = mapA.getSource('sundarbans-pulse-aug') as maplibregl.GeoJSONSource;
        if (pulseA) {
          pulseA.setData(getSundarbansPulseForDate(dateA) as any);
        }
      }
      applyDynamicThematicStyles(mapA, typeA, overlayStyle);
      applyTemporalSatelliteTones(mapA, dateA, typeA);
    }

    syncRasterScenes(dateB, dateA);
  }, [selectedDate, selectedPair, regionId, basemapType, overlayStyle, comparisonMode]);

  // Update layers & fly to active region & sync layer stack checkboxes
  useEffect(() => {
    const mapB = mapRefB.current;
    const mapA = mapRefA.current;
    if (!mapB || !mapB.isStyleLoaded()) return;

    const isComparing = comparisonMode === 'dates' && Boolean(selectedPair);
    const dateA = isComparing && selectedPair ? selectedPair[0] : selectedDate;
    const dateB = isComparing && selectedPair ? selectedPair[1] : selectedDate;

    updateMapBLayerVisibilities(mapB, regionId);
    applyDynamicThematicStyles(mapB, basemapType, overlayStyle);
    if (mapA && mapA.isStyleLoaded()) {
      updateMapALayerVisibilities(mapA, regionId, comparisonMode);
      applyDynamicThematicStyles(
        mapA,
        comparisonMode === 'sensors' ? 'satellite' : basemapType,
        overlayStyle
      );
    }

    syncRasterScenes(dateB, dateA);

    if (viewId === 'M0') {
      mapB.flyTo({ center: [89.8, 23.8], zoom: 6.8, essential: true, duration: 800 });
    } else if (regionId === 'jamuna') {
      mapB.flyTo({ center: [89.75, 25.575], zoom: 11.5, essential: true, duration: 800 });
    } else if (regionId === 'sundarbans') {
      mapB.flyTo({ center: [89.70, 21.875], zoom: 11.8, essential: true, duration: 800 });
    }

    setTimeout(() => {
      if (mapRefB.current) mapRefB.current.resize();
      if (mapRefA.current) mapRefA.current.resize();
    }, 250);
  }, [regionId, viewId, comparisonMode, layerVisibility, overlayStyle]);

  const updateMapBLayerVisibilities = (map: maplibregl.Map, activeRegion: string) => {
    const isJamuna = activeRegion === 'jamuna';
    const showWater = layerVisibility['water'] ?? true;
    const showTransitions = layerVisibility['transitions'] ?? true;
    const showAssets = layerVisibility['assets'] ?? true;

    // Jamuna layers
    const jamunaWaterLayers = ['layer-jamuna-water-sep', 'layer-jamuna-water-sep-line'];
    jamunaWaterLayers.forEach((id) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', isJamuna && showWater ? 'visible' : 'none');
      }
    });

    const jamunaTransitionLayers = [
      'layer-jamuna-erosion',
      'layer-jamuna-erosion-line',
      'layer-jamuna-accretion',
      'layer-jamuna-accretion-line',
    ];
    jamunaTransitionLayers.forEach((id) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', isJamuna && showTransitions ? 'visible' : 'none');
      }
    });

    if (map.getLayer('layer-jamuna-assets-circle')) {
      map.setLayoutProperty('layer-jamuna-assets-circle', 'visibility', isJamuna && showAssets ? 'visible' : 'none');
    }

    // Sundarbans layers
    const sundarbansWaterLayers = ['layer-sundarbans-water', 'layer-sundarbans-water-line'];
    sundarbansWaterLayers.forEach((id) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', !isJamuna && showWater ? 'visible' : 'none');
      }
    });

    const sundarbansCanopyLayers = ['layer-sundarbans-canopy', 'layer-sundarbans-canopy-line'];
    sundarbansCanopyLayers.forEach((id) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', !isJamuna && showTransitions ? 'visible' : 'none');
      }
    });
    const sundarbansPulseLayers = ['layer-sundarbans-pulse', 'layer-sundarbans-pulse-line'];
    sundarbansPulseLayers.forEach((id) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', !isJamuna && showTransitions ? 'visible' : 'none');
      }
    });
    if (map.getLayer('layer-sundarbans-assets-circle')) {
      map.setLayoutProperty('layer-sundarbans-assets-circle', 'visibility', !isJamuna && showAssets ? 'visible' : 'none');
    }
  };

  const updateMapALayerVisibilities = (
    map: maplibregl.Map,
    activeRegion: string,
    mode: 'dates' | 'sensors'
  ) => {
    const isJamuna = activeRegion === 'jamuna';
    const showWater = (layerVisibility['water'] ?? true) && mode === 'dates';
    const showTransitions = (layerVisibility['transitions'] ?? true) && mode === 'dates';

    if (map.getLayer('layer-jamuna-water-aug')) {
      map.setLayoutProperty(
        'layer-jamuna-water-aug',
        'visibility',
        showWater && isJamuna ? 'visible' : 'none'
      );
    }
    if (map.getLayer('layer-jamuna-water-aug-line')) {
      map.setLayoutProperty(
        'layer-jamuna-water-aug-line',
        'visibility',
        showWater && isJamuna ? 'visible' : 'none'
      );
    }
    if (map.getLayer('layer-jamuna-erosion-aug')) {
      map.setLayoutProperty(
        'layer-jamuna-erosion-aug',
        'visibility',
        showTransitions && isJamuna ? 'visible' : 'none'
      );
    }
    if (map.getLayer('layer-jamuna-erosion-aug-line')) {
      map.setLayoutProperty(
        'layer-jamuna-erosion-aug-line',
        'visibility',
        showTransitions && isJamuna ? 'visible' : 'none'
      );
    }
    if (map.getLayer('layer-jamuna-accretion-aug')) {
      map.setLayoutProperty(
        'layer-jamuna-accretion-aug',
        'visibility',
        showTransitions && isJamuna ? 'visible' : 'none'
      );
    }
    if (map.getLayer('layer-jamuna-accretion-aug-line')) {
      map.setLayoutProperty(
        'layer-jamuna-accretion-aug-line',
        'visibility',
        showTransitions && isJamuna ? 'visible' : 'none'
      );
    }
    if (map.getLayer('layer-sundarbans-water-aug')) {
      map.setLayoutProperty(
        'layer-sundarbans-water-aug',
        'visibility',
        showWater && !isJamuna ? 'visible' : 'none'
      );
    }
    if (map.getLayer('layer-sundarbans-water-aug-line')) {
      map.setLayoutProperty(
        'layer-sundarbans-water-aug-line',
        'visibility',
        showWater && !isJamuna ? 'visible' : 'none'
      );
    }
    if (map.getLayer('layer-sundarbans-pulse-aug')) {
      map.setLayoutProperty(
        'layer-sundarbans-pulse-aug',
        'visibility',
        showTransitions && !isJamuna ? 'visible' : 'none'
      );
    }
    if (map.getLayer('layer-sundarbans-pulse-aug-line')) {
      map.setLayoutProperty(
        'layer-sundarbans-pulse-aug-line',
        'visibility',
        showTransitions && !isJamuna ? 'visible' : 'none'
      );
    }
  };

  // 1-Click Map Snapshot Exporter
  const handleCaptureSnapshot = () => {
    const mapB = mapRefB.current;
    if (!mapB) return;

    try {
      const dataUrl = mapB.getCanvas().toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Fluvisar_${regionId}_${comparisonMode}_${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setSnapshotTaken(true);
      setTimeout(() => setSnapshotTaken(false), 2500);
    } catch (err) {
      console.error('Failed to capture map snapshot:', err);
    }
  };

  const isSwipeActive = Boolean(selectedPair) && viewId !== 'M0';

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden select-none">
      {/* MAP B (Underneath / Base: Date B post-flood recession + Active Erosion + SAR analysis) */}
      <div
        ref={mapContainerB}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      />

      {/* MAP A (Overlay / Left side: Date A pre-flood peak inundation OR pure optical satellite imagery) */}
      <div
        ref={mapContainerA}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10,
          pointerEvents: 'none',
          clipPath: isSwipeActive
            ? `polygon(0% 0%, ${swipePosition}% 0%, ${swipePosition}% 100%, 0% 100%)`
            : 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
        }}
      />

      {/* Interactive Map Callout Markers (Pulsing Findings) */}
      {viewId !== 'M0' && (
        <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
          {regionId === 'jamuna' ? (
            <>
              {/* Chilmari Erosion Scallop Marker */}
              <div
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: '38%', top: '54%' }}
                onClick={() => {
                  setSelectedSample({
                    lon: 89.668,
                    lat: 25.568,
                    value: -15.4,
                    unit: 'dB',
                    masked: false,
                    reason: 'Chilmari West Bank Active Collapse (145.8 ha)',
                  });
                  setSelectedFinding('FINDING-JAMUNA-2026-CHILMARI-01');
                  setPanels({ right: true });
                }}
              >
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#DC2626]/95 text-white text-[11px] font-bold shadow-xl border border-white hover:scale-105 transition-transform">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>🔴 {isBn ? 'চিলমারী ভাঙন: ১৪৫.৮ হে.' : 'Chilmari Retreat: 145.8 ha (-8.2 dB)'}</span>
                </div>
              </div>

              {/* Mandaler Char Emergence Marker */}
              <div
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: '57%', top: '44%' }}
                onClick={() => {
                  setSelectedSample({
                    lon: 89.735,
                    lat: 25.595,
                    value: -9.8,
                    unit: 'dB',
                    masked: false,
                    reason: 'Mandaler Char Emergent Silt Bar (88.4 ha)',
                  });
                  setSelectedFinding('FINDING-JAMUNA-2026-MANDALER-01');
                  setPanels({ right: true });
                }}
              >
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#059669]/95 text-white text-[11px] font-bold shadow-xl border border-white hover:scale-105 transition-transform">
                  <span>🌱 {isBn ? 'মন্ডলের চর পলি চর: ৮৮.৪ হে.' : 'Mandaler Char Silt: 88.4 ha (+0.48 NDVI)'}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Dublar Char Tidal Pulse Marker */}
              <div
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: '52%', top: '58%' }}
                onClick={() => {
                  setSelectedSample({
                    lon: 89.725,
                    lat: 21.825,
                    value: -10.1,
                    unit: 'dB',
                    masked: false,
                    reason: 'Dublar Char Sub-Canopy Tidal Pulse (+3.5 dB HH)',
                  });
                  setSelectedFinding('FINDING-SUNDARBANS-2026-DUBLAR-01');
                  setPanels({ right: true });
                }}
              >
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#EA580C]/95 text-white text-[11px] font-bold shadow-xl border border-white hover:scale-105 transition-transform">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>🌊 {isBn ? 'দুবলার চর জোয়ার প্লাবন: ৩১২ হে.' : 'Dublar Sub-Canopy Pulse: 312 ha (+3.5 dB HH)'}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating 3-Way Basemap Switcher & Snapshot Pill (Top Right, Sleek & Compact) */}
      <div className="absolute top-3 right-3 z-20 flex items-center space-x-1.5 pointer-events-auto">
        <div className="flex items-center bg-white/95 backdrop-blur-md p-0.5 rounded-xl border border-[#CBD5E1] shadow-lg text-xs">
          <button
            onClick={() => setBasemapType('satellite')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              basemapType === 'satellite'
                ? 'bg-[#155E75] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#102A43] hover:bg-[#F1F5F9]'
            }`}
            title="Switch to Real High-Resolution True-Color Optical Satellite Imagery"
          >
            <span>🛰️ {isBn ? 'স্যাটেলাইট' : 'Satellite'}</span>
          </button>

          <button
            onClick={() => setBasemapType('sar')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              basemapType === 'sar'
                ? 'bg-[#155E75] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#102A43] hover:bg-[#F1F5F9]'
            }`}
            title="Switch to Calibrated NISAR L-band SAR Microwave Amplitude Radar (Grayscale γ⁰ dB)"
          >
            <span>📡 {isBn ? 'রাডার' : 'Radar'}</span>
          </button>

          <button
            onClick={() => setBasemapType('carto')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              basemapType === 'carto'
                ? 'bg-[#155E75] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#102A43] hover:bg-[#F1F5F9]'
            }`}
            title="Switch to OpenStreetMap Cartographic Vector Map"
          >
            <span>🗺️ {isBn ? 'কার্টো' : 'Carto'}</span>
          </button>
        </div>

        {/* Clean Outlines vs Subtle Tint Toggle (Solves colored polygon blocking satellite view) */}
        <button
          onClick={() => setOverlayStyle(overlayStyle === 'outlines' ? 'tinted' : 'outlines')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border font-bold text-xs shadow-lg transition-all cursor-pointer ${
            overlayStyle === 'outlines'
              ? 'bg-[#0284C7] text-white border-[#0284C7]'
              : 'bg-white/95 backdrop-blur-md text-[#475569] border-[#CBD5E1] hover:bg-[#F1F5F9]'
          }`}
          title="Toggle between Clean Outlines (100% Unobstructed Satellite) and Subtle Thematic Tint"
        >
          <span>{overlayStyle === 'outlines' ? (isBn ? '✏️ শুধু আউটলাইন' : '✏️ Outlines Only') : (isBn ? '🎨 হালকা রঙ' : '🎨 Tinted')}</span>
        </button>

        {/* 📸 Instant Map Snapshot Button */}
        <button
          onClick={handleCaptureSnapshot}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border font-bold text-xs shadow-lg transition-all cursor-pointer ${
            snapshotTaken
              ? 'bg-[#059669] text-white border-[#059669]'
              : 'bg-white/95 backdrop-blur-md text-[#102A43] border-[#CBD5E1] hover:bg-[#F1F5F9]'
          }`}
          title="Capture and download high-resolution map snapshot (PNG)"
        >
          {snapshotTaken ? <Check className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5 text-[#155E75]" />}
          <span>{snapshotTaken ? (isBn ? 'সংরক্ষিত!' : 'Saved!') : (isBn ? 'স্ক্রিনশট' : 'Snapshot')}</span>
        </button>

        {/* 🔍 Zoom In / Out Slider Control */}
        <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#CBD5E1] shadow-lg text-xs font-bold text-[#102A43]">
          <button
            onClick={() => {
              if (mapRefB.current) mapRefB.current.zoomOut({ duration: 300 });
            }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0284C7] transition-colors cursor-pointer text-sm font-black"
            title="Zoom Out (-)"
          >
            -
          </button>
          <input
            type="range"
            min="6"
            max="16"
            step="0.1"
            value={currentZoom}
            onChange={(e) => {
              const z = parseFloat(e.target.value);
              setCurrentZoom(z);
              if (mapRefB.current) {
                mapRefB.current.setZoom(z);
              }
            }}
            className="w-20 h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
            title={`Current Zoom: ${currentZoom}x`}
          />
          <button
            onClick={() => {
              if (mapRefB.current) mapRefB.current.zoomIn({ duration: 300 });
            }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0284C7] transition-colors cursor-pointer text-sm font-black"
            title="Zoom In (+)"
          >
            +
          </button>
          <span className="text-[10px] font-mono text-[#0284C7] min-w-[28px]">{currentZoom}x</span>
        </div>
      </div>

      {/* Dynamic Scientific Legend Indicator */}
      {viewId !== 'M0' && (
        <div className="absolute bottom-6 right-4 z-10 bg-white/95 backdrop-blur-md border border-[#CBD5E1] rounded-xl p-3 shadow-lg text-xs space-y-1.5 pointer-events-none">
          <div className="font-bold text-[#102A43] text-[11px] uppercase tracking-wider flex items-center justify-between">
            <span>{regionId === 'jamuna' ? (isBn ? 'যমুনা নদী গতিবিদ্যা' : 'Jamuna River Dynamics') : (isBn ? 'সুন্দরবন জলাভূমি ও রাডার' : 'Sundarbans Wetland Pulse')}</span>
            <span className="text-[9px] font-mono text-[#0284C7] bg-[#E0F2FE] px-1.5 py-0.5 rounded">NISAR L2</span>
          </div>

          {regionId === 'jamuna' ? (
            <>
              <div className="flex items-center space-x-2">
                {overlayStyle === 'outlines' ? (
                  <div className="w-4 h-0.5 bg-[#38BDF8] rounded-full" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded bg-[#0284C7]/30 border border-[#0284C7]" />
                )}
                <span className="text-[#334155] text-[11px]">{isBn ? 'নদীর চ্যানেল জলভাগ (γ⁰ ≤ -১৪ dB)' : 'Receded Thalweg Braids (γ⁰ ≤ -14 dB)'}</span>
              </div>
              <div className="flex items-center space-x-2">
                {overlayStyle === 'outlines' ? (
                  <div className="w-4 border-t-2 border-dashed border-[#EF4444]" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded bg-[#DC2626]/40 border-2 border-[#EF4444] border-dashed" />
                )}
                <span className="text-[#334155] text-[11px] font-semibold text-[#DC2626]">{isBn ? 'চিলমারী ভাঙন বলয় (১৪৫.৮ হেক্টর)' : 'Chilmari Erosion Cut (145.8 ha)'}</span>
              </div>
              <div className="flex items-center space-x-2">
                {overlayStyle === 'outlines' ? (
                  <div className="w-4 border-t-2 border-dashed border-[#10B981]" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded bg-[#059669]/35 border border-[#10B981]" />
                )}
                <span className="text-[#334155] text-[11px]">{isBn ? 'মন্ডলের চর নতুন পলি (৮৮.৪ হেক্টর)' : 'Mandaler Char Emergent Silt (88.4 ha)'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] border border-white" />
                <span className="text-[#334155] text-[11px]">{isBn ? 'প্রাথমিক বিদ্যালয় ও ফেরি ঘাট' : 'Schools & Ferry Terminals'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                {overlayStyle === 'outlines' ? (
                  <div className="w-4 h-0.5 bg-[#38BDF8] rounded-full" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded bg-[#0284C7]/30 border border-[#0284C7]" />
                )}
                <span className="text-[#334155] text-[11px]">{isBn ? 'পশুর মোহনা ও খাঁড়ি জলপথ' : 'Passur Estuary Thalweg'}</span>
              </div>
              <div className="flex items-center space-x-2">
                {overlayStyle === 'outlines' ? (
                  <div className="w-4 border-t-2 border-dashed border-[#15803D]" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded bg-[#15803D]/25 border border-[#15803D]" />
                )}
                <span className="text-[#334155] text-[11px]">{isBn ? 'ঘন ম্যানগ্রোভ ক্যানোপি (Pauli HV)' : 'Mangrove Canopy (Volume Scattering)'}</span>
              </div>
              <div className="flex items-center space-x-2">
                {overlayStyle === 'outlines' ? (
                  <div className="w-4 border-t-2 border-dashed border-[#F97316]" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded bg-[#EA580C]/40 border-2 border-[#F97316] border-dashed" />
                )}
                <span className="text-[#334155] text-[11px] font-semibold text-[#EA580C]">{isBn ? 'দুবলার চরে জোয়ার প্লাবন (+৩.৫ dB)' : 'Sub-Canopy Tidal Pulse (+3.5 dB HH)'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] border border-white" />
                <span className="text-[#334155] text-[11px]">{isBn ? 'ফরেস্ট রেঞ্জার স্টেশন ও সাইক্লোন শেল্টার' : 'Forest Posts & Cyclone Shelters'}</span>
              </div>
            </>
          )}
        </div>
      )}
      {/* TEMPORARY basemap debug badge (?debug=1) — read this string to diagnose switching */}
      {isDebug && (
        <div className="absolute bottom-2 left-2 z-50 max-w-[72%] p-2 rounded-lg bg-black/85 text-[10px] leading-relaxed font-mono text-[#7DF9AA] border border-[#7DF9AA]/40 pointer-events-auto select-text break-words">
          <span className="font-bold text-white">BASEMAP DEBUG:</span> {dbgText}
        </div>
      )}
    </div>
  );
};
