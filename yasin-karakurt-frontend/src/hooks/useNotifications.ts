'use client';

import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useNotificationStore } from '@/stores/notificationStore';

export const useNotifications = () => {
  useSocket();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  };
};