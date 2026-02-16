/**
 * Password Module Routes
 * Handles all password management endpoints
 */

import express from 'express';
import { PasswordController } from '../controllers/password.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

/**
 * Create password routes
 * @param {PrismaClient} prisma 
 * @returns {Router}
 */
export function createPasswordRoutes(prisma) {
  const router = express.Router();
  const controller = new PasswordController(prisma);

  // ============== FORGOT PASSWORD FLOW (PUBLIC) ==============
  
  /**
   * Step 1: Request password reset OTP
   * POST /api/password/forgot
   * Body: { email, userType }
   * Response: { message: "If email exists, OTP sent" }
   */
  router.post('/forgot', (req, res, next) => 
    controller.requestPasswordReset(req, res, next)
  );

  /**
   * Step 2: Reset password with OTP
   * POST /api/password/reset
   * Body: { email, userType, otp, newPassword, confirmPassword }
   * Response: { message: "Password reset successfully" }
   */
  router.post('/reset', (req, res, next) => 
    controller.resetPassword(req, res, next)
  );

  // ============== FIRST LOGIN PASSWORD CHANGE (PROTECTED) ==============
  
  /**
   * Send OTP for first login password change
   * POST /api/password/first-login/send-otp
   * Headers: Authorization: Bearer <token>
   * Response: { email: "ma***l@domain.com", message: "OTP sent" }
   */
  router.post('/first-login/send-otp', protect, (req, res, next) => 
    controller.sendFirstLoginOTP(req, res, next)
  );

  /**
   * Change password on first login with OTP
   * POST /api/password/first-login/change
   * Headers: Authorization: Bearer <token>
   * Body: { currentPassword, newPassword, confirmPassword, otp }
   * Response: { message: "Password changed successfully" }
   */
  router.post('/first-login/change', protect, (req, res, next) => 
    controller.changePasswordFirstLogin(req, res, next)
  );

  // ============== REGULAR PASSWORD CHANGE WITH OTP (PROTECTED) ==============
  
  /**
   * Send OTP for regular password change
   * POST /api/password/change/send-otp
   * Headers: Authorization: Bearer <token>
   * Response: { email: "ma***l@domain.com", message: "OTP sent" }
   */
  router.post('/change/send-otp', protect, (req, res, next) => 
    controller.sendChangePasswordOTP(req, res, next)
  );

  /**
   * Change password with OTP verification
   * POST /api/password/change
   * Headers: Authorization: Bearer <token>
   * Body: { currentPassword, newPassword, confirmPassword, otp }
   * Response: { message: "Password changed successfully" }
   */
  router.post('/change', protect, (req, res, next) => 
    controller.changePasswordWithOTP(req, res, next)
  );

  return router;
}

export default createPasswordRoutes;



















