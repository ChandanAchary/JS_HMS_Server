/**
 * Diagnostics Service
 * Business logic for diagnostic operations
 */

import { DiagnosticsRepository } from './diagnostics.repository.js';
import { DiagnosticTemplateService } from './template.service.js';
import {
  formatDiagnosticTest,
  formatDiagnosticTestList,
  formatDiagnosticOrder,
  formatDiagnosticResult,
  formatExternalPrescription,
  formatLabSlot,
  formatCollectionSchedule
} from '../controllers/diagnostics.validators.js';
import {
  validateDiagnosticTest,
  validateDiagnosticOrderCreate,
  validateSampleCollection,
  validateResultEntry,
  validateQCCheck,
  validatePathologistReview,
  validateExternalPrescription,
  validateSlotBooking,
  validateSlotCreation,
  INTERPRETATIONS
} from '../controllers/diagnostics.validators.js';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError
} from '../shared/AppError.js';

// Helper functions
const pad = (n, length = 3) => String(n).padStart(length, '0');

const getShortDateKey = (d = new Date()) => {
  const y = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}${mm}${dd}`;
};

export class DiagnosticsService {
  constructor(prisma) {
    this.prisma = prisma;
    this.repository = new DiagnosticsRepository(prisma);
    this.templateService = new DiagnosticTemplateService(prisma);
  }

  // ==================== ID GENERATORS ====================

  async generateOrderId() {
    const shortDate = getShortDateKey();
    const counterId = `DXO${shortDate}`;
    const seq = await this.repository.nextSequence(counterId);
    return `DXO${shortDate}${pad(seq, 3)}`;
  }

  async generateSampleId() {
    const shortDate = getShortDateKey();
    const counterId = `SMPL${shortDate}`;
    const seq = await this.repository.nextSequence(counterId);
    return `SMPL${shortDate}${pad(seq, 4)}`;
  }

  // ==================== DIAGNOSTIC TESTS ====================

  /**
   * Create a new diagnostic test
   */
  async createTest(data, hospitalId) {
    validateDiagnosticTest(data);

    // Check for duplicate test code
    const existing = await this.repository.getTestByCode(data.testCode, hospitalId);
    if (existing) {
      throw new ConflictError(`Test with code ${data.testCode} already exists`);
    }

    const test = await this.repository.createTest({
      ...data,
      hospitalId,
      testCode: data.testCode.toUpperCase().trim(),
      testName: data.testName.trim()
    });

    return {
      test: formatDiagnosticTest(test),
      message: 'Diagnostic test created successfully'
    };
  }

  /**
   * Update diagnostic test
   */
  async updateTest(testId, data, hospitalId) {
    validateDiagnosticTest(data, true);

    const existing = await this.repository.getTestById(testId);
    if (!existing || existing.hospitalId !== hospitalId) {
      throw new NotFoundError('Diagnostic test');
    }

    // If updating test code, check for duplicates
    if (data.testCode && data.testCode !== existing.testCode) {
      const duplicate = await this.repository.getTestByCode(data.testCode, hospitalId);
      if (duplicate) {
        throw new ConflictError(`Test with code ${data.testCode} already exists`);
      }
    }

    const test = await this.repository.updateTest(testId, data);

    return {
      test: formatDiagnosticTest(test),
      message: 'Diagnostic test updated successfully'
    };
  }

  /**
   * Get diagnostic test by ID
   */
  async getTest(testId, hospitalId) {
    const test = await this.repository.getTestById(testId);
    
    if (!test || test.hospitalId !== hospitalId) {
      throw new NotFoundError('Diagnostic test');
    }

    return formatDiagnosticTest(test);
  }

  /**
   * Get all diagnostic tests
   */
  async getAllTests(hospitalId, filters = {}) {
    const tests = await this.repository.getAllTests(hospitalId, {
      ...filters,
      isActive: filters.includeInactive ? undefined : true
    });

    return {
      tests: formatDiagnosticTestList(tests),
      count: tests.length
    };
  }

  /**
   * Get tests by category
   */
  async getTestsByCategory(hospitalId) {
    const tests = await this.repository.getAllTests(hospitalId, { isActive: true });
    
    const byCategory = tests.reduce((acc, test) => {
      if (!acc[test.category]) {
        acc[test.category] = [];
      }
      acc[test.category].push(formatDiagnosticTest(test));
      return acc;
    }, {});

    return byCategory;
  }

  /**
   * Get entry form configuration for a test (uses templates)
   */
  async getEntryFormForTest(testId, hospitalId) {
    const test = await this.repository.getTestById(testId);
    if (!test || test.hospitalId !== hospitalId) {
      throw new NotFoundError('Diagnostic test');
    }

    // Get template configuration
    const formConfig = await this.templateService.getEntryFormConfig(
      test.testCode,
      test.category,
      hospitalId
    );

    return {
      test: formatDiagnosticTest(test),
      formConfig
    };
  }

  /**
   * Get report print configuration for a test
   */
  async getReportPrintConfig(testCode, testCategory, hospitalId) {
    return this.templateService.getPrintConfig(testCode, testCategory, hospitalId);
  }

  /**
   * Deactivate test
   */
  async deactivateTest(testId, hospitalId) {
    const existing = await this.repository.getTestById(testId);
    if (!existing || existing.hospitalId !== hospitalId) {
      throw new NotFoundError('Diagnostic test');
    }

    await this.repository.deactivateTest(testId);

    return { message: 'Diagnostic test deactivated successfully' };
  }

  // ==================== DIAGNOSTIC ORDERS ====================

  /**
   * Create diagnostic order (Doctor-ordered)
   */
  async createDoctorOrder(data, hospitalId, userId) {
    validateDiagnosticOrderCreate({
      ...data,
      orderType: 'DOCTOR_ORDERED'
    });

    // Verify patient exists
    const patient = await this.prisma.patient.findFirst({
      where: { id: data.patientId, hospitalId }
    });
    if (!patient) {
      throw new NotFoundError('Patient');
    }

    // Get tests and calculate pricing
    const tests = await this.repository.getTestsByIds(data.testIds);
    if (tests.length !== data.testIds.length) {
      throw new ValidationError('One or more tests not found');
    }

    const orderId = await this.generateOrderId();
    const urgency = data.urgency || 'ROUTINE';

    // Calculate pricing
    let totalAmount = 0;
    let taxAmount = 0;
    const orderItems = [];

    for (const test of tests) {
      const basePrice = test.discountedPrice || test.basePrice;
      const itemTax = basePrice * (test.taxRate / 100);
      const netPrice = basePrice + itemTax;

      totalAmount += basePrice;
      taxAmount += itemTax;

      // Calculate expected completion time
      const expectedCompletionAt = new Date();
      expectedCompletionAt.setHours(expectedCompletionAt.getHours() + test.turnaroundTime);

      orderItems.push({
        testId: test.id,
        testCode: test.testCode,
        testName: test.testName,
        testCategory: test.category,
        basePrice,
        discountAmount: 0,
        taxAmount: itemTax,
        netPrice,
        status: 'ORDERED',
        priority: urgency,
        expectedCompletionAt
      });
    }

    const netAmount = totalAmount + taxAmount - (data.discountAmount || 0);

    // Create order with items
    const order = await this.prisma.diagnosticOrder.create({
      data: {
        orderId,
        patientId: data.patientId,
        hospitalId,
        orderType: 'DOCTOR_ORDERED',
        sourceType: data.sourceType || 'OPD',
        referringDoctorId: data.referringDoctorId || userId,
        consultationId: data.consultationId,
        clinicalIndication: data.clinicalIndication,
        urgency,
        specialInstructions: data.specialInstructions,
        totalAmount,
        discountAmount: data.discountAmount || 0,
        taxAmount,
        netAmount,
        status: 'CREATED',
        statusHistory: [{ status: 'CREATED', timestamp: new Date(), by: userId }],
        createdBy: userId,
        orderItems: {
          create: orderItems
        }
      },
      include: {
        patient: true,
        orderItems: { include: { test: true } },
        referringDoctor: true
      }
    });

    return {
      order: formatDiagnosticOrder(order),
      message: 'Diagnostic order created successfully'
    };
  }

  /**
   * Create self-initiated order (from external prescription)
   */
  async createSelfInitiatedOrder(data, hospitalId, userId) {
    validateDiagnosticOrderCreate({
      ...data,
      orderType: 'SELF_INITIATED'
    });

    // Verify patient
    const patient = await this.prisma.patient.findFirst({
      where: { id: data.patientId, hospitalId }
    });
    if (!patient) {
      throw new NotFoundError('Patient');
    }

    // Get tests and calculate pricing
    const tests = await this.repository.getTestsByIds(data.testIds);
    if (tests.length !== data.testIds.length) {
      throw new ValidationError('One or more tests not found');
    }

    const orderId = await this.generateOrderId();

    // Calculate pricing
    let totalAmount = 0;
    let taxAmount = 0;
    const orderItems = [];

    for (const test of tests) {
      const basePrice = test.discountedPrice || test.basePrice;
      const itemTax = basePrice * (test.taxRate / 100);
      const netPrice = basePrice + itemTax;

      totalAmount += basePrice;
      taxAmount += itemTax;

      const expectedCompletionAt = new Date();
      expectedCompletionAt.setHours(expectedCompletionAt.getHours() + test.turnaroundTime);

      orderItems.push({
        testId: test.id,
        testCode: test.testCode,
        testName: test.testName,
        testCategory: test.category,
        basePrice,
        discountAmount: 0,
        taxAmount: itemTax,
        netPrice,
        status: 'ORDERED',
        priority: 'ROUTINE',
        expectedCompletionAt
      });
    }

    const netAmount = totalAmount + taxAmount - (data.discountAmount || 0);

    // Create order
    const order = await this.prisma.diagnosticOrder.create({
      data: {
        orderId,
        patientId: data.patientId,
        hospitalId,
        orderType: 'SELF_INITIATED',
        sourceType: 'DIRECT',
        externalPrescriptionId: data.externalPrescriptionId,
        clinicalIndication: data.clinicalIndication,
        urgency: 'ROUTINE',
        collectionMode: data.collectionMode,
        collectionScheduledAt: data.collectionScheduledAt ? new Date(data.collectionScheduledAt) : null,
        collectionSlotId: data.slotId,
        totalAmount,
        discountAmount: data.discountAmount || 0,
        taxAmount,
        netAmount,
        status: data.slotId ? 'SCHEDULED' : 'CREATED',
        statusHistory: [{ status: 'CREATED', timestamp: new Date(), by: userId }],
        createdBy: userId,
        orderItems: {
          create: orderItems
        }
      },
      include: {
        patient: true,
        orderItems: { include: { test: true } },
        externalPrescription: true
      }
    });

    // Book the slot if provided
    if (data.slotId) {
      await this.repository.bookSlot(data.slotId);
    }

    return {
      order: formatDiagnosticOrder(order),
      message: 'Diagnostic order created successfully'
    };
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId, hospitalId) {
    const order = await this.repository.getOrderByOrderId(orderId);
    
    if (!order || order.hospitalId !== hospitalId) {
      throw new NotFoundError('Diagnostic order');
    }

    return formatDiagnosticOrder(order);
  }

  /**
   * Get orders by patient
   */
  async getPatientOrders(patientId, hospitalId) {
    const orders = await this.repository.getOrdersByPatient(patientId, hospitalId);
    return orders.map(formatDiagnosticOrder);
  }

  /**
   * Get all orders with filters
   */
  async getAllOrders(hospitalId, filters = {}) {
    const orders = await this.repository.getOrders(hospitalId, filters);
    const total = await this.repository.countOrders(hospitalId, filters);

    return {
      orders: orders.map(formatDiagnosticOrder),
      total,
      page: filters.page || 1,
      limit: filters.take || 20
    };
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId, reason, hospitalId, userId) {
    const order = await this.repository.getOrderByOrderId(orderId);
    
    if (!order || order.hospitalId !== hospitalId) {
      throw new NotFoundError('Diagnostic order');
    }

    if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
      throw new ValidationError('Cannot cancel completed or already cancelled order');
    }

    // Check if any samples have been collected
    const collectedItems = order.orderItems.filter(item => 
      item.status !== 'ORDERED' && item.status !== 'SAMPLE_PENDING'
    );
    if (collectedItems.length > 0) {
      throw new ValidationError('Cannot cancel order with collected samples');
    }

    // Release slot if booked
    if (order.collectionSlotId) {
      await this.repository.releaseSlot(order.collectionSlotId);
    }

    const statusHistory = order.statusHistory || [];
    statusHistory.push({ status: 'CANCELLED', timestamp: new Date(), by: userId, reason });

    const updated = await this.repository.updateOrder(order.id, {
      status: 'CANCELLED',
      statusHistory,
      cancelledBy: userId,
      cancellationReason: reason,
      cancelledAt: new Date()
    });

    // Update all items to cancelled
    await this.prisma.diagnosticOrderItem.updateMany({
      where: { orderId: order.id },
      data: { status: 'CANCELLED' }
    });

    return {
      order: formatDiagnosticOrder(updated),
      message: 'Order cancelled successfully'
    };
  }

  // ==================== SAMPLE COLLECTION ====================

  /**
   * Get pending collections for a date
   */
  async getPendingCollections(hospitalId, date) {
    const collections = await this.repository.getPendingCollections(hospitalId, date || new Date());
    return collections.map(formatCollectionSchedule);
  }

  /**
   * Mark sample as collected
   */
  async collectSample(data, hospitalId, userId) {
    validateSampleCollection(data);

    // Get order item
    let orderItem;
    if (data.orderItemId) {
      orderItem = await this.repository.getOrderItemById(data.orderItemId);
    } else {
      const order = await this.repository.getOrderByOrderId(data.orderId);
      if (!order) throw new NotFoundError('Diagnostic order');
      orderItem = order.orderItems.find(item => item.status === 'ORDERED' || item.status === 'SAMPLE_PENDING');
    }

    if (!orderItem) {
      throw new NotFoundError('Order item');
    }

    if (orderItem.order.hospitalId !== hospitalId) {
      throw new ForbiddenError('Access denied');
    }

    if (!['ORDERED', 'SAMPLE_PENDING'].includes(orderItem.status)) {
      throw new ValidationError('Sample already collected or item not in valid state');
    }

    // Generate sample ID
    const sampleId = await this.generateSampleId();

    // Update order item
    const statusHistory = orderItem.statusHistory || [];
    statusHistory.push({ status: 'SAMPLE_COLLECTED', timestamp: new Date(), by: userId });

    const updated = await this.repository.updateOrderItem(orderItem.id, {
      sampleId,
      sampleCollectedAt: new Date(),
      sampleQuality: data.sampleQuality || 'GOOD',
      sampleCollectedBy: data.collectedBy,
      barcodeGenerated: true,
      barcodeData: sampleId,
      status: 'SAMPLE_COLLECTED',
      statusHistory
    });

    // Check if all items in order are collected
    const order = await this.repository.getOrderById(orderItem.orderId);
    const allCollected = order.orderItems.every(item => 
      item.status === 'SAMPLE_COLLECTED' || 
      item.status === 'PROCESSING' || 
      item.status === 'COMPLETED' ||
      item.status === 'CANCELLED'
    );

    if (allCollected) {
      const orderStatusHistory = order.statusHistory || [];
      orderStatusHistory.push({ status: 'SAMPLE_COLLECTED', timestamp: new Date(), by: userId });
      
      await this.repository.updateOrder(order.id, {
        status: 'SAMPLE_COLLECTED',
        statusHistory: orderStatusHistory,
        collectionCompletedAt: new Date(),
        collectedBy: userId
      });
    }

    return {
      item: {
        id: updated.id,
        sampleId: updated.sampleId,
        testCode: updated.testCode,
        testName: updated.testName,
        status: updated.status,
        sampleCollectedAt: updated.sampleCollectedAt,
        barcodeData: updated.barcodeData
      },
      message: 'Sample collected successfully'
    };
  }

  /**
   * Reject sample
   */
  async rejectSample(orderItemId, reason, hospitalId, userId) {
    const orderItem = await this.repository.getOrderItemById(orderItemId);
    
    if (!orderItem || orderItem.order.hospitalId !== hospitalId) {
      throw new NotFoundError('Order item');
    }

    if (orderItem.status !== 'SAMPLE_COLLECTED') {
      throw new ValidationError('Sample must be collected before rejection');
    }

    const statusHistory = orderItem.statusHistory || [];
    statusHistory.push({ status: 'REJECTED', timestamp: new Date(), by: userId, reason });

    const updated = await this.repository.updateOrderItem(orderItemId, {
      sampleRejected: true,
      sampleRejectionReason: reason,
      status: 'SAMPLE_PENDING', // Reset to pending for recollection
      statusHistory
    });

    return {
      item: {
        id: updated.id,
        testCode: updated.testCode,
        testName: updated.testName,
        status: updated.status,
        sampleRejected: updated.sampleRejected,
        sampleRejectionReason: updated.sampleRejectionReason
      },
      message: 'Sample rejected. Recollection required.'
    };
  }

  // ==================== RESULTS MANAGEMENT ====================

  /**
   * Enter test result
   */
  async enterResult(data, hospitalId, userId) {
    validateResultEntry(data);

    const orderItem = await this.repository.getOrderItemById(data.orderItemId);
    
    if (!orderItem || orderItem.order.hospitalId !== hospitalId) {
      throw new NotFoundError('Order item');
    }

    if (orderItem.status !== 'SAMPLE_COLLECTED' && orderItem.status !== 'PROCESSING') {
      throw new ValidationError('Sample must be collected before entering results');
    }

    // Determine interpretation
    let interpretation = data.interpretation;
    if (!interpretation && data.resultNumeric !== undefined) {
      const test = orderItem.test;
      const refRanges = test.referenceRanges;
      if (refRanges && Array.isArray(refRanges)) {
        // Simple interpretation based on reference ranges
        const range = refRanges[0]; // Use first range for simplicity
        if (range) {
          if (data.resultNumeric < range.min) {
            interpretation = data.resultNumeric < range.min * 0.5 ? 'CRITICAL_LOW' : 'LOW';
          } else if (data.resultNumeric > range.max) {
            interpretation = data.resultNumeric > range.max * 1.5 ? 'CRITICAL_HIGH' : 'HIGH';
          } else {
            interpretation = 'NORMAL';
          }
        }
      }
    }

    const isCritical = interpretation?.includes('CRITICAL');

    // Create result
    const result = await this.repository.createResult({
      patientId: orderItem.order.patientId,
      hospitalId,
      testId: orderItem.testId,
      testCode: orderItem.testCode,
      testName: orderItem.testName,
      resultValue: data.resultValue,
      resultNumeric: data.resultNumeric,
      resultUnit: data.resultUnit || orderItem.test.unit,
      referenceMin: orderItem.test.referenceRanges?.[0]?.min,
      referenceMax: orderItem.test.referenceRanges?.[0]?.max,
      referenceText: data.referenceText,
      interpretation,
      isCritical,
      reportText: data.reportText,
      impressions: data.impressions,
      recommendations: data.recommendations,
      attachments: data.attachments,
      imageUrls: data.imageUrls || [],
      enteredBy: data.enteredBy,
      enteredAt: new Date(),
      status: 'ENTERED'
    });

    // Update order item
    const itemHistory = orderItem.statusHistory || [];
    itemHistory.push({ status: 'QC_PENDING', timestamp: new Date(), by: userId });

    await this.repository.updateOrderItem(orderItem.id, {
      resultId: result.id,
      status: 'QC_PENDING',
      processingCompletedAt: new Date(),
      statusHistory: itemHistory
    });

    return {
      result: formatDiagnosticResult(result),
      message: 'Result entered successfully'
    };
  }

  /**
   * QC check result
   */
  async qcCheckResult(data, hospitalId, userId) {
    validateQCCheck(data);

    const result = await this.repository.getResultById(data.resultId);
    
    if (!result || result.hospitalId !== hospitalId) {
      throw new NotFoundError('Result');
    }

    if (result.status !== 'ENTERED') {
      throw new ValidationError('Result must be in ENTERED status for QC check');
    }

    const updated = await this.repository.updateResult(data.resultId, {
      qcCheckedBy: data.checkedBy,
      qcCheckedAt: new Date(),
      qcStatus: data.qcStatus,
      qcNotes: data.qcNotes,
      status: data.qcStatus === 'PASSED' ? 'QC_CHECKED' : 'ENTERED'
    });

    // Update order item status
    const orderItem = await this.prisma.diagnosticOrderItem.findFirst({
      where: { resultId: data.resultId }
    });

    if (orderItem) {
      const status = data.qcStatus === 'PASSED' ? 'PATHOLOGIST_REVIEW' : 'QC_PENDING';
      await this.repository.updateOrderItem(orderItem.id, { status });
    }

    return {
      result: formatDiagnosticResult(updated),
      message: data.qcStatus === 'PASSED' 
        ? 'QC passed. Sent for pathologist review.' 
        : 'QC failed. Please re-enter result.'
    };
  }

  /**
   * Pathologist review
   */
  async pathologistReview(data, hospitalId, userId) {
    validatePathologistReview(data);

    const result = await this.repository.getResultById(data.resultId);
    
    if (!result || result.hospitalId !== hospitalId) {
      throw new NotFoundError('Result');
    }

    if (result.status !== 'QC_CHECKED') {
      throw new ValidationError('Result must pass QC before pathologist review');
    }

    const updated = await this.repository.updateResult(data.resultId, {
      reviewedBy: data.reviewedBy,
      reviewedAt: new Date(),
      reviewerNotes: data.reviewerNotes,
      reviewerSignature: data.reviewerSignature,
      // Allow pathologist to update interpretation
      interpretation: data.interpretation || result.interpretation,
      impressions: data.impressions || result.impressions,
      recommendations: data.recommendations || result.recommendations,
      status: 'REVIEWED'
    });

    // Update order item
    const orderItem = await this.prisma.diagnosticOrderItem.findFirst({
      where: { resultId: data.resultId }
    });

    if (orderItem) {
      await this.repository.updateOrderItem(orderItem.id, { status: 'COMPLETED' });
    }

    return {
      result: formatDiagnosticResult(updated),
      message: 'Pathologist review completed'
    };
  }

  /**
   * Release result to patient
   */
  async releaseResult(resultId, hospitalId, userId) {
    const result = await this.repository.getResultById(resultId);
    
    if (!result || result.hospitalId !== hospitalId) {
      throw new NotFoundError('Result');
    }

    if (result.status !== 'REVIEWED' && result.status !== 'APPROVED') {
      throw new ValidationError('Result must be reviewed before release');
    }

    const updated = await this.repository.updateResult(resultId, {
      status: 'RELEASED',
      isReleased: true,
      releasedAt: new Date(),
      releasedBy: userId,
      visibleToPatient: true
    });

    // Check if all results for the order are released
    const orderItem = await this.prisma.diagnosticOrderItem.findFirst({
      where: { resultId },
      include: { order: { include: { orderItems: { include: { result: true } } } } }
    });

    if (orderItem) {
      const allReleased = orderItem.order.orderItems.every(item => 
        item.result?.isReleased || item.status === 'CANCELLED'
      );

      if (allReleased) {
        await this.repository.updateOrder(orderItem.order.id, {
          status: 'COMPLETED',
          resultsDeliveredAt: new Date()
        });
      }
    }

    return {
      result: formatDiagnosticResult(updated),
      message: 'Result released to patient'
    };
  }

  /**
   * Get patient results
   */
  async getPatientResults(patientId, hospitalId) {
    const results = await this.repository.getResultsByPatient(patientId, hospitalId);
    return results.map(formatDiagnosticResult);
  }

  /**
   * Get results pending QC
   */
  async getPendingQCResults(hospitalId) {
    const results = await this.repository.getResultsPendingQC(hospitalId);
    return results.map(formatDiagnosticResult);
  }

  /**
   * Get results pending pathologist review
   */
  async getPendingReviewResults(hospitalId) {
    const results = await this.repository.getResultsPendingReview(hospitalId);
    return results.map(formatDiagnosticResult);
  }

  // ==================== EXTERNAL PRESCRIPTIONS ====================

  /**
   * Upload external prescription
   */
  async uploadExternalPrescription(data, hospitalId, userId) {
    validateExternalPrescription(data);

    // Verify patient
    const patient = await this.prisma.patient.findFirst({
      where: { id: data.patientId, hospitalId }
    });
    if (!patient) {
      throw new NotFoundError('Patient');
    }

    const prescription = await this.repository.createExternalPrescription({
      patientId: data.patientId,
      hospitalId,
      prescriptionDate: data.prescriptionDate ? new Date(data.prescriptionDate) : null,
      prescriptionImage: data.prescriptionImage,
      prescriptionPdf: data.prescriptionPdf,
      referringDoctorName: data.referringDoctorName,
      referringHospital: data.referringHospital,
      referringDoctorPhone: data.referringDoctorPhone,
      referringDoctorRegNo: data.referringDoctorRegNo,
      ocrExtractedText: data.ocrExtractedText,
      ocrExtractedTests: data.ocrExtractedTests,
      manualEntryTests: data.manualEntryTests,
      status: 'UPLOADED'
    });

    return {
      prescription: formatExternalPrescription(prescription),
      message: 'Prescription uploaded successfully'
    };
  }

  /**
   * Map prescription tests to hospital catalog
   */
  async mapPrescriptionTests(prescriptionId, mappings, hospitalId, userId) {
    const prescription = await this.repository.getExternalPrescriptionById(prescriptionId);
    
    if (!prescription || prescription.hospitalId !== hospitalId) {
      throw new NotFoundError('External prescription');
    }

    const updated = await this.repository.updateExternalPrescription(prescriptionId, {
      mappedTests: mappings,
      validationStatus: 'VALIDATED',
      validatedBy: userId,
      validatedAt: new Date(),
      status: 'MAPPED'
    });

    return {
      prescription: formatExternalPrescription(updated),
      message: 'Tests mapped successfully'
    };
  }

  // ==================== LAB SLOTS ====================

  /**
   * Generate slots for a date
   */
  async generateSlots(hospitalId, date, config) {
    const slots = [];
    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);

    const startHour = config.startHour || 9;
    const endHour = config.endHour || 17;
    const slotDuration = config.slotDuration || 15;
    const collectionType = config.collectionType || 'WALK_IN';
    const maxBookings = config.maxBookings || 3;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const endMinute = minute + slotDuration;
        const endHourCalc = hour + Math.floor(endMinute / 60);
        const endMin = endMinute % 60;
        const endTime = `${String(endHourCalc).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

        slots.push({
          hospitalId,
          slotDate,
          slotStartTime: startTime,
          slotEndTime: endTime,
          slotDuration,
          collectionType,
          maxBookings,
          technicianId: config.technicianId
        });
      }
    }

    await this.repository.createLabSlots(slots);

    return { 
      message: `${slots.length} slots generated for ${date}`,
      slotsCount: slots.length
    };
  }

  /**
   * Get available slots
   */
  async getAvailableSlots(hospitalId, date, collectionType) {
    const slots = await this.repository.getAvailableSlots(hospitalId, date, collectionType);
    return slots.filter(s => s.currentBookings < s.maxBookings).map(formatLabSlot);
  }

  /**
   * Book a slot for an order
   */
  async bookSlot(data, hospitalId, userId) {
    validateSlotBooking(data);

    const order = await this.repository.getOrderByOrderId(data.orderId);
    if (!order || order.hospitalId !== hospitalId) {
      throw new NotFoundError('Diagnostic order');
    }

    const slot = await this.repository.getSlotById(data.slotId);
    if (!slot || slot.hospitalId !== hospitalId) {
      throw new NotFoundError('Lab slot');
    }

    if (slot.currentBookings >= slot.maxBookings) {
      throw new ValidationError('Slot is fully booked');
    }

    // Book the slot
    await this.repository.bookSlot(data.slotId);

    // Update order
    const slotDateTime = new Date(slot.slotDate);
    const [hours, minutes] = slot.slotStartTime.split(':');
    slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const statusHistory = order.statusHistory || [];
    statusHistory.push({ status: 'SCHEDULED', timestamp: new Date(), by: userId });

    const updated = await this.repository.updateOrder(order.id, {
      collectionSlotId: data.slotId,
      collectionScheduledAt: slotDateTime,
      collectionMode: slot.collectionType,
      status: 'SCHEDULED',
      statusHistory
    });

    return {
      order: formatDiagnosticOrder(updated),
      slot: formatLabSlot(slot),
      message: 'Slot booked successfully'
    };
  }

  // ==================== REPORTS ====================

  /**
   * Get daily summary
   */
  async getDailySummary(hospitalId, date) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await this.prisma.diagnosticOrder.findMany({
      where: {
        hospitalId,
        createdAt: { gte: startOfDay, lte: endOfDay }
      },
      include: {
        orderItems: { include: { result: true } }
      }
    });

    const summary = {
      date: targetDate.toISOString().split('T')[0],
      totalOrders: orders.length,
      pendingCollection: 0,
      samplesCollected: 0,
      processing: 0,
      completed: 0,
      pendingQC: 0,
      pendingReview: 0,
      released: 0,
      revenue: 0
    };

    for (const order of orders) {
      summary.revenue += order.netAmount;

      if (order.status === 'CREATED' || order.status === 'SCHEDULED') {
        summary.pendingCollection++;
      } else if (order.status === 'SAMPLE_COLLECTED') {
        summary.samplesCollected++;
      } else if (order.status === 'PROCESSING') {
        summary.processing++;
      } else if (order.status === 'COMPLETED') {
        summary.completed++;
      }

      for (const item of order.orderItems) {
        if (item.result) {
          if (item.result.status === 'ENTERED') {
            summary.pendingQC++;
          } else if (item.result.status === 'QC_CHECKED') {
            summary.pendingReview++;
          } else if (item.result.isReleased) {
            summary.released++;
          }
        }
      }
    }

    return summary;
  }

  /**
   * Get TAT analysis
   */
  async getTATAnalysis(hospitalId, dateFrom, dateTo) {
    const items = await this.prisma.diagnosticOrderItem.findMany({
      where: {
        order: { hospitalId },
        status: 'COMPLETED',
        actualCompletionAt: { not: null },
        createdAt: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo)
        }
      },
      include: { test: true }
    });

    const byTest = {};
    for (const item of items) {
      if (!byTest[item.testCode]) {
        byTest[item.testCode] = {
          testCode: item.testCode,
          testName: item.testName,
          expectedTAT: item.test.turnaroundTime,
          samples: [],
          tatBreached: 0
        };
      }

      const expectedTime = new Date(item.createdAt);
      expectedTime.setHours(expectedTime.getHours() + item.test.turnaroundTime);
      const actualTAT = (item.actualCompletionAt - item.createdAt) / (1000 * 60 * 60); // hours

      byTest[item.testCode].samples.push(actualTAT);
      if (item.tatBreached) {
        byTest[item.testCode].tatBreached++;
      }
    }

    // Calculate averages
    const analysis = Object.values(byTest).map(test => ({
      ...test,
      totalSamples: test.samples.length,
      averageTAT: test.samples.length > 0 
        ? (test.samples.reduce((a, b) => a + b, 0) / test.samples.length).toFixed(2)
        : 0,
      minTAT: test.samples.length > 0 ? Math.min(...test.samples).toFixed(2) : 0,
      maxTAT: test.samples.length > 0 ? Math.max(...test.samples).toFixed(2) : 0,
      breachRate: test.samples.length > 0 
        ? ((test.tatBreached / test.samples.length) * 100).toFixed(2) + '%'
        : '0%'
    }));

    return analysis;
  }
}



















