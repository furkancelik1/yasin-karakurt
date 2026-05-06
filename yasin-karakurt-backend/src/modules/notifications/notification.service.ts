import { prisma } from '../../config/database';
import { emitNotification } from '../../socket';
import { NotificationType } from '@prisma/client';

interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
}

export const createNotification = async (input: CreateNotificationInput) => {
  const { userId, title, message, type = 'SYSTEM' } = input;

  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
    },
  });

  emitNotification(userId, {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  });

  return notification;
};

export const getNotificationsByUser = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
};

export const markAsRead = async (notificationId: string, userId: string) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

export const getUnreadCount = async (userId: string) => {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
};