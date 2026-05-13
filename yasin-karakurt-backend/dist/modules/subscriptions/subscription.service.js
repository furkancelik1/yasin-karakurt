"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSubscription = exports.verifySubscriptionPayment = exports.createOrUpdateSubscription = exports.getMySubscription = exports.PLAN_PRICES = void 0;
const iyzipay_1 = require("../../config/iyzipay");
const database_1 = require("../../config/database");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
// 1. KAZARA SİLİNEN FİYAT LİSTESİ BURADA:
exports.PLAN_PRICES = {
    BASIC: 1499,
    PREMIUM: 2999,
    VIP: 4999,
};
const getMySubscription = async (userId) => {
    return database_1.prisma.subscription.findUnique({
        where: { userId },
        include: {
            user: { include: { profile: true } },
            payments: { orderBy: { createdAt: 'desc' } },
        },
    });
};
exports.getMySubscription = getMySubscription;
const createOrUpdateSubscription = async (userId, plan) => {
    const VALID_PLANS = ['BASIC', 'PREMIUM', 'VIP'];
    const safePlan = VALID_PLANS.includes(plan)
        ? plan
        : 'PREMIUM';
    try {
        const price = exports.PLAN_PRICES[safePlan] ?? exports.PLAN_PRICES.PREMIUM;
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        if (!user) {
            return { error: 'Kullanıcı bulunamadı' };
        }
        let subscription = await database_1.prisma.subscription.findUnique({ where: { userId } });
        if (subscription) {
            subscription = await database_1.prisma.subscription.update({
                where: { userId },
                data: { plan: safePlan, status: client_1.SubscriptionStatus.PENDING, priceAmount: new library_1.Decimal(price) },
            });
        }
        else {
            subscription = await database_1.prisma.subscription.create({
                data: { userId, plan: safePlan, status: client_1.SubscriptionStatus.PENDING, priceAmount: new library_1.Decimal(price) },
            });
        }
        const backendUrl = process.env.BACKEND_URL || 'https://curling-trouble-goatskin.ngrok-free.dev';
        const profile = user.profile;
        const safeFirstName = profile?.firstName || 'Danisan';
        const safeLastName = profile?.lastName || 'Kullanici';
        const safeFullName = `${safeFirstName} ${safeLastName}`.trim();
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
            windowType: 'responsive',
            buyer: {
                id: userId,
                name: safeFirstName,
                surname: safeLastName,
                gsmNumber: user.profile?.phone || '+905555555555',
                email: user.email,
                identityNumber: '11111111111',
                registrationAddress: 'Istanbul Turkey',
                city: 'Istanbul',
                country: 'Turkey',
            },
            shippingAddress: {
                contactName: safeFullName,
                city: 'Istanbul',
                country: 'Turkey',
                address: 'Istanbul Turkey',
            },
            billingAddress: {
                contactName: safeFullName,
                city: 'Istanbul',
                country: 'Turkey',
                address: 'Istanbul Turkey',
            },
            basketItems: [
                {
                    id: safePlan,
                    name: `${safePlan} Plan - Yasin Karakurt Personal Training`,
                    category1: 'Fitness Coaching',
                    itemType: 'VIRTUAL',
                    price: price.toString(),
                },
            ],
        };
        return new Promise((resolve) => {
            iyzipay_1.iyzipay.checkoutFormInitialize.create(request, (err, result) => {
                if (err) {
                    console.error('IYZICO KÜTÜPHANE HATASI:', err);
                    return resolve({ error: err.message || 'Iyzico servisine ulaşılamadı' });
                }
                console.log("IYZICO'DAN GELEN YANIT:", result);
                const parsed = typeof result === 'string' ? JSON.parse(result) : result;
                if (parsed.status === 'failure' || parsed.errorCode) {
                    return resolve({
                        error: parsed.errorMessage || parsed.errorCode || 'Ödeme başlatılamadı. Bilgilerinizi kontrol edin.',
                    });
                }
                resolve({ checkoutFormContent: parsed.checkoutFormContent });
            });
        });
    }
    catch (err) {
        console.error('createOrUpdateSubscription kritik hata:', err);
        return Promise.resolve({ error: err.message || 'Sunucu hatası oluştu. Lütfen tekrar deneyin.' });
    }
};
exports.createOrUpdateSubscription = createOrUpdateSubscription;
const verifySubscriptionPayment = async (token) => {
    const request = {
        locale: 'tr',
        conversationId: token,
        token,
    };
    return new Promise((resolve) => {
        iyzipay_1.iyzipay.checkoutForm.retrieve(request, async (err, result) => {
            if (err) {
                console.error('IYZICO VERIFY HATASI:', err);
                return resolve({ status: 'failure', error: err.message || 'Ödeme doğrulanamadı' });
            }
            try {
                const parsed = typeof result === 'string' ? JSON.parse(result) : result;
                if (parsed.status === 'success' || parsed.status === 'SUCCESS') {
                    const subscription = await database_1.prisma.subscription.findUnique({
                        where: { id: parsed.conversationId },
                    });
                    if (subscription) {
                        const now = new Date();
                        const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                        await database_1.prisma.subscription.update({
                            where: { id: subscription.id },
                            data: {
                                status: client_1.SubscriptionStatus.ACTIVE,
                                startDate: now,
                                endDate,
                                iyzicoToken: token,
                                lastPaymentDate: now,
                                nextPaymentDate: endDate,
                            },
                        });
                        await database_1.prisma.payment.create({
                            data: {
                                subscriptionId: subscription.id,
                                amount: subscription.priceAmount ?? new library_1.Decimal(exports.PLAN_PRICES[subscription.plan] ?? 1499),
                                currency: 'TRY',
                                status: 'SUCCESS',
                                iyzicoPaymentId: parsed.paymentId?.toString(),
                                paidAt: now,
                            },
                        });
                        await database_1.prisma.notification.create({
                            data: {
                                userId: subscription.userId,
                                title: 'Hoş geldiniz!',
                                message: 'Aboneliğiniz başarıyla aktif edildi. Gelişim yolculuğunuz başlıyor.',
                                type: 'SYSTEM',
                            },
                        });
                        const trainers = await database_1.prisma.user.findMany({
                            where: { role: 'TRAINER' },
                            select: { id: true },
                        });
                        for (const trainer of trainers) {
                            await database_1.prisma.notification.create({
                                data: {
                                    userId: trainer.id,
                                    title: 'Yeni danışan paketi!',
                                    message: 'Bir danışan yeni bir paket satın aldı.',
                                    type: 'SYSTEM',
                                },
                            });
                        }
                        resolve({ status: 'success', paymentId: parsed.paymentId?.toString() });
                    }
                    else {
                        resolve({ status: 'failure', error: 'Subscription not found' });
                    }
                }
                else {
                    resolve({ status: parsed.status || 'failure', error: parsed.errorMessage || parsed.errorCode });
                }
            }
            catch {
                resolve({ status: 'failure', error: 'Callback parse hatası' });
            }
        });
    });
};
exports.verifySubscriptionPayment = verifySubscriptionPayment;
const cancelSubscription = async (userId) => {
    return database_1.prisma.subscription.updateMany({
        where: { userId, status: { in: [client_1.SubscriptionStatus.ACTIVE, client_1.SubscriptionStatus.PENDING] } },
        data: { status: client_1.SubscriptionStatus.CANCELLED },
    });
};
exports.cancelSubscription = cancelSubscription;
