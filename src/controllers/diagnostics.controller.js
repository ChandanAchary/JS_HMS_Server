/**
 * Diagnostics Controller
 * HTTP request handlers for diagnostic operations
 */

import { DiagnosticsService } from '../services/diagnostics.service.js';
import { DiagnosticsBillingService } from '../services/diagnostics.billing.service.js';
import { ApiResponse } from '../shared/ApiResponse.js';

/**
 * Get Diagnostics Service instance
 */
const getService = (req) => new DiagnosticsService(req.prisma);

/**
 * Get Diagnostics Billing Service instance
 */
const getBillingService = (req) => new DiagnosticsBillingService(req.prisma);

// ==================== DIAGNOSTIC TESTS ====================

/**
 * Create diagnostic test
 */
export async function createTest(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.createTest(req.body, req.hospitalId);
    res.status(201).json(ApiResponse.success(result.test, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Update diagnostic test
 */
export async function updateTest(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.updateTest(req.params.testId, req.body, req.hospitalId);
    res.json(ApiResponse.success(result.test, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Get diagnostic test by ID
 */
export async function getTest(req, res, next) {
  try {
    const service = getService(req);
    const test = await service.getTest(req.params.testId, req.hospitalId);
    res.json(ApiResponse.success(test));
  } catch (error) {
    next(error);
  }
}

/**
 * Get all diagnostic tests
 */
export async function getAllTests(req, res, next) {
  try {
    const service = getService(req);
    const { category, search, department, includeInactive, homeCollectionOnly } = req.query;
    
    const result = await service.getAllTests(req.hospitalId, {
      category,
      search,
      department,
      includeInactive: includeInactive === 'true',
      homeCollectionAvailable: homeCollectionOnly === 'true' ? true : undefined
    });
    
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

/**
 * Get tests by category
 */
export async function getTestsByCategory(req, res, next) {
  try {
    const service = getService(req);
    const tests = await service.getTestsByCategory(req.hospitalId);
    res.json(ApiResponse.success(tests));
  } catch (error) {
    next(error);
  }
}

/**
 * Get entry form configuration for a test (from template)
 */
export async function getTestEntryForm(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.getEntryFormForTest(req.params.testId, req.hospitalId);
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

/**
 * Get report print configuration for a test
 */
export async function getReportPrintConfig(req, res, next) {
  try {
    const service = getService(req);
    const { testCode, testCategory } = req.query;
    
    if (!testCode || !testCategory) {
      return res.status(400).json(ApiResponse.error('testCode and testCategory are required'));
    }
    
    const config = await service.getReportPrintConfig(testCode, testCategory, req.hospitalId);
    res.json(ApiResponse.success(config));
  } catch (error) {
    next(error);
  }
}

/**
 * Deactivate diagnostic test
 */
export async function deactivateTest(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.deactivateTest(req.params.testId, req.hospitalId);
    res.json(ApiResponse.success(null, result.message));
  } catch (error) {
    next(error);
  }
}

// ==================== DIAGNOSTIC ORDERS ====================

/**
 * Create doctor-ordered diagnostic order
 */
export async function createDoctorOrder(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.createDoctorOrder(req.body, req.hospitalId, req.user.id);
    res.status(201).json(ApiResponse.success(result.order, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Create self-initiated diagnostic order
 */
export async function createSelfInitiatedOrder(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.createSelfInitiatedOrder(req.body, req.hospitalId, req.user.id);
    res.status(201).json(ApiResponse.success(result.order, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Get diagnostic order by orderId
 */
export async function getOrder(req, res, next) {
  try {
    const service = getService(req);
    const order = await service.getOrder(req.params.orderId, req.hospitalId);
    res.json(ApiResponse.success(order));
  } catch (error) {
    next(error);
  }
}

/**
 * Get patient's diagnostic orders
 */
export async function getPatientOrders(req, res, next) {
  try {
    const service = getService(req);
    const orders = await service.getPatientOrders(req.params.patientId, req.hospitalId);
    res.json(ApiResponse.success(orders));
  } catch (error) {
    next(error);
  }
}

/**
 * Get all diagnostic orders with filters
 */
export async function getAllOrders(req, res, next) {
  try {
    const service = getService(req);
    const { status, orderType, patientId, doctorId, dateFrom, dateTo, collectionDate, page, limit } = req.query;
    
    const result = await service.getAllOrders(req.hospitalId, {
      status,
      orderType,
      patientId,
      referringDoctorId: doctorId,
      dateFrom,
      dateTo,
      collectionDate,
      skip: page ? (parseInt(page) - 1) * (parseInt(limit) || 20) : 0,
      take: parseInt(limit) || 20,
      page: parseInt(page) || 1
    });
    
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel diagnostic order
 */
export async function cancelOrder(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.cancelOrder(
      req.params.orderId, 
      req.body.reason, 
      req.hospitalId, 
      req.user.id
    );
    res.json(ApiResponse.success(result.order, result.message));
  } catch (error) {
    next(error);
  }
}

// ==================== SAMPLE COLLECTION ====================

/**
 * Get pending collections
 */
export async function getPendingCollections(req, res, next) {
  try {
    const service = getService(req);
    const collections = await service.getPendingCollections(req.hospitalId, req.query.date);
    res.json(ApiResponse.success(collections));
  } catch (error) {
    next(error);
  }
}

/**
 * Collect sample
 */
export async function collectSample(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.collectSample(
      { ...req.body, collectedBy: req.user.id },
      req.hospitalId,
      req.user.id
    );
    res.json(ApiResponse.success(result.item, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Reject sample
 */
export async function rejectSample(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.rejectSample(
      req.params.orderItemId,
      req.body.reason,
      req.hospitalId,
      req.user.id
    );
    res.json(ApiResponse.success(result.item, result.message));
  } catch (error) {
    next(error);
  }
}

// ==================== RESULTS MANAGEMENT ====================

/**
 * Enter test result
 */
export async function enterResult(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.enterResult(
      { ...req.body, enteredBy: req.user.id },
      req.hospitalId,
      req.user.id
    );
    res.status(201).json(ApiResponse.success(result.result, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * QC check result
 */
export async function qcCheckResult(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.qcCheckResult(
      { ...req.body, checkedBy: req.user.id },
      req.hospitalId,
      req.user.id
    );
    res.json(ApiResponse.success(result.result, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Pathologist review
 */
export async function pathologistReview(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.pathologistReview(
      { ...req.body, reviewedBy: req.user.id },
      req.hospitalId,
      req.user.id
    );
    res.json(ApiResponse.success(result.result, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Release result to patient
 */
export async function releaseResult(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.releaseResult(req.params.resultId, req.hospitalId, req.user.id);
    res.json(ApiResponse.success(result.result, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Get patient results
 */
export async function getPatientResults(req, res, next) {
  try {
    const service = getService(req);
    const results = await service.getPatientResults(req.params.patientId, req.hospitalId);
    res.json(ApiResponse.success(results));
  } catch (error) {
    next(error);
  }
}

/**
 * Get results pending QC
 */
export async function getPendingQCResults(req, res, next) {
  try {
    const service = getService(req);
    const results = await service.getPendingQCResults(req.hospitalId);
    res.json(ApiResponse.success(results));
  } catch (error) {
    next(error);
  }
}

/**
 * Get results pending pathologist review
 */
export async function getPendingReviewResults(req, res, next) {
  try {
    const service = getService(req);
    const results = await service.getPendingReviewResults(req.hospitalId);
    res.json(ApiResponse.success(results));
  } catch (error) {
    next(error);
  }
}

// ==================== EXTERNAL PRESCRIPTIONS ====================

/**
 * Upload external prescription
 */
export async function uploadExternalPrescription(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.uploadExternalPrescription(req.body, req.hospitalId, req.user.id);
    res.status(201).json(ApiResponse.success(result.prescription, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Map prescription tests
 */
export async function mapPrescriptionTests(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.mapPrescriptionTests(
      req.params.prescriptionId,
      req.body.mappings,
      req.hospitalId,
      req.user.id
    );
    res.json(ApiResponse.success(result.prescription, result.message));
  } catch (error) {
    next(error);
  }
}

// ==================== LAB SLOTS ====================

/**
 * Generate lab slots
 */
export async function generateSlots(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.generateSlots(req.hospitalId, req.body.date, req.body);
    res.status(201).json(ApiResponse.success(result, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Get available slots
 */
export async function getAvailableSlots(req, res, next) {
  try {
    const service = getService(req);
    const { date, collectionType } = req.query;
    const slots = await service.getAvailableSlots(req.hospitalId, date, collectionType || 'WALK_IN');
    res.json(ApiResponse.success(slots));
  } catch (error) {
    next(error);
  }
}

/**
 * Book a slot
 */
export async function bookSlot(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.bookSlot(req.body, req.hospitalId, req.user.id);
    res.json(ApiResponse.success({ order: result.order, slot: result.slot }, result.message));
  } catch (error) {
    next(error);
  }
}

// ==================== REPORTS ====================

/**
 * Get daily summary
 */
export async function getDailySummary(req, res, next) {
  try {
    const service = getService(req);
    const summary = await service.getDailySummary(req.hospitalId, req.query.date);
    res.json(ApiResponse.success(summary));
  } catch (error) {
    next(error);
  }
}

/**
 * Get TAT analysis
 */
export async function getTATAnalysis(req, res, next) {
  try {
    const service = getService(req);
    const { dateFrom, dateTo } = req.query;
    
    if (!dateFrom || !dateTo) {
      return res.status(400).json(ApiResponse.error('dateFrom and dateTo are required'));
    }
    
    const analysis = await service.getTATAnalysis(req.hospitalId, dateFrom, dateTo);
    res.json(ApiResponse.success(analysis));
  } catch (error) {
    next(error);
  }
}

// ==================== BILLING INTEGRATION ====================

/**
 * Add diagnostic order to bill
 */
export async function addToBill(req, res, next) {
  try {
    const billingService = getBillingService(req);
    const result = await billingService.addDiagnosticsToBill(
      req.params.orderId,
      req.hospitalId,
      req.user.id
    );
    res.json(ApiResponse.success(result, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Get diagnostic charges for a bill
 */
export async function getBillCharges(req, res, next) {
  try {
    const billingService = getBillingService(req);
    const charges = await billingService.getDiagnosticChargesForBill(
      req.params.billId,
      req.hospitalId
    );
    res.json(ApiResponse.success(charges));
  } catch (error) {
    next(error);
  }
}

/**
 * Apply insurance coverage to diagnostic order
 */
export async function applyInsurance(req, res, next) {
  try {
    const billingService = getBillingService(req);
    const result = await billingService.applyInsuranceCoverage(
      req.params.orderId,
      req.body,
      req.hospitalId
    );
    res.json(ApiResponse.success(result, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Apply discount to diagnostic order
 */
export async function applyDiscount(req, res, next) {
  try {
    const billingService = getBillingService(req);
    const result = await billingService.applyDiscount(
      req.params.orderId,
      req.body,
      req.hospitalId,
      req.user.id
    );
    res.json(ApiResponse.success(result, result.message));
  } catch (error) {
    next(error);
  }
}

/**
 * Verify insurance coverage for tests
 */
export async function verifyInsuranceCoverage(req, res, next) {
  try {
    const billingService = getBillingService(req);
    const { testIds, insurancePlan } = req.body;
    
    const result = await billingService.verifyInsuranceCoverage(
      testIds,
      insurancePlan,
      req.hospitalId
    );
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}



















