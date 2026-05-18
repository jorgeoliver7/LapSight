import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Plot from 'react-plotly.js';
import { sessionsApi, formatLapTime } from '../../api/sessions';
import {
  AnomaliesAnalysis,
  DegradationAnalysis,
  HeatmapAnalysis,
  SessionAnalytics,
  StintsAnalysis,
} from '../../types';

interface Props {
  sessionId: number;
  base: SessionAnalytics;
}

type TabKey = 'distribution' | 'heatmap' | 'stints' | 'anomalies' | 'degradation';

const STINT_COLORS = ['#d32f2f', '#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#0288d1'];

const AdvancedAnalytics: React.FC<Props> = ({ sessionId, base }) => {
  const [tab, setTab] = useState<TabKey>('distribution');

  const [stints, setStints] = useState<StintsAnalysis | null>(null);
  const [anomalies, setAnomalies] = useState<AnomaliesAnalysis | null>(null);
  const [degradation, setDegradation] = useState<DegradationAnalysis | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapAnalysis | null>(null);

  const [loading, setLoading] = useState<Record<TabKey, boolean>>({
    distribution: false,
    heatmap: false,
    stints: false,
    anomalies: false,
    degradation: false,
  });
  const [error, setError] = useState<Record<TabKey, string | null>>({
    distribution: null,
    heatmap: null,
    stints: null,
    anomalies: null,
    degradation: null,
  });

  const fetchWith = async <T,>(
    key: TabKey,
    fn: () => Promise<T>,
    setter: (v: T) => void
  ) => {
    setLoading((s) => ({ ...s, [key]: true }));
    setError((s) => ({ ...s, [key]: null }));
    try {
      setter(await fn());
    } catch (e: any) {
      setError((s) => ({
        ...s,
        [key]: e?.response?.data?.message || 'Servicio de analytics no disponible',
      }));
    } finally {
      setLoading((s) => ({ ...s, [key]: false }));
    }
  };

  useEffect(() => {
    setStints(null);
    setAnomalies(null);
    setDegradation(null);
    setHeatmap(null);
  }, [sessionId]);

  useEffect(() => {
    if (tab === 'stints' && !stints && !loading.stints) {
      fetchWith('stints', () => sessionsApi.stints(sessionId), setStints);
    } else if (tab === 'anomalies' && !anomalies && !loading.anomalies) {
      fetchWith('anomalies', () => sessionsApi.anomalies(sessionId), setAnomalies);
    } else if (tab === 'degradation' && !degradation && !loading.degradation) {
      fetchWith('degradation', () => sessionsApi.degradationAdvanced(sessionId), setDegradation);
    } else if (tab === 'heatmap' && !heatmap && !loading.heatmap) {
      fetchWith('heatmap', () => sessionsApi.heatmap(sessionId), setHeatmap);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, sessionId]);

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Análisis avanzado
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block" mb={1}>
          Cálculos con pandas + scikit-learn + scipy ejecutados en microservicio Python.
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
            <Tab value="distribution" label="Distribución" />
            <Tab value="heatmap" label="Heatmap sectores" />
            <Tab value="stints" label="Stints (KMeans)" />
            <Tab value="anomalies" label="Anomalías (IsolationForest)" />
            <Tab value="degradation" label="Degradación (polinómica)" />
          </Tabs>
        </Box>

        {tab === 'distribution' && <DistributionPanel analytics={base} />}

        {tab === 'heatmap' && (
          <PanelLoader loading={loading.heatmap} error={error.heatmap}>
            {heatmap && <HeatmapPanel data={heatmap} />}
          </PanelLoader>
        )}

        {tab === 'stints' && (
          <PanelLoader loading={loading.stints} error={error.stints}>
            {stints && <StintsPanel data={stints} base={base} />}
          </PanelLoader>
        )}

        {tab === 'anomalies' && (
          <PanelLoader loading={loading.anomalies} error={error.anomalies}>
            {anomalies && <AnomaliesPanel data={anomalies} base={base} />}
          </PanelLoader>
        )}

        {tab === 'degradation' && (
          <PanelLoader loading={loading.degradation} error={error.degradation}>
            {degradation && <DegradationPanel data={degradation} base={base} />}
          </PanelLoader>
        )}
      </CardContent>
    </Card>
  );
};

