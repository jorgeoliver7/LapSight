import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Tabs,
  Tab,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
  ShowChart as ShowChartIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ReferenceLine,
  Scatter,
  ComposedChart,
} from 'recharts';
import {
  sessionsApi,
  SessionMetadata,
  ManualLap,
  formatLapTime,
  formatGap,
} from '../../api/sessions';
import ManualLapsEditor from './ManualLapsEditor';
import ComparisonView from './ComparisonView';
import AdvancedAnalytics from './AdvancedAnalytics';
import TrackMap from './TrackMap';
import InsightsPanel from './InsightsPanel';
import { vehiclesApi } from '../../api/vehicles';
import { usersApi } from '../../api/users';
import {
  Session,
  SessionAnalytics,
  SessionType,
  TrackCondition,
  SESSION_TYPE_LABELS,
  TRACK_CONDITION_LABELS,
  Vehicle,
  User,
  UserRole,
} from '../../types';
import { useAuthStore } from '../../store/authStore';

const Analytics: React.FC = () => {
  const { user } = useAuthStore();
  const canUpload =
    user?.role === UserRole.MANAGER ||
    user?.role === UserRole.ENGINEER ||
    user?.role === UserRole.PILOT;
  const canDelete = user?.role === UserRole.MANAGER || user?.role === UserRole.ENGINEER;

  const [sessions, setSessions] = useState<Session[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [compareWithId, setCompareWithId] = useState<number | null>(null);
  const [compareAnalytics, setCompareAnalytics] = useState<SessionAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTab, setUploadTab] = useState<'csv' | 'manual'>('csv');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [manualLaps, setManualLaps] = useState<ManualLap[]>([]);
  const [meta, setMeta] = useState<SessionMetadata>({
    name: '',
    circuit: '',
    sessionDate: new Date().toISOString().slice(0, 16),
    sessionType: SessionType.PRACTICE,
    trackCondition: TrackCondition.DRY,
    durationMinutes: undefined,
    notes: '',
    vehicleId: undefined,
    driverId: undefined,
  });

  const loadSessions = async () => {
    try {
      setLoading(true);
      const [s, v, u] = await Promise.all([
        sessionsApi.list(),
        vehiclesApi.list().catch(() => []),
        usersApi.list().catch(() => []),
      ]);
      setSessions(s);
      setVehicles(v);
      setDrivers(u.filter((u) => u.role === UserRole.PILOT || u.role === UserRole.MANAGER));
      if (s.length > 0 && selectedId == null) {
        setSelectedId(s[0].id);
      }
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error cargando sesiones');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (id: number) => {
    try {
      setLoadingAnalytics(true);
      const a = await sessionsApi.analytics(id);
      setAnalytics(a);
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || 'Error cargando análisis', severity: 'error' });
      setAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId != null) loadAnalytics(selectedId);
    else setAnalytics(null);
    setCompareWithId(null);
    setCompareAnalytics(null);
  }, [selectedId]);

  useEffect(() => {
    if (compareWithId == null) {
      setCompareAnalytics(null);
      return;
    }
    sessionsApi
      .analytics(compareWithId)
      .then(setCompareAnalytics)
      .catch((e) => {
        setSnack({
          msg: e?.response?.data?.message || 'Error cargando sesión a comparar',
          severity: 'error',
        });
        setCompareWithId(null);
      });
  }, [compareWithId]);

  const resetDialog = () => {
    setUploadOpen(false);
    setFile(null);
    setManualLaps([]);
    setUploadTab('csv');
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      const sessionDateIso = new Date(meta.sessionDate).toISOString();
      let created;
      if (uploadTab === 'csv') {
        if (!file) {
          setSnack({ msg: 'Selecciona un archivo CSV', severity: 'error' });
          return;
        }
        created = await sessionsApi.upload({ ...meta, sessionDate: sessionDateIso }, file);
      } else {
        if (manualLaps.length === 0) {
          setSnack({ msg: 'Añade al menos una vuelta', severity: 'error' });
          return;
        }
        const invalidLap = manualLaps.find((l) => !l.lapTime.trim());
        if (invalidLap) {
          setSnack({
            msg: `La vuelta ${invalidLap.lapNumber} no tiene tiempo`,
            severity: 'error',
          });
          return;
        }
        created = await sessionsApi.createManual({
          ...meta,
          sessionDate: sessionDateIso,
          laps: manualLaps,
        });
      }
      setSnack({
        msg: `Sesión "${created.name}" creada (${created.lapCount} vueltas)`,
        severity: 'success',
      });
      resetDialog();
      await loadSessions();
      setSelectedId(created.id);
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || 'Error al guardar la sesión', severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await sessionsApi.downloadTemplate();
    } catch (e: any) {
      setSnack({ msg: 'No se pudo descargar la plantilla', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta sesión y todas sus vueltas?')) return;
    try {
      await sessionsApi.remove(id);
      setSnack({ msg: 'Sesión eliminada', severity: 'success' });
      if (selectedId === id) setSelectedId(null);
      loadSessions();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || 'Error al eliminar', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Análisis de sesiones
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Sube CSV de tiempos por vuelta y analiza el rendimiento
          </Typography>
        </Box>
        {canUpload && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setUploadOpen(true)}>
            Subir sesión
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle2" color="textSecondary" mb={1}>
            Sesiones ({sessions.length})
          </Typography>
          {loading ? (
            <Box p={2} textAlign="center">
              <CircularProgress size={24} />
            </Box>
          ) : sessions.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary" variant="body2">
                No hay sesiones aún. Sube un CSV para empezar.
              </Typography>
            </Paper>
          ) : (
            <Box display="flex" flexDirection="column" gap={1}>
              {sessions.map((s) => (
                <Card
                  key={s.id}
                  variant={selectedId === s.id ? 'elevation' : 'outlined'}
                  elevation={selectedId === s.id ? 4 : 0}
                  sx={{
                    borderColor: selectedId === s.id ? 'primary.main' : undefined,
                    borderWidth: selectedId === s.id ? 2 : undefined,
                  }}
                >
                  <CardActionArea onClick={() => setSelectedId(s.id)}>
                    <CardContent sx={{ pb: 1 }}>
                      <Typography fontWeight={600} variant="body1" gutterBottom>
                        {s.name}
                      </Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap" mb={1}>
                        <Chip label={SESSION_TYPE_LABELS[s.sessionType]} size="small" />
                        {s.trackCondition && (
                          <Chip
                            label={TRACK_CONDITION_LABELS[s.trackCondition]}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        <Chip label={`${s.lapCount} vueltas`} size="small" variant="outlined" />
                      </Box>
                      <Typography variant="caption" color="textSecondary" display="block">
                        {s.circuit || '—'} · {new Date(s.sessionDate).toLocaleDateString('es-ES')}
                      </Typography>
                      {s.vehicleName && (
                        <Typography variant="caption" color="textSecondary" display="block">
                          🏎 {s.vehicleName}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                  {canDelete && (
                    <Box display="flex" justifyContent="flex-end" px={1} pb={1}>
                      <IconButton size="small" onClick={() => handleDelete(s.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Card>
              ))}
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={9}>
          {selectedId == null ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <ShowChartIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
              <Typography color="textSecondary">
                Selecciona una sesión para ver su análisis
              </Typography>
            </Paper>
          ) : loadingAnalytics || !analytics ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Paper>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" fontWeight={500}>
                  Comparar con:
                </Typography>
                <TextField
                  size="small"
                  select
                  value={compareWithId ?? ''}
                  onChange={(e) =>
                    setCompareWithId(e.target.value ? Number(e.target.value) : null)
                  }
                  sx={{ minWidth: 280 }}
                >
                  <MenuItem value="">— Vista individual —</MenuItem>
                  {sessions
                    .filter((s) => s.id !== selectedId)
                    .map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name} ({new Date(s.sessionDate).toLocaleDateString('es-ES')})
                      </MenuItem>
                    ))}
                </TextField>
                {compareWithId != null && !compareAnalytics && <CircularProgress size={20} />}
              </Paper>
              {compareWithId != null && compareAnalytics ? (
                <ComparisonView a={analytics} b={compareAnalytics} />
              ) : (
                <>
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={async () => {
                        try {
                          await sessionsApi.downloadReport(selectedId, analytics.sessionName);
                        } catch (e: any) {
                          setSnack({
                            msg: e?.response?.data?.message || 'No se pudo generar el PDF',
                            severity: 'error',
                          });
                        }
                      }}
                    >
                      📄 Descargar informe PDF
                    </Button>
                  </Box>
                  <InsightsPanel sessionId={selectedId} />
                  <AnalyticsDetail analytics={analytics} />
                  <TrackMap
                    analytics={analytics}
                    circuitName={sessions.find((s) => s.id === selectedId)?.circuit}
                  />
                  <AdvancedAnalytics sessionId={selectedId} base={analytics} />
                </>
              )}
            </Box>
          )}
        </Grid>
      </Grid>

      <Dialog
        open={uploadOpen}
        onClose={() => !uploading && resetDialog()}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nueva sesión</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Nombre de la sesión"
              value={meta.name}
              onChange={(e) => setMeta({ ...meta, name: e.target.value })}
              required
              fullWidth
            />
            <Box display="flex" gap={2}>
              <TextField
                label="Circuito"
                value={meta.circuit}
                onChange={(e) => setMeta({ ...meta, circuit: e.target.value })}
                fullWidth
              />
              <TextField
                label="Fecha y hora"
                type="datetime-local"
                value={meta.sessionDate}
                onChange={(e) => setMeta({ ...meta, sessionDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Tipo"
                select
                value={meta.sessionType}
                onChange={(e) => setMeta({ ...meta, sessionType: e.target.value as SessionType })}
                fullWidth
              >
                {Object.values(SessionType).map((t) => (
                  <MenuItem key={t} value={t}>
                    {SESSION_TYPE_LABELS[t]}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Condición pista"
                select
                value={meta.trackCondition || ''}
                onChange={(e) =>
                  setMeta({ ...meta, trackCondition: (e.target.value as TrackCondition) || undefined })
                }
                fullWidth
              >
                <MenuItem value="">—</MenuItem>
                {Object.values(TrackCondition).map((c) => (
                  <MenuItem key={c} value={c}>
                    {TRACK_CONDITION_LABELS[c]}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Vehículo"
                select
                value={meta.vehicleId ?? ''}
                onChange={(e) =>
                  setMeta({ ...meta, vehicleId: e.target.value ? Number(e.target.value) : undefined })
                }
                fullWidth
              >
                <MenuItem value="">—</MenuItem>
                {vehicles.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Piloto"
                select
                value={meta.driverId ?? ''}
                onChange={(e) =>
                  setMeta({ ...meta, driverId: e.target.value ? Number(e.target.value) : undefined })
                }
                fullWidth
              >
                <MenuItem value="">—</MenuItem>
                {drivers.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.firstName} {d.lastName}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <TextField
              label="Notas"
              value={meta.notes}
              onChange={(e) => setMeta({ ...meta, notes: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1 }}>
              <Tabs value={uploadTab} onChange={(_, v) => setUploadTab(v)}>
                <Tab value="csv" label="Subir CSV" />
                <Tab value="manual" label="Añadir manualmente" />
              </Tabs>
            </Box>

            {uploadTab === 'csv' ? (
              <Box>
                <Button variant="outlined" component="label" fullWidth>
                  {file ? `📄 ${file.name}` : 'Seleccionar archivo CSV'}
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    hidden
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </Button>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Typography variant="caption" color="textSecondary">
                    Columnas: lap, time, s1, s2, s3, valid, compound, fuel, notes (cualquier orden).
                    Separador <code>,</code> o <code>;</code>.
                  </Typography>
                  <Link
                    component="button"
                    type="button"
                    variant="caption"
                    onClick={handleDownloadTemplate}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}
                  >
                    <DownloadIcon fontSize="inherit" />
                    Descargar plantilla
                  </Link>
                </Box>
              </Box>
            ) : (
              <ManualLapsEditor laps={manualLaps} onChange={setManualLaps} />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetDialog} disabled={uploading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              uploading ||
              !meta.name ||
              (uploadTab === 'csv' ? !file : manualLaps.length === 0)
            }
          >
            {uploading ? (
              <CircularProgress size={20} />
            ) : uploadTab === 'csv' ? (
              'Subir y analizar'
            ) : (
              'Crear sesión'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {snack ? <Alert severity={snack.severity}>{snack.msg}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
};

interface KpiProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

const Kpi: React.FC<KpiProps> = ({ icon, label, value, hint, color = 'primary' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Box color={`${color}.main`} display="flex">{icon}</Box>
        <Typography variant="caption" color="textSecondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="h5" fontWeight="bold">
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="textSecondary">
          {hint}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const AnalyticsDetail: React.FC<{ analytics: SessionAnalytics }> = ({ analytics }) => {
  const a = analytics;

  const chartData = a.perLap.map((lap) => ({
    lapNumber: lap.lapNumber,
    time: lap.lapTimeMs / 1000,
    outlier: lap.outlier || !lap.valid ? lap.lapTimeMs / 1000 : null,
    gap: lap.gapToBestMs != null ? lap.gapToBestMs / 1000 : null,
  }));

  const bestSec = a.theoreticalBestLapMs != null && a.bestLapMs != null
    ? a.bestLapMs - a.theoreticalBestLapMs
    : null;

  const degradationLabel =
    a.degradationMsPerLap != null
      ? `${a.degradationMsPerLap > 0 ? '+' : ''}${(a.degradationMsPerLap / 1000).toFixed(3)} s/vuelta`
      : '—';

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="h5" fontWeight="bold">
        {a.sessionName}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <Kpi
            icon={<SpeedIcon />}
            label="Mejor vuelta"
            value={formatLapTime(a.bestLapMs)}
            hint={a.bestLapNumber ? `Vuelta ${a.bestLapNumber}` : undefined}
            color="success"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Kpi
            icon={<TimerIcon />}
            label="Media"
            value={formatLapTime(a.averageMs)}
            hint={`Mediana ${formatLapTime(a.medianMs)}`}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Kpi
            icon={<ShowChartIcon />}
            label="Consistencia"
            value={a.stdDevMs != null ? `±${(a.stdDevMs / 1000).toFixed(3)}s` : '—'}
            hint="Desviación estándar"
            color="info"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Kpi
            icon={<WarningIcon />}
            label="Degradación"
            value={degradationLabel}
            hint={
              a.degradationR2 != null ? `R² ${(a.degradationR2).toFixed(2)}` : undefined
            }
            color={a.degradationMsPerLap && a.degradationMsPerLap > 0 ? 'warning' : 'success'}
          />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Tiempos por vuelta
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lapNumber" label={{ value: 'Vuelta', position: 'insideBottom', offset: -5 }} />
              <YAxis
                tickFormatter={(v) => v.toFixed(2)}
                label={{ value: 'Segundos', angle: -90, position: 'insideLeft' }}
                domain={['auto', 'auto']}
              />
              <RTooltip
                formatter={(v: any) => (typeof v === 'number' ? `${v.toFixed(3)} s` : v)}
                labelFormatter={(l) => `Vuelta ${l}`}
              />
              <Line
                type="monotone"
                dataKey="time"
                stroke="#d32f2f"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Tiempo"
              />
              <Scatter dataKey="outlier" fill="#ff9800" name="Outlier" />
              {a.bestLapMs != null && (
                <ReferenceLine
                  y={a.bestLapMs / 1000}
                  stroke="#4caf50"
                  strokeDasharray="3 3"
                  label={{ value: 'Best', position: 'right', fill: '#4caf50' }}
                />
              )}
              {a.medianMs != null && (
                <ReferenceLine
                  y={a.medianMs / 1000}
                  stroke="#9e9e9e"
                  strokeDasharray="3 3"
                  label={{ value: 'Mediana', position: 'right', fill: '#9e9e9e' }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                Sectores óptimos
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Sector 1</Typography>
                  <Typography fontFamily="monospace" fontWeight={600}>
                    {formatLapTime(a.bestSector1Ms)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Sector 2</Typography>
                  <Typography fontFamily="monospace" fontWeight={600}>
                    {formatLapTime(a.bestSector2Ms)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Sector 3</Typography>
                  <Typography fontFamily="monospace" fontWeight={600}>
                    {formatLapTime(a.bestSector3Ms)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                  <Typography fontWeight={600}>Theoretical best</Typography>
                  <Typography fontFamily="monospace" fontWeight={700} color="success.main">
                    {formatLapTime(a.theoreticalBestLapMs)}
                  </Typography>
                </Box>
                {bestSec != null && (
                  <Typography variant="caption" color="textSecondary" textAlign="right">
                    {bestSec > 0 ? `Dejas ${(bestSec / 1000).toFixed(3)}s sobre la mesa` : 'Vuelta perfecta!'}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                Resumen
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">Vueltas totales</Typography>
                  <Typography fontWeight={600}>{a.totalLaps}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">Vueltas válidas</Typography>
                  <Typography fontWeight={600} color="success.main">
                    {a.validLaps}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">Vueltas inválidas</Typography>
                  <Typography fontWeight={600} color={a.invalidLaps > 0 ? 'error.main' : undefined}>
                    {a.invalidLaps}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">Outliers detectados</Typography>
                  <Typography fontWeight={600} color="warning.main">
                    {a.perLap.filter((l) => l.outlier).length}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">Peor vuelta válida</Typography>
                  <Typography fontFamily="monospace">{formatLapTime(a.worstLapMs)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Detalle por vuelta
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell align="right">Tiempo</TableCell>
                  <TableCell align="right">Gap a best</TableCell>
                  <TableCell align="right">S1</TableCell>
                  <TableCell align="right">S2</TableCell>
                  <TableCell align="right">S3</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {a.perLap.map((lap) => (
                  <TableRow
                    key={lap.lapNumber}
                    sx={{
                      bgcolor: lap.outlier
                        ? 'warning.light'
                        : !lap.valid
                        ? 'error.light'
                        : undefined,
                      opacity: !lap.valid ? 0.7 : 1,
                    }}
                  >
                    <TableCell>{lap.lapNumber}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {formatLapTime(lap.lapTimeMs)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                      {formatGap(lap.gapToBestMs)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                      {formatLapTime(lap.sector1Ms)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                      {formatLapTime(lap.sector2Ms)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                      {formatLapTime(lap.sector3Ms)}
                    </TableCell>
                    <TableCell>
                      {!lap.valid && (
                        <Tooltip title="Vuelta marcada como inválida">
                          <Chip label="Inválida" size="small" color="error" />
                        </Tooltip>
                      )}
                      {lap.outlier && (
                        <Tooltip title="Tiempo > mediana × 1.07 (probable pit/sale)">
                          <Chip label="Outlier" size="small" color="warning" />
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Analytics;
