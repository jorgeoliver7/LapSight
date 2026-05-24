import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  OutlinedInput,
  Select,
  InputLabel,
  FormControl,
  Stack,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { eventsApi, EventRequest } from '../../api/events';
import { vehiclesApi } from '../../api/vehicles';
import { usersApi } from '../../api/users';
import {
  Event,
  EventStatus,
  EventType,
  EVENT_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  User,
  UserRole,
  Vehicle,
} from '../../types';
import { useAuthStore } from '../../store/authStore';
import CircuitSelector from '../../components/CircuitSelector/CircuitSelector';
import { PageHeader, Mono, StatusTag, type StatusTone } from '../../components/apex';
import { colors, fonts } from '../../theme/tokens';
import { useTranslation } from 'react-i18next';

interface FormState extends EventRequest {}

const emptyForm = (): FormState => ({
  name: '',
  description: '',
  eventType: EventType.RACE,
  startDate: new Date().toISOString().slice(0, 16),
  endDate: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
  location: '',
  circuitName: '',
  status: EventStatus.PLANNED,
  notes: '',
  participantIds: [],
  vehicleIds: [],
});

const STATUS_TONE: Record<EventStatus, StatusTone> = {
  [EventStatus.PLANNED]: 'mute',
  [EventStatus.CONFIRMED]: 'accent',
  [EventStatus.IN_PROGRESS]: 'yellow',
  [EventStatus.COMPLETED]: 'green',
  [EventStatus.CANCELLED]: 'red',
  [EventStatus.POSTPONED]: 'orange',
  [EventStatus.WEATHER_DELAY]: 'cyan',
  [EventStatus.TECHNICAL_ISSUE]: 'red',
};

const TYPE_TONE: Record<EventType, StatusTone> = {
  [EventType.RACE]: 'red',
  [EventType.QUALIFYING]: 'orange',
  [EventType.PRACTICE]: 'accent',
  [EventType.TEST]: 'cyan',
  [EventType.SHAKEDOWN]: 'cyan',
  [EventType.TRACKDAY]: 'accent',
  [EventType.TRAINING]: 'green',
  [EventType.MAINTENANCE]: 'yellow',
  [EventType.MEETING]: 'purple',
  [EventType.MEDIA]: 'mute',
  [EventType.SPONSOR_EVENT]: 'purple',
  [EventType.PRESENTATION]: 'purple',
  [EventType.TRAVEL]: 'mute',
  [EventType.OTHER]: 'mute',
};

