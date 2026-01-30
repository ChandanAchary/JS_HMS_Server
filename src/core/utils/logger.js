/**
 * Simple Logger Utility
 * Consistent logging across the application
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const CURRENT_LEVEL = process.env.LOG_LEVEL || 'INFO';

const logger = {
  error: (message, error) => {
    if (LOG_LEVELS[CURRENT_LEVEL] >= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, error || '');
    }
  },

  warn: (message, data) => {
    if (LOG_LEVELS[CURRENT_LEVEL] >= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  },

  info: (message, data) => {
    if (LOG_LEVELS[CURRENT_LEVEL] >= LOG_LEVELS.INFO) {
      console.log(`[INFO] ${message}`, data || '');
    }
  },

  debug: (message, data) => {
    if (LOG_LEVELS[CURRENT_LEVEL] >= LOG_LEVELS.DEBUG) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  },
};
export default logger;
