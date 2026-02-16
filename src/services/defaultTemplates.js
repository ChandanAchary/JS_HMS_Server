/**
 * Default Diagnostic Templates
 * Provides fallback template structures for diagnostic categories
 */

// Default templates array - can be populated with base templates
export const DEFAULT_TEMPLATES = [];

/**
 * Get default template by code
 * @param {string} templateCode - The template code to look up
 * @returns {object|null} - The default template or null if not found
 */
export const getDefaultTemplateByCode = (templateCode) => {
  // Return null - templates should be fetched from database
  // This is a fallback for cases where custom templates aren't available
  return null;
};

/**
 * Get default templates by category
 * @param {string} category - The diagnostic category
 * @returns {array} - Array of default templates for the category
 */
export const getDefaultTemplatesByCategory = (category) => {
  // Return empty array - templates should be fetched from database
  return [];
};

/**
 * Get default template for category
 * @param {string} category - The diagnostic category
 * @returns {object|null} - The default template for the category or null
 */
export const getDefaultTemplateForCategory = (category) => {
  // Return null - templates should be fetched from database
  return null;
};

export default {
  DEFAULT_TEMPLATES,
  getDefaultTemplateByCode,
  getDefaultTemplatesByCategory,
  getDefaultTemplateForCategory
};
