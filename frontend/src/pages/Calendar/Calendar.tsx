import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
} from '@mui/material';
import { Calendar as BigCalendar, dateFnsLocalizer, Event as RBCEvent, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { eventsApi } from '../../api/events';
import { Event, EventType, EVENT_TYPE_LABELS, EVENT_STATUS_LABELS } from '../../types';

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: es }),
  getDay,
  locales,
});

const TYPE_COLOR: Record<EventType, string> = {
  [EventType.RACE]: '#d32f2f',
  [EventType.QUALIFYING]: '#9a0007',
  [EventType.PRACTICE]: '#1976d2',
  [EventType.TEST]: '#0288d1',
  [EventType.SHAKEDOWN]: '#0097a7',
  [EventType.TRACKDAY]: '#00897b',
  [EventType.TRAINING]: '#388e3c',
  [EventType.MAINTENANCE]: '#f57c00',
  [EventType.MEETING]: '#7b1fa2',
  [EventType.MEDIA]: '#5d4037',
  [EventType.SPONSOR_EVENT]: '#c2185b',
  [EventType.PRESENTATION]: '#512da8',
  [EventType.TRAVEL]: '#616161',
  [EventType.OTHER]: '#424242',
};

interface CalendarEvent extends RBCEvent {
  resource: Event;
}

const messages = {
  allDay: 'Todo el día',
  previous: '←',
  next: '→',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay eventos en este rango',
  showMore: (n: number) => `+${n} más`,
};

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    setLoading(true);
    eventsApi
      .list()
      .then(setEvents)
      .catch((e: any) => setError(e?.response?.data?.message || 'Error cargando eventos'))
      .finally(() => setLoading(false));
  }, []);

  const calendarEvents: CalendarEvent[] = useMemo(
    () =>
      events.map((ev) => ({
        title: ev.name,
        start: new Date(ev.startDate),
        end: new Date(ev.endDate),
        resource: ev,
      })),
    [events]
  );

  const eventStyleGetter = (event: CalendarEvent) => ({
    style: {
      backgroundColor: TYPE_COLOR[event.resource.eventType] || '#424242',
      borderRadius: 4,
      border: 'none',
      color: 'white',
      fontSize: '0.85rem',
      padding: '2px 6px',
    },
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Calendario
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Vista temporal de carreras, tests, libres y eventos del equipo
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
        {Object.values(EventType).map((t) => (
          <Chip
            key={t}
            label={EVENT_TYPE_LABELS[t]}
            size="small"
            sx={{
              bgcolor: TYPE_COLOR[t],
              color: 'white',
              fontWeight: 500,
            }}
          />
        ))}
      </Stack>

      <Card>
        <CardContent>
          <Box sx={{ height: 640, '& .rbc-toolbar button': { color: '#d32f2f' } }}>
            <BigCalendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              culture="es"
              messages={messages}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={(ev) => setSelectedEvent((ev as CalendarEvent).resource)}
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              views={['month', 'week', 'day', 'agenda']}
              style={{ height: '100%' }}
            />
          </Box>
        </CardContent>
      </Card>

      {selectedEvent && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight="bold">
                {selectedEvent.name}
              </Typography>
              <Chip
                label={EVENT_STATUS_LABELS[selectedEvent.status]}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {EVENT_TYPE_LABELS[selectedEvent.eventType]} ·{' '}
              {new Date(selectedEvent.startDate).toLocaleString('es-ES')} →{' '}
              {new Date(selectedEvent.endDate).toLocaleString('es-ES')}
            </Typography>
            {selectedEvent.circuitName && (
              <Typography variant="body2">📍 {selectedEvent.circuitName}</Typography>
            )}
            {selectedEvent.description && (
              <Typography variant="body2" mt={1}>
                {selectedEvent.description}
              </Typography>
            )}
            <Box mt={1} display="flex" gap={1} flexWrap="wrap">
              {selectedEvent.participants.map((p) => (
                <Chip key={p.id} label={p.fullName} size="small" />
              ))}
              {selectedEvent.vehicles.map((v) => (
                <Chip key={v.id} label={`🏎 ${v.name}`} size="small" variant="outlined" />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CalendarPage;
