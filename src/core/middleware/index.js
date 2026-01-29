/**
 * Core Middleware Setup
 * Centralized middleware initialization for the application
 */

export { protect as authMiddleware } from './auth.middleware.js';
export { authorize as rbacMiddleware } from './rbac.middleware.js';
export { errorHandler } from './errorHandler.middleware.js';
export { resolveTenant } from './resolveTenant.middleware.js';
