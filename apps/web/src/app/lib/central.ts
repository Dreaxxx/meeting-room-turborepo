import axios from 'axios';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim().length > 0
    ? process.env.NEXT_PUBLIC_API_URL
    : '/api';

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthToken(token?: string) {
  if (token) {
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  } else {
    delete http.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }
}

export function bootstrapAuth() {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (token) {
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

http.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const text =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Unknown error';
    if (status === 401) {
      setAuthToken(undefined);
    }

    return Promise.reject(new Error(`API ${status ?? ''} ${text}`.trim()));
  },
);
