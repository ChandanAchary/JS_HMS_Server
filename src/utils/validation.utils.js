/**
 * Unified Validation Utilities
 * 
 * Centralized validation and normalization functions
 * Used across controllers for consistent data validation
 */

/**
 * Normalize email to lowercase and trim whitespace
 * @param {string} value - Email to normalize
 * @returns {string} Normalized email or empty string
 */
export const normalizeEmail = (value) => {
  return value?.toLowerCase().trim() || "";
};

/**
 * Normalize phone number by removing all non-digit characters
 * @param {string} value - Phone number to normalize
 * @returns {string} Normalized phone number or empty string
 */
export const normalizePhone = (value) => {
  return value?.replace(/\D/g, '') || "";
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format (at least 10 digits)
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid phone format
 */
export const isValidPhone = (phone) => {
  const normalized = normalizePhone(phone);
  return normalized.length >= 10;
};

/**
 * Validate if input is either valid email or phone
 * @param {string} emailOrPhone - Email or phone to validate
 * @returns {string|null} Normalized value if valid, null otherwise
 */
export const validateEmailOrPhone = (emailOrPhone) => {
  if (!emailOrPhone) return null;
  
  const normalized = normalizeEmail(emailOrPhone);
  
  if (isValidEmail(normalized)) {
    return normalized;
  }
  
  const phone = normalizePhone(emailOrPhone);
  if (isValidPhone(phone)) {
    return phone;
  }
  
  return null;
};

/**
 * Validate password strength
 * Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
 */
export const isStrongPassword = (password) => {
  const strengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strengthRegex.test(password);
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const isValidDate = (dateString) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  return !isNaN(new Date(dateString).getTime());
};

/**
 * Validate URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Validate required fields in object
 */
export const validateRequiredFields = (obj, fields) => {
  const missing = fields.filter(field => isEmpty(obj[field]));
  if (missing.length > 0) {
    return {
      valid: false,
      missingFields: missing,
    };
  }
  return { valid: true };
};

export default {
  normalizeEmail,
  normalizePhone,
  isValidEmail,
  isValidPhone,
  validateEmailOrPhone,
  isStrongPassword,
  isValidDate,
  isValidUrl,
  isEmpty,
  validateRequiredFields
};
