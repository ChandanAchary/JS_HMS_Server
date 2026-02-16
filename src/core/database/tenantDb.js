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
import logger from '../../utils/logger.js';

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

  // Ensure Prisma picks up the possibly modified DATABASE_URL (pooler endpoint)
  process.env.DATABASE_URL = dbUrl;

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
      // update env var as well
      process.env.DATABASE_URL = dbUrl;
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
  // Improved retry strategy with exponential backoff and jitter
  const maxRetries = parseInt(process.env.DATABASE_CONNECT_RETRIES || '5', 10);
  const allowOffline = process.env.DATABASE_ALLOW_OFFLINE === 'true' || 
                       (process.env.NODE_ENV === 'development' && process.env.DATABASE_ALLOW_OFFLINE !== 'false');
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await tenantPrisma.$queryRaw`SELECT 1`;
      logger.info('[Tenant DB] Connection successful');
      return true;
    } catch (error) {
      attempt++;
      const isLast = attempt === maxRetries;
      const baseWait = Math.min(1000 * Math.pow(2, attempt - 1), 30000); // cap at 30s
      const jitter = Math.floor(Math.random() * 1000);
      const waitTime = baseWait + jitter;

      logger.warn(`[Tenant DB] Connection attempt ${attempt} failed: ${error.message}`);

      if (isLast) {
        logger.error(`[Tenant DB] All ${maxRetries} connection attempts failed.`);
        logger.error(`[Tenant DB] DATABASE_URL: ${maskDatabaseUrl(process.env.DATABASE_URL)}`);
        logger.error('[Tenant DB] Troubleshooting suggestions:');
        logger.error('  • Verify DATABASE_URL in your .env file is correct');
        logger.error('  • Ensure the database server is running and accessible from this machine');
        logger.error('  • If using Neon, ensure you are using the pooler endpoint and the network allows outbound TCP to the region');
        logger.error('  • On Windows, test connectivity with PowerShell:');
        logger.error('      $host = "ep-ancient-star-a1a0v0jx.ap-southeast-1.aws-pooler.neon.tech"');
        logger.error('      Test-NetConnection -ComputerName $host -Port 5432');
        logger.error('  • On *nix, test with:');
        logger.error('      nc -vz <host> 5432');

        // In development, allow continuing without DB connection
        if (allowOffline) {
          logger.warn('[Tenant DB] Running in offline development mode — database operations will fail at runtime');
          logger.warn('[Tenant DB] To require DB connection, set DATABASE_ALLOW_OFFLINE=false in .env');
          return false;
        }

        throw error;
      }

      logger.info(`[Tenant DB] Retrying in ${Math.round(waitTime)}ms...`);
      await sleep(waitTime);
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


















