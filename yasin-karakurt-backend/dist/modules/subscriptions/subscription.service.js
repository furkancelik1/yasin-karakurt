"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSubscription = exports.activateSubscription = exports.createOrUpdateSubscription = exports.getMySubscription = void 0;
const database_1 = require("../../config/database");
const error_middleware_1 = require("../../middleware/error.middleware");
const getMySubscription = async (userId) => {
    const sub = await database_1.prisma.subscription.findUnique({
        where: { userId },
        include: { payments: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });
    if (!sub)
        throw new error_middleware_1.AppError('Abonelik bulunamadı', 404);
    return sub;
};
exports.getMySubscription = getMySubscription;
const createOrUpdateSubscription = async (userId, plan) => {
    return database_1.prisma.subscription.upsert({
        where: { userId },
        create: { userId, plan, status: 'PENDING' },
        update: { plan, status: 'PENDING' },
    });
};
exports.createOrUpdateSubscription = createOrUpdateSubscription;
const activateSubscription = async (subscriptionId, iyzicoToken) => {
    return database_1.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
            status: 'ACTIVE',
            iyzicoToken,
            startDate: new Date(),
            lastPaymentDate: new Date(),
        },
    });
};
exports.activateSubscription = activateSubscription;
const cancelSubscription = async (userId) => {
    return database_1.prisma.subscription.update({
        where: { userId },
        data: { status: 'CANCELLED' },
    });
};
exports.cancelSubscription = cancelSubscription;
