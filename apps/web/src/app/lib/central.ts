import axios, { AxiosError } from 'axios';
import { CustomCfgConfig, ErrorResponseData } from './types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim().length > 0
    ? process.env.NEXT_PUBLIC_API_URL
    : '/api';

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 65000,
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

function isColdStartError(err: AxiosError) {
  const status = err.response?.status;
  const networkish = !err.response;
  const gateway = status === 502 || status === 503 || status === 504;
  const aborted = err.code === 'ECONNABORTED';
  return networkish || gateway || aborted;
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
  async (error: AxiosError & CustomCfgConfig) => {
    const cfg = error.config;
    const status = error?.response?.status;

    if (status === 401) {
      setAuthToken(undefined);
    }

    cfg.retryCount = cfg.retryCount ?? 0;

    const maxRetries = 2;
    const maxElapsedTime = 70000;

    const startedAt = cfg.startedAt ?? (Date.now() as number);

    if (isColdStartError(error)) {
      const elapsed = Date.now() - startedAt;
      if (elapsed < maxElapsedTime) {
        cfg.retryCount += 1;
        cfg.startedAt = startedAt;

        if (cfg.retryCount < maxRetries) {
          cfg.startedAt = Date.now();
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return http.request(cfg);
        }
      }
    }

    const data = error.response?.data as ErrorResponseData;

    const formatedError: string = data.message || data?.error || error.message || 'Unknown error';

    return Promise.reject(new Error(`API ${status ?? ''} ${formatedError}`.trim()));
  },
);
