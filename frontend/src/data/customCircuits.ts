/**
 * Circuitos custom importados por el usuario (GeoJSON). Persistidos en LocalStorage.
 */
import { Circuit } from './circuits';

const STORAGE_KEY = 'rt-custom-circuits-v1';

export function loadCustomCircuits(): Circuit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c) => c && typeof c.name === 'string' && Array.isArray(c.path));
  } catch {
    return [];
  }
}

export function saveCustomCircuit(circuit: Circuit): void {
  const existing = loadCustomCircuits();
  const idx = existing.findIndex((c) => c.name === circuit.name);
  if (idx >= 0) existing[idx] = circuit;
  else existing.push(circuit);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function deleteCustomCircuit(name: string): void {
  const existing = loadCustomCircuits().filter((c) => c.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

/**
 * Parsea un GeoJSON con LineString o Feature/FeatureCollection y extrae las coords.
 * Devuelve [lng, lat][] o null si no es válido.
 */
export function parseGeoJson(text: string): {
  coords: [number, number][];
  name?: string;
  country?: string;
  length_km?: number;
} | null {
  try {
    const obj = JSON.parse(text);
    let feature: any = obj;
    if (obj.type === 'FeatureCollection' && Array.isArray(obj.features)) {
      feature = obj.features[0];
    }
    if (feature?.type === 'Feature') {
      const geom = feature.geometry;
      if (!geom || geom.type !== 'LineString') return null;
      const props = feature.properties || {};
      return {
        coords: geom.coordinates,
        name: props.Name || props.name,
        country: props.country,
        length_km: props.length ? props.length / 1000 : undefined,
      };
    }
    if (feature?.type === 'LineString') {
      return { coords: feature.coordinates };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Normaliza coordenadas GeoJSON (lng, lat) a 0-100 preservando aspect ratio.
 * Copia simplificada de normalizeGeoJson en circuits.ts.
 */
export function normalizeCoords(coords: [number, number][]): [number, number][] {
  if (coords.length === 0) return [];
  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const rangeLng = maxLng - minLng;
  const rangeLat = maxLat - minLat;
  const meanLatRad = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const lngScale = Math.cos(meanLatRad);
  const effLngRange = rangeLng * lngScale;
  const maxRange = Math.max(effLngRange, rangeLat);
  const padding = 5;
  const xPadding = (maxRange - effLngRange) / 2;
  const yPadding = (maxRange - rangeLat) / 2;
  return coords.map(([lng, lat]) => {
    const xCentered = (lng - minLng) * lngScale + xPadding;
    const yCentered = lat - minLat + yPadding;
    const x = padding + (xCentered / maxRange) * (100 - 2 * padding);
    const y = padding + ((maxRange - yCentered) / maxRange) * (100 - 2 * padding);
    return [x, y];
  });
}
