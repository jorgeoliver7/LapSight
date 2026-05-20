import React, { useMemo, useState } from 'react';
import { MenuItem, TextField } from '@mui/material';
import Plot from 'react-plotly.js';
import { SessionAnalytics, LapAnalytics } from '../../types';
import { formatLapTime } from '../../api/sessions';
import { Circuit, findCircuit } from '../../data/circuits';
import { colors, fonts } from '../../theme/tokens';
import { apexPlotlyConfig } from '../../theme/apexPlotly';
import { Panel, Mono, Label } from '../../components/apex';

interface Props {
  analytics: SessionAnalytics;
  circuitName?: string | null;
}

const SECTOR_COLOR = {
  good: colors.green,
  ok: colors.yellow,
  bad: colors.red,
  noData: colors.textMute,
} as const;

function buildSyntheticPath(): [number, number][] {
  const path: [number, number][] = [];
  const N = 100;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    const rx = 40 + 6 * Math.sin(2 * t) + 3 * Math.cos(3 * t);
    const ry = 30 + 5 * Math.cos(2 * t);
    path.push([50 + rx * Math.cos(t), 50 + ry * Math.sin(t)]);
  }
  return path;
}

const SYNTHETIC: Circuit = {
  name: 'Trazado genérico',
  aliases: [],
  path: buildSyntheticPath(),
  sectorBoundaries: [0.33, 0.66],
};

