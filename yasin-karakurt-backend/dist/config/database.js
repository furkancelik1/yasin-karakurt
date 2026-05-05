"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Global objeye prisma tipini ekliyoruz
const globalForPrisma = global;
// Eğer globalde varsa onu kullan, yoksa yeni oluştur
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        log: ['query', 'error', 'warn'],
    });
// Development ortamındaysak bağlantıyı globalde sakla
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
exports.default = exports.prisma;
