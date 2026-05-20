/**
 * Metadatos extra de circuitos. Indexados por `name` exacto del Circuit en circuits.ts.
 * Valores oficiales del organismo (FIA/FIM) o Wikipedia. Si un valor no se conoce,
 * se omite — la UI usa "—" como fallback.
 */

export type RaceCategory = 'F1' | 'MotoGP' | 'WEC' | 'WSBK' | 'DTM' | 'IndyCar' | 'NASCAR' | 'WRC' | 'GT' | 'F2' | 'F3' | 'Formula E';
export type CircuitDirection = 'CW' | 'CCW';

export interface CircuitExtras {
  /** Número de curvas oficial. */
  turns?: number;
  /** Sentido de giro. */
  direction?: CircuitDirection;
  /** Longitud de la recta más larga (km). */
  longestStraightKm?: number;
  /** Identificador de grupo para variantes del mismo circuito. */
  variantGroup?: string;
  /** Categorías que compiten en este circuito. */
  categories?: RaceCategory[];
  /** Altitud media sobre el nivel del mar (m). */
  altitudeM?: number;
  /** Año de inauguración. */
  opened?: number;
  /** Récord oficial de vuelta en formato libre. */
  lapRecord?: string;
  /** Curiosidad o nota destacada. */
  funFact?: string;
}