const PanelLoader: React.FC<{
  loading: boolean;
  error: string | null;
  children?: React.ReactNode;
}> = ({ loading, error, children }) => {
  if (loading) {
    return (
      <Box textAlign="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="warning">{error}</Alert>;
  }
  return <>{children}</>;
};

// ─── Distribution: Box plot + Histogram con Plotly ──────────────────────

const DistributionPanel: React.FC<{ analytics: SessionAnalytics }> = ({ analytics }) => {
  const validTimes = analytics.perLap
    .filter((l) => l.valid)
    .map((l) => l.lapTimeMs / 1000);

  if (validTimes.length === 0) {
    return <Alert severity="info">Sin vueltas válidas para mostrar distribución.</Alert>;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Plot
          data={[
            {
              y: validTimes,
              type: 'box',
              name: 'Tiempo',
              boxpoints: 'all',
              jitter: 0.4,
              pointpos: 0,
              marker: { color: '#d32f2f', size: 6 },
              boxmean: 'sd',
            },
          ]}
          layout={{
            title: { text: 'Distribución de tiempos (Box plot)' },
            yaxis: { title: { text: 'Segundos' } },
            margin: { l: 50, r: 20, t: 40, b: 30 },
            showlegend: false,
            autosize: true,
          }}
          useResizeHandler
          style={{ width: '100%', height: 320 }}
          config={{ displayModeBar: false }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Plot
          data={[
            {
              x: validTimes,
              type: 'histogram',
              name: 'Vueltas',
              marker: { color: '#d32f2f', line: { color: '#9a0007', width: 1 } },
              autobinx: true,
            } as any,
          ]}
          layout={{
            title: { text: 'Histograma de tiempos' },
            xaxis: { title: { text: 'Segundos' } },
            yaxis: { title: { text: 'Frecuencia' } },
            margin: { l: 50, r: 20, t: 40, b: 50 },
            showlegend: false,
            autosize: true,
          }}
          useResizeHandler
          style={{ width: '100%', height: 320 }}
          config={{ displayModeBar: false }}
        />
      </Grid>
    </Grid>
  );
};

// ─── Heatmap sector × vuelta ──────────────────────

const HeatmapPanel: React.FC<{ data: HeatmapAnalysis }> = ({ data }) => {
  // Eje X = vueltas, Eje Y = sectores, valor = gap en segundos al mejor sector
  const z = data.gapMs.map((row) => row.map((v) => (v == null ? null : v / 1000)));

  return (
    <Box>
      <Plot
        data={[
          {
            z,
            x: data.lapNumbers,
            y: data.sectors,
            type: 'heatmap',
            colorscale: [
              [0, '#1b5e20'],
              [0.3, '#388e3c'],
              [0.6, '#fbc02d'],
              [1, '#b71c1c'],
            ],
            zmin: 0,
            colorbar: { title: { text: 'Gap (s)' } },
            hovertemplate: 'Vuelta %{x}<br>%{y}<br>Gap: %{z:.3f}s<extra></extra>',
          },
        ]}
        layout={{
          title: { text: 'Gap al mejor sector — verde = óptimo, rojo = lejos' },
          xaxis: { title: { text: 'Vuelta' }, dtick: 1 },
          yaxis: { autorange: 'reversed' },
          margin: { l: 50, r: 20, t: 40, b: 50 },
          autosize: true,
        }}
        useResizeHandler
        style={{ width: '100%', height: 280 }}
        config={{ displayModeBar: false }}
      />
      <Typography variant="caption" color="textSecondary">
        Lectura: cada celda muestra cuánto pierdes en ese sector respecto al mejor sector
        que has hecho en toda la sesión. Verde = vuelta perfecta para ese sector.
      </Typography>
    </Box>
  );
};

// ─── Stints: KMeans clustering coloreado en el chart ──────────────────────

const StintsPanel: React.FC<{ data: StintsAnalysis; base: SessionAnalytics }> = ({
  data,
  base,
}) => {
  if (data.nStints === 0) {
    return <Alert severity="info">Sesión demasiado corta para detectar stints.</Alert>;
  }

  const traces = data.stints.map((stint, idx) => {
    const color = STINT_COLORS[idx % STINT_COLORS.length];
    const stintLaps = base.perLap.filter((l) => stint.lapNumbers.includes(l.lapNumber));
    return {
      x: stintLaps.map((l) => l.lapNumber),
      y: stintLaps.map((l) => l.lapTimeMs / 1000),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: `Stint ${idx + 1}${stint.dominantCompound ? ` (${stint.dominantCompound})` : ''}`,
      line: { color, width: 2 },
      marker: { color, size: 7 },
    };
  });

  return (
    <Box>
      <Plot
        data={traces}
        layout={{
          title: {
            text: `${data.nStints} stints detectados (${data.method === 'compound-based' ? 'por compound' : 'KMeans 1D sobre lap_time'})`,
          },
          xaxis: { title: { text: 'Vuelta' }, dtick: 1 },
          yaxis: { title: { text: 'Segundos' } },
          margin: { l: 50, r: 20, t: 40, b: 50 },
          autosize: true,
        }}
        useResizeHandler
        style={{ width: '100%', height: 360 }}
        config={{ displayModeBar: false }}
      />
      <TableContainer sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Stint</TableCell>
              <TableCell>Compound</TableCell>
              <TableCell align="right">Vueltas</TableCell>
              <TableCell align="right">Mejor</TableCell>
              <TableCell align="right">Media</TableCell>
              <TableCell align="right">Degradación</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.stints.map((s, idx) => (
              <TableRow key={s.stintIndex}>
                <TableCell>
                  <Chip
                    label={`Stint ${idx + 1}`}
                    size="small"
                    sx={{
                      bgcolor: STINT_COLORS[idx % STINT_COLORS.length],
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>{s.dominantCompound || '—'}</TableCell>
                <TableCell align="right">{s.lapsCount}</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                  {formatLapTime(s.bestMs)}
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                  {formatLapTime(Math.round(s.meanMs))}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontFamily: 'monospace',
                    color:
                      s.degradationMsPerLap == null
                        ? 'text.secondary'
                        : s.degradationMsPerLap > 0
                        ? 'warning.main'
                        : 'success.main',
                  }}
                >
                  {s.degradationMsPerLap != null
                    ? `${s.degradationMsPerLap > 0 ? '+' : ''}${(
                        s.degradationMsPerLap / 1000
                      ).toFixed(3)} s/v`
                    : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// ─── Anomalies: IsolationForest ──────────────────────

const AnomaliesPanel: React.FC<{ data: AnomaliesAnalysis; base: SessionAnalytics }> = ({
  data,
  base,
}) => {
  const scoresByLap = new Map(data.anomalies.map((a) => [a.lapNumber, a.anomalyScore]));
  const anomalyLaps = data.anomalies.filter((a) => a.isAnomaly).map((a) => a.lapNumber);

  const normalLaps = base.perLap.filter((l) => l.valid && !anomalyLaps.includes(l.lapNumber));
  const anomalousLaps = base.perLap.filter((l) => l.valid && anomalyLaps.includes(l.lapNumber));

  return (
    <Box>
      <Alert
        severity={data.nAnomalies > 0 ? 'warning' : 'success'}
        sx={{ mb: 2 }}
      >
        IsolationForest detectó <strong>{data.nAnomalies}</strong> vueltas anómalas de
        {' '}{base.validLaps} válidas. Una vuelta es anómala si su tiempo (y opcionalmente
        sectores) destaca del patrón general de la sesión.
      </Alert>

      <Plot
        data={[
          {
            x: normalLaps.map((l) => l.lapNumber),
            y: normalLaps.map((l) => l.lapTimeMs / 1000),
            type: 'scatter',
            mode: 'markers',
            name: 'Normal',
            marker: { color: '#1976d2', size: 9 },
            text: normalLaps.map((l) => `score: ${(scoresByLap.get(l.lapNumber) ?? 0).toFixed(3)}`),
          },
          {
            x: anomalousLaps.map((l) => l.lapNumber),
            y: anomalousLaps.map((l) => l.lapTimeMs / 1000),
            type: 'scatter',
            mode: 'markers',
            name: 'Anomalía',
            marker: { color: '#d32f2f', size: 14, symbol: 'x', line: { width: 2 } },
            text: anomalousLaps.map((l) => `score: ${(scoresByLap.get(l.lapNumber) ?? 0).toFixed(3)}`),
          },
        ]}
        layout={{
          title: { text: 'Detección de anomalías (IsolationForest)' },
          xaxis: { title: { text: 'Vuelta' }, dtick: 1 },
          yaxis: { title: { text: 'Segundos' } },
          margin: { l: 50, r: 20, t: 40, b: 50 },
          autosize: true,
        }}
        useResizeHandler
        style={{ width: '100%', height: 320 }}
        config={{ displayModeBar: false }}
      />
    </Box>
  );
};

// ─── Degradación polinómica ──────────────────────

const DegradationPanel: React.FC<{ data: DegradationAnalysis; base: SessionAnalytics }> = ({
  data,
  base,
}) => {
  const validLaps = base.perLap.filter((l) => l.valid);
  const lapNumbers = validLaps.map((l) => l.lapNumber);
  const times = validLaps.map((l) => l.lapTimeMs / 1000);

  // Línea polinómica suave: evaluar el polinomio en muchos puntos para curva suave
  const xMin = Math.min(...lapNumbers);
  const xMax = Math.max(...lapNumbers);
  const xs: number[] = [];
  const N = 100;
  for (let i = 0; i <= N; i++) xs.push(xMin + ((xMax - xMin) * i) / N);

  const evalPoly = (coeffs: number[], x: number) => {
    let result = 0;
    for (const c of coeffs) result = result * x + c;
    return result / 1000;
  };

  const linearY = xs.map((x) => evalPoly(data.linear.coefficients, x));
  const polyY = xs.map((x) => evalPoly(data.polynomial.coefficients, x));

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Se ajustan dos modelos: lineal (R² = <strong>{data.linear.rSquared.toFixed(3)}</strong>) y
        {' '}polinómico grado {data.polynomial.degree} (R² = <strong>{data.polynomial.rSquared.toFixed(3)}</strong>).
        Modelo elegido: <strong>{data.chosen}</strong>.
      </Alert>

      <Plot
        data={[
          {
            x: lapNumbers,
            y: times,
            type: 'scatter',
            mode: 'markers',
            name: 'Vueltas válidas',
            marker: { color: '#424242', size: 8 },
          },
          {
            x: xs,
            y: linearY,
            type: 'scatter',
            mode: 'lines',
            name: `Lineal (R² ${data.linear.rSquared.toFixed(2)})`,
            line: { color: '#1976d2', width: 2, dash: 'dot' },
          },
          {
            x: xs,
            y: polyY,
            type: 'scatter',
            mode: 'lines',
            name: `Polinómico g${data.polynomial.degree} (R² ${data.polynomial.rSquared.toFixed(2)})`,
            line: { color: '#d32f2f', width: 3 },
          },
        ]}
        layout={{
          title: { text: 'Modelos de degradación' },
          xaxis: { title: { text: 'Vuelta' }, dtick: 1 },
          yaxis: { title: { text: 'Segundos' } },
          margin: { l: 50, r: 20, t: 40, b: 50 },
          autosize: true,
          legend: { orientation: 'h', y: -0.2 },
        }}
        useResizeHandler
        style={{ width: '100%', height: 360 }}
        config={{ displayModeBar: false }}
      />
    </Box>
  );
};

export default AdvancedAnalytics;
