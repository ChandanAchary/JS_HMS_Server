/**
 * Diagnostics Validators
 * Input validation for diagnostic operations
 */

import { ValidationError } from '../../shared/exceptions/AppError.js';

// Valid categories for diagnostic tests
export const TEST_CATEGORIES = [
  'BLOOD_TEST',
  'IMAGING',
  'CARDIAC',
  'PATHOLOGY',
  'RADIOLOGY',
  'URINE_TEST',
  'STOOL_TEST',
  'MICROBIOLOGY',
  'SEROLOGY',
  'HORMONES',
  'OTHER'
];

// Valid sample types
export const SAMPLE_TYPES = [
  'BLOOD',
  'URINE',
  'STOOL',
  'SWAB',
  'SPUTUM',
  'CSF',
  'TISSUE',
  'IMAGING',
  'OTHER'
];

// Valid order types
export const ORDER_TYPES = [
  'DOCTOR_ORDERED',
  'SELF_INITIATED',
  'EMERGENCY'
];

// Valid source types
export const SOURCE_TYPES = [
  'OPD',
  'IPD',
  'EMERGENCY',
  'DIRECT'
];

// Valid urgency levels
export const URGENCY_LEVELS = [
  'ROUTINE',
  'URGENT',
  'STAT'
];

// Valid collection modes
export const COLLECTION_MODES = [
  'WALK_IN',
  'HOME_COLLECTION',
  'MOBILE_VAN'
];

// Valid order statuses
export const ORDER_STATUSES = [
  'CREATED',
  'SCHEDULED',
  'SAMPLE_COLLECTED',
  'PROCESSING',
  'PARTIAL_COMPLETE',
  'COMPLETED',
  'CANCELLED'
];

// Valid item statuses
export const ITEM_STATUSES = [
  'ORDERED',
  'SAMPLE_PENDING',
  'SAMPLE_COLLECTED',
  'PROCESSING',
  'QC_PENDING',
  'PATHOLOGIST_REVIEW',
  'COMPLETED',
  'REJECTED',
  'CANCELLED'
];

// Valid result statuses
export const RESULT_STATUSES = [
  'PENDING',
  'ENTERED',
  'QC_CHECKED',
  'REVIEWED',
  'APPROVED',
  'RELEASED',
  'AMENDED'
];

// Valid QC statuses
export const QC_STATUSES = [
  'PENDING',
  'PASSED',
  'FAILED'
];

// Valid interpretations
export const INTERPRETATIONS = [
  'NORMAL',
  'LOW',
  'HIGH',
  'CRITICAL_LOW',
  'CRITICAL_HIGH',
  'ABNORMAL',
  'POSITIVE',
  'NEGATIVE',
  'INCONCLUSIVE'
];

/**
 * Validate diagnostic test create/update
 */
