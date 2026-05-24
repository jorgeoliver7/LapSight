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
import { teamsApi, TeamRequest } from '../../api/teams';
import { Team, VehicleCategory, UserRole } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { PageHeader, Mono, StatusTag } from '../../components/apex';
import { colors, fonts } from '../../theme/tokens';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      setError(e?.response?.data?.message || t('teams.msg.loadError'));
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
        setSnack({ msg: t('teams.msg.updated'), severity: 'success' });
      } else {
        await teamsApi.create(form);
        setSnack({ msg: t('teams.msg.created'), severity: 'success' });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || t('teams.msg.saveError'), severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('teams.msg.deleteConfirm'))) return;
    try {
      await teamsApi.remove(id);
      setSnack({ msg: t('teams.msg.deleted'), severity: 'success' });
      load();
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.message || t('teams.msg.deleteError'), severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <PageHeader
        eyebrow={t('teams.eyebrow')}
        title={t('teams.title')}
        subtitle={t('teams.subtitle', { count: teams.length })}
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
              {t('teams.new')}
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
                  <TableCell>{t('teams.col.name')}</TableCell>
                  <TableCell>{t('teams.col.category')}</TableCell>
                  <TableCell>{t('teams.col.location')}</TableCell>
                  <TableCell align="right">{t('teams.col.members')}</TableCell>
                  <TableCell align="right">{t('teams.col.vehicles')}</TableCell>
                  <TableCell>{t('teams.col.status')}</TableCell>
                  {isManager && <TableCell align="right">{t('common.actions')}</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {teams.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isManager ? 7 : 6}
                      align="center"
                      sx={{ py: 5, color: colors.textMute, fontFamily: fonts.mono, fontSize: 12 }}
                    >
                      {t('teams.empty')}
                    </TableCell>
                  </TableRow>
                ) : (
                  teams.map((team) => (
                    <TableRow key={team.id} hover sx={{ '&:hover': { backgroundColor: colors.surface2 } }}>
                      <TableCell>
                        <span style={{ color: colors.text, fontWeight: 600, fontSize: 13 }}>
                          {team.name}
                        </span>
                        {team.description && (
                          <Mono
                            style={{
                              fontSize: 10,
                              color: colors.textMute,
                              marginTop: 2,
                              display: 'block',
                            }}
                          >
                            {team.description}
                          </Mono>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusTag
                          tone={team.primaryCategory === VehicleCategory.CAR ? 'accent' : 'purple'}
                          dot={false}
                        >
                          {team.primaryCategory === VehicleCategory.CAR ? t('teams.category.CAR') : t('teams.category.MOTORCYCLE')}
                        </StatusTag>
                      </TableCell>
                      <TableCell>
                        <span style={{ color: team.headquartersLocation ? colors.text : colors.textMute, fontSize: 12 }}>
                          {team.headquartersLocation || '—'}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <Mono style={{ color: colors.text, fontSize: 12, fontWeight: 600 }}>
                          {team.membersCount}
                        </Mono>
                      </TableCell>
                      <TableCell align="right">
                        <Mono style={{ color: colors.text, fontSize: 12, fontWeight: 600 }}>
                          {team.vehiclesCount}
                        </Mono>
                      </TableCell>
                      <TableCell>
                        <StatusTag tone={team.active ? 'green' : 'mute'}>
                          {team.active ? t('common.active') : t('common.inactive')}
                        </StatusTag>
                      </TableCell>
                      {isManager && (
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEdit(team)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(team.id)}
                            sx={{ color: colors.textMute, '&:hover': { color: colors.red } }}
                          >
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
          {editingId ? t('teams.edit') : t('teams.create')}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label={t('teams.form.name')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label={t('teams.form.description')}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label={t('teams.form.category')}
              value={form.primaryCategory}
              onChange={(e) => setForm({ ...form, primaryCategory: e.target.value as VehicleCategory })}
              select
              fullWidth
            >
              <MenuItem value={VehicleCategory.CAR}>{t('teams.category.CAR')}</MenuItem>
              <MenuItem value={VehicleCategory.MOTORCYCLE}>{t('teams.category.MOTORCYCLE')}</MenuItem>
            </TextField>
            <TextField
              label={t('teams.form.location')}
              value={form.headquartersLocation}
              onChange={(e) => setForm({ ...form, headquartersLocation: e.target.value })}
              fullWidth
            />
            <TextField
              label={t('teams.form.email')}
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              fullWidth
            />
            <TextField
              label={t('teams.form.phone')}
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              fullWidth
            />
            <TextField
              label={t('teams.form.logoUrl')}
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              fullWidth
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

export default Teams;
