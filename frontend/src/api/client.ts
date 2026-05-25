import axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let onUnauthorized: (() => void) | null = null;

export const registerUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);
