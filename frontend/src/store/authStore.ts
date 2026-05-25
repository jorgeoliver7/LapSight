import { create } from 'zustand';
import { AxiosError } from 'axios';
import { authApi, LoginPayload, RegisterPayload } from '../api/auth';
import { registerUnauthorizedHandler } from '../api/client';
import type { User } from '../types';

export { UserRole } from '../types';
export type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

const extractError = (err: unknown, fallback: string): string => {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || fallback;
  }
  return fallback;
};

export const useAuthStore = create<AuthState>()(
  (set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const payload: LoginPayload = { email, password };
        const response = await authApi.login(payload);
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        const message = extractError(err, 'Authentication error');
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: message,
        });
        throw err;
      }
    },

    register: async (payload: RegisterPayload) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authApi.register(payload);
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        const message = extractError(err, 'Registration error');
        set({ isLoading: false, error: message });
        throw err;
      }
    },

    demoLogin: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await authApi.demo();
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        const message = extractError(err, 'Demo unavailable');
        set({ isLoading: false, error: message });
        throw err;
      }
    },

    logout: async () => {
      try {
        await authApi.logout();
      } catch {
        // Clear session even if server call fails
      }
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    },

    hydrate: async () => {
      set({ isLoading: true });
      try {
        const user = await authApi.me();
        set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },

    clearError: () => set({ error: null }),
  })
);

registerUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});
