"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSubscription = exports.verifySubscriptionPayment = exports.createOrUpdateSubscription = exports.getMySubscription = exports.PLAN_PRICES = void 0;
const iyzipay_1 = require("../../config/iyzipay");
const database_1 = require("../../config/database");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
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
    const price = exports.PLAN_PRICES[plan] ?? exports.PLAN_PRICES.BASIC;
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
    });
    if (!user) {
        throw new Error('Kullanıcı bulunamadı');
    }
    let subscription = await database_1.prisma.subscription.findUnique({ where: { userId } });
    if (subscription) {
        subscription = await database_1.prisma.subscription.update({
            where: { userId },
            data: { plan, status: client_1.SubscriptionStatus.PENDING, priceAmount: new library_1.Decimal(price) },
        });
    }
    else {
        subscription = await database_1.prisma.subscription.create({
            data: { userId, plan, status: client_1.SubscriptionStatus.PENDING, priceAmount: new library_1.Decimal(price) },
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
    return new Promise((resolve, reject) => {
        iyzipay_1.iyzipay.checkoutFormInitialize.create(request, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                const parsed = JSON.parse(result);
                if (parsed.status === 'failure' || parsed.errorCode) {
                    resolve({ error: parsed.errorMessage || parsed.errorCode || 'Ödeme başlatılamadı' });
                    return;
                }
                resolve({ checkoutFormContent: parsed.checkoutFormContent });
            }
            catch {
                resolve({ error: 'Iyzico yanıtı parse edilemedi' });
            }
        });
    });
};
exports.createOrUpdateSubscription = createOrUpdateSubscription;
const verifySubscriptionPayment = async (token) => {
    const request = {
        locale: 'tr',
        conversationId: token,
        token,
    };
    return new Promise((resolve, reject) => {
        iyzipay_1.iyzipay.checkoutForm.retrieve(request, async (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                const parsed = JSON.parse(result);
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
                    }
                    resolve({ status: 'success', paymentId: parsed.paymentId?.toString() });
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
