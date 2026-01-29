// Secure token utility for email verification (cryptographically strong, time-limited, single-use)
import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token
 * @param {number} size - Number of bytes (default: 32)
 * @returns {string} hex token
 */
export function generateVerificationToken(size = 32) {
  return crypto.randomBytes(size).toString('hex');
}

/**
 * Hash a token for secure storage (never store raw tokens)
 * @param {string} token
 * @returns {string} hashed token (hex)
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Compute expiry timestamp (default: 20 minutes)
 * @param {number} minutes
 * @returns {Date}
 */
export function getExpiryDate(minutes = 20) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
