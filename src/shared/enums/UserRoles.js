/**
 * User Roles Enum
 * Centralized definition of all user roles in the system
 */
export const UserRoles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  EMPLOYEE: 'EMPLOYEE',
  NURSE: 'NURSE',
  RECEPTIONIST: 'RECEPTIONIST',
  BILLING_OFFICER: 'BILLING_OFFICER',
  ACCOUNTS_MANAGER: 'ACCOUNTS_MANAGER',
  FINANCE_MANAGER: 'FINANCE_MANAGER',
  PATIENT: 'PATIENT',
};

/**
 * User Status Enum
 */
export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
  PENDING_ACTIVATION: 'PENDING_ACTIVATION',
};

/**
 * Roles with billing access
 */
export const BILLING_ROLES = [
  UserRoles.BILLING_OFFICER,
  UserRoles.ACCOUNTS_MANAGER,
  UserRoles.FINANCE_MANAGER,
  UserRoles.ADMIN,
];

/**
 * Admin roles
 */
export const ADMIN_ROLES = [
  UserRoles.ADMIN,
  UserRoles.SUPER_ADMIN,
];

/**
 * Clinical staff roles
 */
export const CLINICAL_ROLES = [
  UserRoles.DOCTOR,
  UserRoles.NURSE,
];

/**
 * Check if role has specific permission
 */
export const hasRole = (userRole, targetRole) => {
  if (userRole === UserRoles.SUPER_ADMIN) return true;
  return userRole === targetRole;
};

export const hasAnyRole = (userRole, roles = []) => {
  if (userRole === UserRoles.SUPER_ADMIN) return true;
  return roles.includes(userRole);
};

export const isBillingRole = (role) => BILLING_ROLES.includes(role);
export const isAdminRole = (role) => ADMIN_ROLES.includes(role);
export const isClinicalRole = (role) => CLINICAL_ROLES.includes(role);
