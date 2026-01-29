/**
 * Setup Validators
 * Validation functions for setup operations
 */

import { ValidationError } from '../../shared/exceptions/AppError.js';

/**
 * Validate hospital data for configuration
 * Used in Phase 3 (Hospital Configuration)
 */
export const validateHospitalData = (data) => {
  const errors = [];

  if (!data) {
    throw new ValidationError('Hospital data is required');
  }

  if (!data.hospitalName || data.hospitalName.trim().length < 3) {
    errors.push('Hospital name must be at least 3 characters');
  }

  if (!data.address || data.address.trim().length < 5) {
    errors.push('Hospital address must be at least 5 characters');
  }

  if (!data.contactEmail || !isValidEmail(data.contactEmail)) {
    errors.push('Valid hospital contact email is required');
  }

  if (!data.contactPhone || !isValidPhone(data.contactPhone)) {
    errors.push('Valid hospital contact phone is required (10+ digits)');
  }

  // Optional fields validation
  if (data.city && data.city.trim().length > 100) {
    errors.push('City name must not exceed 100 characters');
  }

  if (data.state && data.state.trim().length > 100) {
    errors.push('State name must not exceed 100 characters');
  }

  if (data.country && data.country.trim().length > 100) {
    errors.push('Country name must not exceed 100 characters');
  }

  if (data.registrationType && data.registrationType.trim().length > 50) {
    errors.push('Registration type must not exceed 50 characters');
  }

  if (data.registrationNumber && data.registrationNumber.trim().length > 50) {
    errors.push('Registration number must not exceed 50 characters');
  }

  if (errors.length > 0) {
    throw new ValidationError('Hospital validation failed', errors);
  }

  return true;
};

/**
 * Validate admin data for registration
 * Used in Phase 1 (Admin Registration)
 */
export const validateAdminData = (data) => {
  const errors = [];

  if (!data) {
    throw new ValidationError('Admin data is required');
  }

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Admin name must be at least 2 characters');
  }

  if (data.name && data.name.trim().length > 100) {
    errors.push('Admin name must not exceed 100 characters');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid admin email is required');
  }

  if (!data.phone || !isValidPhone(data.phone)) {
    errors.push('Valid admin phone is required (10+ digits)');
  }

  if (!data.password || !isStrongPassword(data.password)) {
    errors.push('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number');
  }

  if (!data.confirmPassword) {
    errors.push('Confirm password is required');
  }

  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    errors.push('Password and confirm password do not match');
  }

  if (errors.length > 0) {
    throw new ValidationError('Admin validation failed', errors);
  }

  return true;
};

/**
 * Validate OTP format
 */
export const validateOTP = (otp) => {
  if (!otp) {
    throw new ValidationError('OTP is required');
  }

  const cleanOTP = String(otp).trim();
  if (!/^\d{6}$/.test(cleanOTP)) {
    throw new ValidationError('OTP must be a 6-digit number');
  }

  return true;
};

// ============== Helper Functions ==============

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const cleanPhone = phone?.replace(/\D/g, '') || '';
  return cleanPhone.length >= 10;
}

function isStrongPassword(password) {
  // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongRegex.test(password);
}

export default {
  validateHospitalData,
  validateAdminData,
  validateOTP
};
