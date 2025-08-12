import { useState, useEffect } from 'react';

// Interfaces
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  teamId: number;
  teamName?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  active: boolean;
}

export enum UserRole {
  MANAGER = 'MANAGER',
  PILOT = 'PILOT',
  MECHANIC = 'MECHANIC',
  ENGINEER = 'ENGINEER',
  LOGISTICS = 'LOGISTICS',
  FINANCE = 'FINANCE',
  MEDIA = 'MEDIA',
  GUEST = 'GUEST'
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Estado global simple
let authState: AuthState = {
  user: {
    id: 1,
    email: 'demo@racing.com',
    firstName: 'Demo',
    lastName: 'User',
    role: UserRole.MANAGER,
    teamId: 1,
    teamName: 'Racing Team Demo',
    phoneNumber: '+1234567890',
    licenseNumber: 'RT001',
    licenseExpiry: '2025-12-31',
    active: true
  },
  token: 'demo-token-auto',
  isAuthenticated: true,
  isLoading: false,
  error: null
};

const listeners: Array<() => void> = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

// Hook personalizado para el estado de autenticación
export const useAuthStore = () => {
  const [state, setState] = useState(authState);

  useEffect(() => {
    const listener = () => setState({ ...authState });
    listeners.push(listener);
    
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      authState.isLoading = true;
      authState.error = null;
      notifyListeners();

      // Simulación de login
      if (email === 'admin@racing.com' && password === 'admin123') {
        authState.user = {
          id: 1,
          email: 'admin@racing.com',
          firstName: 'Admin',
          lastName: 'Racing',
          role: UserRole.MANAGER,
          teamId: 1,
          teamName: 'Racing Team Demo',
          phoneNumber: '+1234567890',
          licenseNumber: 'RT001',
          licenseExpiry: '2025-12-31',
          active: true
        };
        authState.token = 'demo-token-123';
        authState.isAuthenticated = true;
      } else {
        throw new Error('Credenciales incorrectas');
      }

      authState.isLoading = false;
      notifyListeners();
    } catch (error: any) {
      authState.user = null;
      authState.token = null;
      authState.isAuthenticated = false;
      authState.isLoading = false;
      authState.error = error.message || 'Error de autenticación';
      notifyListeners();
      throw error;
    }
  };

  const logout = () => {
    authState.user = null;
    authState.token = null;
    authState.isAuthenticated = false;
    authState.error = null;
    notifyListeners();
  };

  const clearError = () => {
    authState.error = null;
    notifyListeners();
  };

  const setLoading = (loading: boolean) => {
    authState.isLoading = loading;
    notifyListeners();
  };

  const refreshUser = async () => {
    // Simulación de refresh
    return Promise.resolve();
  };

  return {
    ...state,
    login,
    logout,
    clearError,
    setLoading,
    refreshUser
  };
};