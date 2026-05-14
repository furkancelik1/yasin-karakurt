import { SubscriptionPlan } from '@prisma/client';
import prisma from '../../config/database';
import { iyzipay } from '../../config/iyzipay'; // { } eklendi
import { env } from '../../config/env';

export const getMySubscription = async (userId: string) => {
  return await prisma.subscription.findUnique({
    where: { userId },
  });
};

export const createOrUpdateSubscription = async (userId: string, plan: SubscriptionPlan) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) return { error: 'Kullanıcı bulunamadı' };

  const priceMap: Record<SubscriptionPlan, string> = {
    BASIC: '1.0',
    PREMIUM: '1.0',
    VIP: '1.0',
  };

  const price = priceMap[plan];
  const conversationId = Math.random().toString(36).substring(7);

  const request = {
    locale: 'tr',
    conversationId,
    price,
    paidPrice: price,
    currency: 'TRY',
    basketId: `B_${userId}_${Date.now()}`,
    paymentGroup: 'PRODUCT',
    callbackUrl: `${env.BACKEND_URL}/api/v1/subscriptions/callback`,
    enabledInstallments: [1],
    paymentSource: 'YASIN_KARAKURT_COACHING',
    buyer: {
      id: userId,
      name: user.profile?.firstName || 'Ahmet Furkan',
      surname: user.profile?.lastName || 'Celik',
      gsmNumber: '+905555555555',
      email: user.email,
      identityNumber: '74971543784',
      lastLoginDate: '2013-10-05 12:43:35',
      registrationDate: '2013-01-01 10:00:00',
      registrationAddress: 'Nispetiye Mah. Donanma Sok. No:6',
      ip: '85.34.78.112',
      city: 'Istanbul',
      country: 'Turkey',
      zipCode: '34340',
    },
    shippingAddress: {
      contactName: `${user.profile?.firstName || 'Ahmet Furkan'} ${user.profile?.lastName || 'Celik'}`,
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Nispetiye Mah. Donanma Sok. No:6',
      zipCode: '34340',
    },
    billingAddress: {
      contactName: `${user.profile?.firstName || 'Ahmet Furkan'} ${user.profile?.lastName || 'Celik'}`,
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Nispetiye Mah. Donanma Sok. No:6',
      zipCode: '34340',
    },
    basketItems: [
      {
        id: `PLAN_${plan}`,
        name: `${plan} Plan Coaching`,
        category1: 'Coaching',
        itemType: 'VIRTUAL',
        price,
      },
    ],
  };

  await prisma.subscription.upsert({
    where: { userId },
    update: { plan, status: 'PENDING', priceAmount: parseFloat(price) },
    create: {
      userId,
      plan,
      status: 'PENDING',
      priceAmount: parseFloat(price),
      currency: 'TRY',
    },
  });

  return new Promise<{ checkoutFormContent?: string; paymentPageUrl?: string; error?: string }>((resolve) => {
    iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
      if (err) return resolve({ error: 'Iyzico sunucusuna bağlanılamadı' });

      const res = typeof result === 'string' ? JSON.parse(result) : result;

      if (res.status === 'failure') {
        return resolve({ error: res.errorMessage || 'Ödeme başlatılamadı' });
      }

      const paymentPageUrl = res.paymentPageUrl || null;
      const checkoutFormContent = res.checkoutFormContent || null;

      if (!paymentPageUrl && !checkoutFormContent) {
        return resolve({ error: 'Geçerli bir ödeme kaynağı bulunamadı' });
      }

      resolve({ checkoutFormContent, paymentPageUrl });
    });
  });
};

export const verifySubscriptionPayment = async (token: string) => {
  return new Promise<any>((resolve) => {
    iyzipay.checkoutForm.retrieve({ locale: 'tr', token }, async (err: any, result: any) => {
      const res = typeof result === 'string' ? JSON.parse(result) : result;
      if (res.status === 'success' || res.status === 'SUCCESS') {
        const userId = res.basketId?.split('_')[1];
        if (userId) {
          await prisma.subscription.update({
            where: { userId },
            data: {
              status: 'ACTIVE',
              iyzicoToken: token,
              lastPaymentDate: new Date(),
              startDate: new Date(),
            },
          });
        }
      }
      resolve(res);
    });
  });
};

export const cancelSubscription = async (userId: string) => {
  return await prisma.subscription.update({
    where: { userId },
    data: { status: 'CANCELLED' },
  });
};