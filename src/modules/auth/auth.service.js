/**
 * Auth Service
 * Business logic for authentication
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../../core/utils/logger.js';
import config from '../../core/config/environment.js';
import {
  AuthenticationError,
  ValidationError,
  ConflictError,
  ServiceError,
} from '../../shared/exceptions/AppError.js';

export class AuthService {
  constructor(authRepository) {
    this.repository = authRepository;
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password, rounds = 10) {
    try {
      return await bcrypt.hash(password, rounds);
    } catch (error) {
      logger.error('Error hashing password:', error);
      throw new ServiceError('Failed to hash password');
    }
  }

  /**
   * Verify password
   */
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      logger.error('Error verifying password:', error);
      throw new ServiceError('Failed to verify password');
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(payload) {
    try {
      return jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRY,
      });
    } catch (error) {
      logger.error('Error generating token:', error);
      throw new ServiceError('Failed to generate token');
    }
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token expired');
      }
      throw new AuthenticationError('Invalid token');
    }
  }

  /**
   * Generate OTP (6 digits)
   */
  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Hash OTP
   */
  async hashOtp(otp) {
    try {
      return await bcrypt.hash(otp, 10);
    } catch (error) {
      logger.error('Error hashing OTP:', error);
      throw new ServiceError('Failed to hash OTP');
    }
  }

  /**
   * Verify OTP
   */
  async verifyOtp(plainOtp, hashedOtp) {
    try {
      return await bcrypt.compare(plainOtp, hashedOtp);
    } catch (error) {
      logger.error('Error verifying OTP:', error);
      throw new ServiceError('Failed to verify OTP');
    }
  }

  /**
   * Check if OTP is expired
   */
  isOtpExpired(expiryDate) {
    return new Date(expiryDate) < new Date();
  }

  /**
   * Get OTP expiry date (10 minutes from now)
   */
  getOtpExpiryDate() {
    return new Date(Date.now() + 10 * 60 * 1000);
  }

  /**
   * Login user - handles all user types
   * Includes hospitalSetupRequired flag for admins without hospital
   */
  async login(emailOrPhone, password, userType) {
    // Validate inputs
    if (!emailOrPhone) {
      throw new ValidationError('Email or phone is required');
    }
    if (!password) {
      throw new ValidationError('Password is required');
    }
    if (!userType) {
      throw new ValidationError('User type is required');
    }

    // Find user
    const user = await this.repository.findUserByType(userType, emailOrPhone);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check if user is active
    // Admin uses registrationStep (can be ADMIN_CREATED or COMPLETE), Employee/Doctor use status = 'ACTIVE'
    const isActive = userType === 'ADMIN' 
      ? user.registrationStep && ['ADMIN_CREATED', 'COMPLETE'].includes(user.registrationStep)
      : user.status === 'ACTIVE';
    
    if (!isActive) {
      throw new AuthenticationError('User account is not active');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Determine the role for token
    // Admin has role field in DB, Doctor/Employee role is based on userType
    const tokenRole = userType === 'ADMIN' ? user.role : userType;

    // Generate token
    const permissions = await this.repository.getUserPermissions(tokenRole);
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: tokenRole,
      permissions,
      hospitalId: user.hospitalId,
    });

    // Check if admin needs to configure hospital (Phase 3 of setup)
    const hospitalSetupRequired = userType === 'ADMIN' && !user.hospitalId;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: tokenRole,
        // Include mustChangePassword flag for admins
        mustChangePassword: userType === 'ADMIN' ? !user.isPasswordChanged : false,
        // Enterprise setup flow: flag if hospital needs configuration
        hospitalSetupRequired: hospitalSetupRequired,
      },
      token,
      permissions,
    };
  }

  /**
   * Register new user
   */
  async register(userType, userData) {
    // Check if email exists
    const emailExists = await this.repository.emailExists(userData.email);
    if (emailExists) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(userData.password);

    // Create user
    const user = await this.repository.createUser(userType, {
      ...userData,
      password: hashedPassword,
      status: 'ACTIVE',
    });

    // Generate token
    const permissions = await this.repository.getUserPermissions(user.role);
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      permissions,
      hospitalId: user.hospitalId,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
      token,
      permissions,
    };
  }

  /**
   * Change password
   */
  async changePassword(userId, userType, currentPassword, newPassword) {
    // Validate inputs
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Both passwords are required');
    }

    if (newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters');
    }

    // Get user
    const user = await this.repository.findUserByType(userType, userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Verify current password
    const isPasswordValid = await this.verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await this.hashPassword(newPassword);

    // Update password
    await this.repository.updatePassword(userId, userType, hashedNewPassword);

    return { message: 'Password changed successfully' };
  }

  /**
   * Reset password (admin/system)
   */
  async resetPassword(userId, userType, newPassword) {
    if (!newPassword || newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await this.repository.updatePassword(userId, userType, hashedPassword);

    return { message: 'Password reset successfully' };
  }
}
