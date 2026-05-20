import { colors, fonts } from './tokens';

/**
 * Layout base for Plotly figures rendered inside Apex panels.
 * Apply with `{ ...apexPlotlyLayout(), ...overrides }`.
 */
export function apexPlotlyLayout(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    paper_bgcolor: colors.surface,
    plot_bgcolor: colors.surface,
    font: {
      family: fonts.mono,
      size: 10,
      color: colors.textDim,
    },
    margin: { l: 50, r: 14, t: 10, b: 38 },
    xaxis: {
      gridcolor: colors.border,
      zerolinecolor: colors.border,
      linecolor: colors.border,
      tickcolor: colors.border,
      tickfont: { family: fonts.mono, size: 10, color: colors.textMute },
      titlefont: { family: fonts.mono, size: 10, color: colors.textMute },
    },
    yaxis: {
      gridcolor: colors.border,
      zerolinecolor: colors.border,
      linecolor: colors.border,
      tickcolor: colors.border,
      tickfont: { family: fonts.mono, size: 10, color: colors.textMute },
      titlefont: { family: fonts.mono, size: 10, color: colors.textMute },
    },
    showlegend: false,
    hoverlabel: {
      bgcolor: colors.surface3,
      bordercolor: colors.borderHi,
      font: {
        family: fonts.mono,
        size: 11,
        color: colors.text,
      },
    },
    ...overrides,
  };
}

export const apexPlotlyConfig = {
  displayModeBar: false as const,
  responsive: true as const,
};

export const apexPaletteSeries = [
  colors.accent,
  colors.purple,
  colors.green,
  colors.yellow,
  colors.orange,
  colors.red,
  colors.cyan,
];
