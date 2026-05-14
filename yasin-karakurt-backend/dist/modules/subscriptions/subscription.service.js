"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSubscription = exports.verifySubscriptionPayment = exports.createOrUpdateSubscription = exports.getMySubscription = void 0;
const database_1 = __importDefault(require("../../config/database"));
const iyzipay_1 = require("../../config/iyzipay"); // { } eklendi
const env_1 = require("../../config/env");
const getMySubscription = async (userId) => {
    return await database_1.default.subscription.findUnique({
        where: { userId },
    });
};
exports.getMySubscription = getMySubscription;
const createOrUpdateSubscription = async (userId, plan) => {
    const user = await database_1.default.user.findUnique({
        where: { id: userId },
        include: { profile: true },
    });
    if (!user)
        return { error: 'Kullanıcı bulunamadı' };
    const priceMap = {
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
        callbackUrl: `${env_1.env.BACKEND_URL}/api/v1/subscriptions/callback`,
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
    await database_1.default.subscription.upsert({
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
    return new Promise((resolve) => {
        iyzipay_1.iyzipay.checkoutFormInitialize.create(request, (err, result) => {
            if (err)
                return resolve({ error: 'Iyzico sunucusuna bağlanılamadı' });
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
exports.createOrUpdateSubscription = createOrUpdateSubscription;
const verifySubscriptionPayment = async (token) => {
    return new Promise((resolve) => {
        iyzipay_1.iyzipay.checkoutForm.retrieve({ locale: 'tr', token }, async (err, result) => {
            const res = typeof result === 'string' ? JSON.parse(result) : result;
            if (res.status === 'success' || res.status === 'SUCCESS') {
                const userId = res.basketId?.split('_')[1];
                if (userId) {
                    await database_1.default.subscription.update({
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
exports.verifySubscriptionPayment = verifySubscriptionPayment;
const cancelSubscription = async (userId) => {
    return await database_1.default.subscription.update({
        where: { userId },
        data: { status: 'CANCELLED' },
    });
};
exports.cancelSubscription = cancelSubscription;
