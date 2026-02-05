/**
 * Tenant Context Service
 * 
 * Single-tenant context management
 * Provides access to the single hospital's ID and context throughout the application
 * Since this is a single-tenant system, we cache the hospital data to avoid repeated queries
 */

import { tenantPrisma } from '../database/tenantDb.js';
import logger from '../utils/logger.js';

class TenantContext {
  constructor() {
    this.hospitalId = null;
    this.hospital = null;
  }

  /**
   * Initialize the tenant context (call once at startup)
   */
  async initialize() {
    try {
      const hospital = await tenantPrisma.hospital.findFirst({
        where: { isActive: true },
        select: {
          id: true,
          hospitalName: true,
          isActive: true
        }
      });

      if (hospital) {
        this.hospitalId = hospital.id;
        this.hospital = hospital;
        logger.info('[TenantContext] Initialized with hospital:', hospital.hospitalName);
      } else {
        logger.warn('[TenantContext] No active hospital found');
      }
    } catch (error) {
      logger.error('[TenantContext] Failed to initialize:', error.message);
      throw error;
    }
  }

  /**
   * Get the hospital ID (single-tenant, always the same)
   */
  getHospitalId() {
    return this.hospitalId;
  }

  /**
   * Get the hospital object
   */
  getHospital() {
    return this.hospital;
  }

  /**
   * Get hospital ID with fallback to req.user.hospitalId if context not initialized
   */
  getHospitalIdFromRequest(req) {
    // Prefer context if available, fallback to request
    return this.hospitalId || req?.user?.hospitalId;
  }
}

// Create singleton instance
export const tenantContext = new TenantContext();

export default tenantContext;
