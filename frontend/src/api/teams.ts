import { apiClient } from './client';
import type { Team, VehicleCategory } from '../types';

export interface TeamRequest {
  name: string;
  description?: string;
  logoUrl?: string;
  primaryCategory: VehicleCategory;
  contactEmail?: string;
  contactPhone?: string;
  headquartersLocation?: string;
}

export const teamsApi = {
  list: () => apiClient.get<Team[]>('/teams').then((r) => r.data),
  get: (id: number) => apiClient.get<Team>(`/teams/${id}`).then((r) => r.data),
  create: (payload: TeamRequest) => apiClient.post<Team>('/teams', payload).then((r) => r.data),
  update: (id: number, payload: TeamRequest) =>
    apiClient.put<Team>(`/teams/${id}`, payload).then((r) => r.data),
  remove: (id: number) => apiClient.delete<void>(`/teams/${id}`).then((r) => r.data),
};
