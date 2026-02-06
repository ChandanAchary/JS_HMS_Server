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
   * Login user - handles all user types (ADMIN, DOCTOR, NURSE, RECEPTIONIST, etc)
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

    logger.info(`[Auth Login] Attempting login for: ${emailOrPhone}, type: ${userType}`);

    // Find user by type (supports both table types and roles)
    const user = await this.repository.findUserByType(userType, emailOrPhone);
    if (!user) {
      logger.warn(`[Auth Login] User not found: ${emailOrPhone}, type: ${userType}`);
      throw new AuthenticationError('Invalid credentials');
    }

    logger.info(`[Auth Login] Found user: ${user.email}, id: ${user.id}`);

    // Check if user is active
    // Admin uses registrationStep, others use status = 'ACTIVE' OR isActive = true
    const isActive = userType === 'ADMIN' 
      ? user.registrationStep && ['ADMIN_CREATED', 'COMPLETE'].includes(user.registrationStep)
      : (user.status === 'ACTIVE' || user.isActive === true) && user.isActive !== false;
    
    if (!isActive) {
      logger.warn(`[Auth Login] User account is not active: ${user.email}, status: ${user.status}, isActive: ${user.isActive}`);
      throw new AuthenticationError('User account is not active');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`[Auth Login] Invalid password for user: ${user.email}`);
      throw new AuthenticationError('Invalid credentials');
    }

    logger.info(`[Auth Login] Password verified for user: ${user.email}`);

    // Determine the role for token
    // Priority: Explicitly passed userType (e.g., NURSE) -> user.role (for Employee) -> userType
    let tokenRole = userType;
    
    // If user is Employee and has a role, use that role
    if (user.role && ['NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'OPD_ASSISTANT', 
                      'OPD_COORDINATOR', 'OPD_MANAGER', 'PHARMACIST', 'IPD_NURSE'].includes(user.role)) {
      tokenRole = user.role;
    }
    // For Admin, use the admin role if it exists
    else if (userType === 'ADMIN' && user.role) {
      tokenRole = user.role;
    }
    // For Doctor, use DOCTOR as role
    else if (userType === 'DOCTOR') {
      tokenRole = 'DOCTOR';
    }

    // Generate token
    const permissions = await this.repository.getUserPermissions(tokenRole);
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: tokenRole,
      permissions,
      hospitalId: user.hospitalId,
    });

    logger.info(`[Auth Login] Generated token for user: ${user.email}, role: ${tokenRole}, permissions: ${permissions.join(', ')}`);

    // Check if admin needs to configure hospital (Phase 3 of setup)
    const hospitalSetupRequired = userType === 'ADMIN' && !user.hospitalId;

    // Check if user must change password (first login)
    // All user types have isPasswordChanged field in schema
    const mustChangePassword = user.isPasswordChanged === false;

    // Build response user object with fallbacks for specialization/appliedRole
    let specialization = user.specialization || null;
    let appliedRole = user.appliedRole || user.roleApplied || null;

    // For EMPLOYEE records the actual assigned role is typically stored in `employee.role`
    if (tokenRole === 'EMPLOYEE' && !appliedRole) {
      appliedRole = user.role || appliedRole || null;
    }

    // If still missing, try to fetch the latest join request as a fallback
    if ((!specialization || !appliedRole) && this.repository.findLatestJoinRequestByEmail) {
      try {
        const joinReq = await this.repository.findLatestJoinRequestByEmail(user.email);
        if (joinReq) {
          // join request may store specialization or appliedRole either at root or inside formData
          if (!specialization) {
            specialization = joinReq.specialization || joinReq.appliedRole || specialization || null;
            if (!specialization && joinReq.formData) {
              const fd = typeof joinReq.formData === 'string' ? JSON.parse(joinReq.formData) : joinReq.formData;
              specialization = fd?.specialization || fd?.speciality || specialization || null;
            }
          }
          if (!appliedRole) {
            appliedRole = joinReq.appliedRole || joinReq.roleApplied || appliedRole || null;
            if (!appliedRole && joinReq.formData) {
              const fd = typeof joinReq.formData === 'string' ? JSON.parse(joinReq.formData) : joinReq.formData;
              appliedRole = fd?.roleApplied || fd?.roleAppliedFor || fd?.appliedRole || appliedRole || null;
            }
          }
        }
      } catch (err) {
        // Non-fatal: log and continue with whatever we have
        logger.warn('AuthService: join request fallback failed', err);
      }
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: tokenRole,
        // Include mustChangePassword flag for all users (first login flow)
        mustChangePassword: mustChangePassword,
        // Enterprise setup flow: flag if hospital needs configuration
        hospitalSetupRequired: hospitalSetupRequired,
        // Expose doctor specialization or employee applied role when available
        specialization: specialization || null,
        appliedRole: appliedRole || null,
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
