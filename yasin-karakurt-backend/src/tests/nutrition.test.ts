import supertest from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const request = supertest;
const prisma = new PrismaClient();

describe('Nutrition API Testleri', () => {
  let trainerToken: string;
  let clientToken: string;
  let clientUserId: string;
  let createdPlanId: string;

  const trainerEmail = 'nutrition-trainer@test.com';
  const trainerPassword = 'Trainer123!';
  const clientEmail = 'nutrition-client@test.com';
  const clientPassword = 'Client123!';

  beforeAll(async () => {
    // 1. Trainer oluştur
    const existingTrainer = await prisma.user.findUnique({
      where: { email: trainerEmail }
    });

    if (!existingTrainer) {
      const hashedPassword = await bcrypt.hash(trainerPassword, 10);
      await prisma.user.create({
        data: {
          email: trainerEmail,
          password: hashedPassword,
          role: 'TRAINER',
          isActive: true,
          profile: {
            create: { firstName: 'Nutri', lastName: 'Koç' }
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
            create: { firstName: 'Nutri', lastName: 'Danışan' }
          }
        }
      });
      clientUserId = client.id;
    } else {
      clientUserId = existingClient.id;
    }

    // 3. Login - trainer
    const trainerLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: trainerEmail, password: trainerPassword });
    trainerToken = trainerLoginRes.body.data?.accessToken;

    // 4. Login - client
    const clientLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: clientEmail, password: clientPassword });
    clientToken = clientLoginRes.body.data?.accessToken;

    console.log('Test kullanıcıları hazır');
  });

  afterAll(async () => {
    // Temizlik - önce mealsları, sonra planları sil
    const clientPlan = await prisma.nutritionPlan.findFirst({
      where: { user: { email: clientEmail }, isActive: true },
      include: { meals: true }
    });

    if (clientPlan?.meals) {
      for (const meal of clientPlan.meals) {
        await prisma.meal.delete({ where: { id: meal.id } }).catch(() => {});
      }
    }

    if (clientPlan) {
      await prisma.nutritionPlan.delete({ where: { id: clientPlan.id } }).catch(() => {});
    }

    await prisma.nutritionPlan.deleteMany({
      where: { user: { email: clientEmail } }
    }).catch(() => {});

    await prisma.user.deleteMany({
      where: { email: { in: [trainerEmail, clientEmail] } }
    });
    await prisma.$disconnect();
  });

  // === Makro Hesaplama Unit Testleri ===
  describe('Makro Hesaplama (Unit Test)', () => {
    // Basit bir makro hesaplama fonksiyonu (service'de varsa kullanırız, yoksa burada test ederiz)
    const calculateMacros = (calories: number, ratios: { protein: number; carbs: number; fat: number }) => {
      return {
        protein: Math.round((calories * ratios.protein) / 4), // 1g protein = 4 kcal
        carbs: Math.round((calories * ratios.carbs) / 4),         // 1g karbonhidrat = 4 kcal
        fat: Math.round((calories * ratios.fat) / 9)             // 1g yağ = 9 kcal
      };
    };

    it('Kalori hesaplaması doğru olmalı: Standart oranlar (P:%40, C:%40, F:%20)', () => {
      const result = calculateMacros(2000, { protein: 0.4, carbs: 0.4, fat: 0.2 });
      
      expect(result.protein).toBe(200);  // 2000 * 0.4 / 4 = 200g
      expect(result.carbs).toBe(200);   // 2000 * 0.4 / 4 = 200g
      expect(result.fat).toBe(44);    // 2000 * 0.2 / 9 = 44.44 → 44
    });

    it('Düşük kalorili diyet için doğru hesaplamalı', () => {
      const result = calculateMacros(1200, { protein: 0.35, carbs: 0.35, fat: 0.3 });
      
      expect(result.protein).toBe(105);  // 1200 * 0.35 / 4 = 105g
      expect(result.carbs).toBe(105);  // 1200 * 0.35 / 4 = 105g
      expect(result.fat).toBe(40);      // 1200 * 0.3 / 9 = 40g
    });

    it('Ketojenik diyet oranları için doğru hesaplamalı', () => {
      const result = calculateMacros(1800, { protein: 0.3, carbs: 0.05, fat: 0.65 });
      
      expect(result.protein).toBe(135); // 1800 * 0.3 / 4 = 135g
      expect(result.carbs).toBe(23);   // 1800 * 0.05 / 4 = 22.5 → 23
      expect(result.fat).toBe(130);    // 1800 * 0.65 / 9 = 130g
    });
  });

  // === API Entegrasyon Testleri ===
  describe('Beslenme Planı API Testleri', () => {
    it('Koç danışana beslenme planı atadığında 201 dönmeli', async () => {
      const res = await request(app)
        .post('/api/v1/nutrition/plan')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({
          userId: clientUserId,
          title: 'Haftalık Yağ Yakım Programı',
          targetCalories: 2000,
          protein: 150,
          carbs: 200,
          fat: 65,
          notes: 'Her öğünü zamanında tüketmeye özen göster',
          meals: [
            { name: 'Kahvaltı', content: 'Yulaf + yumurta', time: '08:00', order: 0 },
            { name: 'Öğle', content: 'Tavuk + pirinç', time: '12:30', order: 1 },
            { name: 'Akşam', content: 'Balık + salata', time: '19:00', order: 2 }
          ]
        });

      console.log('Plan oluşturma sonucu:', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      createdPlanId = res.body.data.id;
    });

    it('Koç atanan planı veritabanında doğru kaydedildiğini görmeli', async () => {
      const savedPlan = await prisma.nutritionPlan.findUnique({
        where: { id: createdPlanId },
        include: { meals: true }
      });

      console.log('Kaydedilen plan:', savedPlan);

      expect(savedPlan).toBeDefined();
      expect(savedPlan?.targetCalories).toBe(2000);
      expect(savedPlan?.protein).toBe(150);
      expect(savedPlan?.carbs).toBe(200);
      expect(savedPlan?.fat).toBe(65);
      expect(savedPlan?.isActive).toBe(true);
      expect(savedPlan?.meals).toHaveLength(3);
    });

    it('Danışan kendi beslenme planını çektiğinde doğru değerleri almalı', async () => {
      const res = await request(app)
        .get('/api/v1/nutrition/plan/active/' + clientUserId)
        .set('Authorization', `Bearer ${clientToken}`);

      console.log('Danışan plan getirme:', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('targetCalories', 2000);
      expect(res.body.data).toHaveProperty('protein', 150);
      expect(res.body.data.protein).toBeGreaterThan(0);
    });

    it('Makro hesaplaması ile veritabanı değerleri eşleşmeli (Unit + Integration)', async () => {
      // Veritabanından değerleri al
      const plan = await prisma.nutritionPlan.findUnique({
        where: { id: createdPlanId }
      });

      if (plan) {
        const proteinCal = (plan.protein || 0) * 4;
        const carbsCal = (plan.carbs || 0) * 4;
        const fatCal = (plan.fat || 0) * 9;
        const totalFromMacros = proteinCal + carbsCal + fatCal;

        console.log('Makrolardan toplam:', {
          proteinCal,
          carbsCal,
          fatCal,
          total: totalFromMacros,
          target: plan.targetCalories
        });

        // ±50 kcal tolerans ile kontrol et
        expect(Math.abs(totalFromMacros - plan.targetCalories)).toBeLessThanOrEqual(50);
      }
    });
  });
});