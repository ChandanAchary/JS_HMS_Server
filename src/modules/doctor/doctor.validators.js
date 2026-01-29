/**
 * Doctor Validators
 * Validation functions for doctor-related operations
 */

import { DOCTOR_SPECIALIZATIONS } from '../../constants/roles.js';
import { ValidationError } from '../../shared/exceptions/AppError.js';

/**
 * Validate doctor registration input
 */
export const validateRegistration = (data) => {
  const errors = [];

  if (!data.name?.trim()) {
    errors.push('Name is required');
  }

  if (!data.email?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.phone?.trim()) {
    errors.push('Phone is required');
  } else if (!/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.push('Phone must be 10 digits');
  }

  if (!data.password) {
    errors.push('Password is required');
  } else if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (data.specialization && !DOCTOR_SPECIALIZATIONS.includes(data.specialization)) {
    errors.push(`Invalid specialization. Must be one of: ${DOCTOR_SPECIALIZATIONS.join(', ')}`);
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate login input
 */
export const validateLogin = (data) => {
  const errors = [];

  if (!data.emailOrPhone?.trim()) {
    errors.push('Email or phone is required');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  if (!data.hospitalId) {
    errors.push('Hospital ID is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate profile update input
 */
export const validateProfileUpdate = (data) => {
  const errors = [];

  if (data.name !== undefined && !data.name?.trim()) {
    errors.push('Name cannot be empty');
  }

  if (data.phone !== undefined) {
    if (!data.phone?.trim()) {
      errors.push('Phone cannot be empty');
    } else if (!/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
      errors.push('Phone must be 10 digits');
    }
  }

  if (data.specialization !== undefined && data.specialization && !DOCTOR_SPECIALIZATIONS.includes(data.specialization)) {
    errors.push(`Invalid specialization. Must be one of: ${DOCTOR_SPECIALIZATIONS.join(', ')}`);
  }

  if (data.bankDetails) {
    if (data.bankDetails.accountNumber && !/^\d{9,18}$/.test(data.bankDetails.accountNumber)) {
      errors.push('Invalid account number format');
    }
    if (data.bankDetails.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.bankDetails.ifscCode.toUpperCase())) {
      errors.push('Invalid IFSC code format');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate salary update
 */
export const validateSalaryUpdate = (salary) => {
  if (salary === undefined || salary === null) {
    throw new ValidationError('Salary is required');
  }

  const numSalary = Number(salary);
  if (isNaN(numSalary) || numSalary < 0) {
    throw new ValidationError('Salary must be a positive number');
  }

  return numSalary;
};

/**
 * Validate delegated permissions
 */
export const validateDelegatedPermissions = (permissions) => {
  if (!Array.isArray(permissions)) {
    throw new ValidationError('Permissions must be an array');
  }

  const validPermissions = permissions.filter(p => typeof p === 'string' && p.trim());
  return validPermissions;
};

/**
 * Validate pagination params
 */
export const validatePaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const search = query.search?.trim() || '';
  const specialization = query.specialization?.trim() || null;

  return { page, limit, search, specialization };
};

export default {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateSalaryUpdate,
  validateDelegatedPermissions,
  validatePaginationParams
};
