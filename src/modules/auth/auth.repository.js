/**
 * Auth Repository
 * Handles all database operations for authentication
 */

import logger from '../../core/utils/logger.js';
import { DatabaseError } from '../../shared/exceptions/AppError.js';
import { getPermissionsForRole } from '../../rbac/rolePermissions.js';

export class AuthRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Find the latest join request by email (used as fallback for missing appliedRole/specialization)
   */
  async findLatestJoinRequestByEmail(email) {
    try {
      return await this.prisma.joinRequest.findFirst({
        where: { email: email.toLowerCase() },
        orderBy: { submittedAt: 'desc' },
      });
    } catch (error) {
      logger.warn('Error fetching join request fallback:', error);
      return null;
    }
  }

  /**
   * Find user by email or phone (searches across all user types)
   */
  async findUserByEmailOrPhone(emailOrPhone) {
    try {
      // Try to find admin
      const admin = await this.prisma.admin.findFirst({
        where: { 
          email: emailOrPhone.toLowerCase()
        },
      }).catch(() => null);

      if (admin) return { ...admin, userType: 'ADMIN' };

      // Try to find employee by email
      const employee = await this.prisma.employee.findFirst({
        where: { 
          email: emailOrPhone.toLowerCase()
        },
      }).catch(() => null);

      if (employee) return { ...employee, userType: 'EMPLOYEE' };

      // Try to find doctor by email
      const doctor = await this.prisma.doctor.findFirst({
        where: { 
          email: emailOrPhone.toLowerCase()
        },
      }).catch(() => null);

      if (doctor) return { ...doctor, userType: 'DOCTOR' };

      // Try phone number for employees
      const cleanPhone = emailOrPhone.replace(/\D/g, '');

      const empByPhone = await this.prisma.employee.findFirst({
        where: { 
          phone: cleanPhone
        },
      }).catch(() => null);

      if (empByPhone) return { ...empByPhone, userType: 'EMPLOYEE' };

      // Try phone number for doctors
      const docByPhone = await this.prisma.doctor.findFirst({
        where: { 
          phone: cleanPhone
        },
      }).catch(() => null);

      if (docByPhone) return { ...docByPhone, userType: 'DOCTOR' };

      return null;
    } catch (error) {
      logger.error('Error finding user:', error);
      throw new DatabaseError('Failed to find user');
    }
  }

  /**
   * Find user by specific type/role
   * Supports both user table types (ADMIN, EMPLOYEE, DOCTOR) and role-based lookups (NURSE, etc)
   */
  async findUserByType(userType, emailOrPhone) {
    try {
      // Normalize input
      const email = emailOrPhone.toLowerCase();
      const cleanPhone = emailOrPhone.replace(/\D/g, '');
      
      // Direct table lookups (ADMIN, EMPLOYEE, DOCTOR)
      if (userType === 'ADMIN') {
        return await this.prisma.admin.findFirst({
          where: { email }
        });
      }
      
      if (userType === 'DOCTOR') {
        return await this.prisma.doctor.findFirst({
          where: { 
            OR: [
              { email },
              { phone: cleanPhone }
            ]
          }
        });
      }
      
      if (userType === 'EMPLOYEE') {
        return await this.prisma.employee.findFirst({
          where: { 
            OR: [
              { email },
              { phone: cleanPhone }
            ]
          }
        });
      }
      
      // Role-based lookups (NURSE, OPD_ASSISTANT, etc.)
      // These map to Employee table with role field
      const employeeRoles = ['NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'OPD_ASSISTANT', 
                             'OPD_COORDINATOR', 'OPD_MANAGER', 'PHARMACIST', 'IPD_NURSE'];
      
      if (employeeRoles.includes(userType)) {
        return await this.prisma.employee.findFirst({
          where: {
            role: userType,
            OR: [
              { email },
              { phone: cleanPhone }
            ]
          }
        });
      }

      logger.warn(`Unknown user type: ${userType}`);
      return null;
    } catch (error) {
      logger.error(`Error finding ${userType}:`, error);
      throw new DatabaseError(`Failed to find ${userType}`);
    }
  }

  /**
   * Get Prisma model by user type (for create/update operations)
   */
  getModelByUserType(userType) {
    const models = {
      ADMIN: this.prisma.admin,
      EMPLOYEE: this.prisma.employee,
      DOCTOR: this.prisma.doctor,
    };
    return models[userType] || null;
  }

  /**
   * Update user password
   */
  async updatePassword(userId, userType, hashedPassword) {
    try {
      const model = this.getModelByUserType(userType);
      if (!model) throw new Error(`Invalid user type: ${userType}`);

      return await model.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    } catch (error) {
      logger.error('Error updating password:', error);
      throw new DatabaseError('Failed to update password');
    }
  }

  /**
   * Get user permissions by role
   * Uses static RBAC mapping from rolePermissions.js
   */
  async getUserPermissions(role) {
    try {
      // Use static RBAC mapping instead of database query
      const permissions = getPermissionsForRole(role);
      return permissions || [];
    } catch (error) {
      logger.warn(`Error getting permissions for role ${role}, returning empty array`);
      return [];
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email) {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { email: email.toLowerCase() },
      }).catch(() => null);

      if (admin) return true;

      const employee = await this.prisma.employee.findUnique({
        where: { email: email.toLowerCase() },
      }).catch(() => null);

      if (employee) return true;

      const doctor = await this.prisma.doctor.findUnique({
        where: { email: email.toLowerCase() },
      }).catch(() => null);

      return !!doctor;
    } catch (error) {
      logger.error('Error checking email:', error);
      throw new DatabaseError('Failed to check email');
    }
  }

  /**
   * Create new user (generic)
   */
  async createUser(userType, userData) {
    try {
      const model = this.getModelByUserType(userType);
      if (!model) throw new Error(`Invalid user type: ${userType}`);

      return await model.create({ data: userData });
    } catch (error) {
      logger.error('Error creating user:', error);
      throw new DatabaseError('Failed to create user');
    }
  }
}
