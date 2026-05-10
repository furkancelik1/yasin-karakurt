import supertest from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const request = supertest;
const prisma = new PrismaClient();

describe('Auth API Testleri', () => {
  const testEmail = 'test-user@example.com';
  const testPassword = 'TestPassword123!';

  beforeAll(async () => {
    // Test kullanıcısı oluştur (yoksa)
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await prisma.user.create({
        data: {
          email: testEmail,
          password: hashedPassword,
          role: 'TRAINER',
          isActive: true,
          profile: {
            create: {
              firstName: 'Test',
              lastName: 'Koç'
            }
          }
        }
      });
      console.log('Test kullanıcısı oluşturuldu:', testEmail);
    }
  });

  afterAll(async () => {
    // Test kullanıcısını temizle
    await prisma.user.deleteMany({
      where: { email: testEmail }
    });
    await prisma.$disconnect();
  });

  it('Doğru bilgilerle giriş yapıldığında 200 ve Token dönmeli', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    console.log('Login response:', JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user).toHaveProperty('role', 'TRAINER');
  });

  it('Yanlış şifreyle giriş yapıldığında 401 hatası dönmeli', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'YanlisSifre123'
      });

    expect(res.status).toBe(401);
  });
});