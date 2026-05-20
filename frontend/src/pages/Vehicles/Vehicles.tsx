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
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { vehiclesApi, VehicleRequest } from '../../api/vehicles';
import {
  Vehicle,
  VehicleStatus,
  VehicleType,
  VEHICLE_TYPE_LABELS,
  UserRole,
} from '../../types';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/apex';

const STATUS_LABELS: Record<VehicleStatus, string> = {
  [VehicleStatus.AVAILABLE]: 'Disponible',
  [VehicleStatus.IN_USE]: 'En uso',
  [VehicleStatus.MAINTENANCE]: 'Mantenimiento',
  [VehicleStatus.REPAIR]: 'Reparación',
  [VehicleStatus.OUT_OF_SERVICE]: 'Fuera de servicio',
  [VehicleStatus.TRANSPORT]: 'En transporte',
};

const STATUS_COLOR: Record<VehicleStatus, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  [VehicleStatus.AVAILABLE]: 'success',
  [VehicleStatus.IN_USE]: 'info',
  [VehicleStatus.MAINTENANCE]: 'warning',
  [VehicleStatus.REPAIR]: 'warning',
  [VehicleStatus.OUT_OF_SERVICE]: 'error',
  [VehicleStatus.TRANSPORT]: 'default',
};

const emptyForm: VehicleRequest = {
  name: '',
  vehicleType: VehicleType.FORMULA_1,
  manufacturer: '',
  model: '',
  yearManufactured: undefined,
  chassisNumber: '',
  engineNumber: '',
  registrationNumber: '',
  totalHours: 0,
  totalKilometers: 0,
  nextMaintenanceHours: undefined,
  nextMaintenanceKm: undefined,
  status: VehicleStatus.AVAILABLE,
  notes: '',
};

const Vehicles: React.FC = () => {
  const { user } = useAuthStore();
  const canEdit =
    user?.role === UserRole.MANAGER ||
    user?.role === UserRole.ENGINEER ||
    user?.role === UserRole.MECHANIC;
  const canDelete = user?.role === UserRole.MANAGER;

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<VehicleRequest>(emptyForm);
  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await vehiclesApi.list();
      setVehicles(data);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error cargando vehículos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setForm({
      name: v.name,
      vehicleType: v.vehicleType,
      manufacturer: v.manufacturer || '',
      model: v.model || '',
      yearManufactured: v.yearManufactured,
      chassisNumber: v.chassisNumber || '',
      engineNumber: v.engineNumber || '',
      registrationNumber: v.registrationNumber || '',
      totalHours: v.totalHours,
      totalKilometers: v.totalKilometers,
      nextMaintenanceHours: v.nextMaintenanceHours,
      nextMaintenanceKm: v.nextMaintenanceKm,
      status: v.status,
      notes: v.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await vehiclesApi.update(editingId, form);
        setSnack({ msg: 'Vehículo actualizado', severity: 'success' });
      } else {
        await vehiclesApi.create(form);
        setSnack({ msg: 'Vehículo creado', severity: 'success' });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || 'Error al guardar', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Desactivar este vehículo?')) return;
    try {
      await vehiclesApi.remove(id);
      setSnack({ msg: 'Vehículo desactivado', severity: 'success' });
      load();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || 'Error al eliminar', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <PageHeader
        eyebrow="OPERATIVO · VEHÍCULOS"
        title="Vehículos"
        subtitle="Inventario de vehículos del equipo"
        actions={
          canEdit && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Nuevo vehículo
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
                  <TableCell>Nombre</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Fabricante / Modelo</TableCell>
                  <TableCell align="right">Horas</TableCell>
                  <TableCell align="right">Km</TableCell>
                  <TableCell>Estado</TableCell>
                  {canEdit && <TableCell align="right">Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 7 : 6} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">No hay vehículos todavía</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((v) => (
                    <TableRow key={v.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography fontWeight={500}>{v.name}</Typography>
                          {v.needsMaintenance && (
                            <Tooltip title="Requiere mantenimiento">
                              <WarningIcon color="warning" fontSize="small" />
                            </Tooltip>
                          )}
                        </Box>
                        {v.chassisNumber && (
                          <Typography variant="caption" color="textSecondary">
                            Chasis: {v.chassisNumber}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{VEHICLE_TYPE_LABELS[v.vehicleType]}</TableCell>
                      <TableCell>
                        {v.manufacturer || '—'} {v.model && `/ ${v.model}`}
                        {v.yearManufactured && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            {v.yearManufactured}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">{Number(v.totalHours).toFixed(1)}</TableCell>
                      <TableCell align="right">
                        {Number(v.totalKilometers).toLocaleString('es-ES')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={STATUS_LABELS[v.status]}
                          size="small"
                          color={STATUS_COLOR[v.status]}
                        />
                      </TableCell>
                      {canEdit && (
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEdit(v)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {canDelete && (
                            <IconButton size="small" onClick={() => handleDelete(v.id)}>
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
        <DialogTitle>{editingId ? 'Editar vehículo' : 'Nuevo vehículo'}</DialogTitle>
        <DialogContent>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} pt={1}>
            <TextField
              label="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              sx={{ gridColumn: 'span 2' }}
            />
            <TextField
              label="Tipo"
              value={form.vehicleType}
              onChange={(e) => setForm({ ...form, vehicleType: e.target.value as VehicleType })}
              select
              required
            >
              {Object.values(VehicleType).map((t) => (
                <MenuItem key={t} value={t}>
                  {VEHICLE_TYPE_LABELS[t]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Estado"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as VehicleStatus })}
              select
            >
              {Object.values(VehicleStatus).map((s) => (
                <MenuItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Fabricante"
              value={form.manufacturer}
              onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
            />
            <TextField
              label="Modelo"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
            <TextField
              label="Año"
              type="number"
              value={form.yearManufactured ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  yearManufactured: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <TextField
              label="Nº chasis"
              value={form.chassisNumber}
              onChange={(e) => setForm({ ...form, chassisNumber: e.target.value })}
            />
            <TextField
              label="Nº motor"
              value={form.engineNumber}
              onChange={(e) => setForm({ ...form, engineNumber: e.target.value })}
            />
            <TextField
              label="Matrícula"
              value={form.registrationNumber}
              onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
            />
            <TextField
              label="Horas totales"
              type="number"
              value={form.totalHours ?? 0}
              onChange={(e) => setForm({ ...form, totalHours: Number(e.target.value) })}
            />
            <TextField
              label="Km totales"
              type="number"
              value={form.totalKilometers ?? 0}
              onChange={(e) => setForm({ ...form, totalKilometers: Number(e.target.value) })}
            />
            <TextField
              label="Próximo mant. (horas)"
              type="number"
              value={form.nextMaintenanceHours ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  nextMaintenanceHours: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <TextField
              label="Próximo mant. (km)"
              type="number"
              value={form.nextMaintenanceKm ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  nextMaintenanceKm: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <TextField
              label="Notas"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              multiline
              rows={2}
              sx={{ gridColumn: 'span 2' }}
            />
          </Box>
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

export default Vehicles;
