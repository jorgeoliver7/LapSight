/**
 * Funciones para derivar características de un trazado a partir de sus coordenadas
 * normalizadas (0-100). Útiles cuando no hay metadatos manuales.
 */

import { Circuit } from './circuits';

/**
 * Devuelve el sentido de giro CW/CCW usando la fórmula del shoelace.
 * En coordenadas de pantalla (Y invertida) un área negativa = antihorario visualmente.
 */
export function computeDirection(path: [number, number][]): 'CW' | 'CCW' {
  let sum = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const [x1, y1] = path[i];
    const [x2, y2] = path[i + 1];
    sum += (x2 - x1) * (y2 + y1);
  }
  return sum > 0 ? 'CW' : 'CCW';
}

/**
 * Aproxima el número de curvas contando cambios de dirección significativos.
 * Heurística: agrupa por bins de ángulo y cuenta cambios >25º.
 */
export function approximateTurnCount(path: [number, number][]): number {
  if (path.length < 4) return 0;
  let turns = 0;
  let prevAngle = 0;
  let lastTurnAngle: number | null = null;
  for (let i = 1; i < path.length - 1; i++) {
    const [x1, y1] = path[i - 1];
    const [x2, y2] = path[i];
    const [x3, y3] = path[i + 1];
    const angle1 = Math.atan2(y2 - y1, x2 - x1);
    const angle2 = Math.atan2(y3 - y2, x3 - x2);
    let delta = angle2 - angle1;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;
    const deg = Math.abs(delta * 180 / Math.PI);
    if (deg > 25 && (lastTurnAngle === null || Math.abs(deg - lastTurnAngle) > 10)) {
      turns++;
      lastTurnAngle = deg;
    } else {
      lastTurnAngle = null;
    }
    prevAngle = angle2;
  }
  return turns;
}

/**
 * Detecta la recta más larga (en unidades del path normalizado).
 * Una "recta" = segmentos consecutivos con cambio angular acumulado < 10º.
 */
export function findLongestStraight(path: [number, number][]): number {
  if (path.length < 3) return 0;
  let bestLen = 0;
  let curLen = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const [x1, y1] = path[i];
    const [x2, y2] = path[i + 1];
    const segLen = Math.hypot(x2 - x1, y2 - y1);
    if (i > 0) {
      const [x0, y0] = path[i - 1];
      const ang1 = Math.atan2(y1 - y0, x1 - x0);
      const ang2 = Math.atan2(y2 - y1, x2 - x1);
      let delta = Math.abs(ang2 - ang1);
      if (delta > Math.PI) delta = 2 * Math.PI - delta;
      if (delta * 180 / Math.PI > 10) {
        bestLen = Math.max(bestLen, curLen);
        curLen = 0;
      }
    }
    curLen += segLen;
  }
  bestLen = Math.max(bestLen, curLen);
  return bestLen;
}

/**
 * Convierte unidades del path (0-100) a km usando la longitud declarada.
 * Asume que el path total corresponde a `length_km`.
 */
export function pathUnitsToKm(circuit: Circuit, units: number): number | null {
  if (!circuit.length_km) return null;
  const totalUnits = totalPathLength(circuit.path);
  if (totalUnits === 0) return null;
  return (units / totalUnits) * circuit.length_km;
}

export function totalPathLength(path: [number, number][]): number {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const [x1, y1] = path[i];
    const [x2, y2] = path[i + 1];
    total += Math.hypot(x2 - x1, y2 - y1);
  }
  return total;
}

/** Caja envolvente del path. */
export function pathBoundingBox(path: [number, number][]): { x: number; y: number; w: number; h: number } {
  if (path.length === 0) return { x: 0, y: 0, w: 100, h: 100 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of path) {
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}
