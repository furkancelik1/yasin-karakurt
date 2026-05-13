"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.markAllAsRead = exports.markAsRead = exports.getNotificationsByUser = exports.createNotification = void 0;
const database_1 = require("../../config/database");
const socket_1 = require("../../socket");
const createNotification = async (input) => {
    const { userId, title, message, type = 'SYSTEM' } = input;
    const notification = await database_1.prisma.notification.create({
        data: {
            userId,
            title,
            message,
            type,
        },
    });
    (0, socket_1.emitNotification)(userId, {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
    });
    return notification;
};
exports.createNotification = createNotification;
const getNotificationsByUser = async (userId) => {
    return database_1.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
};
exports.getNotificationsByUser = getNotificationsByUser;
const markAsRead = async (notificationId, userId) => {
    const notification = await database_1.prisma.notification.findFirst({
        where: { id: notificationId, userId },
    });
    if (!notification) {
        throw new Error('Notification not found');
    }
    return database_1.prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
    });
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (userId) => {
    return database_1.prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });
};
exports.markAllAsRead = markAllAsRead;
const getUnreadCount = async (userId) => {
    return database_1.prisma.notification.count({
        where: { userId, isRead: false },
    });
};
exports.getUnreadCount = getUnreadCount;
