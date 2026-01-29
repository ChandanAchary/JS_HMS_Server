export const PERMISSIONS = {
  VIEW_DASHBOARD: "VIEW_DASHBOARD",
  VIEW_ATTENDANCE: "VIEW_ATTENDANCE",
  MARK_ATTENDANCE: "MARK_ATTENDANCE",
  VIEW_PAYROLL: "VIEW_PAYROLL",
  MANAGE_PAYROLL: "MANAGE_PAYROLL",
  VIEW_EMPLOYEES: "VIEW_EMPLOYEES",
  VIEW_DOCTORS: "VIEW_DOCTORS",
  MANAGE_USERS: "MANAGE_USERS",
  VIEW_PROFILE: "VIEW_PROFILE",
  BILLING_ACCESS: "BILLING_ACCESS"
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS = {
  ADMIN: ALL_PERMISSIONS,
  DOCTOR: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MARK_ATTENDANCE
  ],
  EMPLOYEE: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MARK_ATTENDANCE
  ],
  BILLING_ENTRY: [
    PERMISSIONS.BILLING_ACCESS
  ],
  BILLING_EXIT: [
    PERMISSIONS.BILLING_ACCESS
  ]
};

const normalizePermissions = (permissions) => {
  if (!permissions) return [];
  if (Array.isArray(permissions)) return permissions.filter(Boolean);
  return [permissions];
};

export const getPermissionsForRole = (role) => normalizePermissions(ROLE_PERMISSIONS[role]);

export const hasPermissions = (userPermissions, requiredPermissions, requireAll = true) => {
  const normalizedRequired = normalizePermissions(requiredPermissions);
  if (normalizedRequired.length === 0) return true;
  const userSet = new Set(userPermissions || []);
  return requireAll
    ? normalizedRequired.every((permission) => userSet.has(permission))
    : normalizedRequired.some((permission) => userSet.has(permission));
};