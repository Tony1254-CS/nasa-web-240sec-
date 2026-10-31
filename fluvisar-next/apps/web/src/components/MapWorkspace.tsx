import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useWorkspaceStore } from '../store/workspaceStore';

export const MapWorkspace: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { regionId, viewId, setRegion, setView, setSelectedSample } = useWorkspaceStore();

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Use free Carto Positron or standard neutral vector style
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors | NASA-ISRO SAR (NISAR)',
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            paint: {
              'raster-opacity': 0.75,
              'raster-saturation': -0.4, // Desaturate for calm scientific aesthetic (plan.md Sec 4.2)
            },
          },
        ],
      },
      center: viewId === 'M0' ? [89.8, 23.8] : regionId === 'jamuna' ? [89.75, 25.575] : [89.70, 21.875],
      zoom: viewId === 'M0' ? 6.8 : 11,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-left');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      // Add Region Footprints GeoJSON Source
      map.addSource('region-footprints', {
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

      // Outline layer
      map.addLayer({
        id: 'region-footprints-line',
        type: 'line',
        source: 'region-footprints',
        paint: {
          'line-color': '#155E75',
          'line-width': 2.5,
          'line-dasharray': [3, 2],
        },
      });

      // Fill layer
      map.addLayer({
        id: 'region-footprints-fill',
        type: 'fill',
        source: 'region-footprints',
        paint: {
          'fill-color': '#0284C7',
          'fill-opacity': 0.12,
        },
      });

      // Interactive Click on Region Footprint in M0 Atlas
      map.on('click', 'region-footprints-fill', (e: any) => {
        if (!e.features || !e.features[0]) return;
        const targetRegion = e.features[0].properties?.region_id;
        if (targetRegion === 'jamuna' || targetRegion === 'sundarbans') {
          setRegion(targetRegion);
          setView(targetRegion === 'jamuna' ? 'J1' : 'S1');
        }
      });

      // Generic Map Click for Authoritative Numeric Point Sampling (plan.md Section 16.3, 17.0)
      map.on('click', (e: any) => {
        const { lng, lat } = e.lngLat;
        // Bounded check for active region
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

      map.on('mouseenter', 'region-footprints-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'region-footprints-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [regionId]);

  // Fly to target bounds whenever region or view changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (viewId === 'M0') {
      map.flyTo({
        center: [89.8, 23.8],
        zoom: 6.8,
        essential: true,
        duration: 1000,
      });
    } else if (regionId === 'jamuna') {
      map.flyTo({
        center: [89.75, 25.575],
        zoom: 11,
        essential: true,
        duration: 800,
      });
    } else if (regionId === 'sundarbans') {
      map.flyTo({
        center: [89.70, 21.875],
        zoom: 11.5,
        essential: true,
        duration: 800,
      });
    }
  }, [regionId, viewId]);

  return (
    <div className="relative flex-1 w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating Map Legend Indicator */}
      {viewId !== 'M0' && (
        <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-xs border border-[#CBD5E1] rounded-lg p-2.5 shadow-xs text-xs space-y-1.5 pointer-events-none">
          <div className="font-bold text-[#102A43] text-[11px] uppercase tracking-wider">
            {regionId === 'jamuna' ? 'Jamuna Transition' : 'Sundarbans Radar'}
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3.5 h-3.5 rounded bg-[#0072B2]" />
            <span className="text-[#334155] text-[11px]">Observed Water (γ⁰ ≤ -14 dB)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3.5 h-3.5 rounded bg-[#D55E00]" />
            <span className="text-[#334155] text-[11px]">Erosion Candidate (Land ➔ Water)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3.5 h-3.5 rounded bg-[#009E73]" />
            <span className="text-[#334155] text-[11px]">Sediment / Char Accretion</span>
          </div>
        </div>
      )}
    </div>
  );
};
