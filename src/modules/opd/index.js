/**
 * OPD Module Index
 * Exports for OPD (Out-Patient Department) module
 */

import express from 'express';
import opdRoutes from './opd.routes.js';

// RBAC Middleware exports
export {
  opdRbacMiddleware,
  canRecordVitals,
  canConsult,
  canManageQueue,
  canAccessAllQueues,
  requireOpdPermission
} from './opd.rbac.middleware.js';

// Service exports
export { opdDashboardService } from './opd-dashboard.service.js';
export { default as vitalsService } from './vitals.service.js';

// Controller exports
export * as opdDashboardController from './opd-dashboard.controller.js';
export * as vitalsController from './vitals.controller.js';

// Routes export
export { opdRoutes };

// Factory function to create OPD routes
export const createOpdRoutes = () => {
  const router = express.Router();
  router.use('/', opdRoutes);
  return router;
};
