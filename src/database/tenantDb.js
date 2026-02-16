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
    log: process.env.NODE_ENV === 'development' 
      ? [
          { emit: 'event', level: 'warn' },
          { emit: 'event', level: 'error' },
        ]
      : [
          { emit: 'event', level: 'error' },
        ],
  });

  // Configure connection pool settings
  // Neon pooler has a default limit of 25 connections per endpoint
  // We use optimized settings to prevent pool exhaustion
  if (dbUrl.includes('-pooler.neon.tech')) {
    // Use environment variables or defaults for pool configuration
    const poolTimeout = parseInt(process.env.DATABASE_POOL_TIMEOUT || '30', 10); // Increased from 10 to 30
    const poolSize = parseInt(process.env.DATABASE_POOL_SIZE || '5', 10); // Conservative size
    logger.info(`[Tenant DB] Using Neon pooler endpoint - pool timeout: ${poolTimeout}s, size: ${poolSize}`);
    
    // CRITICAL: Set connection timeout at DATABASE_URL level
    if (!dbUrl.includes('?')) {
      dbUrl += `?connection_limit=${poolSize}&statement_timeout=30000&connect_timeout=10`;
    }
  }

  // Log queries in development (but not all queries to avoid performance issues)
  if (process.env.NODE_ENV === 'development') {
    tenantPrismaInstance.$on('query', (e) => {
      // Only log slow queries (> 1s) in development
      if (e.duration > 1000) {
        logger.debug(`[SLOW QUERY] ${e.query} (${e.duration}ms)`);
      }
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
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // Test connection with retry logic
      await tenantPrisma.$queryRaw`SELECT 1`;
      logger.info('[Tenant DB] Connection successful');
      return true;
    } catch (error) {
      retryCount++;
      const isLastAttempt = retryCount === maxRetries;
      
      if (isLastAttempt) {
        logger.error('[Tenant DB] Connection failed after 3 attempts:', error.message);
        logger.error('[Tenant DB] Make sure:');
        logger.error('  1. DATABASE_URL is set in .env file');
        logger.error('  2. Database server is running and accessible');
        logger.error('  3. Network connection is available');
        logger.error('  4. Firewall is not blocking the connection');
        throw error;
      } else {
        const waitTime = 1000 * retryCount;
        logger.warn(`[Tenant DB] Connection attempt ${retryCount} failed, retrying in ${waitTime}ms...`);
        await sleep(waitTime);
      }
    }
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



















