/**
 * Utilidades estadísticas para análisis de tiempos.
 * Implementaciones sencillas y autocontenidas (sin dependencias).
 */

export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function variance(xs: number[], sample = true): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const ss = xs.reduce((acc, x) => acc + (x - m) ** 2, 0);
  return ss / (sample ? xs.length - 1 : xs.length);
}

export function stdDev(xs: number[], sample = true): number {
  return Math.sqrt(variance(xs, sample));
}

export function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

export function percentile(xs: number[], p: number): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const idx = Math.max(0, Math.min(s.length - 1, Math.floor(s.length * p)));
  return s[idx];
}

// ─── Distribución normal estándar ─────────────────────────────────────────

/**
 * Función de error (erf) — aproximación numérica de Abramowitz & Stegun 7.1.26.
 * Precisión ~1.5e-7.
 */
export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

/** CDF de la normal estándar N(0,1). */
export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

/** P-value de dos colas para una z. */
export function normalTwoTailedPvalue(z: number): number {
  return 2 * (1 - normalCdf(Math.abs(z)));
}

// ─── Welch's t-test (varianzas distintas) ─────────────────────────────────

export interface TTestResult {
  t: number;
  df: number;
  pValue: number;       // dos colas, aproximado vía normal cuando df>30
  meanA: number;
  meanB: number;
  diff: number;         // meanA - meanB
  significant05: boolean;
  significant01: boolean;
  cohenD: number;       // tamaño del efecto
  pooledStdDev: number;
}

export function welchTTest(a: number[], b: number[]): TTestResult | null {
  if (a.length < 2 || b.length < 2) return null;
  const mA = mean(a), mB = mean(b);
  const vA = variance(a), vB = variance(b);
  const nA = a.length, nB = b.length;
  const seSquared = vA / nA + vB / nB;
  if (seSquared <= 0) return null;
  const se = Math.sqrt(seSquared);
  const t = (mA - mB) / se;
  // Grados de libertad de Welch-Satterthwaite
  const df = (seSquared * seSquared) /
    ((vA * vA) / (nA * nA * (nA - 1)) + (vB * vB) / (nB * nB * (nB - 1)));
  // P-value: para df > 30 la t se aproxima a la normal. Para df bajo perdemos
  // precisión pero suficiente para nuestro uso.
  const pValue = normalTwoTailedPvalue(t);
  // Cohen's d con SD agrupada
  const pooledStdDev = Math.sqrt(((nA - 1) * vA + (nB - 1) * vB) / (nA + nB - 2));
  const cohenD = pooledStdDev > 0 ? (mA - mB) / pooledStdDev : 0;
  return {
    t, df, pValue,
    meanA: mA, meanB: mB,
    diff: mA - mB,
    significant05: pValue < 0.05,
    significant01: pValue < 0.01,
    cohenD,
    pooledStdDev,
  };
}

// ─── Mann-Whitney U (no paramétrico) ──────────────────────────────────────

export interface MannWhitneyResult {
  u: number;
  z: number;
  pValue: number;
  nA: number;
  nB: number;
  significant05: boolean;
}

export function mannWhitneyU(a: number[], b: number[]): MannWhitneyResult | null {
  if (a.length < 2 || b.length < 2) return null;
  const nA = a.length, nB = b.length;
  const combined = [
    ...a.map((v) => ({ v, group: 'A' as const })),
    ...b.map((v) => ({ v, group: 'B' as const })),
  ].sort((x, y) => x.v - y.v);
  // Asignar rangos con corrección por empates
  const ranks: number[] = new Array(combined.length);
  let i = 0;
  while (i < combined.length) {
    let j = i;
    while (j + 1 < combined.length && combined[j + 1].v === combined[i].v) j++;
    const avgRank = (i + j) / 2 + 1; // 1-indexed
    for (let k = i; k <= j; k++) ranks[k] = avgRank;
    i = j + 1;
  }
  let rankSumA = 0;
  combined.forEach((item, idx) => {
    if (item.group === 'A') rankSumA += ranks[idx];
  });
  const uA = rankSumA - (nA * (nA + 1)) / 2;
  const uB = nA * nB - uA;
  const u = Math.min(uA, uB);
  const muU = (nA * nB) / 2;
  const sigmaU = Math.sqrt((nA * nB * (nA + nB + 1)) / 12);
  const z = sigmaU > 0 ? (u - muU) / sigmaU : 0;
  const pValue = normalTwoTailedPvalue(z);
  return { u, z, pValue, nA, nB, significant05: pValue < 0.05 };
}

// ─── Regresión lineal simple ──────────────────────────────────────────────

export interface LinearFit {
  slope: number;
  intercept: number;
  r2: number;
  /** Función para predecir y(x). */
  predict: (x: number) => number;
  n: number;
}

export function linearFit(xs: number[], ys: number[]): LinearFit | null {
  if (xs.length !== ys.length || xs.length < 2) return null;
  const n = xs.length;
  const mX = mean(xs), mY = mean(ys);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mX;
    const dy = ys[i] - mY;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx === 0) return null;
  const slope = sxy / sxx;
  const intercept = mY - slope * mX;
  const ssTot = syy;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const yPred = intercept + slope * xs[i];
    ssRes += (ys[i] - yPred) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return {
    slope,
    intercept,
    r2,
    predict: (x: number) => intercept + slope * x,
    n,
  };
}

// ─── Kernel Density Estimation (gaussiana) ───────────────────────────────

export function kde(samples: number[], evalPoints: number[], bandwidth?: number): number[] {
  if (samples.length < 2) return evalPoints.map(() => 0);
  const sigma = stdDev(samples);
  const h = bandwidth || 1.06 * sigma * Math.pow(samples.length, -1 / 5); // Silverman
  if (h <= 0) return evalPoints.map(() => 0);
  const norm = 1 / (samples.length * h * Math.sqrt(2 * Math.PI));
  return evalPoints.map((x) =>
    samples.reduce((acc, s) => {
      const z = (x - s) / h;
      return acc + Math.exp(-0.5 * z * z);
    }, 0) * norm
  );
}

/** Etiqueta de magnitud del efecto Cohen's d (Cohen 1988). */
export function cohenDLabel(d: number): string {
  const a = Math.abs(d);
  if (a < 0.2) return 'trivial';
  if (a < 0.5) return 'pequeño';
  if (a < 0.8) return 'mediano';
  if (a < 1.2) return 'grande';
  return 'muy grande';
}

/** Etiqueta de significancia humana. */
export function pValueLabel(p: number): string {
  if (p < 0.001) return 'p < 0.001 (muy significativo)';
  if (p < 0.01) return `p = ${p.toFixed(3)} (significativo)`;
  if (p < 0.05) return `p = ${p.toFixed(3)} (significativo)`;
  if (p < 0.1) return `p = ${p.toFixed(3)} (marginal)`;
  return `p = ${p.toFixed(3)} (no significativo)`;
}
