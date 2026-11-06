import { analysisImage, isoDate, regionForReach } from '../../../data/analysisRegistry';
import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { ImageSource, Map as MlMap } from 'maplibre-gl';
import type * as GeoJSON from 'geojson';
import type { Bounds, ChangeFeature, ChangeFeatureCollection, ReachDetail } from '../data/types';

const EMPTY: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

function asGeoJson(data: ChangeFeatureCollection | null): GeoJSON.FeatureCollection {
  return (data ?? EMPTY) as unknown as GeoJSON.FeatureCollection;
}
void asGeoJson;

interface DecisionMapProps {
  reach: ReachDetail;
  bounds: Bounds;
  dates: string[];
  selectedDate: string;
  selectedFeatureId: string | null;
  erosion: ChangeFeatureCollection | null;
  accretion: ChangeFeatureCollection | null;
  showRadar: boolean;
  showWater: boolean;
  showOpera: boolean;
  scenario: GeoJSON.Feature<GeoJSON.Polygon> | null;
  osm: GeoJSON.FeatureCollection | null;
  topN: number;
  onSelectFeature?: (id: string) => void;
}

function imageCoordinates(bounds: Bounds): [[number, number], [number, number], [number, number], [number, number]] {
  return bounds.coordinates as [[number, number], [number, number], [number, number], [number, number]];
}

function addImage(map: MlMap, id: string, url: string, coordinates: DecisionMapProps['bounds']['coordinates']) {
  map.addSource(id, { type: 'image', url, coordinates: coordinates as [[number, number], [number, number], [number, number], [number, number]] });
}

/* ransack: chips (top-N) and timeline swipe (t0 vs t1) */
function filterToTopN(data: ChangeFeatureCollection | null, topN: number): GeoJSON.FeatureCollection {
  if (!data?.features?.length) return EMPTY;
  const sorted = [...data.features].sort((a, b) => (b.properties.area_ha ?? 0) - (a.properties.area_ha ?? 0));
  return { type: 'FeatureCollection', features: sorted.slice(0, topN).map(f => f as unknown as GeoJSON.Feature) } as unknown as GeoJSON.FeatureCollection;
}

