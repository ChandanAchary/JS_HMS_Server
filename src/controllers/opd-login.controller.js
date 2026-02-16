/**
 * OPD Login Controller
 * Dedicated login endpoint for OPD staff
 * Handles: email/phone + password → returns JWT token
 */

import logger from '../utils/logger.js';
import { ApiResponse } from '../shared/ApiResponse.js';
import { OpdLoginService } from '../services/opd-login.service.js';

export class OpdLoginController {
  constructor(prisma) {
    this.prisma = prisma;
    this.service = new OpdLoginService(prisma);
  }

  /**
   * OPD Staff Login
   * POST /api/opd/login
   * 
   * Body: {
   *   emailOrPhone: "staff@hospital.com" or "9876543210",
   *   password: "password123"
   * }
   * 
   * Returns: { token, user }
   */
  async login(req, res, next) {
    try {
      const { emailOrPhone, password } = req.body;

      // Validate request
      if (!emailOrPhone || !password) {
        return res.status(400).json(
          ApiResponse.badRequest('Email/Phone and password are required')
        );
      }

      // Perform OPD login
      const result = await this.service.loginOpdStaff(emailOrPhone, password);

      logger.info(`[OPD Login] Successfully logged in: ${result.user.email} as ${result.user.role}`);

      res.status(200).json(
        ApiResponse.success(
          {
            token: result.token,
            user: result.user,
            permissions: result.permissions
          },
          'OPD Login successful'
        )
      );
    } catch (error) {
      logger.error(`[OPD Login] Error: ${error.message}`);
      
      // Return appropriate error based on error type
      if (error.message.includes('not found') || error.message.includes('Invalid credentials')) {
        return res.status(401).json(
          ApiResponse.unauthorized('Invalid email/phone or password')
        );
      }

      if (error.message.includes('not an OPD') || error.message.includes('not active')) {
        return res.status(403).json(
          ApiResponse.forbidden(error.message)
        );
      }

      next(error);
    }
  }
}



















