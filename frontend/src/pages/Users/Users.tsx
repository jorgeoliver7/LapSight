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
  Avatar,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { usersApi, UserCreateRequest, UserUpdateRequest } from '../../api/users';
import { User, UserRole } from '../../types';
import { useAuthStore } from '../../store/authStore';

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.MANAGER]: 'Manager',
  [UserRole.PILOT]: 'Piloto',
  [UserRole.MECHANIC]: 'Mecánico',
  [UserRole.ENGINEER]: 'Ingeniero',
  [UserRole.LOGISTICS]: 'Logística',
  [UserRole.FINANCE]: 'Finanzas',
  [UserRole.MEDIA]: 'Medios',
  [UserRole.GUEST]: 'Invitado',
};

interface FormState {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber: string;
  licenseNumber: string;
  active: boolean;
}

const emptyForm: FormState = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: UserRole.PILOT,
  phoneNumber: '',
  licenseNumber: '',
  active: true,
};

const Users: React.FC = () => {
  const { user } = useAuthStore();
  const isManager = user?.role === UserRole.MANAGER;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await usersApi.list();
      setUsers(data);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error cargando usuarios');
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

  const openEdit = (u: User) => {
    setEditingId(u.id);
    setForm({
      email: u.email,
      password: '',
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      phoneNumber: u.phoneNumber || '',
      licenseNumber: u.licenseNumber || '',
      active: u.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        const payload: UserUpdateRequest = {
          firstName: form.firstName,
          lastName: form.lastName,
          role: form.role,
          phoneNumber: form.phoneNumber || undefined,
          licenseNumber: form.licenseNumber || undefined,
          active: form.active,
        };
        await usersApi.update(editingId, payload);
        setSnack({ msg: 'Usuario actualizado', severity: 'success' });
      } else {
        const payload: UserCreateRequest = {
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          role: form.role,
          phoneNumber: form.phoneNumber || undefined,
          licenseNumber: form.licenseNumber || undefined,
        };
        await usersApi.create(payload);
        setSnack({ msg: 'Usuario creado', severity: 'success' });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || 'Error al guardar', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Desactivar este usuario?')) return;
    try {
      await usersApi.remove(id);
      setSnack({ msg: 'Usuario desactivado', severity: 'success' });
      load();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || 'Error al eliminar', severity: 'error' });
    }
  };

  const formValid =
    form.firstName && form.lastName && (editingId || (form.email && form.password.length >= 6));

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Usuarios
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Miembros del equipo
          </Typography>
        </Box>
        {isManager && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Nuevo usuario
          </Button>
        )}
      </Box>

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
                  <TableCell>Miembro</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Licencia</TableCell>
                  <TableCell>Estado</TableCell>
                  {isManager && <TableCell align="right">Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isManager ? 6 : 5} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">No hay usuarios todavía</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                            {u.firstName.charAt(0)}
                            {u.lastName.charAt(0)}
                          </Avatar>
                          <Typography fontWeight={500}>
                            {u.firstName} {u.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip label={ROLE_LABELS[u.role]} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{u.licenseNumber || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.active ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={u.active ? 'success' : 'default'}
                        />
                      </TableCell>
                      {isManager && (
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEdit(u)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {u.id !== user?.id && (
                            <IconButton size="small" onClick={() => handleDelete(u.id)}>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={!!editingId}
              fullWidth
            />
            {!editingId && (
              <TextField
                label="Contraseña inicial"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                helperText="Mínimo 6 caracteres"
                fullWidth
              />
            )}
            <Box display="flex" gap={2}>
              <TextField
                label="Nombre"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Apellido"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
                fullWidth
              />
            </Box>
            <TextField
              label="Rol"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              select
              fullWidth
            >
              {Object.values(UserRole).map((r) => (
                <MenuItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Teléfono"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Nº licencia (FIA/RFEDA)"
              value={form.licenseNumber}
              onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
              fullWidth
            />
            {editingId && (
              <TextField
                label="Estado"
                value={form.active ? 'true' : 'false'}
                onChange={(e) => setForm({ ...form, active: e.target.value === 'true' })}
                select
                fullWidth
              >
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">Inactivo</MenuItem>
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!formValid}>
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

export default Users;
