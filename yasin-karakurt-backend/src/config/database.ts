import { PrismaClient } from '@prisma/client';

// Global objeye prisma tipini ekliyoruz
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Eğer globalde varsa onu kullan, yoksa yeni oluştur
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

// Development ortamındaysak bağlantıyı globalde sakla
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;