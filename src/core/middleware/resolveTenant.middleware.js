/**
 * Resolve Tenant Middleware (Single-Tenant)
 * 
 * For single-tenant applications:
 * - Loads the single hospital from database
 * - Injects Prisma client into request
 * 
 * This middleware ensures consistent database access across all routes
 */

import { getPrisma } from '../database/tenantDb.js';
import logger from '../utils/logger.js';

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
                          req.path.startsWith('/api/public');
    
    if (!isPublicRoute) {
      // Get the first (and only) hospital for single-tenant
      const hospital = await prisma.hospital.findFirst({
        where: { isActive: true },
        select: {
          id: true,
          hospitalName: true,
          isActive: true,
        },
      });
      
      if (hospital) {
        req.hospital = hospital;
        req.hospitalId = hospital.id;
        req.tenantId = hospital.id;
      }
    }
    
    next();
  } catch (error) {
    logger.error('[ResolveTenant] Error loading tenant:', error.message);
    next(error);
  }
};

export default resolveTenant;
