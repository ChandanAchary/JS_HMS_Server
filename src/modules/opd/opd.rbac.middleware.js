/**
 * OPD Role-Based Access Control (RBAC) Module
 * 
 * MIGRATION: This module is being refactored to use centralized permission-driven RBAC.
 * Instead of OPD-specific role lists, we now check permissions from the central ROLE_PERMISSIONS.js
 * 
 * OLD APPROACH (deprecated):
 * - Hard-coded OPD_ALLOWED_ROLES
 * - Custom role checks at each endpoint
 * - Module-specific permission logic
 * 
 * NEW APPROACH (recommended):
 * - Use authorizePermission middleware from rbac.middleware.js
 * - Check semantic permissions: RECORD_VITALS, PROVIDE_CONSULTATION, MANAGE_QUEUE
 * - Centralized ROLE_PERMISSIONS defines which roles have these permissions
 * 
 * EXAMPLE:
 * // OLD (deprecated)
 * router.post('/vitals', opdRbacMiddleware, canRecordVitals, controller.recordVitals);
 * 
 * // NEW (recommended)
 * router.post('/vitals', authorizePermission('RECORD_VITALS'), controller.recordVitals);
 */

import { AuthorizationError } from '../../shared/exceptions/AppError.js';
import { authorizePermission } from '../../core/middleware/rbac.middleware.js';

/**
 * DEPRECATED: OPD access control middleware
 * Use authorizePermission('RECORD_VITALS' | 'PROVIDE_CONSULTATION' | 'MANAGE_QUEUE') instead
 * 
 * Kept for backward compatibility during migration period
 */
export const opdRbacMiddleware = (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated',
        code: 'UNAUTHENTICATED'
      });
    }

    if (!user.isActive || user.isDeleted) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Your account is inactive or deleted',
        code: 'INACTIVE_ACCOUNT'
      });
    }

    // Check permissions array instead of role strings
    const perms = user.permissions || [];
    const opdPerms = {
      canRecordVitals: perms.includes('RECORD_VITALS'),
      canConsult: perms.includes('PROVIDE_CONSULTATION'),
      canManageQueue: perms.includes('MANAGE_QUEUE'),
      canAccessAllQueues: perms.includes('ACCESS_ALL_QUEUES'),
    };

    // If no OPD permissions, reject
    if (!Object.values(opdPerms).some(p => p)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Your role does not have access to OPD functions`,
        code: 'UNAUTHORIZED_ROLE',
      });
    }

    // Store permissions on request for controllers
    req.opdAccess = opdPerms;
    next();
  } catch (error) {
    console.error('OPD RBAC Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error in OPD access control',
      code: 'RBAC_ERROR'
    });
  }
};

/**
 * RECOMMENDED: Use authorizePermission('RECORD_VITALS') middleware instead
 * Kept for backward compatibility
 */
export const canRecordVitals = (req, res, next) => {
  if (!req.opdAccess || !req.opdAccess.canRecordVitals) {
    return res.status(403).json({
      success: false,
      message: `Forbidden: You do not have permission to record vital signs`,
      code: 'NO_VITALS_PERMISSION'
    });
  }
  next();
};

/**
 * RECOMMENDED: Use authorizePermission('PROVIDE_CONSULTATION') middleware instead
 * Kept for backward compatibility
 */
export const canConsult = (req, res, next) => {
  if (!req.opdAccess || !req.opdAccess.canConsult) {
    return res.status(403).json({
      success: false,
      message: `Forbidden: You do not have permission to provide consultation`,
      code: 'NO_CONSULT_PERMISSION'
    });
  }
  next();
};

/**
 * RECOMMENDED: Use authorizePermission('MANAGE_QUEUE') middleware instead
 * Kept for backward compatibility
 */
export const canManageQueue = (req, res, next) => {
  if (!req.opdAccess || !req.opdAccess.canManageQueue) {
    return res.status(403).json({
      success: false,
      message: `Forbidden: You do not have permission to manage OPD queue`,
      code: 'NO_QUEUE_PERMISSION'
    });
  }
  next();
};

/**
 * RECOMMENDED: Use authorizePermission('ACCESS_ALL_QUEUES') middleware instead
 * Kept for backward compatibility
 */
export const canAccessAllQueues = (req, res, next) => {
  if (!req.opdAccess || !req.opdAccess.canAccessAllQueues) {
    return res.status(403).json({
      success: false,
      message: `Forbidden: You do not have permission to access all queues`,
      code: 'NO_ALL_QUEUES_PERMISSION'
    });
  }
  next();
};

/**
 * Wrapper: Creates an authorizePermission middleware for OPD operations
 * Use this for gradual migration to centralized RBAC
 * 
 * @param {string} permissionName - Permission to check (e.g., 'RECORD_VITALS')
 * @returns {Function} Express middleware
 * 
 * @example
 * // Gradually replace old middleware with:
 * router.post('/vitals', requireOpdPermission('RECORD_VITALS'), controller.recordVitals);
 */
export const requireOpdPermission = (permissionName) => {
  return authorizePermission(permissionName);
};

export default {
  opdRbacMiddleware,
  canRecordVitals,
  canConsult,
  canManageQueue,
  canAccessAllQueues,
  requireOpdPermission,
};

