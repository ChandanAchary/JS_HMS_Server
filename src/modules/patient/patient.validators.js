/**
 * Patient Validators
 * Validation functions for patient-related operations
 */

import { ValidationError } from '../../shared/exceptions/AppError.js';

/**
 * Validate patient creation input
 */
export const validatePatientCreate = (data) => {
  const errors = [];

  if (!data.name?.trim()) {
    errors.push('Name is required');
  }

  if (!data.phone?.trim()) {
    errors.push('Phone is required');
  } else if (!/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.push('Phone must be 10 digits');
  }

  if (data.age !== null && data.age !== undefined) {
    const age = parseInt(data.age);
    if (isNaN(age) || age < 0 || age > 150) {
      errors.push('Invalid age');
    }
  }

  if (data.gender && !['Male', 'Female', 'Other', 'M', 'F', 'O'].includes(data.gender)) {
    errors.push('Invalid gender');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate patient search query
 */
export const validateSearchQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return '';
  }
  // Sanitize query - remove special characters
  return query.trim().replace(/[^a-zA-Z0-9\s]/g, '');
};

/**
 * Validate pagination params
 */
export const validatePaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const search = validateSearchQuery(query.search || query.q || '');

  return { page, limit, search };
};

export default {
  validatePatientCreate,
  validateSearchQuery,
  validatePaginationParams
};
