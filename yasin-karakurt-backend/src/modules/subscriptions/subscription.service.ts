import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { SubscriptionPlan } from '@prisma/client';

export const getMySubscription = async (userId: string) => {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    include: { payments: { orderBy: { createdAt: 'desc' }, take: 5 } },
  });
  if (!sub) throw new AppError('Abonelik bulunamadı', 404);
  return sub;
};

export const createOrUpdateSubscription = async (userId: string, plan: SubscriptionPlan) => {
  return prisma.subscription.upsert({
    where: { userId },
    create: { userId, plan, status: 'PENDING' },
    update: { plan, status: 'PENDING' },
  });
};

export const activateSubscription = async (subscriptionId: string, iyzicoToken: string) => {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'ACTIVE',
      iyzicoToken,
      startDate: new Date(),
      lastPaymentDate: new Date(),
    },
  });
};

export const cancelSubscription = async (userId: string) => {
  return prisma.subscription.update({
    where: { userId },
    data: { status: 'CANCELLED' },
  });
};
