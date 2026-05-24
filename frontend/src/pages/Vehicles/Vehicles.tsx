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
import { PageHeader, Mono, StatusTag, type StatusTone } from '../../components/apex';
import { colors, fonts } from '../../theme/tokens';
import { useTranslation } from 'react-i18next';

const STATUS_TONE: Record<VehicleStatus, StatusTone> = {
  [VehicleStatus.AVAILABLE]: 'green',
  [VehicleStatus.IN_USE]: 'accent',
  [VehicleStatus.MAINTENANCE]: 'yellow',
  [VehicleStatus.REPAIR]: 'orange',
  [VehicleStatus.OUT_OF_SERVICE]: 'red',
  [VehicleStatus.TRANSPORT]: 'mute',
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
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const STATUS_LABELS: Record<VehicleStatus, string> = {
    [VehicleStatus.AVAILABLE]: t('vehicles.status.AVAILABLE'),
    [VehicleStatus.IN_USE]: t('vehicles.status.IN_USE'),
    [VehicleStatus.MAINTENANCE]: t('vehicles.status.MAINTENANCE'),
    [VehicleStatus.REPAIR]: t('vehicles.status.REPAIR'),
    [VehicleStatus.OUT_OF_SERVICE]: t('vehicles.status.OUT_OF_SERVICE'),
    [VehicleStatus.TRANSPORT]: t('vehicles.status.TRANSPORT'),
  };
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
      setError(e?.response?.data?.message || t('vehicles.msg.loadError'));
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
        setSnack({ msg: t('vehicles.msg.updated'), severity: 'success' });
      } else {
        await vehiclesApi.create(form);
        setSnack({ msg: t('vehicles.msg.created'), severity: 'success' });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || t('vehicles.msg.saveError'), severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('vehicles.msg.deleteConfirm'))) return;
    try {
      await vehiclesApi.remove(id);
      setSnack({ msg: t('vehicles.msg.deleted'), severity: 'success' });
      load();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || t('vehicles.msg.deleteError'), severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <PageHeader
        eyebrow={t('vehicles.eyebrow')}
        title={t('vehicles.title')}
        subtitle={t('vehicles.subtitle', { count: vehicles.length })}
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
              {t('vehicles.new')}
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
                  <TableCell>{t('vehicles.col.name')}</TableCell>
                  <TableCell>{t('vehicles.col.type')}</TableCell>
                  <TableCell>{t('vehicles.col.manufacturer')}</TableCell>
                  <TableCell align="right">{t('vehicles.col.hours')}</TableCell>
                  <TableCell align="right">{t('vehicles.col.km')}</TableCell>
                  <TableCell>{t('vehicles.col.status')}</TableCell>
                  {canEdit && <TableCell align="right">{t('common.actions')}</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canEdit ? 7 : 6}
                      align="center"
                      sx={{ py: 5, color: colors.textMute, fontFamily: fonts.mono, fontSize: 12 }}
                    >
                      {t('vehicles.empty')}
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((v) => (
                    <TableRow
                      key={v.id}
                      hover
                      sx={{ '&:hover': { backgroundColor: colors.surface2 } }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.75}>
                          <span style={{ color: colors.text, fontWeight: 600, fontSize: 13 }}>
                            {v.name}
                          </span>
                          {v.needsMaintenance && (
                            <Tooltip title={t('vehicles.msg.maintenanceNeeded')}>
                              <WarningIcon sx={{ color: colors.yellow, fontSize: 16 }} />
                            </Tooltip>
                          )}
                        </Box>
                        {v.chassisNumber && (
                          <Mono
                            style={{
                              fontSize: 10,
                              color: colors.textMute,
                              marginTop: 2,
                              display: 'block',
                            }}
                          >
                            {t('vehicles.msg.chassis')} · {v.chassisNumber}
                          </Mono>
                        )}
                      </TableCell>
                      <TableCell>
                        <span style={{ color: colors.textDim, fontSize: 12 }}>
                          {VEHICLE_TYPE_LABELS[v.vehicleType]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={{ color: colors.text, fontSize: 12 }}>
                          {v.manufacturer || '—'} {v.model && `/ ${v.model}`}
                        </span>
                        {v.yearManufactured && (
                          <Mono
                            style={{
                              fontSize: 10,
                              color: colors.textMute,
                              display: 'block',
                              marginTop: 2,
                            }}
                          >
                            {v.yearManufactured}
                          </Mono>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Mono style={{ color: colors.text, fontSize: 12, fontWeight: 600 }}>
                          {Number(v.totalHours).toFixed(1)}
                        </Mono>
                      </TableCell>
                      <TableCell align="right">
                        <Mono style={{ color: colors.text, fontSize: 12, fontWeight: 600 }}>
                          {Number(v.totalKilometers).toLocaleString('es-ES')}
                        </Mono>
                      </TableCell>
                      <TableCell>
                        <StatusTag tone={STATUS_TONE[v.status]}>
                          {STATUS_LABELS[v.status]}
                        </StatusTag>
                      </TableCell>
                      {canEdit && (
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEdit(v)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {canDelete && (
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(v.id)}
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
        <DialogTitle sx={{ fontFamily: fonts.mono, fontSize: 13, letterSpacing: '1.4px', textTransform: 'uppercase', color: colors.textDim }}>
          {editingId ? t('vehicles.edit') : t('vehicles.create')}
        </DialogTitle>
        <DialogContent>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} pt={1}>
            <TextField
              label={t('vehicles.form.name')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              sx={{ gridColumn: 'span 2' }}
            />
            <TextField
              label={t('vehicles.form.type')}
              value={form.vehicleType}
              onChange={(e) => setForm({ ...form, vehicleType: e.target.value as VehicleType })}
              select
              required
            >
              {Object.values(VehicleType).map((vt) => (
                <MenuItem key={vt} value={vt}>
                  {VEHICLE_TYPE_LABELS[vt]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={t('vehicles.form.status')}
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
              label={t('vehicles.form.manufacturer')}
              value={form.manufacturer}
              onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
            />
            <TextField
              label={t('vehicles.form.model')}
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
            <TextField
              label={t('vehicles.form.year')}
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
              label={t('vehicles.form.chassisNumber')}
              value={form.chassisNumber}
              onChange={(e) => setForm({ ...form, chassisNumber: e.target.value })}
            />
            <TextField
              label={t('vehicles.form.engineNumber')}
              value={form.engineNumber}
              onChange={(e) => setForm({ ...form, engineNumber: e.target.value })}
            />
            <TextField
              label={t('vehicles.form.registrationNumber')}
              value={form.registrationNumber}
              onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
            />
            <TextField
              label={t('vehicles.form.totalHours')}
              type="number"
              value={form.totalHours ?? 0}
              onChange={(e) => setForm({ ...form, totalHours: Number(e.target.value) })}
            />
            <TextField
              label={t('vehicles.form.totalKm')}
              type="number"
              value={form.totalKilometers ?? 0}
              onChange={(e) => setForm({ ...form, totalKilometers: Number(e.target.value) })}
            />
            <TextField
              label={t('vehicles.form.nextMaintHours')}
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
              label={t('vehicles.form.nextMaintKm')}
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
              label={t('vehicles.form.notes')}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              multiline
              rows={2}
              sx={{ gridColumn: 'span 2' }}
            />
          </Box>
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

export default Vehicles;
