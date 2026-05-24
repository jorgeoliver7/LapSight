import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Link,
  FormControl,
  InputLabel,
  OutlinedInput,
  Select,
  Box,
  Typography,
} from '@mui/material';
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
import MultiSessionComparison from './MultiSessionComparison';
import AdvancedAnalytics from './AdvancedAnalytics';
import TrackMap from './TrackMap';
import InsightsPanel from './InsightsPanel';
import ConsistencyPanel from './ConsistencyPanel';
import StatisticalTestsPanel from './StatisticalTestsPanel';
import DistributionsPanel from './DistributionsPanel';
import ConditionsImpactPanel from './ConditionsImpactPanel';
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
import CircuitSelector from '../../components/CircuitSelector/CircuitSelector';
import { colors, fonts } from '../../theme/tokens';
import {
  Panel,
  Mono,
  Label,
  MiniStat,
  ToolButton,
  Flag,
} from '../../components/apex';

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
  const [compareWithIds, setCompareWithIds] = useState<number[]>([]);
  const [compareAnalytics, setCompareAnalytics] = useState<SessionAnalytics[]>([]);

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
      setError(e?.response?.data?.message || 'Error loading sessions');
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
      setSnack({ msg: e?.response?.data?.message || 'Error loading analytics', severity: 'error' });
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
    setCompareWithIds([]);
    setCompareAnalytics([]);
  }, [selectedId]);

  useEffect(() => {
    if (compareWithIds.length === 0) {
      setCompareAnalytics([]);
      return;
    }
    Promise.all(compareWithIds.map((id) => sessionsApi.analytics(id)))
      .then(setCompareAnalytics)
      .catch((e) => {
        setSnack({
          msg: e?.response?.data?.message || 'Error loading sessions to compare',
          severity: 'error',
        });
        setCompareWithIds([]);
      });
  }, [compareWithIds]);

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
          setSnack({ msg: 'Select a CSV file', severity: 'error' });
          return;
        }
        created = await sessionsApi.upload({ ...meta, sessionDate: sessionDateIso }, file);
      } else {
        if (manualLaps.length === 0) {
          setSnack({ msg: 'Add at least one lap', severity: 'error' });
          return;
        }
        const invalidLap = manualLaps.find((l) => !l.lapTime.trim());
        if (invalidLap) {
          setSnack({ msg: `Lap ${invalidLap.lapNumber} has no time`, severity: 'error' });
          return;
        }
        created = await sessionsApi.createManual({
          ...meta,
          sessionDate: sessionDateIso,
          laps: manualLaps,
        });
      }
      setSnack({
        msg: `Session "${created.name}" created (${created.lapCount} laps)`,
        severity: 'success',
      });
      resetDialog();
      await loadSessions();
      setSelectedId(created.id);
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || 'Error saving the session', severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await sessionsApi.downloadTemplate();
    } catch (e: any) {
      setSnack({ msg: 'Could not download the template', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this session and all its laps?')) return;
    try {
      await sessionsApi.remove(id);
      setSnack({ msg: 'Session deleted', severity: 'success' });
      if (selectedId === id) setSelectedId(null);
      loadSessions();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || 'Error deleting', severity: 'error' });
    }
  };

  const selectedSession = sessions.find((s) => s.id === selectedId) || null;

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Page title strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
          padding: '4px 4px 0',
        }}
      >
        <div>
          <Label size="micro">TELEMETRY · SESSION ANALYSIS</Label>
          <div
            style={{
              fontFamily: fonts.sans,
              fontSize: 28,
              fontWeight: 600,
              color: colors.text,
              marginTop: 4,
            }}
          >
            Session analytics
          </div>
          <Mono
            style={{
              color: colors.textMute,
              fontSize: 11,
              marginTop: 4,
              letterSpacing: '0.4px',
            }}
          >
            Upload CSV with lap times · {sessions.length} sessions on record
          </Mono>
        </div>
        {canUpload && (
          <ToolButton variant="accent" onClick={() => setUploadOpen(true)}>
            + Upload session
          </ToolButton>
        )}
      </div>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      {/* Two-column shell: sessions list + main detail */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        {/* Sessions sidebar */}
        <Panel
          title="Sessions"
          right={<Mono style={{ color: colors.textMute }}>{sessions.length}</Mono>}
          padding={0}
          style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'hidden' }}
        >
          {loading ? (
            <EmptyState text="Loading…" />
          ) : sessions.length === 0 ? (
            <EmptyState text="Upload a CSV to get started." />
          ) : (
            <div
              style={{
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 232px)',
              }}
            >
              {sessions.map((s) => {
                const active = selectedId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    style={{
                      position: 'relative',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      background: active ? colors.surface2 : 'transparent',
                      borderBottom: `1px solid ${colors.border}`,
                      borderLeft: active
                        ? `2px solid ${colors.accent}`
                        : '2px solid transparent',
                      transition: 'background 80ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!active)
                        (e.currentTarget as HTMLDivElement).style.background = colors.surface2;
                    }}
                    onMouseLeave={(e) => {
                      if (!active)
                        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: active ? colors.text : colors.text,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {s.name}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: 6,
                        marginTop: 6,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      <Tag tone="default">{SESSION_TYPE_LABELS[s.sessionType]}</Tag>
                      {s.trackCondition && (
                        <Tag tone="dim">{TRACK_CONDITION_LABELS[s.trackCondition]}</Tag>
                      )}
                      <Mono style={{ fontSize: 10, color: colors.textMute }}>
                        {s.lapCount} laps
                      </Mono>
                    </div>
                    <Mono
                      style={{
                        fontSize: 10,
                        color: colors.textMute,
                        marginTop: 6,
                        display: 'block',
                        letterSpacing: '0.4px',
                      }}
                    >
                      {(s.circuit || '—')} · {new Date(s.sessionDate).toLocaleDateString()}
                    </Mono>
                    {s.vehicleName && (
                      <Mono
                        style={{
                          fontSize: 10,
                          color: colors.textMute,
                          marginTop: 2,
                          display: 'block',
                        }}
                      >
                        {s.vehicleName}
                      </Mono>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(s.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'transparent',
                          border: `1px solid ${colors.border}`,
                          color: colors.textMute,
                          fontFamily: fonts.mono,
                          fontSize: 10,
                          padding: '2px 6px',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = colors.red;
                          (e.currentTarget as HTMLButtonElement).style.borderColor = colors.red;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = colors.textMute;
                          (e.currentTarget as HTMLButtonElement).style.borderColor = colors.border;
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Main detail area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          {selectedId == null ? (
            <Panel padding={48}>
              <div
                style={{
                  textAlign: 'center',
                  color: colors.textMute,
                  fontFamily: fonts.mono,
                  fontSize: 12,
                  letterSpacing: '0.6px',
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>—</div>
                Select a session to view its analytics
              </div>
            </Panel>
          ) : loadingAnalytics || !analytics ? (
            <Panel padding={48}>
              <div style={{ textAlign: 'center' }}>
                <CircularProgress size={20} />
              </div>
            </Panel>
          ) : (
            <>
              {/* Filter bar: compare with */}
              <Panel padding={12}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    flexWrap: 'wrap',
                  }}
                >
                  <Label>COMPARE WITH</Label>
                  <FormControl size="small" sx={{ minWidth: 320 }}>
                    <InputLabel>Additional sessions (max 3)</InputLabel>
                    <Select
                      multiple
                      value={compareWithIds}
                      onChange={(e) => {
                        const value = e.target.value as number[];
                        setCompareWithIds(value.slice(0, 3));
                      }}
                      input={<OutlinedInput label="Additional sessions (max 3)" />}
                      renderValue={(selected) =>
                        sessions
                          .filter((s) => (selected as number[]).includes(s.id))
                          .map((s) => s.name)
                          .join(', ') || '— Single view —'
                      }
                    >
                      {sessions
                        .filter((s) => s.id !== selectedId)
                        .map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name} ({new Date(s.sessionDate).toLocaleDateString()})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  {compareWithIds.length > 0 && compareAnalytics.length === 0 && (
                    <CircularProgress size={16} />
                  )}
                  {compareWithIds.length > 0 && (
                    <Mono
                      style={{
                        color: colors.accent,
                        cursor: 'pointer',
                        letterSpacing: '0.6px',
                      }}
                      onClick={() => setCompareWithIds([])}
                    >
                      {compareWithIds.length + 1} compared · clear ×
                    </Mono>
                  )}
                  <div style={{ flex: 1 }} />
                  {compareWithIds.length === 0 && (
                    <ToolButton
                      onClick={async () => {
                        try {
                          await sessionsApi.downloadReport(selectedId, analytics.sessionName);
                        } catch (e: any) {
                          setSnack({
                            msg: e?.response?.data?.message || 'Could not generate the PDF',
                            severity: 'error',
                          });
                        }
                      }}
                    >
                      ⤓ PDF
                    </ToolButton>
                  )}
                </div>
              </Panel>

              {compareWithIds.length > 0 && compareAnalytics.length === compareWithIds.length ? (
                <MultiSessionComparison analytics={[analytics, ...compareAnalytics]} />
              ) : (
                <>
                  <InsightsPanel sessionId={selectedId} />
                  <AnalyticsDetail analytics={analytics} session={selectedSession} />
                  <ConsistencyPanel analytics={analytics} />
                  <StatisticalTestsPanel analytics={analytics} sessions={sessions} />
                  <DistributionsPanel analytics={analytics} sessions={sessions} />
                  <ConditionsImpactPanel analytics={analytics} sessions={sessions} />
                  <TrackMap
                    analytics={analytics}
                    circuitName={selectedSession?.circuit}
                  />
                  <AdvancedAnalytics sessionId={selectedId} base={analytics} />
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Upload dialog (theme-inherited) */}
      <Dialog open={uploadOpen} onClose={() => !uploading && resetDialog()} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: fonts.mono, fontSize: 14, letterSpacing: '1.2px', textTransform: 'uppercase', color: colors.textDim }}>
          New session
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Session name"
              value={meta.name}
              onChange={(e) => setMeta({ ...meta, name: e.target.value })}
              required
              fullWidth
            />
            <Box display="flex" gap={2}>
              <Box flex={1}>
                <CircuitSelector
                  value={meta.circuit || ''}
                  onChange={(v) => setMeta({ ...meta, circuit: v })}
                  fullWidth
                />
              </Box>
              <TextField
                label="Date and time"
                type="datetime-local"
                value={meta.sessionDate}
                onChange={(e) => setMeta({ ...meta, sessionDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Type"
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
                label="Track condition"
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
                label="Vehicle"
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
                label="Driver"
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
              label="Notes"
              value={meta.notes}
              onChange={(e) => setMeta({ ...meta, notes: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <Box>
              <Label>Ambient conditions</Label>
              <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={1.5} mt={1}>
                <TextField
                  label="Track temp (°C)"
                  type="number"
                  size="small"
                  inputProps={{ step: 0.1 }}
                  value={meta.trackTempC ?? ''}
                  onChange={(e) => setMeta({ ...meta, trackTempC: e.target.value ? Number(e.target.value) : undefined })}
                />
                <TextField
                  label="Air temp (°C)"
                  type="number"
                  size="small"
                  inputProps={{ step: 0.1 }}
                  value={meta.ambientTempC ?? ''}
                  onChange={(e) => setMeta({ ...meta, ambientTempC: e.target.value ? Number(e.target.value) : undefined })}
                />
                <TextField
                  label="Humidity (%)"
                  type="number"
                  size="small"
                  inputProps={{ min: 0, max: 100, step: 1 }}
                  value={meta.humidityPct ?? ''}
                  onChange={(e) => setMeta({ ...meta, humidityPct: e.target.value ? Number(e.target.value) : undefined })}
                />
                <TextField
                  label="Wind (km/h)"
                  type="number"
                  size="small"
                  inputProps={{ step: 0.1 }}
                  value={meta.windKph ?? ''}
                  onChange={(e) => setMeta({ ...meta, windKph: e.target.value ? Number(e.target.value) : undefined })}
                />
              </Box>
            </Box>
            <TextField
              label="Setup notes"
              value={meta.setupNotes ?? ''}
              onChange={(e) => setMeta({ ...meta, setupNotes: e.target.value })}
              multiline
              rows={3}
              fullWidth
              placeholder="e.g. Press F 1.8/R 1.7 | Gear 12/41 | Wing -3 | Bias +2"
              helperText="Free form. Useful to compare setups across sessions."
            />
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1 }}>
              <Tabs value={uploadTab} onChange={(_, v) => setUploadTab(v)}>
                <Tab value="csv" label="Upload CSV" />
                <Tab value="manual" label="Add manually" />
              </Tabs>
            </Box>
            {uploadTab === 'csv' ? (
              <Box>
                <Button variant="outlined" component="label" fullWidth>
                  {file ? `${file.name}` : 'Select CSV file'}
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    hidden
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </Button>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Typography variant="caption" color="textSecondary">
                    Columns: lap, time, s1, s2, s3, valid, compound, fuel, notes. Sep <code>,</code> or <code>;</code>.
                  </Typography>
                  <Link
                    component="button"
                    type="button"
                    variant="caption"
                    onClick={handleDownloadTemplate}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    ⤓ template
                  </Link>
                </Box>
              </Box>
            ) : (
              <ManualLapsEditor laps={manualLaps} onChange={setManualLaps} />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetDialog} disabled={uploading}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={uploading || !meta.name || (uploadTab === 'csv' ? !file : manualLaps.length === 0)}
          >
            {uploading ? <CircularProgress size={20} /> : uploadTab === 'csv' ? 'Upload and analyze' : 'Create session'}
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
    </div>
  );
};

/* ─── AnalyticsDetail ─────────────────────────────────────────────────── */

const AnalyticsDetail: React.FC<{
  analytics: SessionAnalytics;
  session: Session | null;
}> = ({ analytics: a, session }) => {
  const chartData = a.perLap.map((lap) => ({
    lapNumber: lap.lapNumber,
    time: lap.lapTimeMs / 1000,
    outlier: lap.outlier || !lap.valid ? lap.lapTimeMs / 1000 : null,
  }));

  const bestDelta =
    a.theoreticalBestLapMs != null && a.bestLapMs != null
      ? a.bestLapMs - a.theoreticalBestLapMs
      : null;

  const degradationLabel =
    a.degradationMsPerLap != null
      ? `${a.degradationMsPerLap > 0 ? '+' : ''}${(a.degradationMsPerLap / 1000).toFixed(3)} s/lap`
      : '—';

  const outliers = a.perLap.filter((l) => l.outlier).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Hero: session name + best lap big */}
      <Panel padding={0}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '4px 1fr auto',
            alignItems: 'stretch',
          }}
        >
          <div style={{ background: colors.accent }} />
          <div style={{ padding: '18px 20px' }}>
            <Label size="micro">SESSION</Label>
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                marginTop: 4,
                color: colors.text,
              }}
            >
              {a.sessionName}
            </div>
            {session && (
              <Mono
                style={{
                  fontSize: 11,
                  color: colors.textDim,
                  marginTop: 6,
                  letterSpacing: '0.4px',
                }}
              >
                {session.circuit || '—'} ·{' '}
                {new Date(session.sessionDate).toLocaleDateString()}
                {session.driverName ? ` · ${session.driverName}` : ''}
                {session.vehicleName ? ` · ${session.vehicleName}` : ''}
              </Mono>
            )}
          </div>
          <div
            style={{
              padding: '18px 22px',
              borderLeft: `1px solid ${colors.border}`,
              background: colors.surface2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
              minWidth: 220,
            }}
          >
            <Label size="micro">BEST LAP</Label>
            <Mono
              style={{
                fontSize: 32,
                fontWeight: 600,
                color: colors.purple,
                lineHeight: 1,
                marginTop: 6,
                letterSpacing: '1px',
              }}
            >
              {formatLapTime(a.bestLapMs)}
            </Mono>
            {a.bestLapNumber && (
              <Mono
                style={{
                  fontSize: 10,
                  color: colors.textMute,
                  marginTop: 6,
                  letterSpacing: '0.6px',
                }}
              >
                LAP {a.bestLapNumber}
              </Mono>
            )}
          </div>
        </div>
      </Panel>

      {/* KPI strip */}
      <Panel padding={16}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 0,
          }}
        >
          <KpiCell
            label="Average"
            value={formatLapTime(a.averageMs)}
            sub={`median ${formatLapTime(a.medianMs)}`}
          />
          <KpiCell
            label="Stdev"
            value={a.stdDevMs != null ? `±${(a.stdDevMs / 1000).toFixed(3)}s` : '—'}
            sub="consistency"
          />
          <KpiCell
            label="Degradation"
            value={degradationLabel}
            sub={a.degradationR2 != null ? `R² ${a.degradationR2.toFixed(2)}` : undefined}
            tone={a.degradationMsPerLap && a.degradationMsPerLap > 0 ? 'yellow' : 'green'}
          />
          <KpiCell label="Laps" value={String(a.totalLaps)} sub={`${a.validLaps} valid`} />
          <KpiCell
            label="Invalid"
            value={String(a.invalidLaps)}
            tone={a.invalidLaps > 0 ? 'red' : 'text'}
          />
          <KpiCell label="Outliers" value={String(outliers)} tone={outliers > 0 ? 'orange' : 'text'} last />
        </div>
      </Panel>

      {/* Lap times chart */}
      <Panel
        title="Lap times"
        right={<Mono style={{ color: colors.textMute }}>{a.perLap.length} points</Mono>}
        padding={12}
      >
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke={colors.border} strokeDasharray="3 3" />
            <XAxis
              dataKey="lapNumber"
              stroke={colors.textMute}
              tick={{ fill: colors.textMute, fontFamily: fonts.mono, fontSize: 10 }}
              label={{ value: 'Lap', position: 'insideBottom', offset: -5, fill: colors.textMute, fontFamily: fonts.mono, fontSize: 10 }}
            />
            <YAxis
              stroke={colors.textMute}
              tick={{ fill: colors.textMute, fontFamily: fonts.mono, fontSize: 10 }}
              tickFormatter={(v) => v.toFixed(2)}
              label={{ value: 'Seconds', angle: -90, position: 'insideLeft', fill: colors.textMute, fontFamily: fonts.mono, fontSize: 10 }}
              domain={['auto', 'auto']}
            />
            <RTooltip
              contentStyle={{
                background: colors.surface3,
                border: `1px solid ${colors.borderHi}`,
                borderRadius: 0,
                fontFamily: fonts.mono,
                fontSize: 11,
                color: colors.text,
              }}
              formatter={(v: any) => (typeof v === 'number' ? `${v.toFixed(3)} s` : v)}
              labelFormatter={(l) => `Lap ${l}`}
            />
            <Line
              type="monotone"
              dataKey="time"
              stroke={colors.accent}
              strokeWidth={2}
              dot={{ r: 3, fill: colors.accent, stroke: colors.bg, strokeWidth: 1 }}
              name="Time"
            />
            <Scatter dataKey="outlier" fill={colors.orange} name="Outlier" />
            {a.bestLapMs != null && (
              <ReferenceLine
                y={a.bestLapMs / 1000}
                stroke={colors.purple}
                strokeDasharray="4 4"
                label={{ value: 'Best', position: 'right', fill: colors.purple, fontFamily: fonts.mono, fontSize: 10 }}
              />
            )}
            {a.medianMs != null && (
              <ReferenceLine
                y={a.medianMs / 1000}
                stroke={colors.textMute}
                strokeDasharray="4 4"
                label={{ value: 'Median', position: 'right', fill: colors.textMute, fontFamily: fonts.mono, fontSize: 10 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>

      {/* Two-up: sectors + summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Panel title="Optimal sectors" padding={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SectorRow label="Sector 1" value={formatLapTime(a.bestSector1Ms)} />
            <SectorRow label="Sector 2" value={formatLapTime(a.bestSector2Ms)} />
            <SectorRow label="Sector 3" value={formatLapTime(a.bestSector3Ms)} />
            <div
              style={{
                marginTop: 8,
                paddingTop: 12,
                borderTop: `1px solid ${colors.borderHi}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <Label tone="text">Theoretical best</Label>
              <Mono
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: colors.green,
                  letterSpacing: '0.4px',
                }}
              >
                {formatLapTime(a.theoreticalBestLapMs)}
              </Mono>
            </div>
            {bestDelta != null && (
              <Mono
                style={{
                  fontSize: 10,
                  color: bestDelta > 0 ? colors.yellow : colors.green,
                  textAlign: 'right',
                  letterSpacing: '0.4px',
                }}
              >
                {bestDelta > 0
                  ? `Leaving ${(bestDelta / 1000).toFixed(3)}s on the table`
                  : 'Perfect lap!'}
              </Mono>
            )}
          </div>
        </Panel>
        <Panel title="Summary" padding={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SummaryRow label="Total laps" value={String(a.totalLaps)} />
            <SummaryRow label="Valid laps" value={String(a.validLaps)} tone="green" />
            <SummaryRow
              label="Invalid laps"
              value={String(a.invalidLaps)}
              tone={a.invalidLaps > 0 ? 'red' : 'text'}
            />
            <SummaryRow
              label="Outliers detected"
              value={String(outliers)}
              tone={outliers > 0 ? 'orange' : 'text'}
            />
            <SummaryRow label="Worst valid lap" value={formatLapTime(a.worstLapMs)} mono />
          </div>
        </Panel>
      </div>

      {/* Per-lap table (dense, handoff-style) */}
      <Panel
        title="Lap detail"
        right={<Mono style={{ color: colors.textMute }}>{a.perLap.length} laps</Mono>}
        padding={0}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['#', 'Time', 'Gap', 'S1', 'S2', 'S3', 'Status'].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      textAlign: i === 0 || i === 6 ? 'left' : 'right',
                      fontFamily: fonts.mono,
                      fontSize: 10,
                      letterSpacing: '1.2px',
                      textTransform: 'uppercase',
                      color: colors.textMute,
                      fontWeight: 600,
                      padding: '8px 12px',
                      background: colors.surface2,
                      borderBottom: `1px solid ${colors.borderHi}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {a.perLap.map((lap, idx) => {
                const isBest = a.bestLapNumber === lap.lapNumber;
                const rowBg = isBest
                  ? 'rgba(187, 108, 255, 0.08)'
                  : lap.outlier
                    ? 'rgba(255, 138, 42, 0.06)'
                    : !lap.valid
                      ? 'rgba(255, 79, 79, 0.05)'
                      : idx % 2 === 0
                        ? 'transparent'
                        : colors.surface2;
                const timeColor = isBest
                  ? colors.purple
                  : lap.outlier
                    ? colors.orange
                    : !lap.valid
                      ? colors.textMute
                      : colors.text;
                return (
                  <tr
                    key={lap.lapNumber}
                    style={{
                      background: rowBg,
                      opacity: !lap.valid ? 0.75 : 1,
                    }}
                  >
                    <td
                      style={{
                        ...tdBase,
                        fontFamily: fonts.mono,
                        color: colors.textDim,
                      }}
                    >
                      {lap.lapNumber}
                    </td>
                    <td style={{ ...tdBase, ...tdMono, color: timeColor, textAlign: 'right' }}>
                      {formatLapTime(lap.lapTimeMs)}
                    </td>
                    <td style={{ ...tdBase, ...tdMono, color: colors.textDim, textAlign: 'right' }}>
                      {formatGap(lap.gapToBestMs)}
                    </td>
                    <td style={{ ...tdBase, ...tdMono, color: colors.textDim, textAlign: 'right' }}>
                      {formatLapTime(lap.sector1Ms)}
                    </td>
                    <td style={{ ...tdBase, ...tdMono, color: colors.textDim, textAlign: 'right' }}>
                      {formatLapTime(lap.sector2Ms)}
                    </td>
                    <td style={{ ...tdBase, ...tdMono, color: colors.textDim, textAlign: 'right' }}>
                      {formatLapTime(lap.sector3Ms)}
                    </td>
                    <td style={{ ...tdBase }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {isBest && <Flag f="SB" />}
                        {!lap.valid && (
                          <Tag tone="red">INVALID</Tag>
                        )}
                        {lap.outlier && <Tag tone="orange">OUTLIER</Tag>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const tdBase: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: `1px solid ${colors.border}`,
  fontSize: 12,
  whiteSpace: 'nowrap',
};

const tdMono: React.CSSProperties = {
  fontFamily: fonts.mono,
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
};

const TONE_COLOR: Record<string, string> = {
  text: colors.text,
  dim: colors.textDim,
  mute: colors.textMute,
  accent: colors.accent,
  green: colors.green,
  red: colors.red,
  yellow: colors.yellow,
  orange: colors.orange,
  purple: colors.purple,
  default: colors.text,
};

interface KpiCellProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: 'text' | 'accent' | 'green' | 'red' | 'yellow' | 'orange' | 'purple';
  last?: boolean;
}

const KpiCell: React.FC<KpiCellProps> = ({ label, value, sub, tone = 'text', last }) => (
  <div
    style={{
      padding: '4px 18px',
      borderRight: last ? 'none' : `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}
  >
    <MiniStat
      label={label}
      value={value}
      tone={tone === 'text' ? 'text' : tone}
      size="md"
    />
    {sub && (
      <Mono style={{ fontSize: 10, color: colors.textMute, letterSpacing: '0.4px' }}>
        {sub}
      </Mono>
    )}
  </div>
);

const SectorRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    }}
  >
    <span style={{ fontSize: 13, color: colors.textDim, fontFamily: fonts.sans }}>
      {label}
    </span>
    <Mono style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{value}</Mono>
  </div>
);

const SummaryRow: React.FC<{
  label: string;
  value: string;
  tone?: 'text' | 'green' | 'red' | 'orange';
  mono?: boolean;
}> = ({ label, value, tone = 'text', mono }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    }}
  >
    <span style={{ fontSize: 13, color: colors.textDim, fontFamily: fonts.sans }}>
      {label}
    </span>
    <span
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: TONE_COLOR[tone] ?? colors.text,
        fontFamily: mono || tone !== 'text' ? fonts.mono : fonts.sans,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </span>
  </div>
);

const Tag: React.FC<{
  children: React.ReactNode;
  tone?: 'default' | 'dim' | 'red' | 'orange' | 'green' | 'yellow';
}> = ({ children, tone = 'default' }) => {
  const fg =
    tone === 'red'
      ? colors.red
      : tone === 'orange'
        ? colors.orange
        : tone === 'green'
          ? colors.green
          : tone === 'yellow'
            ? colors.yellow
            : tone === 'dim'
              ? colors.textMute
              : colors.textDim;
  return (
    <span
      style={{
        fontFamily: fonts.mono,
        fontSize: 9,
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        color: fg,
        border: `1px solid ${fg === colors.textMute || fg === colors.textDim ? colors.border : fg}`,
        padding: '1px 5px',
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
};

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      padding: '32px 16px',
      textAlign: 'center',
      color: colors.textMute,
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: '0.6px',
    }}
  >
    {text}
  </div>
);

export default Analytics;
