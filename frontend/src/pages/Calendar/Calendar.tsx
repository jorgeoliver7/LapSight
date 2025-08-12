import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  ViewWeek as WeekIcon,
  ViewDay as DayIcon,
  ViewModule as MonthIcon,
  Sync as SyncIcon
} from '@mui/icons-material';

const Calendar: React.FC = () => {
  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Datos de ejemplo para eventos
  const events = [
    {
      id: 1,
      name: 'Reunión de Equipo',
      type: 'MEETING',
      date: '2024-02-10',
      time: '10:00',
      duration: '6h',
      location: 'Sede del equipo',
      status: 'CONFIRMED',
      participants: 15
    },
    {
      id: 2,
      name: 'Test de Pretemporada',
      type: 'TEST',
      date: '2024-02-15',
      time: '09:00',
      duration: '9h',
      location: 'Circuito de Jerez',
      status: 'CONFIRMED',
      participants: 8
    },
    {
      id: 3,
      name: 'Gran Premio de España',
      type: 'RACE',
      date: '2024-02-22',
      time: '08:00',
      duration: '4 días',
      location: 'Circuit de Barcelona-Catalunya',
      status: 'PLANNED',
      participants: 12
    },
    {
      id: 4,
      name: 'Mantenimiento Programado',
      type: 'MAINTENANCE',
      date: '2024-02-28',
      time: '14:00',
      duration: '4h',
      location: 'Taller',
      status: 'PLANNED',
      participants: 4
    }
  ];

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: string) => {
    if (newView !== null) {
      setView(newView);
    }
  };

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
      CANCELLED: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      PLANNED: 'Planificado',
      CONFIRMED: 'Confirmado',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filtrar eventos por mes actual para la vista de lista
  const currentMonthEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const currentDate = new Date();
    return eventDate.getMonth() === currentDate.getMonth() && 
           eventDate.getFullYear() === currentDate.getFullYear();
  });

  // Próximos eventos (siguientes 7 días)
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= today && eventDate <= nextWeek;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Calendario
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Visualiza y gestiona todos los eventos del equipo
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<SyncIcon />}
            size="large"
          >
            Sincronizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
          >
            Nuevo Evento
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Panel de control del calendario */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </Typography>
                <ToggleButtonGroup
                  value={view}
                  exclusive
                  onChange={handleViewChange}
                  size="small"
                >
                  <ToggleButton value="day">
                    <DayIcon sx={{ mr: 1 }} />
                    Día
                  </ToggleButton>
                  <ToggleButton value="week">
                    <WeekIcon sx={{ mr: 1 }} />
                    Semana
                  </ToggleButton>
                  <ToggleButton value="month">
                    <MonthIcon sx={{ mr: 1 }} />
                    Mes
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              {/* Placeholder para el calendario visual */}
              <Box
                sx={{
                  height: 400,
                  backgroundColor: 'grey.50',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed',
                  borderColor: 'grey.300'
                }}
              >
                <Box textAlign="center">
                  <CalendarIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="grey.600" gutterBottom>
                    Vista de Calendario
                  </Typography>
                  <Typography variant="body2" color="grey.500">
                    Aquí se integrará un componente de calendario interactivo
                    <br />
                    (React Big Calendar, FullCalendar, etc.)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Próximos eventos */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                Próximos Eventos
              </Typography>
              
              {upcomingEvents.length > 0 ? (
                <List>
                  {upcomingEvents.map((event, index) => (
                    <React.Fragment key={event.id}>
                      <ListItem sx={{ px: 0 }}>
                        <Avatar
                          sx={{
                            bgcolor: getEventTypeColor(event.type) + '.main',
                            mr: 2,
                            width: 40,
                            height: 40
                          }}
                        >
                          <EventIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {event.name}
                              </Typography>
                              <Chip
                                label={getStatusLabel(event.status)}
                                size="small"
                                color={getStatusColor(event.status)}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                {formatDate(event.date)}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {event.time} • {event.duration} • {event.location}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < upcomingEvents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <EventIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body2" color="textSecondary">
                    No hay eventos próximos
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Eventos del mes */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                Eventos de este mes
              </Typography>
              
              {currentMonthEvents.length > 0 ? (
                <List>
                  {currentMonthEvents.map((event, index) => (
                    <React.Fragment key={event.id}>
                      <ListItem sx={{ px: 0 }}>
                        <Box display="flex" alignItems="center" width="100%">
                          <Chip
                            label={getEventTypeLabel(event.type)}
                            color={getEventTypeColor(event.type)}
                            size="small"
                            sx={{ mr: 2, minWidth: 80 }}
                          />
                          <Box flex={1}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {event.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(event.date).toLocaleDateString('es-ES')} • {event.location}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            {event.participants} personas
                          </Typography>
                        </Box>
                      </ListItem>
                      {index < currentMonthEvents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <CalendarIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body2" color="textSecondary">
                    No hay eventos este mes
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Información de integración */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                Integración con Calendarios
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Sincroniza automáticamente con Apple Calendar y Google Calendar para mantener
                todos tus eventos actualizados en todos tus dispositivos.
              </Typography>
              <Box display="flex" gap={2}>
                <Button variant="outlined" size="small">
                  Configurar Apple Calendar
                </Button>
                <Button variant="outlined" size="small">
                  Configurar Google Calendar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Calendar;