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

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.ALLOWED_ORIGINS, credentials: true }));
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