import { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Satellite, Globe, Plus, Minus, MapPin } from 'lucide-react';

export interface TelemetrySite {
  id: string;
  name: string;
  location: string;
  coords: [number, number]; // [lon, lat]
  coordsDisplay: string;
  category: string;
  status: string;
  sensor: string;
  color: 'emerald' | 'cyan' | 'purple' | 'amber';
  phenomenon: string;
  isFlagship?: boolean;
}

interface PlanetaryTelemetryMapProps {
  sites: TelemetrySite[];
  selectedSiteId: string | null;
  onSelectSite: (siteId: string) => void;
}

export function PlanetaryTelemetryMap({ sites, selectedSiteId, onSelectSite }: PlanetaryTelemetryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [activeSite, setActiveSite] = useState<TelemetrySite | null>(null);

  const getColorHex = (color: TelemetrySite['color']): string => {
    switch (color) {
      case 'emerald':
        return '#10b981';
      case 'purple':
        return '#c084fc';
      case 'amber':
        return '#f59e0b';
      default:
        return '#22d3ee';
    }
  };

  // Fly to site helper
  const flyToSite = useCallback((site: TelemetrySite) => {
    if (!mapRef.current) return;
    setActiveSite(site);
    onSelectSite(site.id);
    mapRef.current.flyTo({
      center: site.coords,
      zoom: site.isFlagship ? 7.2 : 5.8,
      speed: 1.3,
      curve: 1.4,
      essential: true
    });
  }, [onSelectSite]);

  // Reset to full planetary view
  const resetWorldView = useCallback(() => {
    if (!mapRef.current) return;
    setActiveSite(null);
    mapRef.current.flyTo({
      center: [20, 22],
      zoom: 1.3,
      speed: 1.2,
      essential: true
    });
  }, []);

  // Initialize MapLibre Map with Real Esri Satellite Imagery
  useEffect(() => {
    if (!mapContainerRef.current) return;

    maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'esri-satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Imagery © Esri, Maxar, Earthstar Geographics'
          }
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#030712' }
          },
          {
            id: 'satellite-base',
            type: 'raster',
            source: 'esri-satellite',
            paint: {
              'raster-opacity': 0.94,
              'raster-brightness-max': 0.88,
              'raster-contrast': 0.12,
              'raster-saturation': -0.1
            }
          }
        ]
      },
      center: [20, 22],
      zoom: 1.3,
      minZoom: 1,
      maxZoom: 14,
      attributionControl: false
    });

    mapRef.current = map;

    map.once('load', () => {
      // Add polar sun-synchronous orbital track line paths
      map.addSource('polar-orbits', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { name: 'Orbit Track 1 (Bangladesh Pass)' },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [110, 85], [100, 60], [92, 35], [89.65, 25.3], [89.18, 21.95], [84, 0], [77, -30], [68, -70]
                ]
              }
            },
            {
              type: 'Feature',
              properties: { name: 'Orbit Track 2 (North America Pass)' },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [-115, 85], [-130, 65], [-136, 58.8], [-125, 45], [-121.2, 40], [-115, 15], [-105, -25], [-92, -70]
                ]
              }
            },
            {
              type: 'Feature',
              properties: { name: 'Orbit Track 3 (Mexico Basin Pass)' },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [-78, 85], [-90, 50], [-96, 30], [-99.13, 19.43], [-104, 0], [-112, -35], [-122, -70]
                ]
              }
            }
          ]
        }
      });

      map.addLayer({
        id: 'polar-orbits-line',
        type: 'line',
        source: 'polar-orbits',
        paint: {
          'line-color': '#22d3ee',
          'line-width': 1.6,
          'line-opacity': 0.7,
          'line-dasharray': [5, 4]
        }
      });

      // Add Interactive Custom DOM Markers for each Station
      sites.forEach(site => {
        const hex = getColorHex(site.color);
        const markerEl = document.createElement('div');
        markerEl.className = 'telemetry-station-pin cursor-pointer select-none';
        markerEl.setAttribute('title', `${site.name} (${site.coordsDisplay}) - Click to inspect`);

        markerEl.innerHTML = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
            <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background-color: ${hex}; opacity: 0.5; animation: ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: ${hex}; border: 2.5px solid #030712; box-shadow: 0 0 10px ${hex}; display: flex; align-items: center; justify-content: center;">
              <div style="width: 4px; height: 4px; border-radius: 50%; background-color: #ffffff;"></div>
            </div>
            <div style="position: absolute; left: 24px; white-space: nowrap; background: rgba(3, 7, 18, 0.88); backdrop-filter: blur(6px); border: 1px solid rgba(71, 85, 105, 0.8); padding: 2px 7px; border-radius: 6px; font-size: 10px; font-family: monospace; font-weight: bold; color: #f1f5f9; box-shadow: 0 4px 12px rgba(0,0,0,0.6); pointer-events: none;">
              ${site.name.split(' (')[0]}
            </div>
          </div>
        `;

        markerEl.addEventListener('click', () => {
          flyToSite(site);
        });

        const marker = new maplibregl.Marker({ element: markerEl, anchor: 'center' })
          .setLngLat(site.coords)
          .addTo(map);

        markersRef.current.push(marker);
      });
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [sites, flyToSite]);

  return (
    <div className="rounded-xl bg-slate-950 border border-slate-800/90 overflow-hidden shadow-2xl relative">
      {/* Top Banner Ribbon */}
      <div className="bg-slate-900/95 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <Satellite size={14} className="text-cyan-400 animate-pulse" />
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
            Real Satellite Orbital Telemetry
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            · True Esri Earth Observation & Sun-Synchronous Polar Passes
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300">2 Operational Biomes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-300">3 Benchmark Regimes</span>
          </div>
        </div>
      </div>

      {/* Real MapLibre Satellite Map Container */}
      <div className="relative w-full h-[320px] sm:h-[360px] bg-[#030712] overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Subtle Dark Vignette Border */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(3,7,18,0.7)] border-y border-slate-800/60" />

        {/* Floating HUD Camera Controls (Top Right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
          <button
            type="button"
            onClick={resetWorldView}
            className="p-2 rounded-lg bg-slate-950/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-xl cursor-pointer transition-all"
            title="Reset to Full Planetary World View"
          >
            <Globe size={15} className="text-cyan-400" />
          </button>
          <button
            type="button"
            onClick={() => mapRef.current?.zoomIn()}
            className="p-2 rounded-lg bg-slate-950/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-xl cursor-pointer transition-all"
            title="Zoom In"
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            onClick={() => mapRef.current?.zoomOut()}
            className="p-2 rounded-lg bg-slate-950/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-xl cursor-pointer transition-all"
            title="Zoom Out"
          >
            <Minus size={15} />
          </button>
        </div>

        {/* Active Focused Station HUD Banner (Bottom Left) */}
        {activeSite && (
          <div className="absolute bottom-3 left-3 max-w-sm p-3 rounded-xl bg-slate-950/95 backdrop-blur-md border border-cyan-500/50 shadow-2xl text-xs space-y-1 z-20 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getColorHex(activeSite.color) }}
                />
                {activeSite.name}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                {activeSite.status}
              </span>
            </div>
            <div className="text-[10px] font-mono text-cyan-300 flex items-center gap-1">
              <MapPin size={10} />
              <span>{activeSite.coordsDisplay} · {activeSite.location}</span>
            </div>
            <div className="text-[10px] text-slate-300 line-clamp-1">
              <strong className="text-slate-400">Target:</strong> {activeSite.phenomenon}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Station Quick Fly-To Selector Bar */}
      <div className="bg-slate-950 px-3.5 py-2.5 border-t border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs font-mono scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider mr-1">Fly to Station:</span>
          <button
            type="button"
            onClick={resetWorldView}
            className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
              !activeSite
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/80 font-bold'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Globe size={12} className="text-cyan-400" />
            <span>Reset World (1.3x)</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {sites.map(site => {
            const isSelected = selectedSiteId === site.id || activeSite?.id === site.id;
            const hex = getColorHex(site.color);

            return (
              <button
                key={site.id}
                type="button"
                onClick={() => flyToSite(site)}
                className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/80 font-bold shadow-md'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hex }} />
                <span>{site.name.split(' (')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
