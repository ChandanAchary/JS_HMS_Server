/**
 * Diagnostics Validators & DTOs
 * Input validation and data transformation for diagnostic operations
 */

import { ValidationError } from '../shared/AppError.js';

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * Format diagnostic test for response
 */
export function formatDiagnosticTest(test) {
  if (!test) return null;
  
  return {
    id: test.id,
    testCode: test.testCode,
    testName: test.testName,
    shortName: test.shortName,
    description: test.description,
    category: test.category,
    subCategory: test.subCategory,
    department: test.department,
    
    // Pricing
    basePrice: test.basePrice,
    discountedPrice: test.discountedPrice,
    taxRate: test.taxRate,
    hsnSacCode: test.hsnSacCode,
    
    // Sample info
    sampleType: test.sampleType,
    sampleVolume: test.sampleVolume,
    tubeType: test.tubeType,
    tubeColor: test.tubeColor,
    
    // Timing
    turnaroundTime: test.turnaroundTime,
    fastingRequired: test.fastingRequired,
    fastingHours: test.fastingHours,
    
    // Reference ranges
    referenceRanges: test.referenceRanges,
    unit: test.unit,
    
    // Service config
    homeCollectionAvailable: test.homeCollectionAvailable,
    homeCollectionCharge: test.homeCollectionCharge,
    requiresAppointment: test.requiresAppointment,
    
    isActive: test.isActive,
    createdAt: test.createdAt,
    updatedAt: test.updatedAt
  };
}

/**
 * Format diagnostic test list
 */
export function formatDiagnosticTestList(tests) {
  return tests.map(formatDiagnosticTest);
}

/**
 * Format diagnostic order for response
 */
