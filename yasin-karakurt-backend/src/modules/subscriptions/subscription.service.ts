import { iyzipay } from '../../config/iyzipay';
import { prisma } from '../../config/database';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export const PLAN_PRICES: Record<string, number> = {
  BASIC: 1499,
  PREMIUM: 2999,
  VIP: 4999,
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
  const originalPrice = PLAN_PRICES[plan] ?? PLAN_PRICES.BASIC;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) throw new Error('Kullanıcı bulunamadı');

  let subscription = await prisma.subscription.findUnique({ where: { userId } });

  if (subscription) {
    subscription = await prisma.subscription.update({
      where: { userId },
      data: { plan, status: SubscriptionStatus.PENDING, priceAmount: new Decimal(originalPrice) },
    });
  } else {
    subscription = await prisma.subscription.create({
      data: { userId, plan, status: SubscriptionStatus.PENDING, priceAmount: new Decimal(originalPrice) },
    });
  }

  const backendUrl = process.env.BACKEND_URL || 'https://curling-trouble-goatskin.ngrok-free.dev';

  // IYZICO HATA ÖNLEYİCİ GÜVENLİ DEĞERLER (AI'nin eklemeyi unuttuğu kısım)
  const safeFirstName = user.profile?.firstName || 'Danisan';
  const safeLastName = user.profile?.lastName || 'Kullanici';
  const safeFullName = `${safeFirstName} ${safeLastName}`.trim();
  const testPrice = '1.00';

  const request = {
    locale: 'tr',
    conversationId: subscription.id,
    price: testPrice,
    paidPrice: testPrice,
    currency: 'TRY',
    basketId: 'B' + subscription.id,
    paymentGroup: 'PRODUCT',
    callbackUrl: `${backendUrl}/api/v1/subscriptions/callback`,
    enabledInstallments: [1],
    buyer: {
      id: userId,
      name: safeFirstName,
      surname: safeLastName,
      gsmNumber: '+905555555555',
      email: user.email,
      identityNumber: '74971543784',
      registrationAddress: 'Nispetiye Mah. Donanma Sok. No:6',
      city: 'Istanbul',
      country: 'Turkey',
      zipCode: '34340',
      ip: '85.34.78.112'
    },
    shippingAddress: {
      contactName: safeFullName,
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Nispetiye Mah. Donanma Sok. No:6',
      zipCode: '34340'
    },
    billingAddress: {
      contactName: safeFullName,
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Nispetiye Mah. Donanma Sok. No:6',
      zipCode: '34340'
    },
    basketItems: [
      {
        id: plan,
        name: `${plan} Plan Coaching`,
        category1: 'Fitness',
        itemType: 'VIRTUAL',
        price: testPrice,
      },
    ],
  };

// DİKKAT: Promise dönüş tipine paymentPageUrl eklendi
  return new Promise<{ checkoutFormContent?: string; paymentPageUrl?: string; error?: string }>((resolve) => {
    iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
      console.log("IYZICO RAW RESULT:", JSON.stringify(result, null, 2));

      if (err) {
        return resolve({ error: 'Iyzico bağlantı hatası' });
      }

      const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;

      if (parsedResult.status === 'failure') {
        return resolve({ error: parsedResult.errorMessage || 'Ödeme başlatılamadı' });
      }

      // KESİN ÇÖZÜM: Iyzico linki vermese bile biz Token ile o linki zorla oluşturuyoruz!
      const token = parsedResult.token;
      const guaranteedPaymentUrl = parsedResult.paymentPageUrl || `https://sandbox-cpp.iyzipay.com?token=${token}`;

      resolve({ 
        checkoutFormContent: parsedResult.checkoutFormContent,
        paymentPageUrl: guaranteedPaymentUrl // <-- Artık controller'a kesin olarak gidiyor!
      });
    });
  });
};

export const verifySubscriptionPayment = async (token: string) => {
  const request = {
    locale: 'tr',
    conversationId: token,
    token,
  };

  return new Promise<{ status: string; paymentId?: string; error?: string }>((resolve) => {
    iyzipay.checkoutForm.retrieve(request, async (err: any, result: any) => {
      if (err) {
        console.error('IYZICO VERIFY HATASI:', err);
        return resolve({ status: 'failure', error: err.message || 'Ödeme doğrulanamadı' });
      }

      try {
        const parsed = typeof result === 'string' ? JSON.parse(result) : result;

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

            await prisma.notification.create({
              data: {
                userId: subscription.userId,
                title: 'Hoş geldiniz!',
                message: 'Aboneliğiniz başarıyla aktif edildi. Gelişim yolculuğunuz başlıyor.',
                type: 'SYSTEM',
              },
            });

            const trainers = await prisma.user.findMany({
              where: { role: 'TRAINER' },
              select: { id: true },
            });

            for (const trainer of trainers) {
              await prisma.notification.create({
                data: {
                  userId: trainer.id,
                  title: 'Yeni danışan paketi!',
                  message: 'Bir danışan yeni bir paket satın aldı.',
                  type: 'SYSTEM',
                },
              });
            }

            resolve({ status: 'success', paymentId: parsed.paymentId?.toString() });
          } else {
            resolve({ status: 'failure', error: 'Subscription not found' });
          }
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