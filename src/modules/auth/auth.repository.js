/**
 * Auth Repository
 * Handles all database operations for authentication
 */

import logger from '../../core/utils/logger.js';
import { DatabaseError } from '../../shared/exceptions/AppError.js';

export class AuthRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Find user by email or phone (searches across all user types)
   */
  async findUserByEmailOrPhone(emailOrPhone) {
    try {
      // Try to find admin
      const admin = await this.prisma.admin.findUnique({
        where: { email: emailOrPhone.toLowerCase() },
      }).catch(() => null);

      if (admin) return { ...admin, userType: 'ADMIN' };

      // Try to find employee
      const employee = await this.prisma.employee.findUnique({
        where: { email: emailOrPhone.toLowerCase() },
      }).catch(() => null);

      if (employee) return { ...employee, userType: 'EMPLOYEE' };

      // Try to find doctor
      const doctor = await this.prisma.doctor.findUnique({
        where: { email: emailOrPhone.toLowerCase() },
      }).catch(() => null);

      if (doctor) return { ...doctor, userType: 'DOCTOR' };

      // Try phone number
      const cleanPhone = emailOrPhone.replace(/\D/g, '');

      const empByPhone = await this.prisma.employee.findUnique({
        where: { phone: cleanPhone },
      }).catch(() => null);

      if (empByPhone) return { ...empByPhone, userType: 'EMPLOYEE' };

      const docByPhone = await this.prisma.doctor.findUnique({
        where: { phone: cleanPhone },
      }).catch(() => null);

      if (docByPhone) return { ...docByPhone, userType: 'DOCTOR' };

      return null;
    } catch (error) {
      logger.error('Error finding user:', error);
      throw new DatabaseError('Failed to find user');
    }
  }

  /**
   * Find user by specific type
   */
  async findUserByType(userType, email) {
    try {
      const model = this.getModelByUserType(userType);
      if (!model) return null;

      return await model.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch (error) {
      logger.error(`Error finding ${userType}:`, error);
      throw new DatabaseError(`Failed to find ${userType}`);
    }
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
   * Returns empty array if role not found or permissions unavailable
   */
  async getUserPermissions(role) {
    try {
      if (!this.prisma || !this.prisma.role) {
        logger.warn('Prisma role table not available, returning empty permissions');
        return [];
      }

      const roleData = await this.prisma.role.findUnique({
        where: { name: role },
        include: { permissions: true },
      }).catch(() => null);

      return roleData?.permissions?.map(p => p.name) || [];
    } catch (error) {
      logger.warn(`Permissions unavailable for role ${role}, returning empty array`);
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
