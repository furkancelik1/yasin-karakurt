'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useNotificationStore } from '@/stores/notificationStore';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user, accessToken } = useAuth();
  const { addNotification, incrementUnreadCount } = useNotificationStore();

  const connect = useCallback(() => {
    if (!accessToken || socketRef.current?.connected) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('new_notification', (notification) => {
      console.log('[Socket] New notification:', notification);
      addNotification(notification);
      incrementUnreadCount();
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    socketRef.current = socket;
  }, [accessToken, addNotification, incrementUnreadCount]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (user && accessToken) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, accessToken, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
  };
};