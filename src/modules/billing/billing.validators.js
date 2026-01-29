/**
 * Billing Validators
 * Validation functions for billing-related operations
 */

import { ValidationError } from '../../shared/exceptions/AppError.js';

// Valid billing roles
export const BILLING_ROLES = ['BILLING_ENTRY', 'BILLING_EXIT'];

// Valid payment modes
export const PAYMENT_MODES = ['Cash', 'Card', 'UPI', 'NetBanking', 'Insurance', 'Other'];

/**
 * Validate billing login
 */
export const validateBillingLogin = (data) => {
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
 * Check if role is valid for billing
 */
export const isBillingRole = (role) => {
  return BILLING_ROLES.includes(role);
};

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
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate services array for bill creation
 */
export const validateServices = (services) => {
  if (!Array.isArray(services) || services.length === 0) {
    throw new ValidationError('At least one service is required');
  }

  const errors = [];

  services.forEach((item, index) => {
    if (!item.serviceName?.trim()) {
      errors.push(`Service ${index + 1}: Service name is required`);
    }
    if (!item.category?.trim()) {
      errors.push(`Service ${index + 1}: Category is required`);
    }
  });

  if (errors.length > 0) {
    throw new ValidationError(errors.join('. '));
  }

  return true;
};

/**
 * Validate payment mode
 */
export const validatePaymentMode = (mode) => {
  if (!mode) return 'Cash';
  
  if (!PAYMENT_MODES.includes(mode)) {
    throw new ValidationError(`Invalid payment mode. Must be one of: ${PAYMENT_MODES.join(', ')}`);
  }
  
  return mode;
};

/**
 * Validate payment input
 */
export const validatePaymentInput = (data) => {
  const paymentMode = validatePaymentMode(data.paymentMode || 'Cash');
  const paymentDetails = data.paymentDetails || {};
  
  return { paymentMode, paymentDetails };
};

export default {
  validateBillingLogin,
  isBillingRole,
  validatePatientCreate,
  validateServices,
  validatePaymentMode,
  validatePaymentInput,
  BILLING_ROLES,
  PAYMENT_MODES
};