const Events: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const canEdit = user?.role === UserRole.MANAGER || user?.role === UserRole.LOGISTICS;
  const canDelete = user?.role === UserRole.MANAGER;

  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const [evs, us, vs] = await Promise.all([
        eventsApi.list(),
        usersApi.list().catch(() => []),
        vehiclesApi.list().catch(() => []),
      ]);
      setEvents(evs);
      setUsers(us);
      setVehicles(vs);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || t('events.msg.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (ev: Event) => {
    setEditingId(ev.id);
    setForm({
      name: ev.name,
      description: ev.description || '',
      eventType: ev.eventType,
      startDate: ev.startDate.slice(0, 16),
      endDate: ev.endDate.slice(0, 16),
      location: ev.location || '',
      circuitName: ev.circuitName || '',
      status: ev.status,
      notes: ev.notes || '',
      budgetAllocated: ev.budgetAllocated,
      actualCost: ev.actualCost,
      participantIds: ev.participants.map((p) => p.id),
      vehicleIds: ev.vehicles.map((v) => v.id),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload: EventRequest = {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      };
      if (editingId) {
        await eventsApi.update(editingId, payload);
        setSnack({ msg: t('events.msg.updated'), severity: 'success' });
      } else {
        await eventsApi.create(payload);
        setSnack({ msg: t('events.msg.created'), severity: 'success' });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || t('events.msg.saveError'), severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('events.msg.deleteConfirm'))) return;
    try {
      await eventsApi.remove(id);
      setSnack({ msg: t('events.msg.deleted'), severity: 'success' });
      load();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || t('events.msg.deleteError'), severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <PageHeader
        eyebrow={t('events.eyebrow')}
        title={t('events.title')}
        subtitle={t('events.subtitle', { count: events.length })}
        actions={
          canEdit && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
              sx={{
                bgcolor: colors.accent,
                color: colors.bg,
                fontFamily: fonts.mono,
                fontSize: 11,
                letterSpacing: '1.2px',
                px: 2,
                '&:hover': { bgcolor: colors.accent, opacity: 0.85 },
              }}
            >
              {t('events.new')}
            </Button>
          )
        }
      />

      {error && (
        <Alert severity="error" sx={{ borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ border: `1px solid ${colors.border}`, background: colors.surface }}>
        {loading ? (
          <Box p={4} textAlign="center">
            <CircularProgress sx={{ color: colors.accent }} />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('events.col.event')}</TableCell>
                  <TableCell>{t('events.col.dates')}</TableCell>
                  <TableCell>{t('events.col.circuitLocation')}</TableCell>
                  <TableCell align="right">{t('events.col.drivers')}</TableCell>
                  <TableCell align="right">{t('events.col.vehicles')}</TableCell>
                  <TableCell>{t('events.col.status')}</TableCell>
                  {canEdit && <TableCell align="right">{t('common.actions')}</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canEdit ? 7 : 6}
                      align="center"
                      sx={{ py: 5, color: colors.textMute, fontFamily: fonts.mono, fontSize: 12 }}
                    >
                      {t('events.empty')}
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((ev) => (
                    <TableRow key={ev.id} hover sx={{ '&:hover': { backgroundColor: colors.surface2 } }}>
                      <TableCell>
                        <Box display="flex" flexDirection="column" gap={0.5}>
                          <span style={{ color: colors.text, fontWeight: 600, fontSize: 13 }}>
                            {ev.name}
                          </span>
                          <StatusTag tone={TYPE_TONE[ev.eventType]} size="sm" dot={false}>
                            {EVENT_TYPE_LABELS[ev.eventType]}
                          </StatusTag>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Mono style={{ display: 'block', fontSize: 11, color: colors.text }}>
                          {new Date(ev.startDate).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Mono>
                        <Mono style={{ display: 'block', fontSize: 10, color: colors.textMute, marginTop: 2 }}>
                          →{' '}
                          {new Date(ev.endDate).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Mono>
                      </TableCell>
                      <TableCell>
                        <span style={{ color: ev.circuitName ? colors.text : colors.textMute, fontSize: 12 }}>
                          {ev.circuitName || '—'}
                        </span>
                        {ev.location && (
                          <Mono
                            style={{ display: 'block', fontSize: 10, color: colors.textMute, marginTop: 2 }}
                          >
                            {ev.location}
                          </Mono>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Mono style={{ color: colors.text, fontSize: 12, fontWeight: 600 }}>
                          {ev.participants?.length || 0}
                        </Mono>
                      </TableCell>
                      <TableCell align="right">
                        <Mono style={{ color: colors.text, fontSize: 12, fontWeight: 600 }}>
                          {ev.vehicles?.length || 0}
                        </Mono>
                      </TableCell>
                      <TableCell>
                        <StatusTag tone={STATUS_TONE[ev.status]}>
                          {EVENT_STATUS_LABELS[ev.status]}
                        </StatusTag>
                      </TableCell>
                      {canEdit && (
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEdit(ev)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {canDelete && (
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(ev.id)}
                              sx={{ color: colors.textMute, '&:hover': { color: colors.red } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            fontFamily: fonts.mono,
            fontSize: 13,
            letterSpacing: '1.4px',
            textTransform: 'uppercase',
            color: colors.textDim,
          }}
        >
          {editingId ? t('events.edit') : t('events.create')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <TextField
              label={t('events.form.name')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                label={t('events.form.type')}
                select
                value={form.eventType}
                onChange={(e) => setForm({ ...form, eventType: e.target.value as EventType })}
              >
                {Object.values(EventType).map((et) => (
                  <MenuItem key={et} value={et}>
                    {EVENT_TYPE_LABELS[et]}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label={t('events.form.status')}
                select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as EventStatus })}
              >
                {Object.values(EventStatus).map((s) => (
                  <MenuItem key={s} value={s}>
                    {EVENT_STATUS_LABELS[s]}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label={t('events.form.startDate')}
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label={t('events.form.endDate')}
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <CircuitSelector
                value={form.circuitName || ''}
                onChange={(v) => setForm({ ...form, circuitName: v })}
              />
              <TextField
                label={t('events.form.location')}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <TextField
                label={t('events.form.budget')}
                type="number"
                value={form.budgetAllocated ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    budgetAllocated: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              <TextField
                label={t('events.form.actualCost')}
                type="number"
                value={form.actualCost ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    actualCost: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>{t('events.form.participants')}</InputLabel>
              <Select
                multiple
                value={form.participantIds || []}
                onChange={(e) => setForm({ ...form, participantIds: e.target.value as number[] })}
                input={<OutlinedInput label={t('events.form.participants')} />}
                renderValue={(selected) =>
                  users
                    .filter((u) => (selected as number[]).includes(u.id))
                    .map((u) => `${u.firstName} ${u.lastName}`)
                    .join(', ')
                }
              >
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('events.form.vehicles')}</InputLabel>
              <Select
                multiple
                value={form.vehicleIds || []}
                onChange={(e) => setForm({ ...form, vehicleIds: e.target.value as number[] })}
                input={<OutlinedInput label={t('events.form.vehicles')} />}
                renderValue={(selected) =>
                  vehicles
                    .filter((v) => (selected as number[]).includes(v.id))
                    .map((v) => v.name)
                    .join(', ')
                }
              >
                {vehicles.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('events.form.description')}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <TextField
              label={t('events.form.notes')}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: colors.textDim }}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.name}
            sx={{
              bgcolor: colors.accent,
              color: colors.bg,
              fontFamily: fonts.mono,
              letterSpacing: '1.2px',
              '&:hover': { bgcolor: colors.accent, opacity: 0.85 },
            }}
          >
            {t('common.save').toUpperCase()}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {snack ? (
          <Alert severity={snack.severity} sx={{ borderRadius: 0 }}>
            {snack.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
};

export default Events;
