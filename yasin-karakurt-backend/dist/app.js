"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// 1. Render proxy'si için şart (Gerçek IP'yi okuyabilmek için)
app.set('trust proxy', 1);
// 2. Güvenlik başlıkları
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// 3. CORS Ayarları
const corsOptions = {
    origin: (origin, callback) => {
        // Origin yoksa (Postman, server-to-server, curl) izin ver
        if (!origin)
            return callback(null, true);
        const isAllowed = origin === 'http://localhost:3000' ||
            origin === 'http://localhost:4000' ||
            origin === process.env.FRONTEND_URL ||
            origin.endsWith('.vercel.app') || // Vercel'in tüm alt domainlerine izin ver
            origin.endsWith('.ngrok-free.app') ||
            origin.endsWith('.ngrok-free.dev') ||
            origin.endsWith('.ngrok.io');
        if (isAllowed)
            return callback(null, true);
        return callback(new Error(`CORS: ${origin} izinli değil`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'ngrok-skip-browser-warning',
        'x-skip-browser-warning',
    ],
};
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions)); // Preflight (OPTIONS) isteklerini açıkça yakala
// 4. Geliştirici logları
app.use((0, morgan_1.default)(env_1.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
// 5. Body Parser (Gelen JSON verisini okumak için çok kritik)
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// 6. Statik dosyalar (Geriye dönük uyumluluk için kalsın)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/uploads/checkins', express_1.default.static(path_1.default.join(__dirname, '../uploads/checkins')));
app.use('/uploads/programs', express_1.default.static(path_1.default.join(__dirname, '../uploads/programs')));
// 7. Global Rate Limiter
const limiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);
// 8. Auth Rate Limiter (Canlı ortam için biraz esnetildi)
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Çok fazla deneme! Lütfen 15 dk bekleyin.' }
});
app.use('/api/v1/auth', authLimiter);
// 9. Sağlık kontrolü
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: env_1.env.NODE_ENV, timestamp: new Date().toISOString() });
});
// 10. Ana Rotalar
app.use('/api/v1', routes_1.default);
// 11. Hata yakalayıcılar
app.use(error_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
exports.default = app;
