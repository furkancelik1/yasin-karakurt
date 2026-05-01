import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';

const start = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL bağlantısı kuruldu');

    app.listen(env.PORT, () => {
      console.log(`[${env.NODE_ENV}] Server http://localhost:${env.PORT} adresinde çalışıyor`);
      console.log(`API: http://localhost:${env.PORT}/api/v1`);
    });
  } catch (err) {
    console.error('Sunucu başlatılamadı:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start();
