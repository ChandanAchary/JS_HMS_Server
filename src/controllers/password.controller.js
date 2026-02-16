/**
 * Password Controller
 * Handles password management requests
 * 
 * Endpoints:
 * - POST /password/forgot - Request password reset OTP
 * - POST /password/reset - Reset password with OTP
 * - POST /password/first-login/send-otp - Send OTP for first login change
 * - POST /password/first-login/change - Change password on first login
 * - POST /password/change/send-otp - Send OTP for regular password change
 * - POST /password/change - Change password with OTP
 */

import { PasswordService } from '../services/password.service.js';
import { ApiResponse } from '../shared/ApiResponse.js';
import logger from '../utils/logger.js';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SendOTPDto,
  ChangePasswordWithOTPDto,
} from './password.validators.js';

export class PasswordController {
  constructor(prisma) {
    this.prisma = prisma;
    this.service = new PasswordService(prisma);
  }

  // ============== FORGOT PASSWORD FLOW ==============

  /**
   * Step 1: Request password reset OTP
   * POST /password/forgot
   * Body: { email, userType }
   * 
   * Security: Always returns generic message (doesn't reveal if email exists)
   */
  async requestPasswordReset(req, res, next) {
    try {
      const dto = new ForgotPasswordDto(req.body);
      const validation = dto.validate();

      if (!validation.valid) {
        return res.status(400).json(
          ApiResponse.badRequest(validation.errors.join('; '))
        );
      }

      const result = await this.service.requestPasswordResetOTP(dto.email, dto.userType);
      
      logger.info(`Password reset OTP requested for email: ${dto.email}`);
      
      return res.status(200).json(
        ApiResponse.success(null, result.message)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Step 2: Reset password with OTP
   * POST /password/reset
   * Body: { email, userType, otp, newPassword, confirmPassword }
   */
  async resetPassword(req, res, next) {
    try {
      const dto = new ResetPasswordDto(req.body);
      const validation = dto.validate();

      if (!validation.valid) {
        return res.status(400).json(
          ApiResponse.badRequest(validation.errors.join('; '))
        );
      }

      const result = await this.service.resetPasswordWithOTP(
        dto.email,
        dto.userType,
        dto.otp,
        dto.newPassword,
        dto.confirmPassword
      );
      
      logger.info(`Password reset successfully for email: ${dto.email}`);
      
      return res.status(200).json(
        ApiResponse.success(null, result.message)
      );
    } catch (error) {
      next(error);
    }
  }

  // ============== FIRST LOGIN PASSWORD CHANGE ==============

  /**
   * Send OTP for first login password change
   * POST /password/first-login/send-otp
   * Requires authentication
   */
  async sendFirstLoginOTP(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json(
          ApiResponse.unauthorized('Please login first')
        );
      }

      const userType = this.getUserType(req.user.role);
      
      const result = await this.service.sendFirstLoginOTP(req.user.id, userType);
      
      logger.info(`First login OTP sent for user: ${req.user.id}`);
      
      return res.status(200).json(
        ApiResponse.success({ email: result.email }, result.message)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password on first login with OTP
   * POST /password/first-login/change
   * Body: { currentPassword, newPassword, confirmPassword, otp }
   * Requires authentication
   */
  async changePasswordFirstLogin(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json(
          ApiResponse.unauthorized('Please login first')
        );
      }

      const dto = new ChangePasswordWithOTPDto(req.body);
      const validation = dto.validate();

      if (!validation.valid) {
        return res.status(400).json(
          ApiResponse.badRequest(validation.errors.join('; '))
        );
      }

      const userType = this.getUserType(req.user.role);

      const result = await this.service.changePasswordFirstLogin(
        req.user.id,
        userType,
        dto.currentPassword,
        dto.newPassword,
        dto.confirmPassword,
        dto.otp
      );
      
      logger.info(`First login password changed for user: ${req.user.id}`);
      
      return res.status(200).json(
        ApiResponse.success(null, result.message)
      );
    } catch (error) {
      next(error);
    }
  }

  // ============== REGULAR PASSWORD CHANGE WITH OTP ==============

  /**
   * Send OTP for password change (logged-in users)
   * POST /password/change/send-otp
   * Requires authentication
   */
  async sendChangePasswordOTP(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json(
          ApiResponse.unauthorized('Please login first')
        );
      }

      const userType = this.getUserType(req.user.role);
      
      const result = await this.service.sendChangePasswordOTP(req.user.id, userType);
      
      logger.info(`Change password OTP sent for user: ${req.user.id}`);
      
      return res.status(200).json(
        ApiResponse.success({ email: result.email }, result.message)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password with OTP verification (logged-in users)
   * POST /password/change
   * Body: { currentPassword, newPassword, confirmPassword, otp }
   * Requires authentication
   */
  async changePasswordWithOTP(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json(
          ApiResponse.unauthorized('Please login first')
        );
      }

      const dto = new ChangePasswordWithOTPDto(req.body);
      const validation = dto.validate();

      if (!validation.valid) {
        return res.status(400).json(
          ApiResponse.badRequest(validation.errors.join('; '))
        );
      }

      const userType = this.getUserType(req.user.role);

      const result = await this.service.changePasswordWithOTP(
        req.user.id,
        userType,
        dto.currentPassword,
        dto.newPassword,
        dto.confirmPassword,
        dto.otp
      );
      
      logger.info(`Password changed with OTP for user: ${req.user.id}`);
      
      return res.status(200).json(
        ApiResponse.success(null, result.message)
      );
    } catch (error) {
      next(error);
    }
  }

  // ============== HELPER METHODS ==============

  /**
   * Get user type from role
   * @param {string} role 
   * @returns {string}
   */
  getUserType(role) {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return 'ADMIN';
    if (role === 'DOCTOR') return 'DOCTOR';
    return 'EMPLOYEE';
  }
}



