export function DecisionMap(props: DecisionMapProps) {
  const { reach, bounds, dates, selectedDate, selectedFeatureId, erosion, accretion,
    showRadar, showWater, showOpera, scenario, osm, topN, onSelectFeature } = props;
  const element = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const [radarLoaded,setRadarLoaded] = useState(false);
  const coordinates = imageCoordinates(bounds);
  const imageFor=(kind:'radar'|'water',date:string)=>analysisImage(reach.reach_id,kind,date,[isoDate(reach.primary_pair.t0),isoDate(reach.primary_pair.t1)],showOpera?'vh':'vv');
  const selectRef = useRef(onSelectFeature);
  selectRef.current = onSelectFeature;

  useEffect(() => {
    if (!element.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: element.current,
      style: {
        version: 8,
        sources: { satellite: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, attribution: 'Imagery © Esri, Maxar, Earthstar Geographics' } },
        layers: [
          { id: 'background', type: 'background', paint: { 'background-color': '#10171a' } },
          { id: 'satellite', type: 'raster', source: 'satellite', paint: { 'raster-saturation': -0.35, 'raster-contrast': 0.12 } },
        ],
      },
      center: regionForReach(reach.reach_id)==='jamuna'?[89.75,25.56]:[89.70,21.875], zoom: 8, minZoom: 5, maxZoom: 17,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 110, unit: 'metric' }), 'bottom-left');
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(element.current);

    // Register local analytical imagery as soon as the style exists; remote basemap tiles may be slow/offline.
    map.on('sourcedata', event => {
      if (event.sourceId === 'nisar-radar' && event.isSourceLoaded) setRadarLoaded(true);
    });
    map.once('style.load', () => {
      try {
        const date = selectedDate || dates[0];
        addImage(map, 'nisar-radar', imageFor('radar',date), coordinates);
        map.addLayer({ id: 'nisar-radar-layer', type: 'raster', source: 'nisar-radar', paint: { 'raster-opacity': showRadar ? 0.97 : 0, 'raster-contrast': 0.14 } });
        addImage(map, 'nisar-water', imageFor('water',date), coordinates);
        map.addLayer({ id: 'nisar-water-layer', type: 'raster', source: 'nisar-water', paint: { 'raster-opacity': showWater ? 0.9 : 0 } });
        map.addSource('candidate-erosion', { type: 'geojson', data: filterToTopN(erosion, topN) });
        map.addLayer({ id: 'candidate-erosion-fill', type: 'fill', source: 'candidate-erosion', paint: { 'fill-color': '#f07957', 'fill-opacity': 0.48 } });
        map.addLayer({ id: 'candidate-erosion-outline', type: 'line', source: 'candidate-erosion', paint: { 'line-color': '#ffb09b', 'line-width': 1.2, 'line-opacity': 0.95 } });
        map.addSource('candidate-accretion', { type: 'geojson', data: filterToTopN(accretion, topN) });
        map.addLayer({ id: 'candidate-accretion-fill', type: 'fill', source: 'candidate-accretion', paint: { 'fill-color': '#d9b26a', 'fill-opacity': 0.36 } });
        map.addLayer({ id: 'candidate-accretion-outline', type: 'line', source: 'candidate-accretion', paint: { 'line-color': '#f3d699', 'line-width': 1, 'line-opacity': 0.9 } });
        map.addSource('selected-candidate', { type: 'geojson', data: EMPTY });
        map.addLayer({ id: 'selected-candidate-outline', type: 'line', source: 'selected-candidate', paint: { 'line-color': '#ffffff', 'line-width': 3, 'line-dasharray': [1.5, 1.2] } });
        map.addSource('scenario-zone', { type: 'geojson', data: scenario ?? EMPTY });
        map.addLayer({ id: 'scenario-fill', type: 'fill', source: 'scenario-zone', paint: { 'fill-color': '#efb64f', 'fill-opacity': 0.2 } });
        map.addLayer({ id: 'scenario-line', type: 'line', source: 'scenario-zone', paint: { 'line-color': '#ffd47c', 'line-width': 2.2, 'line-dasharray': [2, 1.5] } });
        map.addSource('osm-context', { type: 'geojson', data: osm ?? EMPTY });
        map.addLayer({ id: 'osm-buildings', type: 'fill', source: 'osm-context', filter: ['has', 'building'], paint: { 'fill-color': '#f2e7c9', 'fill-opacity': 0.85, 'fill-outline-color': '#fff7e4' } });
        map.addLayer({ id: 'osm-roads', type: 'line', source: 'osm-context', filter: ['has', 'highway'], paint: { 'line-color': '#ffffff', 'line-opacity': 0.95, 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1.2, 15, 3] } });
        for (const layerId of ['candidate-erosion-fill', 'candidate-accretion-fill']) {
          map.on('click', layerId, (e) => {
            const feature = e.features?.[0];
            const id = (feature?.properties as { id?: unknown } | undefined)?.id;
            if (id != null && selectRef.current) selectRef.current(String(id));
          });
        }
        map.fitBounds([coordinates[0][0] as number, coordinates[2][1] as number, coordinates[1][0] as number, coordinates[0][1] as number], { padding: 0, duration: 0, maxZoom: 12 });
        map.setMaxBounds([coordinates[0][0] - 0.05, coordinates[3][1] - 0.05, coordinates[1][0] + 0.05, coordinates[0][1] + 0.05] as [number, number, number, number]);
      } catch (error) { console.error('Unable to initialize decision map layers', error); }
    });
    return () => { resizeObserver.disconnect(); map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current; if (!map?.isStyleLoaded()) return;
    const source = map.getSource('nisar-radar') as ImageSource | undefined;
    if (source && selectedDate) source.updateImage({ url: imageFor('radar',selectedDate), coordinates });
    const water = map.getSource('nisar-water') as ImageSource | undefined;
    if (water && selectedDate) water.updateImage({ url: imageFor('water',selectedDate), coordinates });
  }, [selectedDate, reach.reach_id, coordinates, radarLoaded, showOpera]);

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    if (map.getLayer('nisar-radar-layer')) map.setPaintProperty('nisar-radar-layer', 'raster-opacity', showRadar ? 0.97 : 0);
    if (map.getLayer('nisar-water-layer')) map.setPaintProperty('nisar-water-layer', 'raster-opacity', showWater ? 0.9 : 0);
    if (map.getLayer('opera-dswx-layer')) map.setLayoutProperty('opera-dswx-layer', 'visibility', showOpera ? 'visible' : 'none');
  }, [showRadar, showWater, showOpera, radarLoaded]);

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    (map.getSource('candidate-erosion') as maplibregl.GeoJSONSource | undefined)?.setData(filterToTopN(erosion, topN));
    (map.getSource('candidate-accretion') as maplibregl.GeoJSONSource | undefined)?.setData(filterToTopN(accretion, topN));
    if (!selectedFeatureId) { (map.getSource('selected-candidate') as maplibregl.GeoJSONSource | undefined)?.setData(EMPTY); return; }
    const feature = [...(erosion?.features ?? []), ...(accretion?.features ?? [])].find((item) => String(item.properties.id) === selectedFeatureId);
    (map.getSource('selected-candidate') as maplibregl.GeoJSONSource | undefined)?.setData(feature ? ({ type: 'FeatureCollection', features: [feature] } as unknown as GeoJSON.FeatureCollection) : EMPTY);
  }, [erosion, accretion, selectedFeatureId, topN, radarLoaded]);

  useEffect(() => { const map = mapRef.current; if (map) (map.getSource('scenario-zone') as maplibregl.GeoJSONSource | undefined)?.setData(scenario ?? EMPTY); }, [scenario, radarLoaded]);
  useEffect(() => { const map = mapRef.current; if (map) (map.getSource('osm-context') as maplibregl.GeoJSONSource | undefined)?.setData(osm ?? EMPTY); }, [osm, radarLoaded]);
  return <div className="decision-map" ref={element} aria-label={`${reach.name} workspace radar map`} data-radar-loaded={radarLoaded} />;
}

export function featureCentroid(feature: ChangeFeature): [number, number] {
  const centroid = feature.properties.centroid;
  if (Array.isArray(centroid) && centroid.length >= 2) return [centroid[0], centroid[1]];
  const coordinates = feature.geometry.coordinates as number[][][];
  const ring = coordinates?.[0] ?? [];
  if (ring.length === 0) return [89.75, 25.56];
  const points = ring.slice(0, -1);
  return [points.reduce((sum, point) => sum + point[0], 0) / points.length, points.reduce((sum, point) => sum + point[1], 0) / points.length];
}
