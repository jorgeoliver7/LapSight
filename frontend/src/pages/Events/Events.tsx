import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  DirectionsCar as CarIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

const Events: React.FC = () => {
  // Datos de ejemplo
  const events = [
    {
      id: 1,
      name: 'Test de Pretemporada',
      description: 'Sesión de pruebas para preparar la nueva temporada',
      eventType: 'TEST',
      startDate: '2024-02-15T09:00:00',
      endDate: '2024-02-15T18:00:00',
      location: 'Circuito de Jerez',
      circuitName: 'Circuito de Jerez - Ángel Nieto',
      address: 'Ctra. Arcos, Km. 10, 11405 Jerez de la Frontera, Cádiz',
      status: 'CONFIRMED',
      participantCount: 8,
      vehicleCount: 3,
      budgetAllocated: 15000,
      actualCost: null
    },
    {
      id: 2,
      name: 'Gran Premio de España',
      description: 'Carrera oficial del campeonato nacional',
      eventType: 'RACE',
      startDate: '2024-02-22T08:00:00',
      endDate: '2024-02-25T20:00:00',
      location: 'Circuit de Barcelona-Catalunya',
      circuitName: 'Circuit de Barcelona-Catalunya',
      address: 'Carrer de la Platja, s/n, 08160 Montmeló, Barcelona',
      status: 'PLANNED',
      participantCount: 12,
      vehicleCount: 5,
      budgetAllocated: 35000,
      actualCost: null
    },
    {
      id: 3,
      name: 'Reunión de Equipo',
      description: 'Planificación estratégica para la temporada 2024',
      eventType: 'MEETING',
      startDate: '2024-02-10T10:00:00',
      endDate: '2024-02-10T16:00:00',
      location: 'Sede del equipo',
      circuitName: null,
      address: 'Calle Racing, 123, Madrid',
      status: 'CONFIRMED',
      participantCount: 15,
      vehicleCount: 0,
      budgetAllocated: 500,
      actualCost: 450
    }
  ];

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: any } = {
      RACE: 'primary',
      TEST: 'secondary',
      MEETING: 'info',
      MAINTENANCE: 'warning',
      TRAINING: 'success'
    };
    return colors[type] || 'default';
  };

  const getEventTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      RACE: 'Carrera',
      TEST: 'Test',
      MEETING: 'Reunión',
      MAINTENANCE: 'Mantenimiento',
      TRAINING: 'Entrenamiento'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: any } = {
      PLANNED: 'info',
      CONFIRMED: 'success',
      IN_PROGRESS: 'primary',
      COMPLETED: 'default',
      CANCELLED: 'error',
      POSTPONED: 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      PLANNED: 'Planificado',
      CONFIRMED: 'Confirmado',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado',
      POSTPONED: 'Pospuesto'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Eventos
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gestiona carreras, tests, reuniones y otros eventos del equipo
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          Nuevo Evento
        </Button>
      </Box>

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} md={6} lg={4} key={event.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                  <Box display="flex" alignItems="center" flex={1}>
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        bgcolor: getEventTypeColor(event.eventType) + '.main',
                        mr: 2
                      }}
                    >
                      <EventIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h3" fontWeight="bold">
                        {event.name}
                      </Typography>
                      <Box display="flex" gap={1} mt={0.5}>
                        <Chip
                          label={getEventTypeLabel(event.eventType)}
                          color={getEventTypeColor(event.eventType)}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={getStatusLabel(event.status)}
                          color={getStatusColor(event.status)}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Box>
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                </Box>

                <Typography variant="body2" color="textSecondary" paragraph>
                  {event.description}
                </Typography>

                <Box mb={2}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      {event.location}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TimeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      {formatDate(event.startDate)} - {formatDate(event.endDate)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                  </Typography>
                </Box>

                <List dense sx={{ py: 0 }}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <GroupIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${event.participantCount} participantes`}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  {event.vehicleCount > 0 && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <CarIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${event.vehicleCount} vehículos`}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  )}
                </List>

                <Box mt={2} pt={2} borderTop={1} borderColor="divider">
                  <Typography variant="body2" color="textSecondary">
                    <strong>Presupuesto:</strong> €{event.budgetAllocated.toLocaleString()}
                  </Typography>
                  {event.actualCost && (
                    <Typography variant="body2" color="textSecondary">
                      <strong>Coste real:</strong> €{event.actualCost.toLocaleString()}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {events.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No hay eventos programados
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Crea tu primer evento para comenzar a planificar las actividades del equipo
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />}>
              Crear Primer Evento
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Events;