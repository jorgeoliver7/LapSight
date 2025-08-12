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
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  DirectionsCar as CarIcon,
  TwoWheeler as MotorcycleIcon,
  Build as MaintenanceIcon,
  Speed as SpeedIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const Vehicles: React.FC = () => {
  // Datos de ejemplo
  const vehicles = [
    {
      id: 1,
      name: 'Fórmula 3 #23',
      vehicleType: 'FORMULA_3',
      category: 'CAR',
      manufacturer: 'Dallara',
      model: 'F3 2024',
      yearManufactured: 2024,
      chassisNumber: 'F3-2024-001',
      registrationNumber: 'ESP-F3-23',
      totalHours: 150,
      totalKilometers: 2500,
      lastMaintenance: '2024-01-15',
      nextMaintenanceHours: 200,
      nextMaintenanceKm: 3000,
      status: 'AVAILABLE'
    },
    {
      id: 2,
      name: 'MotoGP #44',
      vehicleType: 'MOTOGP',
      category: 'MOTORCYCLE',
      manufacturer: 'Yamaha',
      model: 'YZR-M1',
      yearManufactured: 2023,
      chassisNumber: 'YZR-2023-044',
      registrationNumber: null,
      totalHours: 89,
      totalKilometers: 1200,
      lastMaintenance: '2024-01-20',
      nextMaintenanceHours: 120,
      nextMaintenanceKm: 1500,
      status: 'IN_USE'
    },
    {
      id: 3,
      name: 'GT3 #77',
      vehicleType: 'GT3',
      category: 'CAR',
      manufacturer: 'Porsche',
      model: '911 GT3 R',
      yearManufactured: 2023,
      chassisNumber: 'GT3-2023-077',
      registrationNumber: 'ESP-GT3-77',
      totalHours: 245,
      totalKilometers: 4200,
      lastMaintenance: '2024-01-10',
      nextMaintenanceHours: 250,
      nextMaintenanceKm: 4500,
      status: 'MAINTENANCE'
    }
  ];

  const getVehicleIcon = (category: string) => {
    return category === 'CAR' ? <CarIcon /> : <MotorcycleIcon />;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: any } = {
      AVAILABLE: 'success',
      IN_USE: 'primary',
      MAINTENANCE: 'warning',
      REPAIR: 'error',
      OUT_OF_SERVICE: 'default',
      TRANSPORT: 'info'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      AVAILABLE: 'Disponible',
      IN_USE: 'En Uso',
      MAINTENANCE: 'Mantenimiento',
      REPAIR: 'Reparación',
      OUT_OF_SERVICE: 'Fuera de Servicio',
      TRANSPORT: 'Transporte'
    };
    return labels[status] || status;
  };

  const getMaintenanceProgress = (current: number, next: number) => {
    return Math.min((current / next) * 100, 100);
  };

  const getMaintenanceColor = (progress: number) => {
    if (progress >= 90) return 'error';
    if (progress >= 75) return 'warning';
    return 'success';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Vehículos
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gestiona la flota de vehículos y su mantenimiento
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          Nuevo Vehículo
        </Button>
      </Box>

      <Grid container spacing={3}>
        {vehicles.map((vehicle) => {
          const hoursProgress = getMaintenanceProgress(vehicle.totalHours, vehicle.nextMaintenanceHours);
          const kmProgress = getMaintenanceProgress(vehicle.totalKilometers, vehicle.nextMaintenanceKm);
          
          return (
            <Grid item xs={12} md={6} lg={4} key={vehicle.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                    <Box display="flex" alignItems="center" flex={1}>
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: 'primary.main',
                          mr: 2
                        }}
                      >
                        {getVehicleIcon(vehicle.category)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="h3" fontWeight="bold">
                          {vehicle.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {vehicle.manufacturer} {vehicle.model}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Box>

                  <Box mb={2}>
                    <Chip
                      label={getStatusLabel(vehicle.status)}
                      color={getStatusColor(vehicle.status)}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Chasis:</strong> {vehicle.chassisNumber}
                    </Typography>
                    {vehicle.registrationNumber && (
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <strong>Matrícula:</strong> {vehicle.registrationNumber}
                      </Typography>
                    )}
                    <Typography variant="body2" color="textSecondary">
                      <strong>Año:</strong> {vehicle.yearManufactured}
                    </Typography>
                  </Box>

                  <Box mb={2}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <SpeedIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="textSecondary">
                        {vehicle.totalHours}h / {vehicle.totalKilometers}km
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="textSecondary">
                        Último mantenimiento: {new Date(vehicle.lastMaintenance).toLocaleDateString('es-ES')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Próximo Mantenimiento
                    </Typography>
                    
                    <Box mb={1}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption">Horas</Typography>
                        <Typography variant="caption">
                          {vehicle.totalHours}/{vehicle.nextMaintenanceHours}h
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={hoursProgress}
                        color={getMaintenanceColor(hoursProgress) as any}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption">Kilómetros</Typography>
                        <Typography variant="caption">
                          {vehicle.totalKilometers}/{vehicle.nextMaintenanceKm}km
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={kmProgress}
                        color={getMaintenanceColor(kmProgress) as any}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {vehicles.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No hay vehículos registrados
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Añade vehículos a tu flota para comenzar a gestionar su mantenimiento
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />}>
              Añadir Primer Vehículo
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Vehicles;