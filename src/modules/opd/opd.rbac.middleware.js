/**
 * OPD Role-Based Access Control (RBAC) Module
 * 
 * ENHANCED: Now supports multiple access control methods:
 * 1. Permission-based access (from JWT token)
 * 2. Role-based access (ADMIN, DOCTOR, etc.)
 * 3. roleApplied-based access (NURSE_OPD, OPD_ASSISTANT, etc.)
 * 4. Assignment-based access (employees assigned to OPD)
 * 
 * ACCESS RULES (user needs ANY of these to access OPD):
 * - ADMIN or SUPER_ADMIN role
 * - Has OPD-related permissions (OPD_ACCESS, RECORD_VITALS, etc.)
 * - roleApplied contains OPD-related role
 * - Is assigned to OPD department
 * 
 * EXAMPLE:
 * router.post('/vitals', opdRbacMiddleware, canRecordVitals, controller.recordVitals);
 * // OR using new permission-based approach:
 * router.post('/vitals', authorizePermission('RECORD_VITALS'), controller.recordVitals);
 */

import { AuthorizationError } from '../../shared/exceptions/AppError.js';
import { authorizePermission } from '../../core/middleware/rbac.middleware.js';

/**
 * OPD-related roles that grant access to OPD section
 * These are checked against user.role and user.roleApplied
 */
export const OPD_ALLOWED_ROLES = [
  'ADMIN',
  'SUPER_ADMIN',
  'DOCTOR',
  'NURSE',
  'NURSE_OPD',
  'OPD_ASSISTANT',
  'OPD_COORDINATOR',
  'OPD_MANAGER',
  'RECEPTIONIST',
  'RECEPTION',
];

/**
 * OPD-related permissions that grant access to OPD section
 */
export const OPD_PERMISSIONS = [
  'OPD_ACCESS',
  'RECORD_VITALS',
  'PROVIDE_CONSULTATION',
  'MANAGE_QUEUE',
  'ACCESS_ALL_QUEUES',
  'VIEW_PATIENTS',
  'MANAGE_PATIENTS',
  'OPD_VIEW_HISTORY',
  'OPD_ADD_CONSULTATION',
  'OPD_MANAGE_PRESCRIPTION',
  'OPD_ORDER_TESTS',
  'OPD_MANAGE_REFERRALS',
];

/**
 * Check if a role string matches OPD-related roles
 * @param {string} role - Role to check
 * @returns {boolean}
 */
const isOpdRelatedRole = (role) => {
  if (!role) return false;
  const normalizedRole = role.toUpperCase().replace(/[-\s]/g, '_');
  return OPD_ALLOWED_ROLES.some(allowedRole => 
    normalizedRole === allowedRole || 
    normalizedRole.includes('OPD') ||
    normalizedRole.includes('NURSE') ||
    normalizedRole.includes('DOCTOR')
  );
};

/**
 * OPD access control middleware
 * 
 * Checks multiple criteria for OPD access:
 * 1. User's permissions array (from JWT)
 * 2. User's role (ADMIN, DOCTOR, etc.)
 * 3. User's roleApplied (for employees)
 * 4. Assignment to OPD department
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

    // Extract user info
    const perms = user.permissions || [];
    const userRole = user.role || '';
    const roleApplied = user.roleApplied || user.appliedRole || '';
    const userType = user.userType || '';
    const assignedDepartment = user.department || user.assignedDepartment || '';

    // Check 1: ADMIN/SUPER_ADMIN always have access
    if (['ADMIN', 'SUPER_ADMIN'].includes(userRole.toUpperCase())) {
      req.opdAccess = createOpdAccessObject(perms, true);
      return next();
    }

    // Check 2: User has OPD-related permissions
    const hasOpdPermission = perms.some(p => OPD_PERMISSIONS.includes(p));

    // Check 3: User's role is OPD-related
    const hasOpdRole = isOpdRelatedRole(userRole);

    // Check 4: User's roleApplied is OPD-related
    const hasOpdRoleApplied = isOpdRelatedRole(roleApplied);

    // Check 5: User is assigned to OPD department
    const isAssignedToOpd = assignedDepartment && 
      assignedDepartment.toUpperCase().includes('OPD');

    // Check 6: userType indicates OPD access (DOCTOR always has OPD access)
    const userTypeAllowsOpd = ['DOCTOR', 'ADMIN'].includes(userType);

    // Grant access if any condition is met
    const hasOpdAccess = hasOpdPermission || hasOpdRole || hasOpdRoleApplied || 
                         isAssignedToOpd || userTypeAllowsOpd;

    if (!hasOpdAccess) {
      console.warn(`[OPD RBAC] Access denied for user ${user.id}:`, {
        role: userRole,
        roleApplied,
        userType,
        assignedDepartment,
        permissions: perms.slice(0, 5) // Log first 5 permissions
      });
      return res.status(403).json({
        success: false,
        message: `Forbidden: Your role (${userRole || roleApplied || userType}) does not have access to OPD functions.`,
        code: 'UNAUTHORIZED_ROLE',
        userRole: userRole || roleApplied,
        hint: 'Required: ADMIN role, OPD-related roleApplied (NURSE_OPD, OPD_ASSISTANT, etc.), or OPD permissions'
      });
    }

    // Store permissions on request for controllers
    req.opdAccess = createOpdAccessObject(perms, hasOpdAccess);
    req.opdUserInfo = {
      role: userRole,
      roleApplied,
      userType,
      assignedDepartment,
      accessGrantedBy: hasOpdPermission ? 'permission' : 
                       hasOpdRole ? 'role' : 
                       hasOpdRoleApplied ? 'roleApplied' : 
                       isAssignedToOpd ? 'departmentAssignment' : 'userType'
    };
    
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
 * Create OPD access object from permissions
 * @param {string[]} perms - User permissions
 * @param {boolean} hasAccess - Whether user has OPD access
 * @returns {object} OPD access object
 */
