/**
 * Apex / Pit Wall × Cyan design tokens.
 * Source of truth: design_handoff_apex_telemetry/prototype/tokens.jsx (PWC export).
 */

export const colors = {
  bg: '#0a0b0d',
  surface: '#111316',
  surface2: '#171a1e',
  surface3: '#1d2126',

  border: '#232830',
  borderHi: '#2f3540',

  text: '#e8eaed',
  textDim: '#9ca3ad',
  textMute: '#5b6470',

  accent: '#3ec5d1',
  accentDim: '#1a5862',

  purple: '#bb6cff',
  green: '#26d07c',
  yellow: '#ffc233',
  red: '#ff4f4f',
  orange: '#ff8a2a',
  cyan: '#4ec9ff',
} as const;

export const fonts = {
  sans: '"IBM Plex Sans", "Inter", system-ui, sans-serif',
  mono: '"IBM Plex Mono", "JetBrains Mono", ui-monospace, monospace',
  disp: '"IBM Plex Sans", "Inter", system-ui, sans-serif',
} as const;

export const fontFeatures = {
  tabular: {
    fontVariantNumeric: 'tabular-nums',
    fontFeatureSettings: '"tnum"',
  },
} as const;

export const type = {
  pageTitle: { size: 44, weight: 300 },
  hero: { size: 36, weight: 600 },
  screenTitle: { size: 28, weight: 600 },
  sectionHeader: { size: 22, weight: 500 },
  stat: { size: 18, weight: 500 },
  body: { size: 14, weight: 500 },
  rowName: { size: 13, weight: 600 },
  table: { size: 12, weight: 400 },
  navTab: { size: 11, weight: 600, upper: true, tracking: 1.4 },
  label: { size: 10, weight: 500, upper: true, tracking: 1.4 },
  micro: { size: 9, weight: 500, upper: true, tracking: 1.2 },
} as const;

export const space = {
  panel: 16,
  panelCompact: 14,
  panelEditorial: 24,
  gap2: 2,
  gap4: 4,
  gap8: 8,
  gap10: 10,
  gap14: 14,
  gap22: 22,
  headerH: 56,
  subbarH: 44,
} as const;

export const border = {
  width: '1px',
  widthHi: '1.5px',
  widthAccent: '2px',
  radius: 0,
} as const;

export const compoundColor = (
  c: 'S' | 'M' | 'H' | 'I' | 'W' | string,
): string => {
  switch (c) {
    case 'S':
      return colors.red;
    case 'M':
      return colors.yellow;
    case 'H':
      return colors.text;
    case 'I':
      return colors.green;
    case 'W':
      return colors.cyan;
    default:
      return colors.textMute;
  }
};

export const T = {
  colors,
  fonts,
  fontFeatures,
  type,
  space,
  border,
  compoundColor,
};

export type Tokens = typeof T;
