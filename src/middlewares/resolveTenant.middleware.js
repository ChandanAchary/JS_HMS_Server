/**
 * Resolve Tenant Middleware (Single-Tenant)
 * 
 * For single-tenant applications:
 * - Loads the single hospital from database
 * - Injects Prisma client into request
 * 
 * This middleware ensures consistent database access across all routes
 */

import { getPrisma } from '../core/database/tenantDb.js';
import logger from '../utils/logger.js';

// Simple cache for hospital data (single-tenant, so just one record)
let cachedHospital = null;
let cacheExpireTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

/**
 * Middleware to resolve tenant (hospital) for single-tenant app
 * Attaches prisma client to request for use in controllers
 */
export const resolveTenant = async (req, res, next) => {
  try {
    const prisma = getPrisma();
    
    // Attach prisma client to request for downstream use
    req.prisma = prisma;
    req.tenantPrisma = prisma; // Alias for compatibility
    
    // Skip tenant loading for public/setup routes
    const isPublicRoute = req.path.startsWith('/health') || 
                          req.path === '/' || 
                          req.path.startsWith('/api/versions') ||
                          req.path.startsWith('/api/setup') ||
                          req.path.startsWith('/api/health') ||
                          req.path.startsWith('/api/public');
    
    if (!isPublicRoute) {
      // Check cache first
      if (cachedHospital && Date.now() < cacheExpireTime) {
        req.hospital = cachedHospital;
        req.hospitalId = cachedHospital.id;
        req.tenantId = cachedHospital.id;
      } else {
        // Get the first (and only) hospital for single-tenant
        // Add retry logic for connection pool timeout
        let hospital = null;
        let retries = 3;
        
        while (retries > 0 && !hospital) {
          try {
            hospital = await Promise.race([
              prisma.hospital.findFirst({
                where: { isActive: true },
                select: {
                  id: true,
                  hospitalName: true,
                  isActive: true,
                },
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Query timeout')), 5000)
              )
            ]);
            
            if (hospital) {
              // Cache the hospital
              cachedHospital = hospital;
              cacheExpireTime = Date.now() + CACHE_DURATION;
              
              req.hospital = hospital;
              req.hospitalId = hospital.id;
              req.tenantId = hospital.id;
            }
          } catch (dbError) {
            retries--;
            if (retries > 0) {
              logger.warn(`[ResolveTenant] Connection error, retrying... (${retries} attempts left)`, dbError.message);
              await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
            } else {
              throw dbError;
            }
          }
        }
      }
    }
    
    next();
  } catch (error) {
    logger.error('[ResolveTenant] Error loading tenant:', error.message);
    // Don't fail the entire request, just log and continue
    // This allows public routes to work even if there's a DB issue
    if (!req.path.startsWith('/api/public') && !req.path.startsWith('/health')) {
      next(error);
    } else {
      next();
    }
  }
};

export default resolveTenant;



















