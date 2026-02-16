import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!globalForPrisma.__prisma) {
    globalForPrisma.__prisma = new PrismaClient();
  }
  prisma = globalForPrisma.__prisma;
}

export default prisma;


















