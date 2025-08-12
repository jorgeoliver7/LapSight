import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const Teams: React.FC = () => {
  // Datos de ejemplo
  const teams = [
    {
      id: 1,
      name: 'Racing Team España',
      description: 'Equipo profesional de automovilismo con más de 10 años de experiencia',
      primaryCategory: 'CAR',
      contactEmail: 'info@racingteam.es',
      contactPhone: '+34 600 123 456',
      headquartersLocation: 'Madrid, España',
      memberCount: 15,
      vehicleCount: 8,
      active: true,
      logoUrl: null
    }
  ];

  const getCategoryColor = (category: string) => {
    return category === 'CAR' ? 'primary' : 'secondary';
  };

  const getCategoryLabel = (category: string) => {
    return category === 'CAR' ? 'Automóviles' : 'Motocicletas';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Equipos
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gestiona la información de los equipos de racing
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          Nuevo Equipo
        </Button>
      </Box>

      <Grid container spacing={3}>
        {teams.map((team) => (
          <Grid item xs={12} md={6} lg={4} key={team.id}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: 'primary.main',
                      mr: 2
                    }}
                  >
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <GroupIcon sx={{ fontSize: 30 }} />
                    )}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h6" component="h3" fontWeight="bold">
                      {team.name}
                    </Typography>
                    <Chip
                      label={getCategoryLabel(team.primaryCategory)}
                      color={getCategoryColor(team.primaryCategory) as any}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                </Box>

                <Typography variant="body2" color="textSecondary" paragraph>
                  {team.description}
                </Typography>

                <Box mb={2}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      {team.headquartersLocation}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      {team.contactEmail}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      {team.contactPhone}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Miembros: {team.memberCount}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Vehículos: {team.vehicleCount}
                    </Typography>
                  </Box>
                  <Chip
                    label={team.active ? 'Activo' : 'Inactivo'}
                    color={team.active ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {teams.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No hay equipos registrados
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Crea tu primer equipo para comenzar a gestionar tu organización de racing
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />}>
              Crear Primer Equipo
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Teams;