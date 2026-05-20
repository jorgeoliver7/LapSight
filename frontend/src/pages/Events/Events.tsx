import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
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
import { PageHeader } from '../../components/apex';

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

const STATUS_COLOR: Record<EventStatus, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  [EventStatus.PLANNED]: 'default',
  [EventStatus.CONFIRMED]: 'info',
  [EventStatus.IN_PROGRESS]: 'warning',
  [EventStatus.COMPLETED]: 'success',
  [EventStatus.CANCELLED]: 'error',
  [EventStatus.POSTPONED]: 'warning',
  [EventStatus.WEATHER_DELAY]: 'warning',
  [EventStatus.TECHNICAL_ISSUE]: 'error',
};

const Events: React.FC = () => {
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
      setError(e?.response?.data?.message || 'Error cargando eventos');
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
        setSnack({ msg: 'Evento actualizado', severity: 'success' });
      } else {
        await eventsApi.create(payload);
        setSnack({ msg: 'Evento creado', severity: 'success' });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || 'Error al guardar', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este evento?')) return;
    try {
      await eventsApi.remove(id);
      setSnack({ msg: 'Evento eliminado', severity: 'success' });
      load();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || 'Error al eliminar', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <PageHeader
        eyebrow="OPERATIVO · EVENTOS"
        title="Eventos"
        subtitle="Carreras, tests, libres y reuniones del equipo"
        actions={
          canEdit && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Nuevo evento
            </Button>
          )
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper>
        {loading ? (
          <Box p={4} textAlign="center">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Evento</TableCell>
                  <TableCell>Fechas</TableCell>
                  <TableCell>Circuito / Ubicación</TableCell>
                  <TableCell align="right">Pilotos</TableCell>
                  <TableCell align="right">Vehículos</TableCell>
                  <TableCell>Estado</TableCell>
                  {canEdit && <TableCell align="right">Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 7 : 6} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">No hay eventos planificados</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((ev) => (
                    <TableRow key={ev.id} hover>
                      <TableCell>
                        <Typography fontWeight={500}>{ev.name}</Typography>
                        <Chip
                          label={EVENT_TYPE_LABELS[ev.eventType]}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(ev.startDate).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          → {new Date(ev.endDate).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {ev.circuitName || '—'}
                        {ev.location && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            {ev.location}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">{ev.participants?.length || 0}</TableCell>
                      <TableCell align="right">{ev.vehicles?.length || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={EVENT_STATUS_LABELS[ev.status]}
                          size="small"
                          color={STATUS_COLOR[ev.status]}
                        />
                      </TableCell>
                      {canEdit && (
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEdit(ev)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {canDelete && (
                            <IconButton size="small" onClick={() => handleDelete(ev.id)}>
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
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Editar evento' : 'Nuevo evento'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <TextField
              label="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                label="Tipo"
                select
                value={form.eventType}
                onChange={(e) => setForm({ ...form, eventType: e.target.value as EventType })}
              >
                {Object.values(EventType).map((t) => (
                  <MenuItem key={t} value={t}>
                    {EVENT_TYPE_LABELS[t]}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Estado"
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
                label="Fecha inicio"
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Fecha fin"
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
                label="Ubicación"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <TextField
                label="Presupuesto (€)"
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
                label="Coste real (€)"
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
              <InputLabel>Pilotos / Equipo</InputLabel>
              <Select
                multiple
                value={form.participantIds || []}
                onChange={(e) => setForm({ ...form, participantIds: e.target.value as number[] })}
                input={<OutlinedInput label="Pilotos / Equipo" />}
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
              <InputLabel>Vehículos</InputLabel>
              <Select
                multiple
                value={form.vehicleIds || []}
                onChange={(e) => setForm({ ...form, vehicleIds: e.target.value as number[] })}
                input={<OutlinedInput label="Vehículos" />}
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
              label="Descripción"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <TextField
              label="Notas"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {snack ? <Alert severity={snack.severity}>{snack.msg}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
};

export default Events;
