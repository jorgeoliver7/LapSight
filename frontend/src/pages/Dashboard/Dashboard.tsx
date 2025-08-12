import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  LinearProgress,
  IconButton,
  Button
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Build as MaintenanceIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';

// Tipos para los datos del dashboard
interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  totalUsers: number;
  upcomingEvents: number;
  maintenanceDue: number;
  totalEvents: number;
}

interface RecentActivity {
  id: number;
  type: 'maintenance' | 'event' | 'user' | 'vehicle';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface UpcomingEvent {
  id: number;
  name: string;
  date: string;
  type: string;
  location: string;
  status: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    activeVehicles: 0,
    totalUsers: 0,
    upcomingEvents: 0,
    maintenanceDue: 0,
    totalEvents: 0
  });
  
  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: 1,
      type: 'maintenance',
      title: 'Mantenimiento completado',
      description: 'Cambio de aceite en Fórmula 3 #23',
      timestamp: '2 horas',
      status: 'success'
    },
    {
      id: 2,
      type: 'event',
      title: 'Nuevo evento programado',
      description: 'Test en Circuito de Jerez',
      timestamp: '4 horas',
      status: 'info'
    },
    {
      id: 3,
      type: 'vehicle',
      title: 'Vehículo en mantenimiento',
      description: 'Moto GP #44 requiere revisión',
      timestamp: '6 horas',
      status: 'warning'
    },
    {
      id: 4,
      type: 'user',
      title: 'Nuevo miembro del equipo',
      description: 'Carlos Méndez se unió como mecánico',
      timestamp: '1 día',
      status: 'success'
    }
  ]);
  
  const [upcomingEvents] = useState<UpcomingEvent[]>([
    {
      id: 1,
      name: 'Test de Pretemporada',
      date: '2024-02-15',
      type: 'TEST',
      location: 'Circuito de Jerez',
      status: 'CONFIRMED'
    },
    {
      id: 2,
      name: 'Gran Premio de España',
      date: '2024-02-22',
      type: 'RACE',
      location: 'Circuit de Barcelona-Catalunya',
      status: 'PLANNED'
    },
    {
      id: 3,
      name: 'Reunión de Equipo',
      date: '2024-02-10',
      type: 'MEETING',
      location: 'Sede del equipo',
      status: 'CONFIRMED'
    }
  ]);

  useEffect(() => {
    // Simular carga de datos
    setStats({
      totalVehicles: 8,
      activeVehicles: 6,
      totalUsers: 15,
      upcomingEvents: 3,
      maintenanceDue: 2,
      totalEvents: 12
    });
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <MaintenanceIcon />;
      case 'event':
        return <EventIcon />;
      case 'vehicle':
        return <CarIcon />;
      case 'user':
        return <PeopleIcon />;
      default:
        return <CheckCircleIcon />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      default:
        return 'info.main';
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PLANNED':
        return 'info';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        ¡Bienvenido, {user?.firstName}!
      </Typography>
      
      <Typography variant="body1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
        Aquí tienes un resumen de la actividad de tu equipo
      </Typography>

      {/* Estadísticas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Vehículos Totales"
            value={stats.totalVehicles}
            subtitle={`${stats.activeVehicles} activos`}
            icon={<CarIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Miembros del Equipo"
            value={stats.totalUsers}
            subtitle="Activos"
            icon={<PeopleIcon />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Próximos Eventos"
            value={stats.upcomingEvents}
            subtitle="Este mes"
            icon={<EventIcon />}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Mantenimientos"
            value={stats.maintenanceDue}
            subtitle="Pendientes"
            icon={<WarningIcon />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Actividad reciente */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" component="h3" fontWeight="bold">
                  Actividad Reciente
                </Typography>
                <IconButton className="clickable-button" size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
              
              <List>
                {recentActivities.map((activity, index) => (
                  <ListItem
                    key={activity.id}
                    divider={index < recentActivities.length - 1}
                    sx={{ px: 0 }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getActivityColor(activity.status), width: 40, height: 40 }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Hace {activity.timestamp}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              
              <Box textAlign="center" mt={2}>
                <Button variant="outlined" size="small">
                  Ver todas las actividades
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Próximos eventos */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" component="h3" fontWeight="bold">
                  Próximos Eventos
                </Typography>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
              
              <List>
                {upcomingEvents.map((event, index) => (
                  <ListItem
                    key={event.id}
                    divider={index < upcomingEvents.length - 1}
                    sx={{ px: 0 }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        <ScheduleIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {event.name}
                          </Typography>
                          <Chip
                            label={event.status}
                            size="small"
                            color={getEventStatusColor(event.status) as any}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {event.location}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(event.date).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              
              <Box textAlign="center" mt={2}>
                <Button className="clickable-button" variant="outlined" size="small">
                  Ver calendario completo
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progreso del equipo */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                Estado del Equipo
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Vehículos Operativos</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {stats.activeVehicles}/{stats.totalVehicles}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(stats.activeVehicles / stats.totalVehicles) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                      color="success"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Eventos Completados</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        9/{stats.totalEvents}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(9 / stats.totalEvents) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                      color="primary"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Mantenimientos al Día</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {stats.totalVehicles - stats.maintenanceDue}/{stats.totalVehicles}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={((stats.totalVehicles - stats.maintenanceDue) / stats.totalVehicles) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                      color="warning"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;