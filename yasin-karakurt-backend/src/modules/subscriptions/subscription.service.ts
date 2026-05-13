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
  const buyerName = user.profile?.firstName || 'Ahmet Furkan';
  const buyerSurname = user.profile?.lastName || 'Celik';
  const contactName = `${buyerName} ${buyerSurname}`;

  const request = {
    locale: 'tr',
    conversationId: subscription.id,
    price: '1.00',
    paidPrice: '1.00',
    currency: 'TRY',
    basketId: 'B' + subscription.id,
    paymentGroup: 'PRODUCT',
    callbackUrl: `${backendUrl}/api/v1/subscriptions/callback`,
    enabledInstallments: [1],
    buyer: {
      id: userId,
      name: buyerName,
      surname: buyerSurname,
      gsmNumber: '+905555555555',
      email: user.email,
      identityNumber: '74971543784',
      ip: '85.34.78.112',
      registrationAddress: 'Nispetiye Mah. Donanma Sok. No:6',
      city: 'Istanbul',
      country: 'Turkey',
      zipCode: '34340'
    },
    shippingAddress: {
      contactName,
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Nispetiye Mah. Donanma Sok. No:6',
      zipCode: '34340'
    },
    billingAddress: {
      contactName,
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
        price: '1.00',
      },
    ],
  };

  return new Promise<{ checkoutFormContent?: string; paymentPageUrl?: string; error?: string }>((resolve) => {
    iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
      console.log("---------- IYZICO YANITI ----------");
      console.log(JSON.stringify(result, null, 2));
      console.log("-----------------------------------");

      if (err) {
        return resolve({ error: 'Iyzico bağlantı hatası' });
      }

      if (result.status === 'failure') {
        return resolve({ error: result.errorMessage || 'Ödeme başlatılamadı' });
      }

      resolve({
        checkoutFormContent: result.checkoutFormContent,
        paymentPageUrl: result.paymentPageUrl,
      });
    });
  });
};

// ... verifySubscriptionPayment ve cancelSubscription fonksiyonlarını altına ekleyebilirsin