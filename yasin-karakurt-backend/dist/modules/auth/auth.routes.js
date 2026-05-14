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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController = __importStar(require("./auth.controller"));
const validate_middleware_1 = require("../../middleware/validate.middleware");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Brute-force saldırılarını engellemek için hız sınırlayıcı
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5, // Her IP için 15 dakikada maksimum 5 istek
    standardHeaders: true, // `RateLimit-*` header bilgilerini geri döndürür
    legacyHeaders: false, // `X-RateLimit-*` header'larını devre dışı bırakır
    message: {
        success: false,
        message: 'Çok fazla deneme yaptınız, lütfen 15 dakika sonra tekrar deneyin.'
    }
});
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Geçerli bir e-posta girin'),
    password: zod_1.z.string().min(8, 'Şifre en az 8 karakter olmalı'),
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
// Kayıt ve giriş rotalarına authLimiter eklendi
router.post('/register', authLimiter, (0, validate_middleware_1.validate)(registerSchema), authController.register);
router.post('/login', authLimiter, (0, validate_middleware_1.validate)(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', auth_middleware_1.authenticate, authController.logout);
router.get('/me', auth_middleware_1.authenticate, authController.me);
exports.default = router;
