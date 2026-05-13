'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import type { User } from '@/types';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  setTokens: (access: string, refresh: string, user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      setTokens: (accessToken, refreshToken, user) => {
        set({ accessToken, refreshToken, user });
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setCookie('yk_access', accessToken);
          } catch { /* localStorage unavailable */ }
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          get().setTokens(data.data.accessToken, data.data.refreshToken, data.data.user);
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', payload);
          get().setTokens(data.data.accessToken, data.data.refreshToken, data.data.user);
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch { /* ignore */ }
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            clearCookie('yk_access');
          } catch { /* localStorage unavailable */ }
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      refreshUser: async () => {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            set({ user: res.data.data });
          }
        } catch {
          /* ignore */
        }
      },
    }),
    { name: 'yk-auth', partialize: (s) => ({ user: s.user }) }
  )
);