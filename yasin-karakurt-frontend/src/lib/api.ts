import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 15_000,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefresh);
          document.cookie = `yk_access=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`;

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        document.cookie = 'yk_access=; path=/; max-age=0; SameSite=Lax';
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;