import { tenantPrisma as prisma } from '../core/database/tenantDb.js';
import { defaultDoctorFields, defaultEmployeeFields } from '../utils/defaultFormFields.js';

/**
 * Get default form schema for Doctor or Employee
 * Returns fields with default configuration
 */
export const getDefaultFormSchema = (role) => {
  const type = (role || "").toUpperCase();
  return type === "DOCTOR" ? defaultDoctorFields : defaultEmployeeFields;
};

/**
 * Create or initialize form template with default fields
 * Uses JSON-based `fields` column (schema stores fields as Json)
 */
export const initializeFormTemplate = async (hospitalId, role) => {
  const type = (role || "").toUpperCase();

  // Check if template already exists
  const existing = await prisma.formTemplate.findUnique({
    where: {
      hospitalId_type: {
        hospitalId,
        type
      }
    }
  });

  if (existing) return existing;

  // Create new template with default schema
  const defaultFields = getDefaultFormSchema(type);

  const template = await prisma.formTemplate.create({
    data: {
      hospitalId,
      type,
      name: `${type} Registration`,
      schema: defaultFields
    }
  });

  // normalize to keep `fields` property for existing code
  template.fields = Array.isArray(template.schema) ? template.schema : [];
  return template;
};

/**
 * Get form template for a hospital and role (returns template with fields array)
 */
export const getFormTemplateForHospital = async (hospitalId, role) => {
  const type = (role || "").toUpperCase();

  const template = await prisma.formTemplate.findUnique({
    where: {
      hospitalId_type: { hospitalId, type }
    }
  });

  if (!template) {
    return initializeFormTemplate(hospitalId, type);
  }

  // Ensure fields is always an array (schema column maps to fields in code)
  template.fields = Array.isArray(template.schema) ? template.schema : [];

  return template;
};

/**
 * Calculate age from DOB
 */
export const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Validate form submission against template schema
 * Works with `fields` stored as JSON array inside FormTemplate
 */
export const validateFormSubmission = async (templateId, formData) => {
  const template = await prisma.formTemplate.findUnique({
    where: { id: templateId }
  });

  if (!template) {
    throw new Error("Form template not found");
  }

  const fields = Array.isArray(template.schema) ? template.schema : [];
  const errors = [];

  for (const field of fields) {
    if (!field.isEnabled) continue;

    const value = formData[field.fieldName];

    // Required
    if (field.isRequired && (value === undefined || value === null || value === "")) {
      errors.push({ field: field.fieldName, message: `${field.fieldLabel} is required` });
      continue;
    }

    if (value === undefined || value === null || value === "") continue;

    const type = (field.fieldType || "").toLowerCase();

    if (type === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
        errors.push({ field: field.fieldName, message: `${field.fieldLabel} must be a valid email` });
      }
    }

    if (type === "tel") {
      if (!/^[0-9]{10,15}$/.test(String(value).replace(/\D/g, ""))) {
        errors.push({ field: field.fieldName, message: `${field.fieldLabel} must be 10-15 digits` });
      }
    }

    if (type === "date") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        errors.push({ field: field.fieldName, message: `${field.fieldLabel} must be in YYYY-MM-DD format` });
      }
    }

    // Custom validation
    if (field.validation) {
      const validation = field.validation;
      const valLen = String(value).length;

      if (validation.min && valLen < validation.min) {
        errors.push({ field: field.fieldName, message: `${field.fieldLabel} must be at least ${validation.min} characters` });
      }
      if (validation.max && valLen > validation.max) {
        errors.push({ field: field.fieldName, message: `${field.fieldLabel} must be at most ${validation.max} characters` });
      }
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(String(value))) {
          errors.push({ field: field.fieldName, message: `${field.fieldLabel} format is invalid` });
        }
      }
    }
  }

  return { isValid: errors.length === 0, errors };
};




