function createOpdAccessObject(perms, hasAccess) {
  return {
    hasAccess,
    canRecordVitals: perms.includes('RECORD_VITALS') || perms.includes('OPD_ACCESS'),
    canConsult: perms.includes('PROVIDE_CONSULTATION') || perms.includes('OPD_ADD_CONSULTATION'),
    canManageQueue: perms.includes('MANAGE_QUEUE'),
    canAccessAllQueues: perms.includes('ACCESS_ALL_QUEUES'),
    canViewPatients: perms.includes('VIEW_PATIENTS'),
    canManagePatients: perms.includes('MANAGE_PATIENTS'),
    canViewHistory: perms.includes('OPD_VIEW_HISTORY'),
    canAddConsultation: perms.includes('OPD_ADD_CONSULTATION') || perms.includes('PROVIDE_CONSULTATION'),
    canManagePrescription: perms.includes('OPD_MANAGE_PRESCRIPTION'),
    canOrderTests: perms.includes('OPD_ORDER_TESTS'),
    canManageReferrals: perms.includes('OPD_MANAGE_REFERRALS'),
  };
}

/**
 * Permission check middleware: Can record vitals
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
 * Permission check middleware: Can provide consultation
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
 * Permission check middleware: Can manage queue
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
 * Permission check middleware: Can access all queues
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
 * Permission check middleware: Can add consultation notes
 */
export const canAddConsultation = (req, res, next) => {
  if (!req.opdAccess || !req.opdAccess.canAddConsultation) {
    return res.status(403).json({
      success: false,
      message: `Forbidden: You do not have permission to add consultation notes`,
      code: 'NO_CONSULTATION_PERMISSION'
    });
  }
  next();
};

/**
 * Permission check middleware: Can manage prescriptions
 */
export const canManagePrescription = (req, res, next) => {
  if (!req.opdAccess || !req.opdAccess.canManagePrescription) {
    return res.status(403).json({
      success: false,
      message: `Forbidden: You do not have permission to manage prescriptions`,
      code: 'NO_PRESCRIPTION_PERMISSION'
    });
  }
  next();
};

/**
 * Permission check middleware: Can order tests
 */
export const canOrderTests = (req, res, next) => {
  if (!req.opdAccess || !req.opdAccess.canOrderTests) {
    return res.status(403).json({
      success: false,
      message: `Forbidden: You do not have permission to order diagnostic tests`,
      code: 'NO_ORDER_TESTS_PERMISSION'
    });
  }
  next();
};

/**
 * Permission check middleware: Can view patient OPD history
 */
export const canViewHistory = (req, res, next) => {
  if (!req.opdAccess || !req.opdAccess.canViewHistory) {
    return res.status(403).json({
      success: false,
      message: `Forbidden: You do not have permission to view patient OPD history`,
      code: 'NO_HISTORY_PERMISSION'
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
  canAddConsultation,
  canManagePrescription,
  canOrderTests,
  canViewHistory,
  requireOpdPermission,
  OPD_ALLOWED_ROLES,
  OPD_PERMISSIONS,
};

