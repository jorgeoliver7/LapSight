import { apiClient } from './client';
import type { User, UserRole } from '../types';

export interface UserCreateRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  licenseNumber?: string;
}

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  licenseNumber?: string;
  active?: boolean;
}

export const usersApi = {
  list: () => apiClient.get<User[]>('/users').then((r) => r.data),
  get: (id: number) => apiClient.get<User>(`/users/${id}`).then((r) => r.data),
  create: (payload: UserCreateRequest) =>
    apiClient.post<User>('/users', payload).then((r) => r.data),
  update: (id: number, payload: UserUpdateRequest) =>
    apiClient.put<User>(`/users/${id}`, payload).then((r) => r.data),
  remove: (id: number) => apiClient.delete<void>(`/users/${id}`).then((r) => r.data),
};
