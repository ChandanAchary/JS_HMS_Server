/**
 * Auth Module Routes
 * API v1 routes for authentication
 */

import express from 'express';
import { AuthController } from './auth.controller.js';
import { protect, debugUserContext } from '../../core/middleware/auth.middleware.js';

export function createAuthRoutes(prisma) {
  const router = express.Router();
  const controller = new AuthController(prisma);

  /**
   * Public routes (no authentication required)
   * Role is passed in URL path, NOT in request body
   */
  // Role-specific login endpoints
  // POST /api/auth/admin/login
  // POST /api/auth/doctor/login
  // POST /api/auth/employee/login
  // POST /api/auth/patient/login
  router.post('/:role/login', (req, res, next) => controller.login(req, res, next));
  
  router.post('/register', (req, res, next) => controller.register(req, res, next));
  router.post('/verify', (req, res, next) => controller.verifyToken(req, res, next));

  /**
   * Protected routes (authentication required)
   */
  router.post('/change-password', protect, (req, res, next) =>
    controller.changePassword(req, res, next)
  );
  router.get('/me', protect, (req, res, next) => controller.getProfile(req, res, next));
  router.post('/refresh', protect, (req, res, next) => controller.refreshToken(req, res, next));
  
  // Debug endpoint - shows user context with permissions (staging/dev only)
  router.get('/debug', protect, debugUserContext);

  return router;
}
