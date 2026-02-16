/**
 * Patient Validators & DTOs
 * Validation and response formatting for patient-related operations
 */

import { ValidationError } from '../shared/AppError.js';

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * Response DTO for patient
 */
export const formatPatient = (patient) => ({
  patientId: patient.patientId,
  name: patient.name,
  age: patient.age,
  gender: patient.gender,
  phone: patient.phone,
  address: patient.address || '',
  createdAt: patient.createdAt
});

/**
 * Response DTO for patient with bills
 */
export const formatPatientWithBills = (patient, bills = []) => ({
  ...formatPatient(patient),
  bills: bills.map(formatBillSummary)
});

/**
 * Response DTO for bill summary
 */
export const formatBillSummary = (bill) => ({
  billId: bill.billId,
  billDate: bill.billDate,
  services: bill.services,
  totalAmount: bill.totalAmount,
  paymentStatus: bill.paymentStatus,
  paymentMode: bill.paymentMode
});

/**
 * Request DTO for patient creation
 */
export const parsePatientInput = (body) => ({
  name: body.name?.trim(),
  age: body.age ? parseInt(body.age) : null,
  gender: body.gender?.trim() || null,
  phone: body.phone?.trim(),
  address: body.address?.trim() || null
});

/**
 * Response DTO for patient search results
 */
export const formatPatientSearchResults = (patients, billsByPatient = {}) => ({
  success: true,
  patients: patients.map(p => formatPatientWithBills(p, billsByPatient[p.patientId] || []))
});

/**
 * Response DTO for paginated patients
 */
export const formatPaginatedPatients = (result, billsByPatient = {}) => ({
  patients: result.data.map(p => formatPatientWithBills(p, billsByPatient[p.patientId] || [])),
  pagination: result.pagination
});

// ============================================================================
// Validators
// ============================================================================

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



















