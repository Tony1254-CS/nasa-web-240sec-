import type * as GeoJSON from 'geojson';
export function featureTouchesEnvelope(feature: GeoJSON.Feature, envelope: GeoJSON.Feature<GeoJSON.Polygon>) {
  const outer = envelope.geometry.coordinates[0] as number[][];
  const geometry = feature.geometry;
  if (geometry.type === 'Polygon') {
    const rings = geometry.coordinates as number[][][];
    if (rings[0].some((point) => pointInRing([point[0], point[1]], outer))) return true;
    if (outer.some((point) => pointInRing([point[0], point[1]], rings[0]))) return true;
    return rings[0].some((point, index) => {
      const next = rings[0][(index + 1) % rings[0].length];
      return outer.some((edge, edgeIndex) => segmentsTouch(point, next, edge, outer[(edgeIndex + 1) % outer.length]));
    });
  }
  if (geometry.type === 'LineString') {
    const points = geometry.coordinates as number[][];
    if (points.some((point) => pointInRing([point[0], point[1]], outer))) return true;
    return points.some((point, index) => index > 0 && outer.some((edge, edgeIndex) => segmentsTouch(points[index - 1], point, edge, outer[(edgeIndex + 1) % outer.length])));
  }
  return false;
}
function pointInRing(point: [number, number], ring: number[][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const cross = ((yi > point[1]) !== (yj > point[1])) && (point[0] < ((xj - xi) * (point[1] - yi)) / ((yj - yi) || 1e-12) + xi);
    if (cross) inside = !inside;
  }
  return inside;
}
function orient(a: number[], b: number[], c: number[]) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}
function segmentsTouch(a: number[], b: number[], c: number[], d: number[]) {
  const onSegment = (p: number[], q: number[], r: number[]) =>
    q[0] <= Math.max(p[0], r[0]) + 1e-10 && q[0] >= Math.min(p[0], r[0]) - 1e-10 &&
    q[1] <= Math.max(p[1], r[1]) + 1e-10 && q[1] >= Math.min(p[1], r[1]) - 1e-10;
  const o1 = orient(a, b, c), o2 = orient(a, b, d), o3 = orient(c, d, a), o4 = orient(c, d, b);
  if (((o1 > 0 && o2 < 0) || (o1 < 0 && o2 > 0)) && ((o3 > 0 && o4 < 0) || (o3 < 0 && o4 > 0))) return true;
  return (Math.abs(o1) < 1e-10 && onSegment(a, c, b)) ||
    (Math.abs(o2) < 1e-10 && onSegment(a, d, b)) ||
    (Math.abs(o3) < 1e-10 && onSegment(c, a, d)) ||
    (Math.abs(o4) < 1e-10 && onSegment(c, b, d));
}
export function makeScenario(center: [number, number], lengthM: number, depthM: number, bearing: number): GeoJSON.Feature<GeoJSON.Polygon> {
  const angle = bearing * Math.PI / 180;
  const along = [Math.sin(angle), Math.cos(angle)];
  const across = [Math.cos(angle), -Math.sin(angle)];
  const toPoint = (u: number, v: number): [number, number] => {
    const east = along[0] * u + across[0] * v;
    const north = along[1] * u + across[1] * v;
    const lat = center[1] + north / 110540;
    const lon = center[0] + east / (111320 * Math.cos(center[1] * Math.PI / 180));
    return [lon, lat];
  };
  const halfLength = lengthM / 2;
  const halfDepth = depthM / 2;
  return {
    type: 'Feature',
    properties: { kind: 'scenario screening envelope', length_m: lengthM, retreat_m: depthM, bearing_deg: bearing },
    geometry: { type: 'Polygon', coordinates: [[
      toPoint(-halfLength, -halfDepth), toPoint(halfLength, -halfDepth),
      toPoint(halfLength, halfDepth), toPoint(-halfLength, halfDepth),
      toPoint(-halfLength, -halfDepth),
    ]] },
  };
}