export function formatDiagnosticOrder(order) {
  if (!order) return null;
  
  return {
    id: order.id,
    orderId: order.orderId,
    
    // Patient info
    patient: order.patient ? {
      id: order.patient.id,
      patientId: order.patient.patientId,
      name: order.patient.name,
      phone: order.patient.phone,
      age: order.patient.age,
      gender: order.patient.gender
    } : null,
    
    // Order info
    orderType: order.orderType,
    sourceType: order.sourceType,
    
    // Referring doctor
    referringDoctor: order.referringDoctor ? {
      id: order.referringDoctor.id,
      name: order.referringDoctor.name,
      specialization: order.referringDoctor.specialization
    } : null,
    consultationId: order.consultationId,
    
    // Clinical info
    clinicalIndication: order.clinicalIndication,
    urgency: order.urgency,
    specialInstructions: order.specialInstructions,
    
    // Collection
    collectionMode: order.collectionMode,
    collectionScheduledAt: order.collectionScheduledAt,
    collectionCompletedAt: order.collectionCompletedAt,
    
    // Pricing
    totalAmount: order.totalAmount,
    discountAmount: order.discountAmount,
    taxAmount: order.taxAmount,
    netAmount: order.netAmount,
    
    // Insurance
    insuranceCovered: order.insuranceCovered,
    insuranceAmount: order.insuranceAmount,
    patientAmount: order.patientAmount,
    preAuthNumber: order.preAuthNumber,
    preAuthStatus: order.preAuthStatus,
    
    // Status
    status: order.status,
    statusHistory: order.statusHistory,
    
    // Results
    resultsDeliveredAt: order.resultsDeliveredAt,
    resultsDeliveryMode: order.resultsDeliveryMode,
    
    // Order items
    items: order.orderItems ? order.orderItems.map(formatOrderItem) : [],
    
    // Metadata
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
}

/**
 * Format order item
 */
export function formatOrderItem(item) {
  if (!item) return null;
  
  return {
    id: item.id,
    testCode: item.testCode,
    testName: item.testName,
    testCategory: item.testCategory,
    
    // Pricing
    basePrice: item.basePrice,
    discountAmount: item.discountAmount,
    taxAmount: item.taxAmount,
    netPrice: item.netPrice,
    
    // Sample info
    sampleId: item.sampleId,
    sampleCollectedAt: item.sampleCollectedAt,
    sampleQuality: item.sampleQuality,
    sampleRejected: item.sampleRejected,
    
    // Status
    status: item.status,
    priority: item.priority,
    
    // TAT
    expectedCompletionAt: item.expectedCompletionAt,
    actualCompletionAt: item.actualCompletionAt,
    tatBreached: item.tatBreached,
    
    // Test details
    test: item.test ? {
      id: item.test.id,
      testCode: item.test.testCode,
      testName: item.test.testName,
      sampleType: item.test.sampleType,
      tubeType: item.test.tubeType,
      tubeColor: item.test.tubeColor,
      fastingRequired: item.test.fastingRequired,
      fastingHours: item.test.fastingHours
    } : null,
    
    // Result
    result: item.result ? formatDiagnosticResult(item.result) : null
  };
}

/**
 * Format diagnostic result
 */
export function formatDiagnosticResult(result) {
  if (!result) return null;
  
  return {
    id: result.id,
    testId: result.testId,
    testCode: result.testCode,
    testName: result.testName,
    
    // Result values
    resultValue: result.resultValue,
    resultNumeric: result.resultNumeric,
    resultUnit: result.resultUnit,
    
    // Reference range
    referenceMin: result.referenceMin,
    referenceMax: result.referenceMax,
    referenceText: result.referenceText,
    
    // Interpretation
    interpretation: result.interpretation,
    isCritical: result.isCritical,
    
    // Report (for imaging/pathology)
    reportText: result.reportText,
    impressions: result.impressions,
    recommendations: result.recommendations,
    
    // Attachments
    attachments: result.attachments,
    imageUrls: result.imageUrls,
    
    // QC & Review status
    status: result.status,
    qcStatus: result.qcStatus,
    isReleased: result.isReleased,
    releasedAt: result.releasedAt,
    
    // Visibility
    visibleToPatient: result.visibleToPatient,
    
    createdAt: result.createdAt,
    updatedAt: result.updatedAt
  };
}

/**
 * Format external prescription
 */
export function formatExternalPrescription(prescription) {
  if (!prescription) return null;
  
  return {
    id: prescription.id,
    patientId: prescription.patientId,
    
    prescriptionDate: prescription.prescriptionDate,
    prescriptionImage: prescription.prescriptionImage,
    
    // Referring info
    referringDoctorName: prescription.referringDoctorName,
    referringHospital: prescription.referringHospital,
    
    // Extracted data
    ocrExtractedTests: prescription.ocrExtractedTests,
    manualEntryTests: prescription.manualEntryTests,
    mappedTests: prescription.mappedTests,
    
    // Status
    validationStatus: prescription.validationStatus,
    status: prescription.status,
    
    createdAt: prescription.createdAt
  };
}

/**
 * Format lab slot
 */
export function formatLabSlot(slot) {
  if (!slot) return null;
  
  return {
    id: slot.id,
    slotDate: slot.slotDate,
    slotStartTime: slot.slotStartTime,
    slotEndTime: slot.slotEndTime,
    slotDuration: slot.slotDuration,
    collectionType: slot.collectionType,
    
    // Availability
    maxBookings: slot.maxBookings,
    currentBookings: slot.currentBookings,
    availableSpots: slot.maxBookings - slot.currentBookings,
    isAvailable: slot.isAvailable && slot.currentBookings < slot.maxBookings,
    
    // Technician
    technician: slot.technician ? {
      id: slot.technician.id,
      name: slot.technician.name
    } : null
  };
}

/**
 * Format collection schedule
 */
export function formatCollectionSchedule(order) {
  return {
    orderId: order.orderId,
    patient: {
      id: order.patient.id,
      patientId: order.patient.patientId,
      name: order.patient.name,
      phone: order.patient.phone
    },
    scheduledTime: order.collectionScheduledAt,
    collectionMode: order.collectionMode,
    tests: order.orderItems.map(item => ({
      testCode: item.testCode,
      testName: item.testName,
      sampleType: item.test?.sampleType,
      tubeType: item.test?.tubeType,
      tubeColor: item.test?.tubeColor,
      fastingRequired: item.test?.fastingRequired,
      status: item.status
    })),
    status: order.status,
    urgency: order.urgency
  };
}

/**
 * Format daily summary report
 */
export function formatDailySummary(data) {
  return {
    date: data.date,
    totalOrders: data.totalOrders,
    pendingCollection: data.pendingCollection,
    samplesCollected: data.samplesCollected,
    processing: data.processing,
    completed: data.completed,
    pendingQC: data.pendingQC,
    pendingReview: data.pendingReview,
    released: data.released,
    revenue: data.revenue
  };
}

// ============================================================================
// Validators
// ============================================================================

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



















