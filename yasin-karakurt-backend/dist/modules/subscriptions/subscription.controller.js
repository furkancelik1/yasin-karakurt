"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancel = exports.paymentCallback = exports.initiate = exports.getMy = void 0;
const subService = __importStar(require("./subscription.service"));
const getMy = async (req, res, next) => {
    try {
        const data = await subService.getMySubscription(req.user.sub);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getMy = getMy;
const initiate = async (req, res, next) => {
    try {
        const plan = req.body.plan;
        if (!plan || !['BASIC', 'PREMIUM', 'VIP'].includes(plan)) {
            res.status(400).json({ success: false, message: 'Geçerli bir plan seçin: BASIC, PREMIUM, VIP' });
            return;
        }
        const data = await subService.createOrUpdateSubscription(req.user.sub, plan);
        if (data.error) {
            res.status(200).json({ success: false, message: data.error });
            return;
        }
        // DİKKAT: paymentPageUrl artık frontend'e iletiliyor
        res.status(201).json({
            success: true,
            data: {
                checkoutFormContent: data.checkoutFormContent,
                paymentPageUrl: data.paymentPageUrl
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.initiate = initiate;
const paymentCallback = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) {
            const failUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?payment=failed&reason=no_token`;
            res.redirect(302, failUrl);
            return;
        }
        const result = await subService.verifySubscriptionPayment(token);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const success = result.status === 'success' || result.status === 'SUCCESS';
        const redirectUrl = success
            ? `${frontendUrl}/dashboard?payment=success`
            : `${frontendUrl}/dashboard?payment=failed&reason=${encodeURIComponent(result.error || 'payment_failed')}`;
        res.redirect(302, redirectUrl);
    }
    catch (err) {
        const failUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?payment=failed&reason=callback_error`;
        res.redirect(302, failUrl);
    }
};
exports.paymentCallback = paymentCallback;
const cancel = async (req, res, next) => {
    try {
        const data = await subService.cancelSubscription(req.user.sub);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.cancel = cancel;
