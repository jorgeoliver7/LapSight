/**
 * Trazados de circuitos reales como arrays de coordenadas [x, y] en espacio 0–100.
 *
 * Los puntos están dibujados a mano aproximando la forma característica de cada
 * circuito (recta de meta, curvas icónicas, dirección de marcha) — no son
 * coordenadas GPS reales, son una representación visual reconocible.
 *
 * Los aliases cubren las variantes habituales con las que aparece cada circuito
 * en exports CSV (MyLaps Speedhive, iRacing) y plataformas en español/inglés.
 */

export interface Circuit {
  name: string;
  aliases: string[];
  /** Array de [x, y] en rango 0-100. El primer punto debe coincidir con el último (pista cerrada). */
  path: [number, number][];
  /** Porcentajes del path donde acaban S1 y S2 (S3 va hasta el final). */
  sectorBoundaries: [number, number];
  country?: string;
  length_km?: number;
}

// Helper: sample N points along a cubic Bezier curve
function bezier(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  samples = 12
): [number, number][] {
  const result: [number, number][] = [];
  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const x =
      (1 - t) ** 3 * p0[0] +
      3 * (1 - t) ** 2 * t * p1[0] +
      3 * (1 - t) * t ** 2 * p2[0] +
      t ** 3 * p3[0];
    const y =
      (1 - t) ** 3 * p0[1] +
      3 * (1 - t) ** 2 * t * p1[1] +
      3 * (1 - t) * t ** 2 * p2[1] +
      t ** 3 * p3[1];
    result.push([x, y]);
  }
  return result;
}

function buildPath(start: [number, number], segments: Array<[[number, number], [number, number], [number, number]]>): [number, number][] {
  const path: [number, number][] = [start];
  let current = start;
  for (const [c1, c2, end] of segments) {
    path.push(...bezier(current, c1, c2, end, 14));
    current = end;
  }
  return path;
}

// ─── Jarama ──────────────────────────────────────────────────────────────────
// Trazado característico: recta de meta hacia el sur, curva Bugatti larga,
// S de Farina, Ascari, Tobogán, curva final cerrada antes de meta.
const JARAMA: Circuit = {
  name: 'Circuito del Jarama',
  aliases: ['jarama', 'jarama-rasch', 'circuito del jarama'],
  country: 'ES',
  length_km: 3.85,
  path: buildPath(
    [50, 90],
    [
      [[70, 90], [85, 80], [88, 65]],     // recta meta + curva 1 (derecha)
      [[88, 50], [82, 38], [70, 32]],     // Bugatti
      [[60, 28], [55, 30], [50, 38]],     // S de Farina entrada
      [[45, 45], [40, 42], [35, 35]],     // Farina salida
      [[25, 28], [15, 30], [12, 45]],     // sector medio
      [[10, 60], [15, 72], [25, 78]],     // Tobogán
      [[35, 80], [40, 78], [45, 85]],     // horquilla
      [[48, 90], [49, 90], [50, 90]],     // vuelta a meta
    ]
  ),
  sectorBoundaries: [0.33, 0.66],
};

// ─── Circuit Ricardo Tormo (Cheste) ──────────────────────────────────────────
// Forma característica con stadium: largo en una dirección, curvas de retorno,
// recta paralela. Famoso por el sector "stadium" final.
const CHESTE: Circuit = {
  name: 'Circuit Ricardo Tormo',
  aliases: ['cheste', 'valencia', 'ricardo tormo', 'circuit ricardo tormo'],
  country: 'ES',
  length_km: 4.005,
  path: buildPath(
    [20, 85],
    [
      [[30, 88], [45, 88], [60, 85]],     // recta principal
      [[75, 80], [88, 70], [88, 55]],     // curva 1 hacia el norte
      [[88, 45], [80, 38], [72, 42]],     // S de Repsol
      [[65, 48], [60, 42], [55, 35]],     // curva 4-5
      [[50, 30], [42, 32], [40, 42]],     // curva izquierda
      [[38, 52], [42, 55], [50, 52]],     // pasada del stadium
      [[55, 50], [55, 45], [48, 42]],     // chicane stadium
      [[40, 45], [25, 55], [15, 65]],     // sector final
      [[10, 75], [12, 82], [20, 85]],     // vuelta a meta
    ]
  ),
  sectorBoundaries: [0.33, 0.66],
};

// ─── MotorLand Aragón ────────────────────────────────────────────────────────
// Trazado largo y técnico con la recta más larga del calendario MotoGP español.
const ARAGON: Circuit = {
  name: 'MotorLand Aragón',
  aliases: ['aragon', 'aragón', 'motorland', 'motorland aragón', 'alcañiz'],
  country: 'ES',
  length_km: 5.078,
  path: buildPath(
    [15, 85],
    [
      [[25, 90], [40, 92], [55, 88]],     // recta meta
      [[70, 84], [82, 75], [85, 60]],     // curva 1 cerrada
      [[88, 48], [82, 38], [70, 38]],     // bajada técnica
      [[60, 42], [55, 38], [55, 28]],     // sector medio inicio
      [[55, 18], [60, 12], [70, 15]],     // horquilla norte
      [[78, 20], [85, 28], [80, 38]],     // S de retorno
      [[72, 45], [60, 50], [50, 48]],     // diagonal
      [[40, 50], [30, 45], [22, 42]],     // recta del bidón
      [[12, 45], [8, 55], [10, 65]],      // entrada al stadium
      [[15, 75], [18, 80], [15, 85]],     // último sector
    ]
  ),
  sectorBoundaries: [0.35, 0.70],
};

