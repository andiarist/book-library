import { PrismaClient } from '../generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as dotenv from 'dotenv';

dotenv.config();

// 1. Definimos un tipo para evitar errores de TypeScript con el objeto global
const globalForPrisma = global as unknown as { prisma: PrismaClient };

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL no está definida en las variables de entorno.');
}

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:../prisma/dev.db',
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    // Opcional: útil para ver qué consultas hace Prisma en la consola
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

console.log('✅ Prisma Client inicializado correctamente');

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
