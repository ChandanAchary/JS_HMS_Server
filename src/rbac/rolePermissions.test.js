/**
 * RBAC Role Permissions - Unit Tests
 * 
 * Tests for centralized role-permission mapping and authorization helpers
 */

import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  getPermissionsForRole,
  roleHasPermission,
  hasPermission,
} from '../rolePermissions.js';

describe('RBAC - Role Permissions', () => {
  describe('PERMISSIONS constant', () => {
    it('should define all required permissions', () => {
      expect(PERMISSIONS).toBeDefined();
      expect(PERMISSIONS.MANAGE_PATIENTS).toBe('MANAGE_PATIENTS');
      expect(PERMISSIONS.RECORD_VITALS).toBe('RECORD_VITALS');
      expect(PERMISSIONS.PROVIDE_CONSULTATION).toBe('PROVIDE_CONSULTATION');
      expect(PERMISSIONS.MANAGE_QUEUE).toBe('MANAGE_QUEUE');
      expect(PERMISSIONS.GENERATE_REPORT).toBe('GENERATE_REPORT');
    });

    it('should have unique permission names', () => {
      const values = Object.values(PERMISSIONS);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('ROLE_PERMISSIONS mapping', () => {
    it('should define roles', () => {
      expect(ROLE_PERMISSIONS.SUPER_ADMIN).toBeDefined();
      expect(ROLE_PERMISSIONS.ADMIN).toBeDefined();
      expect(ROLE_PERMISSIONS.DOCTOR).toBeDefined();
      expect(ROLE_PERMISSIONS.EMPLOYEE).toBeDefined();
      expect(ROLE_PERMISSIONS.PATHOLOGY).toBeDefined();
    });

    it('SUPER_ADMIN should have all permissions', () => {
      const allPermissions = Object.values(PERMISSIONS);
      expect(ROLE_PERMISSIONS.SUPER_ADMIN).toContain('MANAGE_PATIENTS');
      expect(ROLE_PERMISSIONS.SUPER_ADMIN.length).toBeGreaterThanOrEqual(allPermissions.length);
    });

    it('DOCTOR should have clinical permissions', () => {
      expect(ROLE_PERMISSIONS.DOCTOR).toContain(PERMISSIONS.PROVIDE_CONSULTATION);
      expect(ROLE_PERMISSIONS.DOCTOR).toContain(PERMISSIONS.MANAGE_PATIENTS);
    });

    it('PATHOLOGY should have diagnostic permissions', () => {
      expect(ROLE_PERMISSIONS.PATHOLOGY).toContain(PERMISSIONS.GENERATE_REPORT);
      expect(ROLE_PERMISSIONS.PATHOLOGY).toContain(PERMISSIONS.APPROVE_QC);
      expect(ROLE_PERMISSIONS.PATHOLOGY).toContain(PERMISSIONS.REVIEW_PATHOLOGY);
    });

    it('EMPLOYEE base role should have minimal permissions', () => {
      const empPerms = ROLE_PERMISSIONS.EMPLOYEE;
      expect(empPerms.length).toBeLessThan(ROLE_PERMISSIONS.DOCTOR.length);
      expect(empPerms).toContain(PERMISSIONS.VIEW_PROFILE);
    });
  });

  describe('getPermissionsForRole', () => {
    it('should return permissions for valid role', () => {
      const perms = getPermissionsForRole('DOCTOR');
      expect(Array.isArray(perms)).toBe(true);
      expect(perms.length).toBeGreaterThan(0);
      expect(perms).toContain(PERMISSIONS.PROVIDE_CONSULTATION);
    });

    it('should return empty array for unknown role', () => {
      const perms = getPermissionsForRole('UNKNOWN_ROLE');
      expect(Array.isArray(perms)).toBe(true);
      expect(perms.length).toBe(0);
    });

    it('should return empty array for null role', () => {
      const perms = getPermissionsForRole(null);
      expect(Array.isArray(perms)).toBe(true);
      expect(perms.length).toBe(0);
    });

    it('should return array not reference', () => {
      const perms1 = getPermissionsForRole('DOCTOR');
      const perms2 = getPermissionsForRole('DOCTOR');
      expect(perms1).toEqual(perms2);
      // Modifying returned array should not affect ROLE_PERMISSIONS
      perms1.push('FAKE_PERMISSION');
      expect(getPermissionsForRole('DOCTOR')).not.toContain('FAKE_PERMISSION');
    });
  });

  describe('roleHasPermission', () => {
    it('should return true for SUPER_ADMIN with any permission', () => {
      expect(roleHasPermission('SUPER_ADMIN', PERMISSIONS.MANAGE_PATIENTS)).toBe(true);
      expect(roleHasPermission('SUPER_ADMIN', 'NONEXISTENT')).toBe(true);
    });

    it('should return true for ADMIN with any permission', () => {
      expect(roleHasPermission('ADMIN', PERMISSIONS.MANAGE_PATIENTS)).toBe(true);
      expect(roleHasPermission('ADMIN', PERMISSIONS.GENERATE_REPORT)).toBe(true);
    });

    it('should return true when role has permission', () => {
      expect(roleHasPermission('DOCTOR', PERMISSIONS.PROVIDE_CONSULTATION)).toBe(true);
      expect(roleHasPermission('PATHOLOGY', PERMISSIONS.GENERATE_REPORT)).toBe(true);
    });

    it('should return false when role lacks permission', () => {
      expect(roleHasPermission('DOCTOR', PERMISSIONS.MANAGE_QUEUE)).toBe(false);
      expect(roleHasPermission('EMPLOYEE', PERMISSIONS.MANAGE_PATIENTS)).toBe(false);
    });

    it('should handle unknown roles', () => {
      expect(roleHasPermission('UNKNOWN', PERMISSIONS.MANAGE_PATIENTS)).toBe(false);
    });
  });

  describe('hasPermission', () => {
    const userPermissions = [
      PERMISSIONS.MANAGE_PATIENTS,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.PROVIDE_CONSULTATION,
    ];

    it('should return true when user has required permission', () => {
      expect(hasPermission(userPermissions, PERMISSIONS.MANAGE_PATIENTS)).toBe(true);
      expect(hasPermission(userPermissions, PERMISSIONS.VIEW_REPORTS)).toBe(true);
    });

    it('should return false when user lacks permission', () => {
      expect(hasPermission(userPermissions, PERMISSIONS.MANAGE_QUEUE)).toBe(false);
      expect(hasPermission(userPermissions, PERMISSIONS.RECORD_VITALS)).toBe(false);
    });

    describe('with array of permissions and requireAll=false (OR logic)', () => {
      it('should return true if user has ANY required permission', () => {
        const required = [PERMISSIONS.MANAGE_PATIENTS, PERMISSIONS.RECORD_VITALS];
        expect(hasPermission(userPermissions, required, false)).toBe(true); // has first one
      });

      it('should return true if user has multiple required permissions', () => {
        const required = [PERMISSIONS.MANAGE_PATIENTS, PERMISSIONS.VIEW_REPORTS];
        expect(hasPermission(userPermissions, required, false)).toBe(true);
      });

      it('should return false if user has none of required permissions', () => {
        const required = [PERMISSIONS.MANAGE_QUEUE, PERMISSIONS.RECORD_VITALS];
        expect(hasPermission(userPermissions, required, false)).toBe(false);
      });
    });

    describe('with array of permissions and requireAll=true (AND logic)', () => {
      it('should return true if user has ALL required permissions', () => {
        const required = [PERMISSIONS.MANAGE_PATIENTS, PERMISSIONS.VIEW_REPORTS];
        expect(hasPermission(userPermissions, required, true)).toBe(true);
      });

      it('should return false if user lacks any required permission', () => {
        const required = [PERMISSIONS.MANAGE_PATIENTS, PERMISSIONS.RECORD_VITALS];
        expect(hasPermission(userPermissions, required, true)).toBe(false);
      });

      it('should return false if user has none of required permissions', () => {
        const required = [PERMISSIONS.MANAGE_QUEUE, PERMISSIONS.RECORD_VITALS];
        expect(hasPermission(userPermissions, required, true)).toBe(false);
      });
    });

    it('should return true for empty required array', () => {
      expect(hasPermission(userPermissions, [], false)).toBe(true);
      expect(hasPermission(userPermissions, [], true)).toBe(true);
    });

    it('should return false for null/undefined user permissions', () => {
      expect(hasPermission(null, PERMISSIONS.MANAGE_PATIENTS)).toBe(false);
      expect(hasPermission(undefined, PERMISSIONS.MANAGE_PATIENTS)).toBe(false);
      expect(hasPermission([], PERMISSIONS.MANAGE_PATIENTS)).toBe(false);
    });

    it('should handle string or array input', () => {
      const perm = PERMISSIONS.MANAGE_PATIENTS;
      const permArray = [PERMISSIONS.MANAGE_PATIENTS];

      expect(hasPermission(userPermissions, perm)).toBe(true);
      expect(hasPermission(userPermissions, permArray)).toBe(true);
    });
  });

  describe('Role hierarchy and permission distribution', () => {
    it('should have DOCTOR with more permissions than base EMPLOYEE', () => {
      const doctorPerms = getPermissionsForRole('DOCTOR');
      const empPerms = getPermissionsForRole('EMPLOYEE');
      expect(doctorPerms.length).toBeGreaterThan(empPerms.length);
    });

    it('should have all diagnostic roles defined', () => {
      const diagnosticRoles = ['PATHOLOGY', 'LAB_TECHNICIAN', 'XRAY', 'MRI', 'CT_SCAN', 'ULTRASOUND', 'ECG', 'ENDOSCOPY'];
      diagnosticRoles.forEach(role => {
        expect(ROLE_PERMISSIONS[role]).toBeDefined();
        expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true);
        expect(ROLE_PERMISSIONS[role].length).toBeGreaterThan(0);
      });
    });

    it('all diagnostic roles should have GENERATE_REPORT', () => {
      const diagnosticRoles = ['PATHOLOGY', 'LAB_TECHNICIAN', 'XRAY', 'MRI'];
      diagnosticRoles.forEach(role => {
        expect(roleHasPermission(role, PERMISSIONS.GENERATE_REPORT)).toBe(true);
      });
    });

    it('OPD roles should have their specific permissions', () => {
      expect(roleHasPermission('NURSE', PERMISSIONS.RECORD_VITALS)).toBe(true);
      expect(roleHasPermission('DOCTOR', PERMISSIONS.PROVIDE_CONSULTATION)).toBe(true);
      expect(roleHasPermission('OPD_COORDINATOR', PERMISSIONS.MANAGE_QUEUE)).toBe(true);
    });
  });

  describe('Edge cases and safety', () => {
    it('should not modify ROLE_PERMISSIONS when querying', () => {
      const original = JSON.stringify(ROLE_PERMISSIONS);
      
      getPermissionsForRole('DOCTOR');
      roleHasPermission('DOCTOR', PERMISSIONS.MANAGE_PATIENTS);
      hasPermission(['PERM1'], ['PERM2']);

      expect(JSON.stringify(ROLE_PERMISSIONS)).toBe(original);
    });

    it('should handle case sensitivity in roles', () => {
      expect(getPermissionsForRole('doctor')).toEqual([]); // lowercase not found
      expect(getPermissionsForRole('DOCTOR').length).toBeGreaterThan(0); // uppercase works
    });

    it('should handle whitespace in permission checks', () => {
      const perms = [PERMISSIONS.MANAGE_PATIENTS];
      expect(hasPermission(perms, ' MANAGE_PATIENTS')).toBe(false); // space matters
      expect(hasPermission(perms, PERMISSIONS.MANAGE_PATIENTS)).toBe(true);
    });
  });
});
