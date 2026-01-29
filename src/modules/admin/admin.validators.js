/**
 * Admin Validators
 * Validation functions for admin operations
 */

import { ValidationError } from '../../shared/exceptions/AppError.js';

/**
 * Validate admin registration
 */
export const validateAdminRegister = (data) => {
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
  }

  if (!data.password) {
    errors.push('Password is required');
  } else if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!data.confirmPassword) {
    errors.push('Confirm password is required');
  }

  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    errors.push('Password and confirm password do not match');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate admin login
 */
export const validateAdminLogin = (data) => {
  const errors = [];

  if (!data.emailOrPhone?.trim()) {
    errors.push('Email or phone is required');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate profile update
 */
export const validateProfileUpdate = (data) => {
  const errors = [];

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
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
  if (salary === undefined || salary === null || salary < 0) {
    throw new ValidationError('Invalid salary value');
  }
  return Number(salary);
};

/**
 * Validate assignment creation
 */
export const validateAssignmentCreate = (data) => {
  const errors = [];

  if (!data.assigneeType) {
    errors.push('Assignee type is required');
  } else if (!['DOCTOR', 'EMPLOYEE'].includes(data.assigneeType)) {
    errors.push('Assignee type must be DOCTOR or EMPLOYEE');
  }

  if (!data.assigneeId) {
    errors.push('Assignee ID is required');
  }

  if (!data.title?.trim()) {
    errors.push('Title is required');
  }

  if (!data.startDateTime) {
    errors.push('Start date/time is required');
  }

  if (!data.endDateTime) {
    errors.push('End date/time is required');
  }

  if (data.startDateTime && data.endDateTime) {
    const start = new Date(data.startDateTime);
    const end = new Date(data.endDateTime);
    if (start >= end) {
      errors.push('End date/time must be after start date/time');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate delegated permissions
 */
export const validateDelegatedPermissions = (permissions) => {
  if (!Array.isArray(permissions)) {
    throw new ValidationError('Permissions must be an array');
  }
  return true;
};

/**
 * Validate hospital profile update
 */
export const validateHospitalUpdate = (data) => {
  const errors = [];

  if (data.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
    errors.push('Invalid contact email format');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate form template role
 */
export const validateFormRole = (role) => {
  if (!['DOCTOR', 'EMPLOYEE'].includes(role?.toUpperCase())) {
    throw new ValidationError('Invalid role. Must be DOCTOR or EMPLOYEE');
  }
  return role.toUpperCase();
};

/**
 * Validate payroll input
 */
export const validatePayrollInput = (data) => {
  const errors = [];

  if (!data.amount || Number(data.amount) <= 0) {
    errors.push('Amount must be greater than zero');
  }

  const validModes = ['BANK_TRANSFER', 'UPI', 'MANUAL'];
  const normalizedMode = (data.paymentMode || '').toUpperCase();
  if (!validModes.includes(normalizedMode)) {
    errors.push('Invalid payment mode');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return {
    amount: Number(data.amount),
    paymentMode: normalizedMode
  };
};

/**
 * Validate new password with confirmation
 */
export const validateNewPassword = (data) => {
  const errors = [];

  if (!data.newPassword) {
    errors.push('New password is required');
  } else if (data.newPassword.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!data.confirmPassword) {
    errors.push('Confirm password is required');
  }

  if (data.newPassword && data.confirmPassword && data.newPassword !== data.confirmPassword) {
    errors.push('Password and confirm password do not match');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

export default {
  validateAdminRegister,
  validateAdminLogin,
  validateProfileUpdate,
  validateSalaryUpdate,
  validateAssignmentCreate,
  validateDelegatedPermissions,
  validateHospitalUpdate,
  validateFormRole,
  validatePayrollInput,
  validateNewPassword
};
 
