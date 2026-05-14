"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSubscription = exports.verifySubscriptionPayment = exports.createOrUpdateSubscription = exports.getMySubscription = exports.PLAN_PRICES = void 0;
const database_1 = __importDefault(require("../../config/database"));
const iyzipay_1 = require("../../config/iyzipay");
const env_1 = require("../../config/env");
exports.PLAN_PRICES = {
    BASIC: 1499,
    PREMIUM: 2999,
    VIP: 4999,
};
// Iyzico Sandbox sabitleri (test ortamı için beyaz listede olan değerler)
const IYZICO_SANDBOX = {
    identityNumber: '74971543784', // TC algoritması geçerli sandbox test numarası
    gsmNumber: '+905555555555', // Standart sandbox GSM
    ip: '85.34.78.112', // Standart sandbox IP
    defaultAddress: 'Nispetiye Mah. Donanma Sok. No:6, Istanbul',
    city: 'Istanbul',
    country: 'Turkey',
    zipCode: '34340',
};
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
    // Dinamik kullanıcı verileri (veritabanından çekiliyor)
    const firstName = user.profile?.firstName || 'Musteri';
    const lastName = user.profile?.lastName || 'Kullanici';
    const fullName = `${firstName} ${lastName}`;
    const email = user.email;
    const gsmNumber = user.profile?.phone || IYZICO_SANDBOX.gsmNumber;
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
            name: firstName,
            surname: lastName,
            gsmNumber,
            email,
            identityNumber: IYZICO_SANDBOX.identityNumber,
            lastLoginDate: new Date().toISOString().split('T')[0],
            registrationDate: new Date().toISOString().split('T')[0],
            registrationAddress: IYZICO_SANDBOX.defaultAddress,
            ip: IYZICO_SANDBOX.ip,
            city: IYZICO_SANDBOX.city,
            country: IYZICO_SANDBOX.country,
            zipCode: IYZICO_SANDBOX.zipCode,
        },
        shippingAddress: {
            contactName: fullName,
            city: IYZICO_SANDBOX.city,
            country: IYZICO_SANDBOX.country,
            address: IYZICO_SANDBOX.defaultAddress,
            zipCode: IYZICO_SANDBOX.zipCode,
        },
        billingAddress: {
            contactName: fullName,
            city: IYZICO_SANDBOX.city,
            country: IYZICO_SANDBOX.country,
            address: IYZICO_SANDBOX.defaultAddress,
            zipCode: IYZICO_SANDBOX.zipCode,
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
