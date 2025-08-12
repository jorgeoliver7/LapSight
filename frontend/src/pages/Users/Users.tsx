import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const Users: React.FC = () => {
  // Datos de ejemplo
  const users = [
    {
      id: 1,
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos.rodriguez@racingteam.es',
      role: 'MANAGER',
      phoneNumber: '+34 600 111 222',
      licenseNumber: 'ESP-2024-001',
      licenseExpiry: '2025-12-31',
      active: true
    },
    {
      id: 2,
      firstName: 'Ana',
      lastName: 'García',
      email: 'ana.garcia@racingteam.es',
      role: 'PILOT',
      phoneNumber: '+34 600 333 444',
      licenseNumber: 'ESP-2024-002',
      licenseExpiry: '2025-06-15',
      active: true
    },
    {
      id: 3,
      firstName: 'Miguel',
      lastName: 'López',
      email: 'miguel.lopez@racingteam.es',
      role: 'MECHANIC',
      phoneNumber: '+34 600 555 666',
      licenseNumber: null,
      licenseExpiry: null,
      active: true
    }
  ];

  const getRoleLabel = (role: string) => {
    const roles: { [key: string]: string } = {
      MANAGER: 'Manager',
      PILOT: 'Piloto',
      MECHANIC: 'Mecánico',
      ENGINEER: 'Ingeniero',
      LOGISTICS: 'Logística',
      FINANCE: 'Finanzas',
      MEDIA: 'Medios',
      GUEST: 'Invitado'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: any } = {
      MANAGER: 'primary',
      PILOT: 'secondary',
      MECHANIC: 'success',
      ENGINEER: 'info',
      LOGISTICS: 'warning',
      FINANCE: 'error',
      MEDIA: 'default',
      GUEST: 'default'
    };
    return colors[role] || 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Usuarios
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gestiona los miembros del equipo y sus permisos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          Nuevo Usuario
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box mb={3}>
            <TextField
              placeholder="Buscar usuarios..."
              variant="outlined"
              size="small"
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell>Licencia</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(user.role)}
                        color={getRoleColor(user.role)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.phoneNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {user.licenseNumber ? (
                        <Box>
                          <Typography variant="body2">
                            {user.licenseNumber}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Exp: {new Date(user.licenseExpiry!).toLocaleDateString('es-ES')}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No requerida
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.active ? 'Activo' : 'Inactivo'}
                        color={user.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {users.length === 0 && (
            <Box textAlign="center" py={6}>
              <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No hay usuarios registrados
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Añade miembros a tu equipo para comenzar a colaborar
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />}>
                Añadir Primer Usuario
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Users;