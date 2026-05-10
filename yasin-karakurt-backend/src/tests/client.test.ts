import supertest from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const request = supertest;
const prisma = new PrismaClient();

describe('Danışan Yönetimi API Testleri', () => {
  const testTrainerEmail = 'trainer@test.com';
  const testTrainerPassword = 'Trainer123!';

  beforeAll(async () => {
    // Test için trainer kullanıcısı oluştur (yoksa)
    const existingUser = await prisma.user.findUnique({
      where: { email: testTrainerEmail }
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(testTrainerPassword, 10);
      await prisma.user.create({
        data: {
          email: testTrainerEmail,
          password: hashedPassword,
          role: 'TRAINER',
          profile: {
            create: {
              firstName: 'Test',
              lastName: 'Koç'
            }
          }
        }
      });
      console.log('Test trainer kullanıcısı oluşturuldu:', testTrainerEmail);
    }
  });

  afterAll(async () => {
    // Test kullanıcısını temizle
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'trainer@test.com' } }
    });
    await prisma.$disconnect();
  });

  it('Önce login olup token almalı', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testTrainerEmail, password: testTrainerPassword });

    console.log('Login status:', loginRes.status);
    console.log('Login body:', JSON.stringify(loginRes.body, null, 2));

    expect(loginRes.status).toBe(200);
    // Backend 'accessToken' döndürüyor, 'token' değil
    expect(loginRes.body.data).toHaveProperty('accessToken');
  });

  it('Yeni bir danışan başarıyla oluşturulmalı', async () => {
    // Önce giriş yapıp token al
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testTrainerEmail, password: testTrainerPassword });

    const token = loginRes.body.data?.accessToken;

    if (!token) {
      console.log('Token alınamadı, login response:', loginRes.body);
      throw new Error('Login failed - no token');
    }

    // Yeni danışan oluştur
    const res = await request(app)
      .post('/api/v1/admin/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: `yeni_danisan_${Date.now()}@test.com`,
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'Danışan'
      });

    console.log('Create client status:', res.status);
    console.log('Create client body:', JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(201);
  });
});