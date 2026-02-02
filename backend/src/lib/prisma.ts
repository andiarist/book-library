import { PrismaClient } from '../generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as dotenv from 'dotenv';

dotenv.config();

// 1. Definimos un tipo para evitar errores de TypeScript con el objeto global
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:../prisma/dev.db',
});

// 2. Si ya existe una instancia en 'global', la reutilizamos. Si no, la creamos.
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    // Opcional: útil para ver qué consultas hace Prisma en la consola
    log: ['query'],
  });

console.log('✅ Prisma Client inicializado correctamente');

// 3. En entornos que no sean producción, guardamos la instancia en 'global'
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
