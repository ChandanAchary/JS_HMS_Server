/**
 * PublicRegistration Validators
 */

import { ValidationError } from '../../shared/exceptions/AppError.js';

/**
 * Valid roles for public registration
 */
export const VALID_ROLES = ['DOCTOR', 'EMPLOYEE'];

/**
 * Validate role parameter
 */
export const validateRole = (role) => {
  if (!role) {
    throw new ValidationError('Role parameter is missing');
  }

  if (!VALID_ROLES.includes(role.toUpperCase())) {
    throw new ValidationError('Invalid role. Must be DOCTOR or EMPLOYEE');
  }

  return role.toUpperCase();
};

/**
 * Validate form data exists
 */
export const validateFormDataExists = (formData) => {
  if (!formData) {
    throw new ValidationError('formData is required');
  }
  return true;
};

/**
 * Validate required application fields
 */
export const validateApplicationFields = (email, name) => {
  const errors = [];

  if (!email) {
    errors.push('Email is required in form data');
  }

  if (!name) {
    errors.push('Name is required in form data');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate status check input
 */
export const validateStatusCheckInput = (email, phone) => {
  if (!email && !phone) {
    throw new ValidationError('Email or phone is required');
  }
  return true;
};

/**
 * Validate hospital ID parameter
 */
export const validateHospitalId = (hospitalId) => {
  if (!hospitalId) {
    throw new ValidationError('Hospital ID is required');
  }
  return hospitalId;
};

export default {
  VALID_ROLES,
  validateRole,
  validateFormDataExists,
  validateApplicationFields,
  validateStatusCheckInput,
  validateHospitalId
};
