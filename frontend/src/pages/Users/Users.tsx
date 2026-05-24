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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { usersApi, UserCreateRequest, UserUpdateRequest } from '../../api/users';
import { User, UserRole } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { PageHeader, Mono, StatusTag, type StatusTone } from '../../components/apex';
import { colors, fonts } from '../../theme/tokens';
import { useTranslation } from 'react-i18next';

const ROLE_TONE: Record<UserRole, StatusTone> = {
  [UserRole.MANAGER]: 'accent',
  [UserRole.PILOT]: 'cyan',
  [UserRole.MECHANIC]: 'orange',
  [UserRole.ENGINEER]: 'purple',
  [UserRole.LOGISTICS]: 'yellow',
  [UserRole.FINANCE]: 'green',
  [UserRole.MEDIA]: 'mute',
  [UserRole.GUEST]: 'mute',
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

const Initials: React.FC<{ first: string; last: string }> = ({ first, last }) => (
  <div
    style={{
      width: 32,
      height: 32,
      background: colors.surface3,
      border: `1px solid ${colors.borderHi}`,
      color: colors.text,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: fonts.mono,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.6,
      flexShrink: 0,
    }}
  >
    {(first.charAt(0) + last.charAt(0)).toUpperCase()}
  </div>
);

const Users: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isManager = user?.role === UserRole.MANAGER;
  const ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.MANAGER]: t('users.role.MANAGER'),
    [UserRole.PILOT]: t('users.role.PILOT'),
    [UserRole.MECHANIC]: t('users.role.MECHANIC'),
    [UserRole.ENGINEER]: t('users.role.ENGINEER'),
    [UserRole.LOGISTICS]: t('users.role.LOGISTICS'),
    [UserRole.FINANCE]: t('users.role.FINANCE'),
    [UserRole.MEDIA]: t('users.role.MEDIA'),
    [UserRole.GUEST]: t('users.role.GUEST'),
  };

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
      setError(e?.response?.data?.message || t('users.msg.loadError'));
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
        setSnack({ msg: t('users.msg.updated'), severity: 'success' });
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
        setSnack({ msg: t('users.msg.created'), severity: 'success' });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || t('users.msg.saveError'), severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('users.msg.deleteConfirm'))) return;
    try {
      await usersApi.remove(id);
      setSnack({ msg: t('users.msg.deleted'), severity: 'success' });
      load();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || t('users.msg.deleteError'), severity: 'error' });
    }
  };

  const formValid =
    form.firstName && form.lastName && (editingId || (form.email && form.password.length >= 6));

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <PageHeader
        eyebrow={t('users.eyebrow')}
        title={t('users.title')}
        subtitle={t('users.subtitle', { count: users.length })}
        actions={
          isManager && (
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
              {t('users.new')}
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
                  <TableCell>{t('users.col.member')}</TableCell>
                  <TableCell>{t('users.col.email')}</TableCell>
                  <TableCell>{t('users.col.role')}</TableCell>
                  <TableCell>{t('users.col.license')}</TableCell>
                  <TableCell>{t('users.col.status')}</TableCell>
                  {isManager && <TableCell align="right">{t('common.actions')}</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isManager ? 6 : 5}
                      align="center"
                      sx={{ py: 5, color: colors.textMute, fontFamily: fonts.mono, fontSize: 12 }}
                    >
                      {t('users.empty')}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id} hover sx={{ '&:hover': { backgroundColor: colors.surface2 } }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.25}>
                          <Initials first={u.firstName} last={u.lastName} />
                          <span style={{ color: colors.text, fontWeight: 600, fontSize: 13 }}>
                            {u.firstName} {u.lastName}
                          </span>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Mono style={{ color: colors.textDim, fontSize: 12 }}>{u.email}</Mono>
                      </TableCell>
                      <TableCell>
                        <StatusTag tone={ROLE_TONE[u.role]} dot={false}>
                          {ROLE_LABELS[u.role]}
                        </StatusTag>
                      </TableCell>
                      <TableCell>
                        <Mono style={{ color: u.licenseNumber ? colors.text : colors.textMute, fontSize: 12 }}>
                          {u.licenseNumber || '—'}
                        </Mono>
                      </TableCell>
                      <TableCell>
                        <StatusTag tone={u.active ? 'green' : 'mute'}>
                          {u.active ? t('common.active') : t('common.inactive')}
                        </StatusTag>
                      </TableCell>
                      {isManager && (
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEdit(u)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {u.id !== user?.id && (
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(u.id)}
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontFamily: fonts.mono,
            fontSize: 13,
            letterSpacing: '1.4px',
            textTransform: 'uppercase',
            color: colors.textDim,
          }}
        >
          {editingId ? t('users.edit') : t('users.create')}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label={t('users.form.email')}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={!!editingId}
              fullWidth
            />
            {!editingId && (
              <TextField
                label={t('users.form.password')}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                helperText={t('users.form.passwordHelp')}
                fullWidth
              />
            )}
            <Box display="flex" gap={2}>
              <TextField
                label={t('users.form.firstName')}
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label={t('users.form.lastName')}
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
                fullWidth
              />
            </Box>
            <TextField
              label={t('users.form.role')}
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
              label={t('users.form.phone')}
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label={t('users.form.license')}
              value={form.licenseNumber}
              onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
              fullWidth
            />
            {editingId && (
              <TextField
                label={t('users.form.status')}
                value={form.active ? 'true' : 'false'}
                onChange={(e) => setForm({ ...form, active: e.target.value === 'true' })}
                select
                fullWidth
              >
                <MenuItem value="true">{t('common.active')}</MenuItem>
                <MenuItem value="false">{t('common.inactive')}</MenuItem>
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: colors.textDim }}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formValid}
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

export default Users;