// ─── Circuito de Navarra ─────────────────────────────────────────────────────
// Trazado moderno, varios complejos de curvas medias.
const NAVARRA: Circuit = {
  name: 'Circuito de Navarra',
  aliases: ['navarra', 'circuito de navarra', 'los arcos'],
  country: 'ES',
  length_km: 3.933,
  path: buildPath(
    [25, 85],
    [
      [[40, 88], [55, 88], [68, 82]],     // recta meta
      [[80, 75], [88, 62], [85, 50]],     // curva 1
      [[80, 38], [70, 32], [62, 38]],     // chicane
      [[55, 42], [52, 35], [48, 28]],     // curva 4
      [[45, 22], [38, 22], [32, 28]],     // horquilla
      [[28, 35], [32, 42], [40, 45]],     // S de retorno
      [[48, 48], [50, 55], [40, 55]],     // diagonal
      [[28, 55], [18, 60], [15, 72]],     // último sector
      [[15, 80], [20, 85], [25, 85]],     // vuelta a meta
    ]
  ),
  sectorBoundaries: [0.33, 0.66],
};

// ─── Parcmotor Castellolí ────────────────────────────────────────────────────
const CASTELLOLI: Circuit = {
  name: 'Parcmotor Castellolí',
  aliases: ['castelloli', 'castellolí', 'parcmotor', 'parcmotor castellolí'],
  country: 'ES',
  length_km: 2.5,
  path: buildPath(
    [25, 75],
    [
      [[35, 78], [50, 80], [62, 75]],     // recta corta
      [[75, 70], [82, 60], [78, 50]],     // curva 1
      [[72, 42], [62, 38], [55, 42]],     // chicane
      [[48, 45], [45, 38], [40, 32]],     // curva técnica
      [[32, 28], [25, 32], [20, 42]],     // horquilla
      [[18, 52], [22, 62], [25, 75]],     // último sector
    ]
  ),
  sectorBoundaries: [0.33, 0.66],
};

// ─── Spa-Francorchamps ───────────────────────────────────────────────────────
// Icónico por su forma alargada en valle y Eau Rouge (subida famosa).
const SPA: Circuit = {
  name: 'Spa-Francorchamps',
  aliases: ['spa', 'spa-francorchamps', 'spa francorchamps', 'circuit de spa'],
  country: 'BE',
  length_km: 7.004,
  path: buildPath(
    [20, 90],
    [
      [[28, 92], [38, 90], [42, 82]],     // recta La Source → Eau Rouge approach
      [[43, 75], [45, 70], [48, 68]],     // Eau Rouge
      [[52, 65], [58, 55], [70, 50]],     // Raidillon → Kemmel straight
      [[80, 48], [85, 42], [82, 32]],     // Les Combes
      [[78, 25], [70, 22], [62, 28]],     // Malmedy
      [[55, 32], [48, 28], [40, 32]],     // Rivage
      [[32, 38], [28, 48], [32, 55]],     // Pouhon
      [[38, 62], [45, 68], [52, 70]],     // Stavelot
      [[58, 72], [60, 78], [55, 82]],     // Blanchimont
      [[45, 85], [30, 88], [20, 90]],     // bus stop → meta
    ]
  ),
  sectorBoundaries: [0.30, 0.65],
};

// ─── Jerez ───────────────────────────────────────────────────────────────────
const JEREZ: Circuit = {
  name: 'Circuito de Jerez',
  aliases: ['jerez', 'jerez angel nieto', 'circuito de jerez', 'jerez de la frontera'],
  country: 'ES',
  length_km: 4.428,
  path: buildPath(
    [25, 85],
    [
      [[40, 88], [55, 88], [68, 82]],     // recta meta
      [[80, 75], [85, 65], [80, 55]],     // Expo 92 / curva 1
      [[75, 48], [65, 45], [58, 50]],     // Michelin
      [[52, 55], [50, 45], [45, 38]],     // Sito Pons
      [[40, 32], [32, 32], [28, 40]],     // Curva del Peluqui
      [[25, 48], [28, 55], [35, 55]],     // Curva Senna
      [[42, 55], [42, 62], [35, 65]],     // chicane
      [[25, 65], [15, 72], [18, 80]],     // último sector
      [[22, 84], [24, 85], [25, 85]],     // a meta
    ]
  ),
  sectorBoundaries: [0.35, 0.70],
};

export const CIRCUITS: Circuit[] = [JARAMA, CHESTE, ARAGON, NAVARRA, CASTELLOLI, SPA, JEREZ];

/**
 * Busca un circuito por nombre con matching flexible: case-insensitive,
 * acentos opcionales, sin prefijos comunes. Devuelve null si no hay match.
 */
export function findCircuit(name?: string | null): Circuit | null {
  if (!name) return null;
  const normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/circuit(o|s)?\s+(de|del|of)?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  for (const c of CIRCUITS) {
    const candidates = [c.name, ...c.aliases].map((s) =>
      s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
    );
    if (candidates.some((alias) => normalized.includes(alias) || alias.includes(normalized))) {
      return c;
    }
  }
  return null;
}
