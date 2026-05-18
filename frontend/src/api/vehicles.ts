import { apiClient } from './client';
import type { Vehicle, VehicleStatus, VehicleType } from '../types';

export interface VehicleRequest {
  name: string;
  vehicleType: VehicleType;
  chassisNumber?: string;
  engineNumber?: string;
  registrationNumber?: string;
  manufacturer?: string;
  model?: string;
  yearManufactured?: number;
  totalHours?: number;
  totalKilometers?: number;
  nextMaintenanceHours?: number;
  nextMaintenanceKm?: number;
  status?: VehicleStatus;
  notes?: string;
}

export const vehiclesApi = {
  list: () => apiClient.get<Vehicle[]>('/vehicles').then((r) => r.data),
  get: (id: number) => apiClient.get<Vehicle>(`/vehicles/${id}`).then((r) => r.data),
  create: (payload: VehicleRequest) =>
    apiClient.post<Vehicle>('/vehicles', payload).then((r) => r.data),
  update: (id: number, payload: VehicleRequest) =>
    apiClient.put<Vehicle>(`/vehicles/${id}`, payload).then((r) => r.data),
  remove: (id: number) => apiClient.delete<void>(`/vehicles/${id}`).then((r) => r.data),
};
