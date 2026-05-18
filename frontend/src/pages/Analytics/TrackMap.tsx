import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, MenuItem, TextField, Chip } from '@mui/material';
import Plot from 'react-plotly.js';
import { SessionAnalytics, LapAnalytics } from '../../types';
import { formatLapTime } from '../../api/sessions';
import { Circuit, findCircuit } from '../../data/circuits';

interface Props {
  analytics: SessionAnalytics;
  circuitName?: string | null;
}

const SECTOR_COLORS = {
  good: '#1b5e20',
  ok: '#f9a825',
  bad: '#c62828',
  noData: '#9e9e9e',
};

/**
 * Trazado sintético de fallback cuando el circuito no coincide con ninguno conocido.
 */
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
    analytics.bestLapNumber ?? validLaps[0]?.lapNumber ?? 1
  );

  const selectedLap = validLaps.find((l) => l.lapNumber === selectedLapNumber);

  const circuit = useMemo(() => findCircuit(circuitName) ?? SYNTHETIC, [circuitName]);
  const isReal = circuit !== SYNTHETIC;

  // Percentiles de cada sector entre todas las vueltas válidas
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

  const classifyForSelected = (sectorNum: 1 | 2 | 3): keyof typeof SECTOR_COLORS => {
    if (!selectedLap) return 'noData';
    const value = sectorNum === 1 ? selectedLap.sector1Ms : sectorNum === 2 ? selectedLap.sector2Ms : selectedLap.sector3Ms;
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
      line: { color: SECTOR_COLORS[classifyForSelected(1)], width: 7 },
      hoverinfo: 'name' as const,
    },
    {
      x: path.slice(s1End, s2End + 1).map((p) => p[0]),
      y: path.slice(s1End, s2End + 1).map((p) => p[1]),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: 'S2',
      line: { color: SECTOR_COLORS[classifyForSelected(2)], width: 7 },
      hoverinfo: 'name' as const,
    },
    {
      x: path.slice(s2End).map((p) => p[0]),
      y: path.slice(s2End).map((p) => p[1]),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: 'S3',
      line: { color: SECTOR_COLORS[classifyForSelected(3)], width: 7 },
      hoverinfo: 'name' as const,
    },
  ];

  const startMarker = {
    x: [path[0][0]],
    y: [path[0][1]],
    type: 'scatter' as const,
    mode: 'markers+text' as const,
    name: 'Meta',
    text: ['🏁'],
    textposition: 'top center' as const,
    marker: { color: '#000', size: 18, symbol: 'diamond' },
    hoverinfo: 'text' as const,
  };

  const sectorMarkers = {
    x: [path[s1End][0], path[s2End][0]],
    y: [path[s1End][1], path[s2End][1]],
    type: 'scatter' as const,
    mode: 'markers' as const,
    name: 'Cambio sector',
    marker: { color: '#1976d2', size: 10, symbol: 'line-ns', line: { width: 3 } },
    hoverinfo: 'name' as const,
  };

  const sectorLegendLabels: Record<1 | 2 | 3, string> = { 1: 'S1', 2: 'S2', 3: 'S3' };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              Track map · {isReal ? circuit.name : 'Trazado genérico'}
              {circuit.length_km && (
                <Typography component="span" variant="caption" color="textSecondary" ml={1}>
                  ({circuit.length_km} km)
                </Typography>
              )}
              {circuit.realData && (
                <Typography
                  component="span"
                  variant="caption"
                  ml={1}
                  sx={{
                    bgcolor: 'success.light',
                    color: 'success.dark',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    fontWeight: 600,
                  }}
                >
                  GPS real
                </Typography>
              )}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {isReal
                ? `Trazado aproximado de ${circuit.name}. Sectores coloreados según rendimiento de la vuelta seleccionada (verde mejor que P50, amarillo cerca, rojo peor que P75).`
                : 'Circuito no reconocido — usando trazado genérico. Sectores se colorean igual.'}
            </Typography>
          </Box>
          <TextField
            select
            size="small"
            label="Vuelta"
            value={selectedLapNumber}
            onChange={(e) => setSelectedLapNumber(Number(e.target.value))}
            sx={{ minWidth: 220 }}
          >
            {validLaps.map((l) => (
              <MenuItem key={l.lapNumber} value={l.lapNumber}>
                Vuelta {l.lapNumber} — {formatLapTime(l.lapTimeMs)}
                {l.lapNumber === analytics.bestLapNumber ? ' ⭐' : ''}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box display="flex" gap={1} mb={1} flexWrap="wrap">
          {([1, 2, 3] as const).map((s) => {
            const cls = classifyForSelected(s);
            const value =
              s === 1 ? selectedLap?.sector1Ms : s === 2 ? selectedLap?.sector2Ms : selectedLap?.sector3Ms;
            return (
              <Chip
                key={s}
                size="small"
                label={`${sectorLegendLabels[s]} ${formatLapTime(value)}`}
                sx={{
                  bgcolor: SECTOR_COLORS[cls],
                  color: 'white',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
              />
            );
          })}
        </Box>

        <Plot
          data={[...sectorTraces, sectorMarkers, startMarker] as any}
          layout={{
            xaxis: { visible: false, scaleanchor: 'y', scaleratio: 1 },
            yaxis: { visible: false },
            margin: { l: 10, r: 10, t: 10, b: 10 },
            showlegend: false,
            autosize: true,
            plot_bgcolor: '#fafafa',
            paper_bgcolor: '#fafafa',
          }}
          useResizeHandler
          style={{ width: '100%', height: 360 }}
          config={{ displayModeBar: false }}
        />
      </CardContent>
    </Card>
  );
};

export default TrackMap;
