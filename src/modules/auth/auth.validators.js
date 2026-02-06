/**
 * Auth Validators
 * Input validation for auth endpoints
 */

import { ValidationError } from '../../shared/exceptions/AppError.js';
import { isValidEmail, isValidPhone, isEmpty } from '../../core/utils/validation.utils.js';

export class AuthValidators {
  /**
   * Validate login request (role determined by API path, not body)
   */
  static validateLogin(emailOrPhone, password) {
    const errors = [];

    if (isEmpty(emailOrPhone)) {
      errors.push('Email or phone is required');
    }

    if (isEmpty(password)) {
      errors.push('Password is required');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join('; '));
    }
  }

  /**
   * Validate role-specific login (role passed from route, not body)
   * Supports all user types and roles: ADMIN, DOCTOR, EMPLOYEE, NURSE, RECEPTIONIST, etc.
   */
  static validateRoleLogin(emailOrPhone, password, role) {
    const errors = [];

    if (isEmpty(emailOrPhone)) {
      errors.push('Email or phone is required');
    }

    if (isEmpty(password)) {
      errors.push('Password is required');
    }

    // Support all role types
    const validRoles = [
      // Base types
      'ADMIN', 'EMPLOYEE', 'DOCTOR', 'PATIENT',
      // Employee roles
      'NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'OPD_ASSISTANT', 
      'OPD_COORDINATOR', 'OPD_MANAGER', 'PHARMACIST', 'IPD_NURSE'
    ];
    
    if (!validRoles.includes(role?.toUpperCase())) {
      errors.push(`Invalid role: ${role}. Supported roles: ${validRoles.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join('; '));
    }
  }

  /**
   * Validate registration request
   */
  static validateRegister(name, email, phone, password) {
    const errors = [];

    if (isEmpty(name)) {
      errors.push('Name is required');
    }

    if (isEmpty(email)) {
      errors.push('Email is required');
    } else if (!isValidEmail(email)) {
      errors.push('Invalid email format');
    }

    if (isEmpty(phone)) {
      errors.push('Phone is required');
    } else if (!isValidPhone(phone)) {
      errors.push('Phone must be at least 10 digits');
    }

    if (isEmpty(password)) {
      errors.push('Password is required');
    } else if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join('; '));
    }
  }

  /**
   * Validate password change request
   */
  static validateChangePassword(currentPassword, newPassword, confirmPassword) {
    const errors = [];

    if (isEmpty(currentPassword)) {
      errors.push('Current password is required');
    }

    if (isEmpty(newPassword)) {
      errors.push('New password is required');
    }

    if (isEmpty(confirmPassword)) {
      errors.push('Password confirmation is required');
    }

    if (newPassword && newPassword.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join('; '));
    }
  }

  /**
   * Validate reset password request
   */
  static validateResetPassword(userId, userType, newPassword) {
    const errors = [];

    if (isEmpty(userId)) {
      errors.push('User ID is required');
    }

    if (isEmpty(userType)) {
      errors.push('User type is required');
    }

    if (isEmpty(newPassword)) {
      errors.push('New password is required');
    } else if (newPassword.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join('; '));
    }
  }
}
