/**
 * OPD Login Service
 * Business logic for OPD staff authentication
 * Verifies credentials and generates JWT token
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../../core/utils/logger.js';
import config from '../../core/config/environment.js';
import { getPermissionsForRole } from '../../rbac/rolePermissions.js';

const OPD_ROLES = [
  'OPD_MANAGER',
  'OPD_COORDINATOR',
  'OPD_ASSISTANT',
  'NURSE',
  'DOCTOR',
  'RECEPTIONIST'
];

export class OpdLoginService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Verify password using bcrypt
   */
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      logger.error('Error verifying password:', error);
      throw new Error('Failed to verify password');
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
      throw new Error('Failed to generate token');
    }
  }

  /**
   * Login OPD staff member
   * Searches for user by email or phone in Employee or Doctor tables
   * Verifies they have an OPD role
   * Returns JWT token with permissions
   * 
   * @param {string} emailOrPhone - Email or phone number
   * @param {string} password - Plain password
   * @returns {object} { user, token, permissions }
   */
  async loginOpdStaff(emailOrPhone, password) {
    if (!emailOrPhone || !password) {
      throw new Error('Email/Phone and password are required');
    }

    // Normalize inputs
    const email = emailOrPhone.toLowerCase();
    const cleanPhone = emailOrPhone.replace(/\D/g, '');

    logger.info(`[OPD Login] Attempting login for: ${emailOrPhone}`);

    // Get hospital ID from context
    const hospital = await this.prisma.hospital.findFirst({
      where: { isActive: true },
      select: { id: true }
    });

    if (!hospital) {
      logger.error('[OPD Login] Hospital not configured');
      throw new Error('Hospital not configured');
    }

    const hospitalId = hospital.id;

    // Search for employee with OPD role
    let user = await this.prisma.employee.findFirst({
      where: {
        hospitalId,
        // Check if employee is active (either isActive=true OR status='ACTIVE')
        OR: [
          { isActive: true },
          { status: 'ACTIVE' }
        ],
        // AND search by email or phone
        AND: [
          {
            OR: [
              { email },
              { phone: cleanPhone }
            ]
          }
        ]
      }
    });

    // If found, verify it's an OPD role
    if (user) {
      logger.info(`[OPD Login] Found employee: ${user.email}, role: ${user.role}`);
      
      if (!user.role || !OPD_ROLES.includes(user.role)) {
        logger.warn(`[OPD Login] Employee ${user.email} has invalid role: ${user.role || 'NONE'}`);
        throw new Error(`Your role (${user.role || 'EMPLOYEE'}) is not authorized for OPD access. OPD roles: ${OPD_ROLES.join(', ')}`);
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        logger.warn(`[OPD Login] Invalid password for employee: ${user.email}`);
        throw new Error('Invalid credentials');
      }

      // Get permissions for role
      const permissions = getPermissionsForRole(user.role) || [];

      logger.info(`[OPD Login] Employee ${user.email} authenticated successfully. Permissions: ${permissions.join(', ')}`);

      // Generate token
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
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone
        },
        token,
        permissions
      };
    }

    logger.info(`[OPD Login] No employee found for: ${emailOrPhone}, searching doctors...`);

    // Search for doctor
    user = await this.prisma.doctor.findFirst({
      where: {
        hospitalId,
        // Check if doctor is active (either isActive=true OR status='ACTIVE')
        OR: [
          { isActive: true },
          { status: 'ACTIVE' }
        ],
        // AND search by email or phone
        AND: [
          {
            OR: [
              { email },
              { phone: cleanPhone }
            ]
          }
        ]
      }
    });

    if (user) {
      logger.info(`[OPD Login] Found doctor: ${user.email}`);
      
      // Doctors can access OPD
      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        logger.warn(`[OPD Login] Invalid password for doctor: ${user.email}`);
        throw new Error('Invalid credentials');
      }

      // Get permissions for DOCTOR role
      const permissions = getPermissionsForRole('DOCTOR') || [];

      logger.info(`[OPD Login] Doctor ${user.email} authenticated successfully. Permissions: ${permissions.join(', ')}`);

      // Generate token
      const token = this.generateToken({
        id: user.id,
        email: user.email,
        role: 'DOCTOR',
        permissions,
        hospitalId: user.hospitalId,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'DOCTOR',
          phone: user.phone,
          specialization: user.specialization
        },
        token,
        permissions
      };
    }

    // No valid user found
    logger.error(`[OPD Login] User not found: ${emailOrPhone}`);
    throw new Error('User not found or invalid credentials');
  }
}
