import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, MenuItem, TextField, Chip } from '@mui/material';
import Plot from 'react-plotly.js';
import { SessionAnalytics, LapAnalytics } from '../../types';
import { formatLapTime } from '../../api/sessions';

interface Props {
  analytics: SessionAnalytics;
}

const SECTOR_COLORS = {
  good: '#1b5e20',    // verde oscuro: mejor que la mediana del sector
  ok: '#f9a825',      // amarillo: cerca de la mediana
  bad: '#c62828',     // rojo: peor que p75 del sector
  noData: '#9e9e9e',
};

/**
 * Genera un trazado sintético de circuito con 3 sectores.
 * Es una elipse irregular con varios "puntos de curva" para que parezca un circuito.
 * Los índices [0..33], [33..66], [66..100] son S1, S2, S3.
 */
function buildCircuitPath(): { x: number[]; y: number[] } {
  const x: number[] = [];
  const y: number[] = [];
  const N = 100;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    // Elipse base + perturbaciones para simular chicanas / horquillas
    const rx = 4 + 0.6 * Math.sin(2 * t) + 0.3 * Math.cos(3 * t);
    const ry = 3 + 0.5 * Math.cos(2 * t);
    x.push(rx * Math.cos(t));
    y.push(ry * Math.sin(t));
  }
  return { x, y };
}

const TrackMap: React.FC<Props> = ({ analytics }) => {
  const validLaps = analytics.perLap.filter((l) => l.valid);
  const [selectedLapNumber, setSelectedLapNumber] = useState<number>(
    analytics.bestLapNumber ?? validLaps[0]?.lapNumber ?? 1
  );

  const selectedLap = validLaps.find((l) => l.lapNumber === selectedLapNumber);

  // Calcula percentiles de cada sector entre todas las vueltas válidas
  // para clasificar el sector de la vuelta seleccionada como good/ok/bad.
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

  const path = useMemo(buildCircuitPath, []);

  const sectorBoundaries = [33, 66];
  const sectorRanges: Array<{ from: number; to: number; sector: 1 | 2 | 3 }> = [
    { from: 0, to: sectorBoundaries[0], sector: 1 },
    { from: sectorBoundaries[0], to: sectorBoundaries[1], sector: 2 },
    { from: sectorBoundaries[1], to: path.x.length - 1, sector: 3 },
  ];

  const sectorTraces = sectorRanges.map((range) => {
    const status = classifyForSelected(range.sector);
    return {
      x: path.x.slice(range.from, range.to + 1),
      y: path.y.slice(range.from, range.to + 1),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: `S${range.sector}`,
      line: { color: SECTOR_COLORS[status], width: 8 },
      hoverinfo: 'name' as const,
    };
  });

  // Marca el inicio/línea de meta
  const startMarker = {
    x: [path.x[0]],
    y: [path.y[0]],
    type: 'scatter' as const,
    mode: 'markers+text' as const,
    name: 'Meta',
    text: ['🏁'],
    textposition: 'top center' as const,
    marker: { color: '#000', size: 16, symbol: 'diamond' },
    hoverinfo: 'text' as const,
  };

  const sectorLegendLabels: Record<1 | 2 | 3, string> = { 1: 'S1', 2: 'S2', 3: 'S3' };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              Track map · {analytics.sessionName}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Cada sector coloreado según el rendimiento de la vuelta seleccionada
              (verde mejor que mediana · amarillo cerca · rojo peor que P75).
            </Typography>
          </Box>
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
          data={[...sectorTraces, startMarker] as any}
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
          style={{ width: '100%', height: 320 }}
          config={{ displayModeBar: false, staticPlot: false }}
        />
      </CardContent>
    </Card>
  );
};

export default TrackMap;