const TrackMap: React.FC<Props> = ({ analytics, circuitName }) => {
  const validLaps = analytics.perLap.filter((l) => l.valid);
  const [selectedLapNumber, setSelectedLapNumber] = useState<number>(
    analytics.bestLapNumber ?? validLaps[0]?.lapNumber ?? 1,
  );

  const selectedLap = validLaps.find((l) => l.lapNumber === selectedLapNumber);

  const circuit = useMemo(() => findCircuit(circuitName) ?? SYNTHETIC, [circuitName]);
  const isReal = circuit !== SYNTHETIC;

  const sectorPercentiles = useMemo(() => {
    const sec = (lap: LapAnalytics, n: 1 | 2 | 3) =>
      n === 1 ? lap.sector1Ms : n === 2 ? lap.sector2Ms : lap.sector3Ms;
    const result: Record<number, { median: number; p75: number } | null> = {};
    for (const n of [1, 2, 3] as const) {
      const values = validLaps.map((l) => sec(l, n)).filter((v): v is number => v != null);
      if (values.length === 0) {
        result[n] = null;
      } else {
        const sorted = [...values].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const p75 = sorted[Math.floor(sorted.length * 0.75)];
        result[n] = { median, p75 };
      }
    }
    return result;
  }, [validLaps]);

  const classifyForSelected = (sectorNum: 1 | 2 | 3): keyof typeof SECTOR_COLOR => {
    if (!selectedLap) return 'noData';
    const value =
      sectorNum === 1
        ? selectedLap.sector1Ms
        : sectorNum === 2
          ? selectedLap.sector2Ms
          : selectedLap.sector3Ms;
    const stats = sectorPercentiles[sectorNum];
    if (value == null || !stats) return 'noData';
    if (value < stats.median) return 'good';
    if (value < stats.p75) return 'ok';
    return 'bad';
  };

  const path = circuit.path;
  const total = path.length;
  const s1End = Math.max(1, Math.floor(total * circuit.sectorBoundaries[0]));
  const s2End = Math.max(s1End + 1, Math.floor(total * circuit.sectorBoundaries[1]));

  const sectorTraces = [
    {
      x: path.slice(0, s1End + 1).map((p) => p[0]),
      y: path.slice(0, s1End + 1).map((p) => p[1]),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: 'S1',
      line: { color: SECTOR_COLOR[classifyForSelected(1)], width: 6 },
      hoverinfo: 'name' as const,
    },
    {
      x: path.slice(s1End, s2End + 1).map((p) => p[0]),
      y: path.slice(s1End, s2End + 1).map((p) => p[1]),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: 'S2',
      line: { color: SECTOR_COLOR[classifyForSelected(2)], width: 6 },
      hoverinfo: 'name' as const,
    },
    {
      x: path.slice(s2End).map((p) => p[0]),
      y: path.slice(s2End).map((p) => p[1]),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: 'S3',
      line: { color: SECTOR_COLOR[classifyForSelected(3)], width: 6 },
      hoverinfo: 'name' as const,
    },
  ];

  const startMarker = {
    x: [path[0][0]],
    y: [path[0][1]],
    type: 'scatter' as const,
    mode: 'markers' as const,
    name: 'Meta',
    marker: { color: colors.text, size: 12, symbol: 'diamond', line: { color: colors.bg, width: 2 } },
    hoverinfo: 'name' as const,
  };

  const sectorMarkers = {
    x: [path[s1End][0], path[s2End][0]],
    y: [path[s1End][1], path[s2End][1]],
    type: 'scatter' as const,
    mode: 'markers' as const,
    name: 'Cambio sector',
    marker: { color: colors.accent, size: 10, symbol: 'line-ns', line: { width: 3, color: colors.accent } },
    hoverinfo: 'name' as const,
  };

  return (
    <Panel
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Track map · {isReal ? circuit.name : 'genérico'}
          {circuit.length_km && (
            <Mono style={{ color: colors.textMute, fontSize: 10, letterSpacing: '0.4px' }}>
              · {circuit.length_km} km
            </Mono>
          )}
          {circuit.realData && (
            <Mono
              style={{
                fontSize: 9,
                color: colors.green,
                border: `1px solid ${colors.green}`,
                padding: '1px 5px',
                letterSpacing: '0.8px',
                fontWeight: 600,
                textTransform: 'uppercase',
                marginLeft: 4,
              }}
            >
              GPS real
            </Mono>
          )}
        </span>
      }
      right={
        <TextField
          select
          size="small"
          label="Vuelta"
          value={selectedLapNumber}
          onChange={(e) => setSelectedLapNumber(Number(e.target.value))}
          sx={{ minWidth: 200 }}
        >
          {validLaps.map((l) => (
            <MenuItem key={l.lapNumber} value={l.lapNumber}>
              V{l.lapNumber} — {formatLapTime(l.lapTimeMs)}
              {l.lapNumber === analytics.bestLapNumber ? ' ★' : ''}
            </MenuItem>
          ))}
        </TextField>
      }
      padding={0}
    >
      <div
        style={{
          padding: '10px 16px',
          borderBottom: `1px solid ${colors.border}`,
          background: colors.surface,
        }}
      >
        <Mono
          style={{
            fontSize: 10,
            color: colors.textMute,
            letterSpacing: '0.3px',
            lineHeight: 1.5,
            display: 'block',
            marginBottom: 8,
          }}
        >
          {isReal
            ? 'Trazado aproximado. Sectores coloreados según la vuelta seleccionada: verde mejor que P50, amarillo entre P50–P75, rojo peor que P75.'
            : 'Circuito no reconocido — trazado genérico. Sectores se colorean igual.'}
        </Mono>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {([1, 2, 3] as const).map((s) => {
            const cls = classifyForSelected(s);
            const value =
              s === 1
                ? selectedLap?.sector1Ms
                : s === 2
                  ? selectedLap?.sector2Ms
                  : selectedLap?.sector3Ms;
            const c = SECTOR_COLOR[cls];
            return (
              <div
                key={s}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 10px',
                  border: `1px solid ${c}`,
                  borderLeft: `3px solid ${c}`,
                  background: colors.surface2,
                }}
              >
                <Label tone="mute" size="micro">
                  S{s}
                </Label>
                <Mono
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: c,
                    letterSpacing: '0.2px',
                  }}
                >
                  {formatLapTime(value)}
                </Mono>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: 12 }}>
        <Plot
          data={[...sectorTraces, sectorMarkers, startMarker] as never}
          layout={
            {
              xaxis: { visible: false, scaleanchor: 'y', scaleratio: 1 },
              yaxis: { visible: false },
              margin: { l: 10, r: 10, t: 10, b: 10 },
              showlegend: false,
              autosize: true,
              plot_bgcolor: colors.surface,
              paper_bgcolor: colors.surface,
              font: {
                family: fonts.mono,
                size: 10,
                color: colors.textDim,
              },
              hoverlabel: {
                bgcolor: colors.surface3,
                bordercolor: colors.borderHi,
                font: { family: fonts.mono, size: 11, color: colors.text },
              },
            } as never
          }
          useResizeHandler
          style={{ width: '100%', height: 360 }}
          config={apexPlotlyConfig as never}
        />
      </div>
    </Panel>
  );
};

export default TrackMap;
