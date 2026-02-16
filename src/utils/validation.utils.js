/**
 * Validation Utilities
 * Common validation functions
 */

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const normalizeEmail = (email) => {
  return email?.trim().toLowerCase() || '';
};

// Phone validation
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone?.replace(/\s/g, '') || '');
};

export const normalizePhone = (phone) => {
  return phone?.replace(/\D/g, '') || '';
};

// Combined validation
export const validateEmailOrPhone = (emailOrPhone) => {
  return isValidEmail(emailOrPhone) || isValidPhone(emailOrPhone);
};

// Password validation
export const isStrongPassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongRegex.test(password);
};

// Date validation
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Empty check
export const isEmpty = (value) => {
  return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
};

// Required fields validation
export const validateRequiredFields = (obj, requiredFields) => {
  const missing = [];
  requiredFields.forEach(field => {
    if (isEmpty(obj[field])) {
      missing.push(field);
    }
  });
  return missing.length === 0 ? null : missing;
};


















