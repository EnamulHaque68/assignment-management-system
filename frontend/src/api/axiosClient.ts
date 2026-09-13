import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('assignment_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unwrap ApiResponse<T> & handle 401/403
axiosClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>;
    // If wrapped in ApiResponse envelope, return body.data
    if (body && typeof body === 'object' && 'success' in body) {
      if (!body.success) {
        return Promise.reject(new Error(body.message || 'Operation failed.'));
      }
      return body.data as any;
    }
    return response.data;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const serverMessage = data?.message || (typeof data === 'string' ? data : null);

      if (status === 401) {
        localStorage.removeItem('assignment_token');
        localStorage.removeItem('assignment_user');
        window.dispatchEvent(new CustomEvent('auth_unauthorized', { detail: { message: serverMessage || 'Session expired. Please log in again.' } }));
      } else if (status === 403) {
        window.dispatchEvent(new CustomEvent('auth_forbidden', { detail: { message: serverMessage || 'You do not have permission to perform this action.' } }));
      }

      const errorMessage = serverMessage || `Request failed with status code ${status}`;
      return Promise.reject(new Error(errorMessage));
    }

    return Promise.reject(new Error(error.message || 'Network error occurred.'));
  }
);
