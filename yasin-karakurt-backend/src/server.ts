import app from './app';
import { env } from './config/env';
import prisma from './config/database';
import { initSocket } from './socket';
import { createServer } from 'http';

const start = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL bağlantısı kuruldu');

    const httpServer = createServer(app);
    initSocket(httpServer);

    httpServer.listen(env.PORT, () => {
      console.log(`[${env.NODE_ENV}] Server http://localhost:${env.PORT} adresinde çalışıyor`);
      console.log(`API: http://localhost:${env.PORT}/api/v1`);
      console.log(`Socket.io: http://localhost:${env.PORT}`);
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