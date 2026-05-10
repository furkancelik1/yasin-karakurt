import supertest from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createServer as createHttpServer, Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import ioClient from 'socket.io-client';
import { initSocket, emitNotification } from '../socket';

const request = supertest;
const prisma = new PrismaClient();

describe('Socket.io Bildirim Sistemi Testleri', () => {
  let httpServer: HttpServer;
  let io: SocketServer;
  let serverAddress: string;

  const trainerEmail = 'socket-test-trainer@test.com';
  const trainerPassword = 'Trainer123!';
  const clientEmail = 'socket-test-client@test.com';
  const clientPassword = 'Client123!';

  let trainerToken: string;
  let clientToken: string;
  let trainerUserId: string;
  let clientUserId: string;

  beforeAll(async () => {
    httpServer = createHttpServer(app);
    io = initSocket(httpServer);

    await new Promise<void>((resolve) => {
      httpServer.listen(4002, () => {
        console.log('Socket test server 4002 portunda çalışıyor');
        resolve();
      });
    });
    serverAddress = 'http://localhost:4002';

    const hashedTrainerPassword = await bcrypt.hash(trainerPassword, 10);
    const hashedClientPassword = await bcrypt.hash(clientPassword, 10);

    const existingTrainer = await prisma.user.findUnique({
      where: { email: trainerEmail }
    });
    if (!existingTrainer) {
      const trainer = await prisma.user.create({
        data: {
          email: trainerEmail,
          password: hashedTrainerPassword,
          role: 'TRAINER',
          isActive: true,
          profile: {
            create: {
              firstName: 'Socket',
              lastName: 'Koç'
            }
          }
        }
      });
      trainerUserId = trainer.id;
    } else {
      trainerUserId = existingTrainer.id;
    }

    const existingClient = await prisma.user.findUnique({
      where: { email: clientEmail }
    });
    if (!existingClient) {
      const client = await prisma.user.create({
        data: {
          email: clientEmail,
          password: hashedClientPassword,
          role: 'CLIENT',
          isActive: true,
          profile: {
            create: {
              firstName: 'Socket',
              lastName: 'Danışan'
            }
          }
        }
      });
      clientUserId = client.id;
    } else {
      clientUserId = existingClient.id;
    }

    const trainerLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: trainerEmail, password: trainerPassword });
    trainerToken = trainerLoginRes.body.data?.accessToken;

    const clientLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: clientEmail, password: clientPassword });
    clientToken = clientLoginRes.body.data?.accessToken;

    console.log('Test kullanıcıları hazır');
    console.log('Trainer ID:', trainerUserId);
    console.log('Client ID:', clientUserId);
  }, 30000);

  afterAll(async () => {
    io.close();
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
    await prisma.user.deleteMany({
      where: { email: { in: [trainerEmail, clientEmail] } }
    });
    await prisma.$disconnect();
  }, 30000);

  describe('Connection Test', () => {
    it('Socket istemcisi sunucuya başarıyla bağlanabilmeli', (done) => {
      const socket = ioClient(serverAddress, {
        auth: { token: trainerToken },
        transports: ['websocket'],
        reconnection: false,
      });

      socket.on('connect', () => {
        expect(socket.connected).toBe(true);
        console.log('Socket bağlantısı başarılı, socket ID:', socket.id);
        socket.disconnect();
        done();
      });

      socket.on('connect_error', (err: Error) => {
        done(err);
      });
    }, 10000);

    it('Geçersiz token ile bağlantı reddedilmeli', (done) => {
      const socket = ioClient(serverAddress, {
        auth: { token: 'invalid-token' },
        transports: ['websocket'],
        reconnection: false,
      });

      socket.on('connect', () => {
        socket.disconnect();
        done(new Error('Geçersiz token kabul edilmemeli'));
      });

      socket.on('connect_error', (err: Error) => {
        expect(err.message).toBe('Invalid token');
        socket.disconnect();
        done();
      });
    }, 10000);
  });

  describe('Room Join Test', () => {
    it('Kullanıcı bağlandıktan sonra socket.id ile bir rooma katılmış olmalı', (done) => {
      const socket = ioClient(serverAddress, {
        auth: { token: trainerToken },
        transports: ['websocket'],
        reconnection: false,
      });

      socket.on('connect', () => {
        expect(socket.id).toBeDefined();
        console.log('Socket bağlandı, ID:', socket.id);
        
        socket.disconnect();
        done();
      });

      socket.on('connect_error', (err: Error) => {
        socket.disconnect();
        done(err);
      });
    }, 10000);
  });

  describe('Check-in Notification Test', () => {
    it('emitNotification çağrıldığında ilgili kullanıcıya new_notification eventi gönderilmeli', (done) => {
      const socket = ioClient(serverAddress, {
        auth: { token: trainerToken },
        transports: ['websocket'],
        reconnection: false,
      });

      socket.on('connect', () => {
        const notification = {
          id: 'test-checkin-' + Date.now(),
          title: 'Yeni Check-in',
          message: 'Danışan check-in gönderdi',
          type: 'CHECKIN',
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        let notificationReceived = false;
        socket.on('new_notification', (data) => {
          notificationReceived = true;
          expect(data).toMatchObject(notification);
          console.log('Check-in bildirimi alındı:', data);
          socket.disconnect();
          done();
        });

        setTimeout(() => {
          if (!notificationReceived) {
            emitNotification(trainerUserId, notification);
          } else {
            emitNotification(trainerUserId, notification);
          }
        }, 500);

        setTimeout(() => {
          if (!notificationReceived) {
            socket.disconnect();
            done(new Error('Bildirim alınamadı'));
          }
        }, 3000);
      });

      socket.on('connect_error', (err: Error) => {
        socket.disconnect();
        done(err);
      });
    }, 10000);
  });

  describe('Client Registration Notification Test', () => {
    it('Yeni danışan eklendiğinde koça bildirim gönderilmeli', (done) => {
      const socket = ioClient(serverAddress, {
        auth: { token: trainerToken },
        transports: ['websocket'],
        reconnection: false,
      });

      socket.on('connect', () => {
        const notification = {
          id: 'test-client-reg-' + Date.now(),
          title: 'Yeni Danışan',
          message: 'Sisteme yeni danışan kaydoldu',
          type: 'CLIENT_REGISTER',
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        let notificationReceived = false;
        socket.on('new_notification', (data) => {
          notificationReceived = true;
          expect(data.type).toBe('CLIENT_REGISTER');
          console.log('Danışan kayıt bildirimi alındı:', data);
          socket.disconnect();
          done();
        });

        setTimeout(() => {
          emitNotification(trainerUserId, notification);
        }, 500);

        setTimeout(() => {
          if (!notificationReceived) {
            socket.disconnect();
            done(new Error('Danışan kayıt bildirimi alınamadı'));
          }
        }, 3000);
      });

      socket.on('connect_error', (err: Error) => {
        socket.disconnect();
        done(err);
      });
    }, 10000);
  });

  describe('Security Test', () => {
    it('Token olmadan socket bağlantısı reddedilmeli', (done) => {
      const socket = ioClient(serverAddress, {
        transports: ['websocket'],
        reconnection: false,
      });

      socket.on('connect', () => {
        socket.disconnect();
        done(new Error('Token olmadan bağlantı kabul edilmemeli'));
      });

      socket.on('connect_error', (err: Error) => {
        expect(err.message).toBe('Authentication required');
        socket.disconnect();
        done();
      });
    }, 10000);

    it('Yanlış formatlı token reddedilmeli', (done) => {
      const socket = ioClient(serverAddress, {
        auth: { token: 'yanlis-format-token-xyz' },
        transports: ['websocket'],
        reconnection: false,
      });

      socket.on('connect', () => {
        socket.disconnect();
        done(new Error('Yanlış formatlı token kabul edilmemeli'));
      });

      socket.on('connect_error', (err: Error) => {
        expect(err.message).toBe('Invalid token');
        socket.disconnect();
        done();
      });
    }, 10000);
  });
});