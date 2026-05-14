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
const routes_1 = __importDefault(require("./routes")); // <--- Tüm rotalar buradan gelecek
const error_middleware_1 = require("./middleware/error.middleware");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.set('trust proxy', 1); // ngrok gibi proxy'lerin IP adreslerini doğru tanıması için şart
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const corsOptions = {
    origin: (origin, callback) => {
        // Origin yoksa (Postman, server-to-server, curl) izin ver
        if (!origin)
            return callback(null, true);
        const staticAllowed = [
            'http://localhost:3000',
            'http://localhost:4000',
            'https://curling-trouble-goatskin.ngrok-free.dev',
            ...env_1.env.ALLOWED_ORIGINS,
        ];
        const isAllowed = staticAllowed.includes(origin) ||
            origin.endsWith('.ngrok-free.dev') ||
            origin.endsWith('.ngrok.io') ||
            origin.endsWith('.ngrok-free.app');
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
app.use((0, morgan_1.default)(env_1.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/uploads/checkins', express_1.default.static(path_1.default.join(__dirname, '../uploads/checkins')));
app.use('/uploads/programs', express_1.default.static(path_1.default.join(__dirname, '../uploads/programs')));
const limiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: env_1.env.NODE_ENV, timestamp: new Date().toISOString() });
});
// Senin o harika modüler yapın: Tüm rotalar /api/v1 altında toplanıyor
app.use('/api/v1', routes_1.default);
app.use(error_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
exports.default = app;
