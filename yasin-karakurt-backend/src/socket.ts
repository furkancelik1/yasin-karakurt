import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from './config/env';

let io: SocketServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.ALLOWED_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; role: string };
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.sub;
    console.log(`[Socket] User connected: ${userId} (${socket.id})`);

    socket.join(`user:${userId}`);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] User disconnected: ${userId} - ${reason}`);
    });
  });

  console.log('[Socket] Socket.io initialized');
  return io;
};

export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitNotification = (userId: string, notification: {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}) => {
  if (!io) return;
  io.to(`user:${userId}`).emit('new_notification', notification);
};