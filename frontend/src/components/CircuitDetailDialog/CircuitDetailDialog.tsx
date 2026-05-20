import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  Chip, Stack, Divider, TextField, IconButton, Tab, Tabs, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell, Tooltip, Snackbar, Alert,
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon, Delete as DeleteIcon, EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { Circuit, findCircuit } from '../../data/circuits';
import { getCircuitExtras } from '../../data/circuitMeta';
import { computeDirection, totalPathLength, findLongestStraight } from '../../data/circuitCharacteristics';
import { getCircuitNote, saveCircuitNote } from '../../data/circuitNotes';
import { deleteCustomCircuit, loadCustomCircuits } from '../../data/customCircuits';
import CircuitMiniMap from '../CircuitMiniMap/CircuitMiniMap';
import { sessionsApi, formatLapTime } from '../../api/sessions';
import { eventsApi } from '../../api/events';
import type { Session, Event, SessionAnalytics } from '../../types';

interface Props {
  circuit: Circuit | null;
  open: boolean;
  onClose: () => void;
  onCustomDeleted?: () => void;
}

interface SessionRecord {
  session: Session;
  bestLapMs: number | null;
  loading: boolean;
}

const CircuitDetailDialog: React.FC<Props> = ({ circuit, open, onClose, onCustomDeleted }) => {
  const [tab, setTab] = useState<'info' | 'records' | 'events' | 'notes'>('info');
  const [sessionsAtCircuit, setSessionsAtCircuit] = useState<SessionRecord[]>([]);
  const [eventsAtCircuit, setEventsAtCircuit] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [noteDirty, setNoteDirty] = useState(false);
  const [snackbar, setSnackbar] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);

  // Cargar notas locales al abrir
  useEffect(() => {
    if (circuit) {
      setNote(getCircuitNote(circuit.name));
      setNoteDirty(false);
      setTab('info');
    }
  }, [circuit]);

  // Cargar sesiones y eventos de este circuito
  useEffect(() => {
    if (!circuit || !open) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([sessionsApi.list(), eventsApi.list()])
      .then(([allSessions, allEvents]) => {
        if (cancelled) return;
        const matchSessions = allSessions.filter((s) => {
          const sCircuit = findCircuit(s.circuit);
          return sCircuit?.name === circuit.name || s.circuit === circuit.name;
        });
        const matchEvents = allEvents.filter((e) => {
          const eCircuit = findCircuit(e.circuitName);
          return eCircuit?.name === circuit.name || e.circuitName === circuit.name;
        });
        setSessionsAtCircuit(matchSessions.map((s) => ({ session: s, bestLapMs: null, loading: true })));
        setEventsAtCircuit(matchEvents);
        setLoading(false);

        // Cargar analytics de cada sesión en paralelo para obtener mejor vuelta
        matchSessions.forEach((s) => {
          sessionsApi
            .analytics(s.id)
            .then((a: SessionAnalytics) => {
              if (cancelled) return;
              const bestLap = a.perLap
                .filter((l) => l.valid && l.lapTimeMs)
                .reduce<number | null>((best, l) => (best == null || l.lapTimeMs < best ? l.lapTimeMs : best), null);
              setSessionsAtCircuit((prev) =>
                prev.map((r) => (r.session.id === s.id ? { ...r, bestLapMs: bestLap, loading: false } : r))
              );
            })
            .catch(() => {
              if (cancelled) return;
              setSessionsAtCircuit((prev) =>
                prev.map((r) => (r.session.id === s.id ? { ...r, loading: false } : r))
              );
            });
        });
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [circuit, open]);

  const sortedRecords = useMemo(() => {
    return [...sessionsAtCircuit].sort((a, b) => {
      if (a.bestLapMs == null) return 1;
      if (b.bestLapMs == null) return -1;
      return a.bestLapMs - b.bestLapMs;
    });
  }, [sessionsAtCircuit]);

  const totalKm = useMemo(() => {
    if (!circuit?.length_km) return 0;
    // Suma de vueltas? Mejor: lapCount * length_km
    return sessionsAtCircuit.reduce((acc, r) => acc + (r.session.lapCount || 0) * (circuit.length_km || 0), 0);
  }, [sessionsAtCircuit, circuit]);

  if (!circuit) return null;

  const extras = getCircuitExtras(circuit.name);
  const computedDirection = !extras.direction ? computeDirection(circuit.path) : extras.direction;
  const longestStraightPathUnits = findLongestStraight(circuit.path);
  const pathTotal = totalPathLength(circuit.path);
  const longestStraightKm =
    extras.longestStraightKm ??
    (circuit.length_km && pathTotal > 0
      ? (longestStraightPathUnits / pathTotal) * circuit.length_km
      : null);

  const isCustom = loadCustomCircuits().some((c) => c.name === circuit.name);

  const handleSaveNote = () => {
    saveCircuitNote(circuit.name, note);
    setNoteDirty(false);
    setSnackbar({ msg: 'Notas guardadas', severity: 'success' });
  };

  const handleDeleteCustom = () => {
    if (!isCustom) return;
    if (!confirm(`¿Eliminar el circuito custom "${circuit.name}"?`)) return;
    deleteCustomCircuit(circuit.name);
    setSnackbar({ msg: 'Circuito eliminado', severity: 'success' });
    onCustomDeleted?.();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 6 }}>
          <Box flex={1}>
            <Typography variant="h6" component="span">{circuit.name}</Typography>
            {circuit.country && (
              <Typography variant="caption" color="textSecondary" ml={1}>· {circuit.country}</Typography>
            )}
          </Box>
          {isCustom && (
            <Tooltip title="Eliminar circuito custom">
              <IconButton size="small" onClick={handleDeleteCustom} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={2}>
            <Box flex={1} display="flex" justifyContent="center" alignItems="center" sx={{ bgcolor: '#fafafa', borderRadius: 1, p: 2 }}>
              <CircuitMiniMap circuit={circuit} size={280} showStart showSectors strokeWidth={3} />
            </Box>
            <Box flex={1}>
              <Stack spacing={1.5}>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {circuit.realData ? (
                    <Chip label="GPS real" size="small" color="success" variant="outlined" />
                  ) : (
                    <Chip label="Estilizado" size="small" variant="outlined" />
                  )}
                  {isCustom && <Chip label="Custom" size="small" color="info" variant="outlined" />}
                  {extras.categories?.map((c) => (
                    <Chip key={c} label={c} size="small" variant="outlined" />
                  ))}
                </Box>
                <Divider />
                <DataRow label="Longitud" value={circuit.length_km ? `${circuit.length_km.toFixed(3)} km` : '—'} />
                <DataRow label="Curvas" value={extras.turns?.toString() ?? '—'} />
                <DataRow
                  label="Sentido"
                  value={
                    computedDirection === 'CW' ? '↻ Horario' :
                    computedDirection === 'CCW' ? '↺ Antihorario' : '—'
                  }
                />
                <DataRow
                  label="Recta más larga"
                  value={longestStraightKm ? `${longestStraightKm.toFixed(3)} km` : '—'}
                />
                <DataRow label="Inaugurado" value={extras.opened?.toString() ?? '—'} />
                <DataRow label="Altitud" value={extras.altitudeM ? `${extras.altitudeM} m` : '—'} />
                {extras.lapRecord && (
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <TrophyIcon fontSize="small" color="warning" />
                    <Typography variant="caption" fontFamily="monospace">
                      Récord: {extras.lapRecord}
                    </Typography>
                  </Box>
                )}
                {extras.funFact && (
                  <Box sx={{ mt: 1, p: 1.5, bgcolor: 'info.light', borderRadius: 1, opacity: 0.85 }}>
                    <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                      💡 {extras.funFact}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab value="info" label="Resumen" />
            <Tab value="records" label={`Récords (${sessionsAtCircuit.length})`} />
            <Tab value="events" label={`Eventos (${eventsAtCircuit.length})`} />
            <Tab value="notes" label="Notas técnicas" />
          </Tabs>

          <Box pt={2}>
            {tab === 'info' && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  Has hecho <strong>{sessionsAtCircuit.length}</strong> sesión{sessionsAtCircuit.length === 1 ? '' : 'es'} en este circuito
                  {totalKm > 0 && <> · ~<strong>{totalKm.toFixed(0)} km</strong> recorridos</>}
                </Typography>
                <Typography variant="body2">
                  Eventos planificados o pasados: <strong>{eventsAtCircuit.length}</strong>
                </Typography>
              </Box>
            )}

            {tab === 'records' && (
              <Box>
                {loading && <CircularProgress size={24} />}
                {!loading && sessionsAtCircuit.length === 0 && (
                  <Typography variant="body2" color="textSecondary">
                    No tienes sesiones registradas en este circuito todavía.
                  </Typography>
                )}
                {sortedRecords.length > 0 && (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Sesión</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Piloto</TableCell>
                        <TableCell>Vehículo</TableCell>
                        <TableCell align="right">Mejor vuelta</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedRecords.map((r, i) => (
                        <TableRow key={r.session.id}>
                          <TableCell>
                            {i === 0 && r.bestLapMs != null ? (
                              <Tooltip title="Tu mejor vuelta en este circuito">
                                <TrophyIcon fontSize="small" color="warning" />
                              </Tooltip>
                            ) : (
                              i + 1
                            )}
                          </TableCell>
                          <TableCell>{r.session.name}</TableCell>
                          <TableCell>{new Date(r.session.sessionDate).toLocaleDateString('es-ES')}</TableCell>
                          <TableCell>{r.session.driverName || '—'}</TableCell>
                          <TableCell>{r.session.vehicleName || '—'}</TableCell>
                          <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: i === 0 ? 600 : 400 }}>
                            {r.loading ? <CircularProgress size={14} /> : formatLapTime(r.bestLapMs)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Box>
            )}

            {tab === 'events' && (
              <Box>
                {loading && <CircularProgress size={24} />}
                {!loading && eventsAtCircuit.length === 0 && (
                  <Typography variant="body2" color="textSecondary">
                    No hay eventos planificados en este circuito.
                  </Typography>
                )}
                {eventsAtCircuit.length > 0 && (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Evento</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Fecha inicio</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {eventsAtCircuit.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>{e.name}</TableCell>
                          <TableCell>{e.eventType}</TableCell>
                          <TableCell>{new Date(e.startDate).toLocaleDateString('es-ES')}</TableCell>
                          <TableCell><Chip label={e.status} size="small" variant="outlined" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Box>
            )}

            {tab === 'notes' && (
              <Box>
                <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                  Notas guardadas localmente en este navegador. Útil para relación de cambios, presiones, líneas de frenada, etc.
                </Typography>
                <TextField
                  multiline
                  fullWidth
                  minRows={6}
                  placeholder="Ej: 4ª recta principal, 3ª curva 1, presión delantera 1.8 bar..."
                  value={note}
                  onChange={(e) => { setNote(e.target.value); setNoteDirty(true); }}
                />
                <Box display="flex" justifyContent="flex-end" mt={1}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveNote}
                    disabled={!noteDirty}
                    size="small"
                  >
                    Guardar
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snackbar ? (
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>
            {snackbar.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
};

const DataRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box display="flex" justifyContent="space-between">
    <Typography variant="body2" color="textSecondary">{label}</Typography>
    <Typography variant="body2" fontWeight={500}>{value}</Typography>
  </Box>
);

export default CircuitDetailDialog;
