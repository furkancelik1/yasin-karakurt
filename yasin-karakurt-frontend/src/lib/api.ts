import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true' // <--- BU SATIR KRİTİK
  },
  timeout: 15_000,
  withCredentials: false,
});

/* Request Interceptor (Token ekleme kısmı) */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* Response Interceptor (Hata yakalama kısmı aynı kalsın) */
export default api;