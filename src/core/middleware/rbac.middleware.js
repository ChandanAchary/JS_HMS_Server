/**
 * RBAC (Role-Based Access Control) Middleware
 * Authorizes endpoints based on user roles and permissions
 */

import { AuthorizationError } from '../../shared/exceptions/AppError.js';

/**
 * Authorization middleware - checks if user has required role(s)
 * @param {string|string[]} requiredRoles - Single role or array of roles
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
        throw new AuthorizationError(`This action requires one of: ${rolesArray.join(', ')}`);
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
 * Permission-based authorization - checks if user has specific permission
 * @param {string} requiredPermission - Permission to check
 */
export const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthorizationError('User not authenticated');
      }

      // SUPER_ADMIN has all permissions
      if (req.user.role === 'SUPER_ADMIN') {
        return next();
      }

      const userPermissions = req.user.permissions || [];
      if (!userPermissions.includes(requiredPermission)) {
        throw new AuthorizationError(`Permission '${requiredPermission}' required`);
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
