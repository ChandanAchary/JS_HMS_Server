import { PERMISSIONS } from "./permissions.js";

// Role -> permissions mapping
// WHY: Define baseline permissions for each role. Tokens may include a `permissions`
// array to short-circuit checks; otherwise permission middleware falls back to this map.
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: Object.values(PERMISSIONS), // full access across system
  ADMIN: Object.values(PERMISSIONS), // legacy ADMIN role has full access within its hospital
  TENANT_ADMIN: [
    PERMISSIONS.ADMINISTER_TENANT,
    PERMISSIONS.MANAGE_EMPLOYEE,
    PERMISSIONS.MANAGE_SUBSCRIPTIONS,
    PERMISSIONS.MANAGE_BILLING,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.PRINT_REPORT,
    PERMISSIONS.DISPATCH_REPORT,
    PERMISSIONS.INVITE_USER,
  ],
  HR_: [PERMISSIONS.INVITE_USER, PERMISSIONS.MANAGE_EMPLOYEE],
  DOCTOR: [PERMISSIONS.GENERATE_REPORT, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.MANAGE_PATIENTS],
  LAB_TECH: [PERMISSIONS.GENERATE_REPORT, PERMISSIONS.VIEW_REPORTS],
  DISPATCH: [PERMISSIONS.VIEW_REPORTS, PERMISSIONS.DISPATCH_REPORT],
  EMPLOYEE: [PERMISSIONS.VIEW_REPORTS],
};

export function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

export default ROLE_PERMISSIONS;
