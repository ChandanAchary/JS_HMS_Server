/**
 * Password Service
 * Handles password reset, forgot password, and first login password change
 * 
 * Security Features:
 * - OTP generated using crypto.randomInt() instead of Math.random()
 * - OTPs stored as bcrypt hashes (not plain text)
 * - Rate limiting: 3 attempts per 15 minutes
 * - Attempt tracking with account lockout
 * - Generic error messages to prevent email enumeration
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import logger from '../../core/utils/logger.js';
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  TooManyRequestsError,
  ServiceError,
} from '../../shared/exceptions/AppError.js';
import { sendOtpEmail, sendPasswordResetEmail, sendPasswordChangedEmail } from '../../services/email.service.js';

// Configuration
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 15;
const RATE_LIMIT_WINDOW_MINUTES = 15;
const MAX_REQUESTS_PER_WINDOW = 3;

// In-memory rate limiting store (in production, use Redis)
const rateLimitStore = new Map();
const otpAttemptStore = new Map();

export class PasswordService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Generate secure 6-digit OTP using crypto.randomInt
   * @returns {string} 6-digit OTP
   */
  generateSecureOTP() {
    // crypto.randomInt is cryptographically secure
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Hash OTP for secure storage
   * @param {string} otp - Plain text OTP
   * @returns {Promise<string>} Hashed OTP
   */
  async hashOTP(otp) {
    return await bcrypt.hash(otp, 10);
  }

  /**
   * Verify OTP against hash
   * @param {string} plainOtp - User provided OTP
   * @param {string} hashedOtp - Stored hashed OTP
   * @returns {Promise<boolean>}
   */
  async verifyOTP(plainOtp, hashedOtp) {
    return await bcrypt.compare(plainOtp, hashedOtp);
  }

  /**
   * Hash password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  /**
   * Verify password against hash
   * @param {string} plainPassword - User provided password
   * @param {string} hashedPassword - Stored hashed password
   * @returns {Promise<boolean>}
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Get Prisma model by user type
   */
  getModelByUserType(userType) {
    const models = {
      ADMIN: this.prisma.admin,
      EMPLOYEE: this.prisma.employee,
      DOCTOR: this.prisma.doctor,
    };
    return models[userType.toUpperCase()] || null;
  }

  /**
   * Check rate limiting for OTP requests
   * @param {string} identifier - Email or user identifier
   * @throws {TooManyRequestsError} If rate limit exceeded
   */
  checkRateLimit(identifier) {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowMs = RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;
    
    const record = rateLimitStore.get(key);
    
    if (record) {
      // Clean up old entries
      const validRequests = record.requests.filter(time => now - time < windowMs);
      
      if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        const oldestRequest = Math.min(...validRequests);
        const resetTime = new Date(oldestRequest + windowMs);
        throw new TooManyRequestsError(
          `Too many requests. Please try again after ${RATE_LIMIT_WINDOW_MINUTES} minutes.`,
          { resetAt: resetTime }
        );
      }
      
      record.requests = [...validRequests, now];
    } else {
      rateLimitStore.set(key, { requests: [now] });
    }

    // Cleanup old rate limit entries periodically
    this.cleanupRateLimitStore();
  }

  /**
   * Track OTP verification attempts
   * @param {string} identifier - Email or session identifier
   * @returns {number} Current attempt count
   */
  trackOTPAttempt(identifier) {
    const key = `attempts:${identifier}`;
    const now = Date.now();
    const lockoutMs = LOCKOUT_MINUTES * 60 * 1000;
    
    const record = otpAttemptStore.get(key);
    
    if (record) {
      // Check if in lockout period
      if (record.lockedUntil && record.lockedUntil > now) {
        const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
        throw new TooManyRequestsError(
          `Account temporarily locked. Please try again in ${remainingMinutes} minutes.`
        );
      }
      
      // Reset if lockout period has passed
      if (record.lockedUntil && record.lockedUntil <= now) {
        otpAttemptStore.set(key, { attempts: 1, lastAttempt: now });
        return 1;
      }
      
      record.attempts += 1;
      record.lastAttempt = now;
      
      // Lock if max attempts exceeded
      if (record.attempts >= MAX_OTP_ATTEMPTS) {
        record.lockedUntil = now + lockoutMs;
        throw new TooManyRequestsError(
          `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`
        );
      }
      
      return record.attempts;
    }
    
    otpAttemptStore.set(key, { attempts: 1, lastAttempt: now });
    return 1;
  }

  /**
   * Clear OTP attempts after successful verification
   * @param {string} identifier
   */
  clearOTPAttempts(identifier) {
    otpAttemptStore.delete(`attempts:${identifier}`);
  }

  /**
   * Cleanup expired rate limit entries (run periodically)
   */
  cleanupRateLimitStore() {
    const now = Date.now();
    const windowMs = RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;
    
    for (const [key, record] of rateLimitStore.entries()) {
      const validRequests = record.requests.filter(time => now - time < windowMs);
      if (validRequests.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }

  /**
   * Find user by email and type
   * @param {string} email 
   * @param {string} userType 
   * @returns {Promise<object|null>}
   */
  async findUserByEmail(email, userType) {
    const model = this.getModelByUserType(userType);
    if (!model) return null;

    const normalizedEmail = email.toLowerCase().trim();

    try {
      if (userType === 'ADMIN') {
        return await model.findFirst({
          where: { email: normalizedEmail }
        });
      }
      // Employee and Doctor have compound unique constraint with isDeleted
      return await model.findFirst({
        where: { 
          email: normalizedEmail,
          isDeleted: false
        }
      });
    } catch (error) {
      logger.error(`Error finding ${userType} by email:`, error);
      return null;
    }
  }

  // ============== FORGOT PASSWORD FLOW (2 STEPS) ==============

  /**
   * Step 1: Request password reset OTP
   * Sends OTP to user's email if account exists
   * 
   * @param {string} email - User email
   * @param {string} userType - ADMIN, EMPLOYEE, or DOCTOR
   * @returns {Promise<object>} - Generic success message (privacy)
   */
  async requestPasswordResetOTP(email, userType) {
    // Validate inputs
    if (!email || !userType) {
      throw new ValidationError('Email and user type are required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check rate limiting
    this.checkRateLimit(normalizedEmail);

    // Find user (don't reveal if exists)
    const user = await this.findUserByEmail(normalizedEmail, userType);

    // Always return same message for privacy (don't reveal if email exists)
    const genericMessage = 'If your email is registered, you will receive a verification code shortly.';

    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${normalizedEmail}`);
      return { message: genericMessage };
    }

    // Generate secure OTP
    const otp = this.generateSecureOTP();
    const hashedOTP = await this.hashOTP(otp);
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store hashed OTP in database
    const model = this.getModelByUserType(userType);
    
    try {
      await model.update({
        where: { id: user.id },
        data: {
          passwordResetOTP: hashedOTP,
          passwordResetOTPExpiry: otpExpiry,
          // Clear any existing reset tokens
          passwordResetToken: null,
          passwordResetExpiresAt: null,
        }
      });

      // Send OTP email
      const userName = user.name || user.fullName || 'User';
      const emailSent = await sendOtpEmail(normalizedEmail, userName, otp);

      if (!emailSent) {
        logger.error(`Failed to send password reset OTP to ${normalizedEmail}`);
        // Still return generic message for security
      }

      logger.info(`Password reset OTP sent to ${normalizedEmail}`);
    } catch (error) {
      logger.error(`Error storing password reset OTP:`, error);
      // Return generic message even on error
    }

    return { message: genericMessage };
  }

  /**
   * Step 2: Reset password using OTP
   * Verifies OTP and sets new password in one step
   * 
   * @param {string} email - User email
   * @param {string} userType - ADMIN, EMPLOYEE, or DOCTOR
   * @param {string} otp - 6-digit OTP
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm new password
   * @returns {Promise<object>} - Success message
   */
  async resetPasswordWithOTP(email, userType, otp, newPassword, confirmPassword) {
    // Validate inputs
    if (!email || !userType || !otp || !newPassword || !confirmPassword) {
      throw new ValidationError('All fields are required');
    }

    if (newPassword !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }

    if (newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      throw new ValidationError('Invalid OTP format. Must be 6 digits.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const attemptKey = `reset:${normalizedEmail}`;

    // Track attempts
    this.trackOTPAttempt(attemptKey);

    // Find user
    const user = await this.findUserByEmail(normalizedEmail, userType);
    
    if (!user) {
      throw new AuthenticationError('Invalid request. Please request a new OTP.');
    }

    // Check if OTP exists and not expired
    if (!user.passwordResetOTP || !user.passwordResetOTPExpiry) {
      throw new AuthenticationError('No pending password reset. Please request a new OTP.');
    }

    if (new Date() > new Date(user.passwordResetOTPExpiry)) {
      throw new AuthenticationError('OTP has expired. Please request a new one.');
    }

    // Verify hashed OTP
    const isOTPValid = await this.verifyOTP(otp, user.passwordResetOTP);
    
    if (!isOTPValid) {
      const remainingAttempts = MAX_OTP_ATTEMPTS - this.getAttemptCount(attemptKey);
      throw new AuthenticationError(
        `Invalid OTP. ${remainingAttempts > 0 ? `${remainingAttempts} attempts remaining.` : ''}`
      );
    }

    // Clear attempts on successful verification
    this.clearOTPAttempts(attemptKey);

    // Check if new password is different from current
    const isSamePassword = await this.verifyPassword(newPassword, user.password);
    if (isSamePassword) {
      throw new ValidationError('New password must be different from your current password.');
    }

    // Hash and save new password
    const hashedPassword = await this.hashPassword(newPassword);
    const model = this.getModelByUserType(userType);

    await model.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        // Clear all reset-related fields
        passwordResetOTP: null,
        passwordResetOTPExpiry: null,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        // Mark password as changed (for first login flow)
        isPasswordChanged: true,
      }
    });

    // Send confirmation email (optional)
    try {
      await sendPasswordChangedEmail(normalizedEmail, user.name || 'User');
    } catch (e) {
      logger.warn('Failed to send password changed confirmation email');
    }

    logger.info(`Password reset successfully for ${normalizedEmail}`);

    return { message: 'Password reset successfully. You can now login with your new password.' };
  }

  /**
   * Get current attempt count for an identifier
   * @param {string} identifier 
   * @returns {number}
   */
  getAttemptCount(identifier) {
    const key = `attempts:${identifier}`;
    const record = otpAttemptStore.get(key);
    return record ? record.attempts : 0;
  }

  // ============== FIRST LOGIN PASSWORD CHANGE ==============

  /**
   * Step 1: Send OTP for first login password change
   * Called when user must change their default password
   * 
   * @param {string} userId - User ID
   * @param {string} userType - ADMIN, EMPLOYEE, or DOCTOR
   * @returns {Promise<object>} - Success message
   */
  async sendFirstLoginOTP(userId, userType) {
    if (!userId || !userType) {
      throw new ValidationError('User ID and type are required');
    }

    const model = this.getModelByUserType(userType);
    if (!model) {
      throw new ValidationError('Invalid user type');
    }

    const user = await model.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check rate limiting
    this.checkRateLimit(user.email);

    // Generate secure OTP
    const otp = this.generateSecureOTP();
    const hashedOTP = await this.hashOTP(otp);
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP for password change
    await model.update({
      where: { id: userId },
      data: {
        changePasswordOTP: hashedOTP,
        changePasswordOTPExpiry: otpExpiry,
      }
    });

    // Send OTP email
    const emailSent = await sendOtpEmail(user.email, user.name || 'User', otp);

    if (!emailSent) {
      logger.error(`Failed to send first login OTP to ${user.email}`);
      throw new ServiceError('Failed to send verification code. Please try again.');
    }

    logger.info(`First login OTP sent to ${user.email}`);

    return { 
      message: 'Verification code sent to your email.',
      email: this.maskEmail(user.email)
    };
  }

  /**
   * Step 2: Change password on first login with OTP
   * Requires current password + new password + OTP verification
   * 
   * @param {string} userId - User ID
   * @param {string} userType - ADMIN, EMPLOYEE, or DOCTOR  
   * @param {string} currentPassword - Current/default password
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm new password
   * @param {string} otp - 6-digit OTP
   * @returns {Promise<object>} - Success message
   */
  async changePasswordFirstLogin(userId, userType, currentPassword, newPassword, confirmPassword, otp) {
    // Validate inputs
    if (!userId || !userType || !currentPassword || !newPassword || !confirmPassword || !otp) {
      throw new ValidationError('All fields are required');
    }

    if (newPassword !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }

    if (newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    if (!/^\d{6}$/.test(otp)) {
      throw new ValidationError('Invalid OTP format. Must be 6 digits.');
    }

    const model = this.getModelByUserType(userType);
    if (!model) {
      throw new ValidationError('Invalid user type');
    }

    const user = await model.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const attemptKey = `firstlogin:${userId}`;

    // Track attempts
    this.trackOTPAttempt(attemptKey);

    // Verify current password
    const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Check OTP exists and not expired
    if (!user.changePasswordOTP || !user.changePasswordOTPExpiry) {
      throw new AuthenticationError('No pending verification. Please request a new OTP.');
    }

    if (new Date() > new Date(user.changePasswordOTPExpiry)) {
      throw new AuthenticationError('Verification code has expired. Please request a new one.');
    }

    // Verify OTP
    const isOTPValid = await this.verifyOTP(otp, user.changePasswordOTP);
    
    if (!isOTPValid) {
      const remainingAttempts = MAX_OTP_ATTEMPTS - this.getAttemptCount(attemptKey);
      throw new AuthenticationError(
        `Invalid verification code. ${remainingAttempts > 0 ? `${remainingAttempts} attempts remaining.` : ''}`
      );
    }

    // Clear attempts
    this.clearOTPAttempts(attemptKey);

    // Check new password is different
    const isSamePassword = await this.verifyPassword(newPassword, user.password);
    if (isSamePassword) {
      throw new ValidationError('New password must be different from your current password.');
    }

    // Update password
    const hashedPassword = await this.hashPassword(newPassword);

    await model.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        changePasswordOTP: null,
        changePasswordOTPExpiry: null,
        changePasswordNewHash: null,
        isPasswordChanged: true,
      }
    });

    // Send confirmation email
    try {
      await sendPasswordChangedEmail(user.email, user.name || 'User');
    } catch (e) {
      logger.warn('Failed to send password changed confirmation email');
    }

    logger.info(`First login password changed for user ${userId}`);

    return { message: 'Password changed successfully. Please login with your new password.' };
  }

  // ============== REGULAR PASSWORD CHANGE WITH OTP ==============

  /**
   * Send OTP for regular password change (logged-in users)
   * 
   * @param {string} userId - User ID
   * @param {string} userType - ADMIN, EMPLOYEE, or DOCTOR
   * @returns {Promise<object>} - Success message
   */
  async sendChangePasswordOTP(userId, userType) {
    if (!userId || !userType) {
      throw new ValidationError('User ID and type are required');
    }

    const model = this.getModelByUserType(userType);
    if (!model) {
      throw new ValidationError('Invalid user type');
    }

    const user = await model.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check rate limiting
    this.checkRateLimit(user.email);

    // Generate secure OTP
    const otp = this.generateSecureOTP();
    const hashedOTP = await this.hashOTP(otp);
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP
    await model.update({
      where: { id: userId },
      data: {
        changePasswordOTP: hashedOTP,
        changePasswordOTPExpiry: otpExpiry,
      }
    });

    // Send OTP email
    const emailSent = await sendOtpEmail(user.email, user.name || 'User', otp);

    if (!emailSent) {
      throw new ServiceError('Failed to send verification code. Please try again.');
    }

    logger.info(`Change password OTP sent to ${user.email}`);

    return { 
      message: 'Verification code sent to your email.',
      email: this.maskEmail(user.email)
    };
  }

  /**
   * Change password with OTP verification (logged-in users)
   * 
   * @param {string} userId - User ID
   * @param {string} userType - ADMIN, EMPLOYEE, or DOCTOR
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm new password
   * @param {string} otp - 6-digit OTP
   * @returns {Promise<object>} - Success message
   */
  async changePasswordWithOTP(userId, userType, currentPassword, newPassword, confirmPassword, otp) {
    // Same logic as first login but doesn't require mustChangePassword
    return await this.changePasswordFirstLogin(userId, userType, currentPassword, newPassword, confirmPassword, otp);
  }

  // ============== HELPER METHODS ==============

  /**
   * Mask email for privacy (show first 2 and last chars)
   * @param {string} email 
   * @returns {string}
   */
  maskEmail(email) {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 3) {
      return `${localPart[0]}***@${domain}`;
    }
    return `${localPart.slice(0, 2)}***${localPart.slice(-1)}@${domain}`;
  }
}
