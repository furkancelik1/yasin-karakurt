'use client';

import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  incrementUnreadCount: () => void;
  setUnreadCount: (count: number | ((prev: number) => number)) => void;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));
    toast(notification.title, {
      description: notification.message,
      duration: 5000,
      style: {
        background: '#1a1a1a',
        border: '#dc2626 solid 1px',
        color: '#fafafa',
      },
      icon: '🔔',
    });
  },

  incrementUnreadCount: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }));
  },

  setUnreadCount: (countOrUpdater) => {
    set((state) => ({
      unreadCount: typeof countOrUpdater === 'function'
        ? countOrUpdater(state.unreadCount)
        : countOrUpdater,
    }));
  },

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<{ success: boolean; data: Notification[] }>('/notifications');
      if (data.success) {
        set({ notifications: data.data || [] });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get<{ success: boolean; data: { count: number } }>('/notifications/unread-count');
      if (data.success) {
        set({ unreadCount: data.data.count });
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  markAsRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },
}));