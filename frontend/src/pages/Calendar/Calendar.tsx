import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Calendar as BigCalendar, dateFnsLocalizer, Event as RBCEvent, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { eventsApi } from '../../api/events';
import { Event, EventType, EVENT_TYPE_LABELS, EVENT_STATUS_LABELS } from '../../types';
import { PageHeader, Mono, Label, StatusTag, type StatusTone } from '../../components/apex';
import { colors, fonts } from '../../theme/tokens';
import { useTranslation } from 'react-i18next';

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: es }),
  getDay,
  locales,
});

const TYPE_TONE: Record<EventType, StatusTone> = {
  [EventType.RACE]: 'red',
  [EventType.QUALIFYING]: 'orange',
  [EventType.PRACTICE]: 'accent',
  [EventType.TEST]: 'cyan',
  [EventType.SHAKEDOWN]: 'cyan',
  [EventType.TRACKDAY]: 'accent',
  [EventType.TRAINING]: 'green',
  [EventType.MAINTENANCE]: 'yellow',
  [EventType.MEETING]: 'purple',
  [EventType.MEDIA]: 'mute',
  [EventType.SPONSOR_EVENT]: 'purple',
  [EventType.PRESENTATION]: 'purple',
  [EventType.TRAVEL]: 'mute',
  [EventType.OTHER]: 'mute',
};

const TONE_HEX: Record<StatusTone, string> = {
  accent: colors.accent,
  green: colors.green,
  yellow: colors.yellow,
  orange: colors.orange,
  red: colors.red,
  purple: colors.purple,
  cyan: colors.cyan,
  mute: colors.textMute,
};

interface CalendarEvent extends RBCEvent {
  resource: Event;
}

const CalendarPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState<Date>(new Date());

  const messages = {
    allDay: t('calendar.messages.allDay'),
    previous: '←',
    next: '→',
    today: t('calendar.messages.today'),
    month: t('calendar.messages.month'),
    week: t('calendar.messages.week'),
    day: t('calendar.messages.day'),
    agenda: t('calendar.messages.agenda'),
    date: t('calendar.messages.date'),
    time: t('calendar.messages.time'),
    event: t('calendar.messages.event'),
    noEventsInRange: t('calendar.messages.noEventsInRange'),
    showMore: (n: number) => t('calendar.messages.showMore', { n }),
  };

  useEffect(() => {
    setLoading(true);
    eventsApi
      .list()
      .then(setEvents)
      .catch((e: any) => setError(e?.response?.data?.message || t('calendar.loadError')))
      .finally(() => setLoading(false));
  }, [t]);

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

  const eventStyleGetter = (event: CalendarEvent) => {
    const hex = TONE_HEX[TYPE_TONE[event.resource.eventType] || 'mute'];
    return {
      style: {
        backgroundColor: `${hex}22`,
        color: hex,
        borderLeft: `3px solid ${hex}`,
        borderRadius: 0,
        fontSize: '10px',
        padding: '1px 6px',
      },
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: colors.accent }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <PageHeader
        eyebrow={t('calendar.eyebrow')}
        title={t('calendar.title')}
        subtitle={t('calendar.subtitle')}
      />

      {error && (
        <Alert severity="error" sx={{ borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Label tone="dim">{t('calendar.legendLabel')}</Label>
        <Box display="flex" flexWrap="wrap" gap={0.75}>
          {Object.values(EventType).map((t) => (
            <StatusTag key={t} tone={TYPE_TONE[t]} size="sm">
              {EVENT_TYPE_LABELS[t]}
            </StatusTag>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          p: 1.5,
        }}
      >
        <Box sx={{ height: 640 }}>
          <BigCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            culture={i18n.language?.startsWith('es') ? 'es' : 'en'}
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
      </Box>

      {selectedEvent && (
        <Box
          sx={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderLeft: `3px solid ${TONE_HEX[TYPE_TONE[selectedEvent.eventType]]}`,
            p: 2,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <span style={{ color: colors.text, fontWeight: 600, fontSize: 16 }}>
                {selectedEvent.name}
              </span>
              <StatusTag tone={TYPE_TONE[selectedEvent.eventType]} dot={false}>
                {EVENT_TYPE_LABELS[selectedEvent.eventType]}
              </StatusTag>
            </Box>
            <StatusTag tone="accent">{EVENT_STATUS_LABELS[selectedEvent.status]}</StatusTag>
          </Box>
          <Mono style={{ color: colors.textDim, fontSize: 11, display: 'block', marginBottom: 6 }}>
            {new Date(selectedEvent.startDate).toLocaleString(i18n.language)} →{' '}
            {new Date(selectedEvent.endDate).toLocaleString(i18n.language)}
          </Mono>
          {selectedEvent.circuitName && (
            <div style={{ color: colors.text, fontSize: 12, marginBottom: 4 }}>
              📍 {selectedEvent.circuitName}
            </div>
          )}
          {selectedEvent.description && (
            <div style={{ color: colors.textDim, fontSize: 12, marginTop: 8 }}>
              {selectedEvent.description}
            </div>
          )}
          {(selectedEvent.participants.length > 0 || selectedEvent.vehicles.length > 0) && (
            <Box mt={1.5} display="flex" gap={0.75} flexWrap="wrap">
              {selectedEvent.participants.map((p) => (
                <span
                  key={p.id}
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    color: colors.textDim,
                    border: `1px solid ${colors.border}`,
                    background: colors.surface2,
                    padding: '2px 8px',
                  }}
                >
                  {p.fullName}
                </span>
              ))}
              {selectedEvent.vehicles.map((v) => (
                <span
                  key={v.id}
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    color: colors.accent,
                    border: `1px solid ${colors.accent}`,
                    padding: '2px 8px',
                  }}
                >
                  🏎 {v.name}
                </span>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CalendarPage;