export const CIRCUIT_EXTRAS: Record<string, CircuitExtras> = {
  // ─── España ────────────────────────────────────────────────────────────
  'Circuit de Barcelona-Catalunya': {
    turns: 14, direction: 'CW', longestStraightKm: 1.047, variantGroup: 'barcelona',
    categories: ['F1', 'MotoGP', 'WEC', 'F2', 'F3'], altitudeM: 132, opened: 1991,
    lapRecord: '1:16.330 (Verstappen, 2023)',
    funFact: 'Sede tradicional del test de pretemporada F1.',
  },
  'Circuito del Jarama': {
    turns: 16, direction: 'CW', variantGroup: 'jarama',
    categories: ['MotoGP', 'WSBK', 'GT'], altitudeM: 670, opened: 1967,
    funFact: 'Diseñado por John Hugenholtz, el mismo de Suzuka.',
  },
  'MotorLand Aragón': {
    turns: 17, direction: 'CW', longestStraightKm: 1.2, variantGroup: 'aragon',
    categories: ['MotoGP', 'WSBK', 'WEC'], altitudeM: 365, opened: 2009,
    funFact: 'Recta principal de 1.2 km, una de las más largas en MotoGP.',
  },
  'Circuit Ricardo Tormo': {
    turns: 14, direction: 'CCW', variantGroup: 'cheste',
    categories: ['MotoGP', 'WSBK', 'F1'], altitudeM: 90, opened: 1999,
    funFact: 'Final tradicional de la temporada de MotoGP.',
  },
  'Parcmotor Castellolí': {
    turns: 12, direction: 'CW', variantGroup: 'castelloli',
    categories: ['GT'], altitudeM: 380, opened: 2007,
    funFact: 'Track day favorito de Cataluña.',
  },
  'Circuito de Navarra': {
    turns: 15, direction: 'CW', variantGroup: 'navarra',
    categories: ['WSBK', 'GT'], altitudeM: 500, opened: 2010,
  },
  'Circuito de Jerez': {
    turns: 13, direction: 'CW', variantGroup: 'jerez',
    categories: ['MotoGP', 'WSBK', 'F1'], altitudeM: 37, opened: 1985,
    lapRecord: '1:36.170 (Bagnaia, 2023)',
    funFact: 'Renombrado "Ángel Nieto" en honor al 13+ veces campeón.',
  },

  // ─── F1 Europa ─────────────────────────────────────────────────────────
  'Spa-Francorchamps': {
    turns: 19, direction: 'CW', longestStraightKm: 1.95, variantGroup: 'spa',
    categories: ['F1', 'WEC', 'GT'], altitudeM: 401, opened: 1921,
    lapRecord: '1:46.286 (Hamilton, 2018)',
    funFact: 'Eau Rouge-Raidillon es probablemente el complejo de curvas más icónico del motorsport.',
  },
  'Circuit de Monaco': {
    turns: 19, direction: 'CW', longestStraightKm: 0.67, variantGroup: 'monaco',
    categories: ['F1'], altitudeM: 7, opened: 1929,
    lapRecord: '1:12.909 (Verstappen, 2023)',
    funFact: 'Circuito callejero. La velocidad media es la más baja del calendario F1.',
  },
  'Autodromo Nazionale Monza': {
    turns: 11, direction: 'CW', longestStraightKm: 1.05, variantGroup: 'monza',
    categories: ['F1', 'WEC', 'F2', 'F3'], altitudeM: 162, opened: 1922,
    lapRecord: '1:21.046 (Hamilton, 2020)',
    funFact: 'Velocidad media más alta del calendario F1. Conocido como "Templo de la velocidad".',
  },
  'Autodromo Enzo e Dino Ferrari': {
    turns: 19, direction: 'CCW', variantGroup: 'imola',
    categories: ['F1', 'WEC'], altitudeM: 37, opened: 1953,
    lapRecord: '1:15.484 (Hamilton, 2020)',
    funFact: 'Antihorario, uno de los pocos del calendario F1.',
  },
  'Nürburgring GP-Strecke': {
    turns: 16, direction: 'CW', variantGroup: 'nurburgring',
    categories: ['F1', 'DTM', 'GT'], altitudeM: 578, opened: 1984,
  },
  'Hockenheimring': {
    turns: 17, direction: 'CW', variantGroup: 'hockenheim',
    categories: ['F1', 'DTM'], altitudeM: 103, opened: 1932,
    funFact: 'Layout actual diseñado por Tilke en 2002, mucho más corto que el bosque original.',
  },
  'Circuit Zandvoort': {
    turns: 14, direction: 'CW', variantGroup: 'zandvoort',
    categories: ['F1', 'DTM'], altitudeM: 5, opened: 1948,
    funFact: 'Tiene dos curvas con peralte (banked corners) tras el rediseño 2020.',
  },
  'Hungaroring': {
    turns: 14, direction: 'CW', variantGroup: 'hungaroring',
    categories: ['F1', 'F2', 'F3'], altitudeM: 213, opened: 1986,
    funFact: 'A menudo llamado "Mónaco sin paredes" por lo retorcido.',
  },
  'Red Bull Ring': {
    turns: 10, direction: 'CW', variantGroup: 'red-bull-ring',
    categories: ['F1', 'MotoGP', 'DTM'], altitudeM: 678, opened: 1969,
    lapRecord: '1:05.619 (Sainz, 2020)',
    funFact: 'Más corto del calendario F1 en tiempo de vuelta.',
  },
  'Intercity Istanbul Park': {
    turns: 14, direction: 'CCW', variantGroup: 'istanbul',
    categories: ['F1', 'WSBK'], altitudeM: 130, opened: 2005,
    funFact: 'La Turn 8 es una curva cuádruple ápice de 4G y 8 segundos.',
  },
  'Silverstone Circuit': {
    turns: 18, direction: 'CW', longestStraightKm: 0.77, variantGroup: 'silverstone',
    categories: ['F1', 'MotoGP', 'WEC', 'F2', 'F3'], altitudeM: 196, opened: 1948,
    lapRecord: '1:27.097 (Verstappen, 2020)',
    funFact: 'Aerodromo militar de la WW2 reconvertido en circuito.',
  },

  // ─── MotoGP / Histórico ────────────────────────────────────────────────
  'Silverstone International': {
    turns: 10, direction: 'CW', variantGroup: 'silverstone',
    categories: ['GT', 'F3'],
    funFact: 'Sub-trazado interior usado para series menores.',
  },
  'Nürburgring Nordschleife': {
    turns: 73, direction: 'CW', longestStraightKm: 2.2, variantGroup: 'nurburgring',
    categories: ['GT', 'WEC'], altitudeM: 320, opened: 1927,
    lapRecord: '5:19.546 (Porsche 919 Hybrid Evo, 2018)',
    funFact: 'Conocido como "Inferno Verde". 73 curvas en 20.832 km.',
  },
  'Circuit de la Sarthe': {
    turns: 38, direction: 'CW', longestStraightKm: 1.8, variantGroup: 'le-mans',
    categories: ['WEC'], altitudeM: 56, opened: 1923,
    funFact: 'Sede de las 24 Horas de Le Mans desde 1923. La recta Mulsanne llevaba chicane desde 1990.',
  },
  'Circuit Bugatti': {
    turns: 14, direction: 'CW', variantGroup: 'le-mans',
    categories: ['MotoGP', 'F2'], altitudeM: 56, opened: 1965,
    lapRecord: '1:30.876 (Bagnaia, 2023)',
    funFact: 'Sub-trazado permanente de Le Mans, sede del GP de Francia de MotoGP.',
  },
  'Autodromo Internazionale del Mugello': {
    turns: 15, direction: 'CW', longestStraightKm: 1.141, variantGroup: 'mugello',
    categories: ['MotoGP', 'WEC', 'GT'], altitudeM: 285, opened: 1974,
    lapRecord: '1:46.208 (Bagnaia, 2022)',
    funFact: 'Propiedad de Ferrari desde 1988. La recta llega a 366 km/h con MotoGP.',
  },
  'Misano World Circuit Marco Simoncelli': {
    turns: 16, direction: 'CW', variantGroup: 'misano',
    categories: ['MotoGP', 'WSBK'], altitudeM: 4, opened: 1972,
    funFact: 'Renombrado en 2012 tras la muerte de Marco Simoncelli.',
  },
  'Sachsenring': {
    turns: 13, direction: 'CCW', variantGroup: 'sachsenring',
    categories: ['MotoGP'], altitudeM: 320, opened: 1927,
    funFact: '10 izquierdas, 3 derechas — los pilotos casi gastan sólo el lado izquierdo del neumático.',
  },
  'Algarve International Circuit': {
    turns: 15, direction: 'CW', variantGroup: 'algarve',
    categories: ['MotoGP', 'WSBK', 'F1', 'WEC'], altitudeM: 100, opened: 2008,
    funFact: 'Montaña rusa portuguesa: muchas elevaciones y descensos.',
  },
  'Autódromo do Estoril': {
    turns: 13, direction: 'CW', variantGroup: 'estoril',
    categories: ['MotoGP', 'WSBK'], altitudeM: 88, opened: 1972,
    funFact: 'Sede del GP de Portugal F1 entre 1984-1996.',
  },

  // ─── Asia / Oriente Medio ──────────────────────────────────────────────
  'Suzuka International Racing Course': {
    turns: 18, direction: 'CW', longestStraightKm: 1.2, variantGroup: 'suzuka',
    categories: ['F1', 'WEC'], altitudeM: 45, opened: 1962,
    lapRecord: '1:30.983 (Hamilton, 2019)',
    funFact: 'Único trazado en figura de 8 del calendario F1 (pasa sobre sí mismo).',
  },
  'Suzuka East Course': {
    turns: 10, direction: 'CW', variantGroup: 'suzuka',
    categories: ['GT'],
    funFact: 'Sub-trazado de la primera mitad de Suzuka.',
  },
  'Sepang International Circuit': {
    turns: 15, direction: 'CW', variantGroup: 'sepang',
    categories: ['F1', 'MotoGP', 'WEC'], altitudeM: 16, opened: 1999,
    funFact: 'Primer trazado diseñado completamente por Hermann Tilke.',
  },
  'Shanghai International Circuit': {
    turns: 16, direction: 'CW', variantGroup: 'shanghai',
    categories: ['F1', 'WEC'], altitudeM: 5, opened: 2004,
    funFact: 'Trazado en forma de carácter chino "shang" (上).',
  },
  'Baku City Circuit': {
    turns: 20, direction: 'CCW', longestStraightKm: 2.2, variantGroup: 'baku',
    categories: ['F1', 'F2'], altitudeM: 0, opened: 2016,
    funFact: 'Circuito callejero más rápido del mundo. Pasa por la muralla de la ciudad vieja.',
  },
  'Lusail International Circuit': {
    turns: 16, direction: 'CW', variantGroup: 'losail',
    categories: ['F1', 'MotoGP'], altitudeM: 13, opened: 2004,
    funFact: 'Primera carrera nocturna permanente del calendario MotoGP.',
  },
  'Jeddah Corniche Circuit': {
    turns: 27, direction: 'CCW', longestStraightKm: 1.5, variantGroup: 'jeddah',
    categories: ['F1', 'F2'], altitudeM: 5, opened: 2021,
    funFact: 'Circuito callejero más rápido y largo (en curvas) del calendario F1.',
  },
  'Yas Marina Circuit': {
    turns: 16, direction: 'CCW', variantGroup: 'yas-marina',
    categories: ['F1', 'WEC'], altitudeM: 1, opened: 2009,
    funFact: 'Habitual final de temporada F1. Carrera al ocaso, termina de noche.',
  },

  // ─── Américas ──────────────────────────────────────────────────────────
  'Circuit Gilles Villeneuve': {
    turns: 14, direction: 'CW', longestStraightKm: 1.1, variantGroup: 'montreal',
    categories: ['F1'], altitudeM: 18, opened: 1978,
    funFact: 'Construido en la Isla Notre-Dame, escenario de la Expo 67.',
  },
  'Autódromo Hermanos Rodríguez': {
    turns: 17, direction: 'CW', variantGroup: 'mexico-city',
    categories: ['F1', 'WEC'], altitudeM: 2240, opened: 1962,
    funFact: 'A 2240m de altitud — el aire fino afecta motores y aerodinámica.',
  },
  'Autódromo José Carlos Pace': {
    turns: 15, direction: 'CCW', variantGroup: 'interlagos',
    categories: ['F1', 'WEC'], altitudeM: 800, opened: 1940,
    lapRecord: '1:10.540 (Bottas, 2018)',
    funFact: 'Conocido como Interlagos. Antihorario y construido sobre colinas.',
  },
  'Autódromo Oscar y Juan Gálvez': {
    turns: 15, direction: 'CW', variantGroup: 'buenos-aires',
    categories: ['F1', 'WSBK', 'MotoGP'], altitudeM: 8, opened: 1952,
    funFact: 'Sede del GP de Argentina F1 hasta 1998.',
  },

  // ─── Oceanía / Sudeste Asiático ────────────────────────────────────────
  'Albert Park Circuit': {
    turns: 14, direction: 'CW', variantGroup: 'albert-park',
    categories: ['F1'], altitudeM: 10, opened: 1953,
    funFact: 'Inicio tradicional de temporada F1. Trazado semi-callejero alrededor del lago Albert.',
  },
  'Phillip Island Grand Prix Circuit': {
    turns: 12, direction: 'CCW', longestStraightKm: 0.9, variantGroup: 'phillip-island',
    categories: ['MotoGP', 'WSBK'], altitudeM: 35, opened: 1956,
    funFact: 'Costero, en una isla. Vientos cruzados muy impredecibles.',
  },
  'Marina Bay Street Circuit': {
    turns: 19, direction: 'CCW', variantGroup: 'singapore',
    categories: ['F1'], altitudeM: 2, opened: 2008,
    funFact: 'Primera carrera nocturna permanente de F1.',
  },
};

/** Devuelve los extras de un circuito o objeto vacío. */
export function getCircuitExtras(circuitName: string): CircuitExtras {
  return CIRCUIT_EXTRAS[circuitName] || {};
}
