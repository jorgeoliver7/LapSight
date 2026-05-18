import { apiClient } from './client';
import type { Event, EventStatus, EventType } from '../types';

export interface EventRequest {
  name: string;
  description?: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  location?: string;
  circuitName?: string;
  status?: EventStatus;
  notes?: string;
  budgetAllocated?: number;
  actualCost?: number;
  participantIds?: number[];
  vehicleIds?: number[];
}

export const eventsApi = {
  list: () => apiClient.get<Event[]>('/events').then((r) => r.data),
  get: (id: number) => apiClient.get<Event>(`/events/${id}`).then((r) => r.data),
  create: (payload: EventRequest) =>
    apiClient.post<Event>('/events', payload).then((r) => r.data),
  update: (id: number, payload: EventRequest) =>
    apiClient.put<Event>(`/events/${id}`, payload).then((r) => r.data),
  remove: (id: number) => apiClient.delete<void>(`/events/${id}`).then((r) => r.data),
};
