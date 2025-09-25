import axios from 'axios';

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
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
    return Promise.reject(new Error(`API ${status ?? ''} ${text}`.trim()));
  },
);
