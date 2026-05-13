import { iyzipay } from '../../config/iyzipay';
import { prisma } from '../../config/database';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export const PLAN_PRICES: Record<string, number> = {
  BASIC: 1499,
  PREMIUM: 2999,
  VIP: 4999,
};

export const createOrUpdateSubscription = async (userId: string, plan: SubscriptionPlan) => {
  const price = PLAN_PRICES[plan] ?? PLAN_PRICES.BASIC;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) throw new Error('Kullanıcı bulunamadı');

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

  // IYZICO'NUN EN SEVDİĞİ STANDART TEST VERİLERİ
  const request = {
    locale: 'tr',
    conversationId: subscription.id,
    price: price.toString(),
    paidPrice: price.toString(),
    currency: 'TRY',
    basketId: 'B' + subscription.id,
    paymentGroup: 'PRODUCT',
    callbackUrl: `${backendUrl}/api/v1/subscriptions/callback`,
    enabledInstallments: [1],
    buyer: {
      id: userId,
      name: user.profile?.firstName || 'Furkan',
      surname: user.profile?.lastName || 'Celik',
      gsmNumber: '+905555555555', // Manuel olarak bu formatta kalsın
      email: user.email,
      identityNumber: '11111111111',
      registrationAddress: 'Nispetiye Mah. Donanma Sok. No:6',
      city: 'Istanbul',
      country: 'Turkey',
      zipCode: '34340'
    },
    shippingAddress: {
      contactName: (user.profile?.firstName + ' ' + user.profile?.lastName) || 'Furkan Celik',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Nispetiye Mah. Donanma Sok. No:6',
      zipCode: '34340'
    },
    billingAddress: {
      contactName: (user.profile?.firstName + ' ' + user.profile?.lastName) || 'Furkan Celik',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Nispetiye Mah. Donanma Sok. No:6',
      zipCode: '34340'
    },
    basketItems: [
      {
        id: plan,
        name: `${plan} Plan - Coaching`,
        category1: 'Fitness',
        itemType: 'VIRTUAL',
        price: price.toString(),
      },
    ],
  };

  return new Promise<{ checkoutFormContent?: string; error?: string }>((resolve) => {
    iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
      // --- HATA YAKALAYICI (TERMINALDE GORECEKSIN) ---
      console.log("---------- IYZICO YANITI ----------");
      console.log(JSON.stringify(result, null, 2));
      console.log("-----------------------------------");

      if (err) {
        return resolve({ error: 'Iyzico bağlantı hatası' });
      }

      if (result.status === 'failure') {
        return resolve({ error: result.errorMessage || 'Ödeme başlatılamadı' });
      }

      resolve({ checkoutFormContent: result.checkoutFormContent });
    });
  });
};

// ... verifySubscriptionPayment ve cancelSubscription fonksiyonlarını altına ekleyebilirsin