export function validateDiagnosticTest(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate) {
    if (!data.testCode?.trim()) {
      errors.push('Test code is required');
    }
    if (!data.testName?.trim()) {
      errors.push('Test name is required');
    }
    if (!data.category) {
      errors.push('Category is required');
    }
    if (data.basePrice === undefined || data.basePrice < 0) {
      errors.push('Valid base price is required');
    }
  }

  if (data.category && !TEST_CATEGORIES.includes(data.category)) {
    errors.push(`Invalid category. Must be one of: ${TEST_CATEGORIES.join(', ')}`);
  }

  if (data.sampleType && !SAMPLE_TYPES.includes(data.sampleType)) {
    errors.push(`Invalid sample type. Must be one of: ${SAMPLE_TYPES.join(', ')}`);
  }

  if (data.turnaroundTime !== undefined && data.turnaroundTime < 0) {
    errors.push('Turnaround time must be positive');
  }

  if (data.fastingRequired && !data.fastingHours) {
    errors.push('Fasting hours required when fasting is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }
}

/**
 * Validate diagnostic order create
 */
export function validateDiagnosticOrderCreate(data) {
  const errors = [];

  if (!data.patientId?.trim()) {
    errors.push('Patient ID is required');
  }

  if (!data.orderType) {
    errors.push('Order type is required');
  } else if (!ORDER_TYPES.includes(data.orderType)) {
    errors.push(`Invalid order type. Must be one of: ${ORDER_TYPES.join(', ')}`);
  }

  if (!data.sourceType) {
    errors.push('Source type is required');
  } else if (!SOURCE_TYPES.includes(data.sourceType)) {
    errors.push(`Invalid source type. Must be one of: ${SOURCE_TYPES.join(', ')}`);
  }

  if (!data.testIds || !Array.isArray(data.testIds) || data.testIds.length === 0) {
    errors.push('At least one test must be selected');
  }

  if (data.urgency && !URGENCY_LEVELS.includes(data.urgency)) {
    errors.push(`Invalid urgency. Must be one of: ${URGENCY_LEVELS.join(', ')}`);
  }

  if (data.collectionMode && !COLLECTION_MODES.includes(data.collectionMode)) {
    errors.push(`Invalid collection mode. Must be one of: ${COLLECTION_MODES.join(', ')}`);
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }
}

/**
 * Validate sample collection input
 */
export function validateSampleCollection(data) {
  const errors = [];

  if (!data.orderId && !data.orderItemId) {
    errors.push('Order ID or Order Item ID is required');
  }

  if (!data.collectedBy?.trim()) {
    errors.push('Collector ID is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }
}

/**
 * Validate result entry
 */
export function validateResultEntry(data) {
  const errors = [];

  if (!data.orderItemId?.trim()) {
    errors.push('Order item ID is required');
  }

  if (data.resultValue === undefined && data.resultNumeric === undefined && !data.reportText?.trim()) {
    errors.push('Result value, numeric result, or report text is required');
  }

  if (!data.enteredBy?.trim()) {
    errors.push('Entered by (technician ID) is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }
}

/**
 * Validate QC check
 */
export function validateQCCheck(data) {
  const errors = [];

  if (!data.resultId?.trim()) {
    errors.push('Result ID is required');
  }

  if (!data.qcStatus) {
    errors.push('QC status is required');
  } else if (!QC_STATUSES.includes(data.qcStatus)) {
    errors.push(`Invalid QC status. Must be one of: ${QC_STATUSES.join(', ')}`);
  }

  if (!data.checkedBy?.trim()) {
    errors.push('Checked by (senior technician ID) is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }
}

/**
 * Validate pathologist review
 */
export function validatePathologistReview(data) {
  const errors = [];

  if (!data.resultId?.trim()) {
    errors.push('Result ID is required');
  }

  if (!data.reviewedBy?.trim()) {
    errors.push('Reviewed by (pathologist ID) is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }
}

/**
 * Validate external prescription upload
 */
export function validateExternalPrescription(data) {
  const errors = [];

  if (!data.patientId?.trim()) {
    errors.push('Patient ID is required');
  }

  if (!data.prescriptionImage && !data.manualEntryTests) {
    errors.push('Prescription image or manual test entry is required');
  }

  if (data.manualEntryTests && !Array.isArray(data.manualEntryTests)) {
    errors.push('Manual entry tests must be an array');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }
}

/**
 * Validate slot booking
 */
export function validateSlotBooking(data) {
  const errors = [];

  if (!data.orderId?.trim()) {
    errors.push('Order ID is required');
  }

  if (!data.slotId?.trim()) {
    errors.push('Slot ID is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }
}

/**
 * Validate slot creation
 */
export function validateSlotCreation(data) {
  const errors = [];

  if (!data.slotDate) {
    errors.push('Slot date is required');
  }

  if (!data.slotStartTime) {
    errors.push('Slot start time is required');
  }

  if (!data.slotEndTime) {
    errors.push('Slot end time is required');
  }

  if (data.collectionType && !COLLECTION_MODES.includes(data.collectionType)) {
    errors.push(`Invalid collection type. Must be one of: ${COLLECTION_MODES.join(', ')}`);
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }
}

/**
 * Check if user has lab role
 */
export function isLabRole(role) {
  const labRoles = ['LAB_TECHNICIAN', 'SENIOR_LAB_TECHNICIAN', 'PATHOLOGIST', 'RADIOLOGIST', 'ADMIN', 'SUPER_ADMIN'];
  return labRoles.includes(role);
}

/**
 * Check if user can enter results
 */
export function canEnterResults(role) {
  return ['LAB_TECHNICIAN', 'SENIOR_LAB_TECHNICIAN', 'PATHOLOGIST', 'ADMIN'].includes(role);
}

/**
 * Check if user can approve QC
 */
export function canApproveQC(role) {
  return ['SENIOR_LAB_TECHNICIAN', 'PATHOLOGIST', 'ADMIN'].includes(role);
}

/**
 * Check if user can do pathologist review
 */
export function canDoPathologistReview(role) {
  return ['PATHOLOGIST', 'RADIOLOGIST', 'ADMIN'].includes(role);
}

/**
 * Check if user can release results
 */
export function canReleaseResults(role) {
  return ['PATHOLOGIST', 'RADIOLOGIST', 'ADMIN', 'SENIOR_LAB_TECHNICIAN'].includes(role);
}
