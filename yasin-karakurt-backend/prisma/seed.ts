import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import process from 'node:process';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Veritabanı "Premium" test verileriyle dolduruluyor...');
  const password = await bcrypt.hash('Test123!', 12);

  // Yasin Hoca (Eğitmen)
  await prisma.user.upsert({
    where: { email: 'yasin@ykplatform.com' },
    update: {},
    create: {
      email: 'yasin@ykplatform.com',
      password: password, 
      role: 'TRAINER',
      profile: {
        create: {
          firstName: 'Yasin',
          lastName: 'Karakurt',
        }
      }
    }
  });

  // Danışan 1
  await prisma.user.upsert({
    where: { email: 'ahmet@test.com' },
    update: {},
    create: {
      email: 'ahmet@test.com',
      password: password,
      role: 'CLIENT',
      profile: {
        create: { firstName: 'Ahmet Furkan', lastName: 'Çelik' }
      },
      checkIns: {
        create: {
          weight: 78.5,
          bodyFat: 14.2,
          notes: 'Hocam bu hafta antrenmanlar çok iyi geçti, beslenmeyi %100 tutturduk. Omuzlarda ciddi bir dolgunluk hissediyorum.',
          submittedAt: new Date(), // Bugün
          photos: {
            create: [
              { url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop', angle: 'FRONT' }
            ]
          }
        }
      }
    }
  });

  // Danışan 2
  await prisma.user.upsert({
    where: { email: 'burak@test.com' },
    update: {},
    create: {
      email: 'burak@test.com',
      password: password,
      role: 'CLIENT',
      profile: {
        create: { firstName: 'Burak', lastName: 'Yılmaz' }
      },
      checkIns: {
        create: {
          weight: 84.1,
          bodyFat: 16.5,
          notes: 'Kardiyoları aksattım biraz ama ağırlık artışları devam ediyor. Sağ dirseğimde ufak bir sızı var.',
          submittedAt: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 gün önce
          photos: {
            create: [
              { url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop', angle: 'FRONT' }
            ]
          }
        }
      }
    }
  });

  // Danışan 3
  await prisma.user.upsert({
    where: { email: 'can@test.com' },
    update: {},
    create: {
      email: 'can@test.com',
      password: password,
      role: 'CLIENT',
      profile: {
        create: { firstName: 'Can', lastName: 'Demir' }
      },
      checkIns: {
        create: {
          weight: 72.3,
          bodyFat: 11.8,
          notes: 'Enerjim harika. Göğüs antrenmanındaki yeni sistem inanılmaz pump yapıyor.',
          submittedAt: new Date(new Date().setDate(new Date().getDate() - 4)), // 4 gün önce
          photos: {
            create: [
              { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop', angle: 'FRONT' }
            ]
          }
        }
      }
    }
  });

  console.log('✅ Dark-Luxe galeri için test verileri başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });