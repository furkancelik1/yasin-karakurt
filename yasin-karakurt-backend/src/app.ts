import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import apiRoutes from './routes';
import { errorHandler, notFound } from './middleware/error.middleware';
import path from 'path';

const app = express();

// 1. Render proxy'si için şart (Gerçek IP'yi okuyabilmek için)
app.set('trust proxy', 1);

// 2. Güvenlik başlıkları
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// 3. CORS Ayarları
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Origin yoksa (Postman, server-to-server, curl) izin ver
    if (!origin) return callback(null, true);

    const isAllowed = 
      origin === 'http://localhost:3000' ||
      origin === 'http://localhost:4000' ||
      origin === process.env.FRONTEND_URL ||
      origin.endsWith('.vercel.app') || // Vercel'in tüm alt domainlerine izin ver
      origin.endsWith('.ngrok-free.app') ||
      origin.endsWith('.ngrok-free.dev') ||
      origin.endsWith('.ngrok.io');

    if (isAllowed) return callback(null, true);
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

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight (OPTIONS) isteklerini açıkça yakala

// 4. Geliştirici logları
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// 5. Body Parser (Gelen JSON verisini okumak için çok kritik)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 6. Statik dosyalar (Geriye dönük uyumluluk için kalsın)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/checkins', express.static(path.join(__dirname, '../uploads/checkins')));
app.use('/uploads/programs', express.static(path.join(__dirname, '../uploads/programs')));

// 7. Global Rate Limiter
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);

// 8. Auth Rate Limiter (Canlı ortam için biraz esnetildi)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Çok fazla deneme! Lütfen 15 dk bekleyin.' }
});
app.use('/api/v1/auth', authLimiter);

// 9. Sağlık kontrolü
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

// 10. Ana Rotalar
app.use('/api/v1', apiRoutes);

// 11. Hata yakalayıcılar
app.use(notFound);
app.use(errorHandler);

export default app;