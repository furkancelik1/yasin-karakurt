import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import apiRoutes from './routes'; // <--- Tüm rotalar buradan gelecek
import { errorHandler, notFound } from './middleware/error.middleware';
import path from 'path';

const app = express();
app.set('trust proxy', 1); // ngrok gibi proxy'lerin IP adreslerini doğru tanıması için şart

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Origin yoksa (Postman, server-to-server, curl) izin ver
    if (!origin) return callback(null, true);

    const staticAllowed: string[] = [
      'http://localhost:3000',
      'http://localhost:4000',
      'https://curling-trouble-goatskin.ngrok-free.dev',
      ...(env.ALLOWED_ORIGINS as unknown as string[]),
    ];

    const isAllowed =
      staticAllowed.includes(origin) ||
      origin.endsWith('.ngrok-free.dev') ||
      origin.endsWith('.ngrok.io') ||
      origin.endsWith('.ngrok-free.app');

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
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/checkins', express.static(path.join(__dirname, '../uploads/checkins')));
app.use('/uploads/programs', express.static(path.join(__dirname, '../uploads/programs')));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

// Senin o harika modüler yapın: Tüm rotalar /api/v1 altında toplanıyor
app.use('/api/v1', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;