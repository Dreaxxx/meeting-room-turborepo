import axios from 'axios';
import { http, setAuthToken } from './central';

export async function login(email: string, password: string) {
  const { data } = await http.post('/auth/login', { email, password });
  setAuthToken(data.accessToken);
  localStorage.setItem('token', data.accessToken);
  return data.user;
}

export async function register(email: string, password: string, name?: string) {
  const { data } = await http.post('/auth/signup', { email, password, name });
  setAuthToken(data.accessToken);
  localStorage.setItem('token', data.accessToken);
  return data.user;
}

export function logout() {
  localStorage.removeItem('token');
  setAuthToken(undefined);
}

export function bootstrapAuth() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    console.log('token', token);

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}
