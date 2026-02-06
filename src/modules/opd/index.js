/**
 * OPD Module Index
 * Exports for OPD (Out-Patient Department) module
 */

import express from 'express';
import opdRoutes from './opd.routes.js';

// Login exports
export { OpdLoginController } from './opd-login.controller.js';
export { OpdLoginService } from './opd-login.service.js';

// RBAC Middleware exports
export {
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
  OPD_PERMISSIONS
} from './opd.rbac.middleware.js';

// Service exports
export { opdDashboardService } from './opd-dashboard.service.js';
export { opdConsultationService } from './opd-consultation.service.js';
export { default as vitalsService } from './vitals.service.js';

// Controller exports
export * as opdDashboardController from './opd-dashboard.controller.js';
export * as opdConsultationController from './opd-consultation.controller.js';
export * as vitalsController from './vitals.controller.js';

// Routes export
export { opdRoutes };
export { default as opdConsultationRoutes } from './opd-consultation.routes.js';

// Factory function to create OPD routes
export const createOpdRoutes = () => {
  const router = express.Router();
  router.use('/', opdRoutes);
  return router;
};
