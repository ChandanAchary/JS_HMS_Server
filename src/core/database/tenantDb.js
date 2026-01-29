/**
 * Tenant Database Configuration (Single-Tenant)
 * 
 * For single-tenant applications:
 * - Simple Prisma client for single hospital database
 * - Contains: Hospital, Admin, Employee, Doctor, Patient
 * - Also contains: Attendance, Assignment, Bill, Payroll, etc.
 * 
 * Includes connection initialization with retry logic and error handling.
 */

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

// Utility: Mask sensitive database URL in logs
const maskDatabaseUrl = (url) => {
  if (!url) return "(not set)";
  try {
    return url.replace(/:\/\/.*?:.*?@/, '://<user>:<redacted>@');
  } catch (e) {
    return "(invalid)";
  }
};

// Utility: Sleep for exponential backoff
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// Tenant Prisma client - connects to database
let tenantPrismaInstance;

export function initializeTenantPrisma() {
  if (tenantPrismaInstance) {
    return tenantPrismaInstance;
  }

  let dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    logger.error("FATAL: DATABASE_URL is not set");
    process.exit(1);
  }
  
  // For Neon connections, use the pooling endpoint if regular endpoint is provided
  if (dbUrl.includes('neon.tech') && !dbUrl.includes('-pooler')) {
    dbUrl = dbUrl.replace(/\.neon\.tech/, '-pooler.neon.tech');
    logger.info('[Tenant DB] Using Neon connection pooling endpoint');
  }

  tenantPrismaInstance = new PrismaClient({
    errorFormat: 'pretty',
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
    ],
  });

  // Log queries in development
  if (process.env.NODE_ENV === 'development') {
    tenantPrismaInstance.$on('query', (e) => {
      logger.debug(`[Query] ${e.query} (${e.duration}ms)`);
    });
  }

  tenantPrismaInstance.$on('error', (e) => {
    logger.error('[Prisma Error]', e);
  });

  return tenantPrismaInstance;
}

// Initialize on module load
export const tenantPrisma = initializeTenantPrisma();

export async function connectDB() {
  try {
    // Simply ensure connection works
    await tenantPrisma.$queryRaw`SELECT 1`;
    logger.info('[Tenant DB] Connection successful');
    return true;
  } catch (error) {
    logger.error('[Tenant DB] Connection failed:', error.message);
    throw error;
  }
}

export async function disconnectPrisma() {
  if (tenantPrismaInstance) {
    await tenantPrismaInstance.$disconnect();
    tenantPrismaInstance = null;
  }
}

export function getPrisma() {
  if (!tenantPrismaInstance) {
    initializeTenantPrisma();
  }
  return tenantPrismaInstance;
}
