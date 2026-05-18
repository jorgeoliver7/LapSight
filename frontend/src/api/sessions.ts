import { apiClient } from './client';
import type {
  Session,
  SessionAnalytics,
  SessionType,
  TireCompound,
  TrackCondition,
} from '../types';

export interface SessionMetadata {
  name: string;
  circuit?: string;
  sessionDate: string;
  sessionType: SessionType;
  trackCondition?: TrackCondition;
  durationMinutes?: number;
  notes?: string;
  vehicleId?: number;
  driverId?: number;
}

export interface ManualLap {
  lapNumber: number;
  lapTime: string;
  sector1?: string;
  sector2?: string;
  sector3?: string;
  valid?: boolean;
  compound?: TireCompound;
  notes?: string;
}

export interface ManualSessionRequest extends SessionMetadata {
  laps: ManualLap[];
}

export const sessionsApi = {
  list: () => apiClient.get<Session[]>('/sessions').then((r) => r.data),
  get: (id: number) => apiClient.get<Session>(`/sessions/${id}`).then((r) => r.data),
  analytics: (id: number) =>
    apiClient.get<SessionAnalytics>(`/sessions/${id}/analytics`).then((r) => r.data),
  remove: (id: number) => apiClient.delete<void>(`/sessions/${id}`).then((r) => r.data),
  upload: (metadata: SessionMetadata, file: File) => {
    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', file);
    return apiClient
      .post<Session>('/sessions', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
  createManual: (payload: ManualSessionRequest) =>
    apiClient.post<Session>('/sessions/manual', payload).then((r) => r.data),
  downloadTemplate: async () => {
    const response = await apiClient.get<Blob>('/sessions/template', {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lap-times-template.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

/** Formatea milisegundos a "m:ss.mmm" o "ss.mmm" si <60s. */
export const formatLapTime = (ms?: number | null): string => {
  if (ms == null) return '—';
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  if (minutes === 0) return seconds.toFixed(3);
  return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`;
};

export const formatGap = (ms?: number | null): string => {
  if (ms == null) return '—';
  if (ms === 0) return '+0.000';
  const sign = ms > 0 ? '+' : '-';
  return `${sign}${(Math.abs(ms) / 1000).toFixed(3)}`;
};
