import { iyzipay } from '../../config/iyzipay';
import { prisma } from '../../config/database';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export const PLAN_PRICES: Record<string, number> = {
  BASIC:  1499,
  PREMIUM: 2999,
  VIP:    4999,
};

export const getMySubscription = async (userId: string) => {
  return prisma.subscription.findUnique({
    where: { userId },
    include: {
      user: { include: { profile: true } },
      payments: { orderBy: { createdAt: 'desc' } },
    },
  });
};

export const createOrUpdateSubscription = async (userId: string, plan: SubscriptionPlan) => {
  const price = PLAN_PRICES[plan] ?? PLAN_PRICES.BASIC;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    throw new Error('Kullanıcı bulunamadı');
  }

  let subscription = await prisma.subscription.findUnique({ where: { userId } });

  if (subscription) {
    subscription = await prisma.subscription.update({
      where: { userId },
      data: { plan, status: SubscriptionStatus.PENDING, priceAmount: new Decimal(price) },
    });
  } else {
    subscription = await prisma.subscription.create({
      data: { userId, plan, status: SubscriptionStatus.PENDING, priceAmount: new Decimal(price) },
    });
  }

  const backendUrl = process.env.BACKEND_URL || 'https://curling-trouble-goatskin.ngrok-free.dev';

  const request = {
    locale: 'tr',
    conversationId: subscription.id,
    price: price.toString(),
    paidPrice: price.toString(),
    currency: 'TRY',
    basketId: `B-${subscription.id}`,
    paymentGroup: 'PRODUCT',
    callbackUrl: `${backendUrl}/api/v1/subscriptions/callback`,
    enabledInstallments: [1],
    buyer: {
      id: userId,
      name: user.profile?.firstName || 'User',
      surname: user.profile?.lastName || 'Surname',
      email: user.email,
      identityNumber: '11111111111',
      registrationAddress: 'Istanbul Turkey',
      city: 'Istanbul',
      country: 'Turkey',
    },
    shippingAddress: {
      contactName: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Istanbul Turkey',
    },
    billingAddress: {
      contactName: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Istanbul Turkey',
    },
    basketItems: [
      {
        id: plan,
        name: `${plan} Plan - Yasin Karakurt Personal Training`,
        category1: 'Fitness Coaching',
        itemType: 'VIRTUAL',
        price: price.toString(),
      },
    ],
  };

  return new Promise<{ checkoutFormContent?: string; error?: string }>((resolve, reject) => {
    iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const parsed = JSON.parse(result as string);

        if (parsed.status === 'failure' || parsed.errorCode) {
          resolve({ error: parsed.errorMessage || parsed.errorCode || 'Ödeme başlatılamadı' });
          return;
        }

        resolve({ checkoutFormContent: parsed.checkoutFormContent });
      } catch {
        resolve({ error: 'Iyzico yanıtı parse edilemedi' });
      }
    });
  });
};

export const verifySubscriptionPayment = async (token: string) => {
  const request = {
    locale: 'tr',
    conversationId: token,
    token,
  };

  return new Promise<{ status: string; paymentId?: string; error?: string }>((resolve, reject) => {
    iyzipay.checkoutForm.retrieve(request, async (err: any, result: any) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const parsed = JSON.parse(result as string);

        if (parsed.status === 'success' || parsed.status === 'SUCCESS') {
          const subscription = await prisma.subscription.findUnique({
            where: { id: parsed.conversationId },
          });

          if (subscription) {
            const now = new Date();
            const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: SubscriptionStatus.ACTIVE,
                startDate: now,
                endDate,
                iyzicoToken: token,
                lastPaymentDate: now,
                nextPaymentDate: endDate,
              },
            });

            await prisma.payment.create({
              data: {
                subscriptionId: subscription.id,
                amount: subscription.priceAmount ?? new Decimal(PLAN_PRICES[subscription.plan] ?? 1499),
                currency: 'TRY',
                status: 'SUCCESS',
                iyzicoPaymentId: parsed.paymentId?.toString(),
                paidAt: now,
              },
            });
          }

          resolve({ status: 'success', paymentId: parsed.paymentId?.toString() });
        } else {
          resolve({ status: parsed.status || 'failure', error: parsed.errorMessage || parsed.errorCode });
        }
      } catch {
        resolve({ status: 'failure', error: 'Callback parse hatası' });
      }
    });
  });
};

export const cancelSubscription = async (userId: string) => {
  return prisma.subscription.updateMany({
    where: { userId, status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING] } },
    data: { status: SubscriptionStatus.CANCELLED },
  });
};