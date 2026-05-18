import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import Plot from 'react-plotly.js';
import { SessionAnalytics } from '../../types';
import { formatGap, formatLapTime } from '../../api/sessions';

interface Props {
  analytics: SessionAnalytics[];
}

const PALETTE = ['#d32f2f', '#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#0288d1'];

const MultiSessionComparison: React.FC<Props> = ({ analytics }) => {
  // Vueltas válidas por sesión, indexadas por lapNumber para overlay
  const allLapNumbers = useMemo(() => {
    const set = new Set<number>();
    analytics.forEach((a) => a.perLap.forEach((l) => set.add(l.lapNumber)));
    return Array.from(set).sort((a, b) => a - b);
  }, [analytics]);

  const validTimesBySession = useMemo(
    () =>
      analytics.map((a) =>
        a.perLap.filter((l) => l.valid).map((l) => l.lapTimeMs / 1000)
      ),
    [analytics]
  );

  const referenceBest = useMemo(() => {
    const bests = analytics.map((a) => a.bestLapMs ?? Number.POSITIVE_INFINITY);
    return Math.min(...bests);
  }, [analytics]);

  // Datos para line chart: para cada vuelta, array con valor por sesión
  const lineData = useMemo(
    () =>
      analytics.map((a, idx) => {
        const lapMap = new Map(a.perLap.map((l) => [l.lapNumber, l]));
        return {
          x: allLapNumbers,
          y: allLapNumbers.map((n) => {
            const lap = lapMap.get(n);
            if (!lap || !lap.valid) return null;
            return lap.lapTimeMs / 1000;
          }),
          type: 'scatter' as const,
          mode: 'lines+markers' as const,
          name: a.sessionName,
          line: { color: PALETTE[idx % PALETTE.length], width: 2 },
          marker: { color: PALETTE[idx % PALETTE.length], size: 6 },
          connectgaps: false,
        };
      }),
    [analytics, allLapNumbers]
  );

  // Violin plot data
  const violinData = analytics.map((a, idx) => ({
    y: validTimesBySession[idx],
    type: 'violin' as const,
    name: a.sessionName,
    line: { color: PALETTE[idx % PALETTE.length] },
    fillcolor: PALETTE[idx % PALETTE.length],
    opacity: 0.6,
    box: { visible: true },
    meanline: { visible: true },
    points: 'all' as const,
    jitter: 0.4,
    pointpos: 0,
    marker: { size: 4 },
  }));

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Header con leyenda de sesiones */}
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        {analytics.map((a, idx) => (
          <Box key={a.sessionId} display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 14,
                height: 14,
                bgcolor: PALETTE[idx % PALETTE.length],
                borderRadius: 0.5,
              }}
            />
            <Typography variant="body1" fontWeight={600}>
              {a.sessionName}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* KPIs por sesión */}
      <Grid container spacing={2}>
        {analytics.map((a, idx) => {
          const color = PALETTE[idx % PALETTE.length];
          const gapToRef =
            a.bestLapMs != null && referenceBest !== Number.POSITIVE_INFINITY
              ? a.bestLapMs - referenceBest
              : null;
          return (
            <Grid item xs={12} sm={6} md={3} key={a.sessionId}>
              <Card sx={{ borderLeft: `4px solid ${color}` }}>
                <CardContent>
                  <Typography variant="caption" color="textSecondary">
                    Mejor vuelta
                  </Typography>
                  <Typography variant="h5" fontWeight={700} fontFamily="monospace">
                    {formatLapTime(a.bestLapMs)}
                  </Typography>
                  {gapToRef != null && gapToRef !== 0 && (
                    <Typography
                      variant="caption"
                      color={gapToRef > 0 ? 'error.main' : 'success.main'}
                      fontFamily="monospace"
                    >
                      {formatGap(gapToRef)} vs mejor del grupo
                    </Typography>
                  )}
                  <Box mt={1}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Media: <strong>{formatLapTime(a.averageMs)}</strong>
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Mediana: <strong>{formatLapTime(a.medianMs)}</strong>
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      σ:{' '}
                      <strong>
                        {a.stdDevMs != null ? `±${(a.stdDevMs / 1000).toFixed(3)}s` : '—'}
                      </strong>
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Theoretical:{' '}
                      <strong>{formatLapTime(a.theoreticalBestLapMs)}</strong>
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Vueltas válidas:{' '}
                      <strong>
                        {a.validLaps}/{a.totalLaps}
                      </strong>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Line chart overlay */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Tiempos por vuelta — overlay
          </Typography>
          <Plot
            data={lineData}
            layout={{
              xaxis: { title: { text: 'Vuelta' }, dtick: 1 },
              yaxis: {
                title: { text: 'Segundos' },
                tickformat: '.2f',
                autorange: true,
              },
              margin: { l: 50, r: 20, t: 30, b: 50 },
              autosize: true,
              legend: { orientation: 'h', y: -0.18 },
            }}
            useResizeHandler
            style={{ width: '100%', height: 360 }}
            config={{ displayModeBar: false }}
          />
        </CardContent>
      </Card>

      {/* Violin plot de distribuciones */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Distribuciones (violin plot)
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block" mb={1}>
            Cada "violín" muestra la densidad de probabilidad de los tiempos. Box interior =
            cuartiles. Pico ancho = pace concentrado (consistente). Forma estirada = mayor
            dispersión.
          </Typography>
          <Plot
            data={violinData}
            layout={{
              yaxis: { title: { text: 'Segundos' }, tickformat: '.2f' },
              margin: { l: 50, r: 20, t: 30, b: 60 },
              autosize: true,
              showlegend: false,
            }}
            useResizeHandler
            style={{ width: '100%', height: 380 }}
            config={{ displayModeBar: false }}
          />
        </CardContent>
      </Card>

      {/* Tabla resumen comparativa */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Tabla comparativa
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Métrica</TableCell>
                  {analytics.map((a, idx) => (
                    <TableCell
                      key={a.sessionId}
                      align="right"
                      sx={{ color: PALETTE[idx % PALETTE.length], fontWeight: 700 }}
                    >
                      {a.sessionName}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <ComparisonRow
                  label="Mejor vuelta"
                  values={analytics.map((a) => a.bestLapMs)}
                  format={formatLapTime}
                />
                <ComparisonRow
                  label="Media"
                  values={analytics.map((a) => a.averageMs)}
                  format={formatLapTime}
                />
                <ComparisonRow
                  label="Mediana"
                  values={analytics.map((a) => a.medianMs)}
                  format={formatLapTime}
                />
                <ComparisonRow
                  label="Consistencia (σ)"
                  values={analytics.map((a) => a.stdDevMs)}
                  format={(n) => (n != null ? `±${(n / 1000).toFixed(3)}s` : '—')}
                  lowerIsBetter
                />
                <ComparisonRow
                  label="Theoretical best"
                  values={analytics.map((a) => a.theoreticalBestLapMs)}
                  format={formatLapTime}
                />
                <ComparisonRow
                  label="Mejor S1"
                  values={analytics.map((a) => a.bestSector1Ms)}
                  format={formatLapTime}
                />
                <ComparisonRow
                  label="Mejor S2"
                  values={analytics.map((a) => a.bestSector2Ms)}
                  format={formatLapTime}
                />
                <ComparisonRow
                  label="Mejor S3"
                  values={analytics.map((a) => a.bestSector3Ms)}
                  format={formatLapTime}
                />
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary' }}>Vueltas válidas</TableCell>
                  {analytics.map((a, idx) => (
                    <TableCell key={a.sessionId} align="right" sx={{ fontFamily: 'monospace' }}>
                      <Chip
                        size="small"
                        label={`${a.validLaps}/${a.totalLaps}`}
                        sx={{
                          bgcolor: PALETTE[idx % PALETTE.length],
                          color: 'white',
                          fontFamily: 'monospace',
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

interface ComparisonRowProps {
  label: string;
  values: (number | null | undefined)[];
  format: (n: number | null | undefined) => string;
  lowerIsBetter?: boolean;
}

const ComparisonRow: React.FC<ComparisonRowProps> = ({
  label,
  values,
  format,
  lowerIsBetter = true,
}) => {
  const numericValues = values.map((v) => (v == null ? null : v));
  const validValues = numericValues.filter((v): v is number => v != null);
  let bestIdx = -1;
  if (validValues.length > 0) {
    const target = lowerIsBetter ? Math.min(...validValues) : Math.max(...validValues);
    bestIdx = numericValues.findIndex((v) => v === target);
  }

  return (
    <TableRow>
      <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>{label}</TableCell>
      {numericValues.map((v, idx) => (
        <TableCell
          key={idx}
          align="right"
          sx={{
            fontFamily: 'monospace',
            fontWeight: idx === bestIdx ? 700 : 400,
            color: idx === bestIdx ? 'success.main' : undefined,
          }}
        >
          {format(v)}
        </TableCell>
      ))}
    </TableRow>
  );
};

export default MultiSessionComparison;
