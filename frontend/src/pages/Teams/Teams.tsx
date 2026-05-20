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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { teamsApi, TeamRequest } from '../../api/teams';
import { Team, VehicleCategory, UserRole } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/apex';

const emptyForm: TeamRequest = {
  name: '',
  description: '',
  logoUrl: '',
  primaryCategory: VehicleCategory.CAR,
  contactEmail: '',
  contactPhone: '',
  headquartersLocation: '',
};

const Teams: React.FC = () => {
  const { user } = useAuthStore();
  const isManager = user?.role === UserRole.MANAGER;

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TeamRequest>(emptyForm);
  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await teamsApi.list();
      setTeams(data);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error cargando equipos');
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

  const openEdit = (team: Team) => {
    setEditingId(team.id);
    setForm({
      name: team.name,
      description: team.description || '',
      logoUrl: team.logoUrl || '',
      primaryCategory: team.primaryCategory,
      contactEmail: team.contactEmail || '',
      contactPhone: team.contactPhone || '',
      headquartersLocation: team.headquartersLocation || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await teamsApi.update(editingId, form);
        setSnack({ msg: 'Equipo actualizado', severity: 'success' });
      } else {
        await teamsApi.create(form);
        setSnack({ msg: 'Equipo creado', severity: 'success' });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || 'Error al guardar', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Desactivar este equipo?')) return;
    try {
      await teamsApi.remove(id);
      setSnack({ msg: 'Equipo desactivado', severity: 'success' });
      load();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || 'Error al eliminar', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <PageHeader
        eyebrow="OPERATIVO · EQUIPOS"
        title="Equipos"
        subtitle="Gestiona los equipos de racing"
        actions={
          isManager && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Nuevo equipo
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
                  <TableCell>Categoría</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell align="right">Miembros</TableCell>
                  <TableCell align="right">Vehículos</TableCell>
                  <TableCell>Estado</TableCell>
                  {isManager && <TableCell align="right">Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {teams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isManager ? 7 : 6} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">No hay equipos todavía</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  teams.map((team) => (
                    <TableRow key={team.id} hover>
                      <TableCell>
                        <Typography fontWeight={500}>{team.name}</Typography>
                        {team.description && (
                          <Typography variant="caption" color="textSecondary">
                            {team.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={team.primaryCategory === VehicleCategory.CAR ? 'Coches' : 'Motos'}
                          size="small"
                          color={team.primaryCategory === VehicleCategory.CAR ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>{team.headquartersLocation || '—'}</TableCell>
                      <TableCell align="right">{team.membersCount}</TableCell>
                      <TableCell align="right">{team.vehiclesCount}</TableCell>
                      <TableCell>
                        <Chip
                          label={team.active ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={team.active ? 'success' : 'default'}
                        />
                      </TableCell>
                      {isManager && (
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEdit(team)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(team.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar equipo' : 'Nuevo equipo'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Descripción"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Categoría principal"
              value={form.primaryCategory}
              onChange={(e) => setForm({ ...form, primaryCategory: e.target.value as VehicleCategory })}
              select
              fullWidth
            >
              <MenuItem value={VehicleCategory.CAR}>Coches</MenuItem>
              <MenuItem value={VehicleCategory.MOTORCYCLE}>Motos</MenuItem>
            </TextField>
            <TextField
              label="Ubicación"
              value={form.headquartersLocation}
              onChange={(e) => setForm({ ...form, headquartersLocation: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email de contacto"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              fullWidth
            />
            <TextField
              label="Teléfono"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              fullWidth
            />
            <TextField
              label="URL del logo"
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              fullWidth
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

export default Teams;
