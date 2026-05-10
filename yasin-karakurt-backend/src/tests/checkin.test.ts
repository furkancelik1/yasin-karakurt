import supertest from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const request = supertest;
const prisma = new PrismaClient();

describe('Check-in API Testleri', () => {
  let trainerToken: string;
  let clientToken: string;
  let clientUserId: string;
  let createdCheckInId: string;

  const trainerEmail = 'checkin-trainer@test.com';
  const trainerPassword = 'Trainer123!';
  const clientEmail = 'checkin-client@test.com';
  const clientPassword = 'Client123!';

  beforeAll(async () => {
    // 1. Trainer oluştur
    const existingTrainer = await prisma.user.findUnique({
      where: { email: trainerEmail }
    });

    if (!existingTrainer) {
      const hashedPassword = await bcrypt.hash(trainerPassword, 10);
      const trainer = await prisma.user.create({
        data: {
          email: trainerEmail,
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
      console.log('Trainer oluşturuldu:', trainerEmail);
    }

    // 2. Client oluştur
    const existingClient = await prisma.user.findUnique({
      where: { email: clientEmail }
    });

    if (!existingClient) {
      const hashedPassword = await bcrypt.hash(clientPassword, 10);
      const client = await prisma.user.create({
        data: {
          email: clientEmail,
          password: hashedPassword,
          role: 'CLIENT',
          isActive: true,
          profile: {
            create: {
              firstName: 'Test',
              lastName: 'Danışan'
            }
          }
        }
      });
      clientUserId = client.id;
      console.log('Client oluşturuldu:', clientEmail, 'ID:', clientUserId);
    } else {
      clientUserId = existingClient.id;
    }

    // 3. Trainer login olup token al
    const trainerLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: trainerEmail, password: trainerPassword });
    
    trainerToken = trainerLoginRes.body.data?.accessToken;
    console.log('Trainer token alındı');

    // 4. Client login olup token al
    const clientLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: clientEmail, password: clientPassword });
    
    clientToken = clientLoginRes.body.data?.accessToken;
    console.log('Client token alındı');
  });

  afterAll(async () => {
    // Test verilerini temizle
    await prisma.checkInPhoto.deleteMany({
      where: { checkIn: { user: { email: clientEmail } } }
    });
    await prisma.checkIn.deleteMany({
      where: { user: { email: clientEmail } }
    });
    await prisma.user.deleteMany({
      where: { email: { in: [trainerEmail, clientEmail] } }
    });
    await prisma.$disconnect();
  });

  it('Bir danışan check-in gönderdiğinde 201 dönmeli', async () => {
    const res = await request(app)
      .post('/api/v1/checkins')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        weight: 75.5,
        bodyFat: 12.3,
        notes: 'Bu hafta hedeflerimi %100 tutturdum!'
      });

    console.log('Check-in gönderim sonucu:', JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    createdCheckInId = res.body.data.id;
  });

  it('Gönderilen check-in photos tablosuna doğru şekilde bağlanmalı', async () => {
    // Veritabanında check-in'in photos ilişkisini kontrol et
    const checkInWithPhotos = await prisma.checkIn.findUnique({
      where: { id: createdCheckInId },
      include: { photos: true }
    });

    console.log('Check-in photos ilişkisi:', checkInWithPhotos?.photos);

    expect(checkInWithPhotos).toBeDefined();
    // Photos ilişkisi doğru çalışıyor olmalı
    expect(checkInWithPhotos).toHaveProperty('photos');
  });

  it('Bir koç check-in listelediğinde danışanın check-inini görmeli', async () => {
    const res = await request(app)
      .get('/api/v1/checkins/trainer')
      .set('Authorization', `Bearer ${trainerToken}`);

    console.log('Trainer listeleme sonucu - toplam:', res.body.data?.length);
    console.log('İlk check-in:', res.body.data?.[0]);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    
    // Az önce oluşturduğumuz check-in listede olmalı
    const foundCheckIn = res.body.data?.find(
      (c: any) => c.id === createdCheckInId
    );
    expect(foundCheckIn).toBeDefined();
  });

  it('Check-in detay getirme doğru verileri dönmeli', async () => {
    const res = await request(app)
      .get(`/api/v1/checkins/${createdCheckInId}`)
      .set('Authorization', `Bearer ${trainerToken}`);

    console.log('Check-in detay:', JSON.stringify(res.body.data, null, 2));

    expect(res.status).toBe(200);
    expect(res.body.data.checkin.weight).toBe(75.5);
    expect(res.body.data.checkin.bodyFat).toBe(12.3);
    expect(res.body.data.checkin.notes).toContain('hedeflerimi');
  });
});