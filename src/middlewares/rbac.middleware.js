/**
 * RBAC (Role-Based Access Control) Middleware
 * 
 * Centralizes authorization logic. Supports both:
 * 1. DEPRECATED: Role-based checks - authorize('ADMIN') or authorize(['DOCTOR', 'ADMIN'])
 * 2. RECOMMENDED: Permission-based checks - authorizePermission('MANAGE_PATIENTS')
 * 
 * NEW APPROACH: Use permission-driven checks for better granularity and maintainability.
 * Role checks are supported for backward compatibility but should be migrated away from.
 * 
 * SUPER_ADMIN: Always granted access
 */

import { AuthorizationError } from '../shared/AppError.js';
import { hasPermission, roleHasPermission } from '../rbac/rolePermissions.js';

/**
 * DEPRECATED: Authorization middleware - checks if user has required role(s)
 * @deprecated Use authorizePermission() instead for permission-driven checks
 * @param {string|string[]} requiredRoles - Single role or array of roles
 * @returns {Function} Express middleware
 */
export const authorize = (requiredRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthorizationError('User not authenticated');
      }

      const userRole = req.user.role;
      const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      // SUPER_ADMIN has access to everything
      if (userRole === 'SUPER_ADMIN') {
        return next();
      }

      // Check if user has any of the required roles
      if (rolesArray.length > 0 && !rolesArray.includes(userRole)) {
        throw new AuthorizationError(
          `Access denied. This action requires one of: ${rolesArray.join(', ')}`
        );
      }

      next();
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return res.status(error.statusCode).json(error.toJSON());
      }
      return res.status(403).json(new AuthorizationError('Access denied').toJSON());
    }
  };
};

/**
 * RECOMMENDED: Permission-based authorization middleware
 * 
 * Checks if user has required permission(s) from their token.
 * Provides more fine-grained control than role-based checks.
 * 
 * @param {string|string[]} requiredPermissions - Single permission or array
 * @param {Object} options - Optional config
 * @param {boolean} options.requireAll - If true, user must have ALL permissions (AND logic)
 *                                       If false (default), user must have ANY (OR logic)
 * @returns {Function} Express middleware
 * 
 * @example
 * // Single permission (AND logic implicit)
 * authorizePermission('MANAGE_PATIENTS')
 * 
 * // Multiple permissions - user must have ANY
 * authorizePermission(['MANAGE_PATIENTS', 'VIEW_PATIENTS'])
 * 
 * // Multiple permissions - user must have ALL
 * authorizePermission(['MANAGE_PATIENTS', 'APPROVE_QC'], { requireAll: true })
 */
export const authorizePermission = (requiredPermissions, options = {}) => {
  const { requireAll = false } = options;
  
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthorizationError('User not authenticated');
      }

      // SUPER_ADMIN always has access
      if (req.user.role === 'SUPER_ADMIN') {
        return next();
      }

      // Get user permissions from token (populated by auth.middleware.js)
      const userPermissions = req.user.permissions || [];
      
      // Check permissions
      const permArray = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

      if (permArray.length === 0) {
        return next(); // No restrictions
      }

      const hasRequired = hasPermission(userPermissions, permArray, requireAll);
      
      if (!hasRequired) {
        const op = requireAll ? 'ALL of' : 'ANY of';
        throw new AuthorizationError(
          `Access denied. Permission required: ${op} [${permArray.join(', ')}]`
        );
      }

      next();
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return res.status(error.statusCode).json(error.toJSON());
      }
      return res.status(403).json(new AuthorizationError('Access denied').toJSON());
    }
  };
};

/**
 * DEPRECATED: Checks if user has a specific permission
 * Use authorizePermission() instead (middleware form)
 * @deprecated Use authorizePermission() for middleware or call hasPermission() in services
 */
export const requirePermission = (requiredPermission) => {
  return authorizePermission(requiredPermission);
};

/**
 * Service-level helper: Check if a role has a permission
 * Useful for inline permission checks in services/controllers
 * 
 * @param {string} role - Role name
 * @param {string|string[]} permissions - Permission(s) to check
 * @param {boolean} requireAll - If true, role must have ALL permissions
 * @returns {boolean} True if role has required permission(s)
 * 
 * @example
 * if (!roleHasPermission('DOCTOR', 'MANAGE_PATIENTS')) {
 *   throw new AuthorizationError('...');
 * }
 */
export { roleHasPermission, hasPermission } from '../rbac/rolePermissions.js';

/**
 * Express helper: Compose multiple permission requirements
 * Allows for complex logic: (A AND B) OR C
 * 
 * @param {Object} options - Config object
 * @param {string|string[]} options.require - Permissions user MUST have (AND)
 * @param {string|string[]} options.anyOf - Permissions user may have (OR)
 * @returns {Function} Express middleware
 * 
 * @example
 * // User must have MANAGE_PATIENTS AND (APPROVE_QC OR REVIEW_PATHOLOGY)
 * authorizeComplex({
 *   require: 'MANAGE_PATIENTS',
 *   anyOf: ['APPROVE_QC', 'REVIEW_PATHOLOGY']
 * })
 */
export const authorizeComplex = (options = {}) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthorizationError('User not authenticated');
      }

      if (req.user.role === 'SUPER_ADMIN') {
        return next();
      }

      const userPerms = req.user.permissions || [];
      const { require = [], anyOf = [] } = options;

      // Check required permissions (AND logic)
      const requiredArray = Array.isArray(require) ? require : [require];
      for (const perm of requiredArray) {
        if (perm && !userPerms.includes(perm)) {
          throw new AuthorizationError(
            `Access denied. Missing required permission: ${perm}`
          );
        }
      }

      // Check anyOf permissions (OR logic)
      const anyOfArray = Array.isArray(anyOf) ? anyOf : [anyOf];
      if (anyOfArray.length > 0 && !anyOfArray.some(p => userPerms.includes(p))) {
        throw new AuthorizationError(
          `Access denied. Must have one of: [${anyOfArray.join(', ')}]`
        );
      }

      next();
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return res.status(error.statusCode).json(error.toJSON());
      }
      return res.status(403).json(new AuthorizationError('Access denied').toJSON());
    }
  };
};

export default {
  authorize,
  authorizePermission,
  requirePermission,
  roleHasPermission,
  hasPermission,
  authorizeComplex,
};



















