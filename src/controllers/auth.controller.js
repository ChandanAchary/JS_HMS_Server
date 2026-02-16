/**
 * Auth Controller
 * Handles auth requests and returns responses
 */

import logger from '../utils/logger.js';
import { ApiResponse } from '../shared/ApiResponse.js';
import { AuthService } from '../services/auth.service.js';
import { AuthRepository } from '../services/auth.repository.js';
import { AuthValidators } from './auth.validators.js';
import {
  LoginResponseDto,
  LoginRequestDto,
  ChangePasswordDto,
} from './auth.validators.js';

export class AuthController {
  constructor(prisma) {
    this.prisma = prisma;
    this.repository = new AuthRepository(prisma);
    this.service = new AuthService(this.repository);
  }

  /**
   * Login endpoint with role from URL path
   * POST /api/auth/:role/login
   * Role is passed in URL path, NOT in request body
   */
  async login(req, res, next) {
    try {
      const { emailOrPhone, password } = req.body;
      const { role } = req.params;

      // Validate request (role comes from URL path)
      AuthValidators.validateRoleLogin(emailOrPhone, password, role);

      // Perform login
      const result = await this.service.login(emailOrPhone, password, role.toUpperCase());

      // Build response
      const response = new LoginResponseDto(result.user, result.token, result.permissions);

      logger.info(`User ${result.user.email} logged in as ${role}`);
      res.status(200).json(ApiResponse.success(response, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unified login endpoint - auto-detects user type
   * POST /api/auth/login
   * Body: { emailOrPhone: string, password: string }
   * 
   * Auto-detects whether user is ADMIN, DOCTOR, EMPLOYEE, etc.
   * This is the recommended endpoint for login throughout the project
   */
  async unifiedLogin(req, res, next) {
    try {
      const { emailOrPhone, password } = req.body;

      // Validate request
      if (!emailOrPhone || !password) {
        return res.status(400).json(
          ApiResponse.badRequest('Email/Phone and password are required')
        );
      }

      logger.info(`[Unified Login] Attempting login for: ${emailOrPhone}`);

      // Try to find user by email/phone automatically (searches all user types)
      const user = await this.repository.findUserByEmailOrPhone(emailOrPhone);
      
      if (!user) {
        logger.warn(`[Unified Login] User not found: ${emailOrPhone}`);
        return res.status(401).json(
          ApiResponse.unauthorized('Invalid email/phone or password')
        );
      }

      const userType = user.userType || 'EMPLOYEE';
      logger.info(`[Unified Login] Found user: ${user.email}, type: ${userType}`);

      // Perform login with detected user type
      const result = await this.service.login(emailOrPhone, password, userType);

      // Build response
      const response = new LoginResponseDto(result.user, result.token, result.permissions);

      logger.info(`[Unified Login] Successfully logged in: ${result.user.email} as ${result.user.role}`);
      res.status(200).json(ApiResponse.success(response, 'Login successful'));
    } catch (error) {
      if (error.message.includes('Invalid credentials') || error.message.includes('not active')) {
        return res.status(401).json(
          ApiResponse.unauthorized('Invalid email/phone or password')
        );
      }
      next(error);
    }
  }

  /**
   * Register endpoint
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, phone, password, userType = 'EMPLOYEE' } = req.body;

      // Validate request
      AuthValidators.validateRegister(name, email, phone, password);

      // Perform registration
      const result = await this.service.register(userType, {
        name,
        email: email.toLowerCase(),
        phone: phone.replace(/\D/g, ''),
        password,
        role: userType,
      });

      // Build response
      const response = new LoginResponseDto(result.user, result.token, result.permissions);

      logger.info(`New user registered: ${result.user.email}`);
      res.status(201).json(ApiResponse.created(response, 'Registration successful'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify token endpoint
   * POST /api/v1/auth/verify
   */
  async verifyToken(req, res, next) {
    try {
      const token = req.body.token || req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(400).json(ApiResponse.badRequest('Token is required'));
      }

      const decoded = this.service.verifyToken(token);

      res.status(200).json(ApiResponse.success(decoded, 'Token is valid'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password endpoint
   * POST /api/v1/auth/change-password
   * Requires authentication
   */
  async changePassword(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json(ApiResponse.unauthorized('Please login first'));
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validate request
      AuthValidators.validateChangePassword(currentPassword, newPassword, confirmPassword);

      // Change password
      // Note: You'll need to determine userType from context
      const userType = req.user.role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE';
      await this.service.changePassword(req.user.id, userType, currentPassword, newPassword);

      logger.info(`Password changed for user: ${req.user.email}`);
      res.status(200).json(ApiResponse.success(null, 'Password changed successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   * Requires authentication
   */
  async getProfile(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json(ApiResponse.unauthorized('Please login first'));
      }

      res.status(200).json(
        ApiResponse.success(req.user, 'Profile retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh token
   * POST /api/v1/auth/refresh
   */
  async refreshToken(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json(ApiResponse.unauthorized('Please login first'));
      }

      const newToken = this.service.generateToken({
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        permissions: req.user.permissions || [],
        hospitalId: req.user.hospitalId,
      });

      res.status(200).json(ApiResponse.success({ token: newToken }, 'Token refreshed successfully'));
    } catch (error) {
      next(error);
    }
  }
}



















