/**
 * Diagnostics DTOs
 * Data Transfer Objects for diagnostic system
 */

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
