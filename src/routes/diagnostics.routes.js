/**
 * Diagnostics Routes
 * API routes for diagnostic operations
 */

import { Router } from 'express';
import * as diagnosticsController from '../controllers/diagnostics.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import templateRoutes from './template.routes.js';
import workboardRoutes from './workboard.routes.js';

const router = Router();

// Root endpoint - no auth required for module info
router.get('/', (req, res) => {
  res.json({ module: 'diagnostics', status: 'active', endpoints: ['GET /tests', 'POST /orders', 'GET /orders', 'POST /collection/collect', 'POST /results/enter'] });
});

// All routes require authentication
router.use(protect);

// Mount template routes
router.use('/templates', templateRoutes);

// Mount workboard routes (result entry & workflow)
router.use('/workboard', workboardRoutes);

// ==================== DIAGNOSTIC TESTS (Master Catalog) ====================

/**
 * @route   GET /api/diagnostics/tests
 * @desc    Get all diagnostic tests with filters
 * @query   category, search, department, includeInactive, homeCollectionOnly
 * @access  Protected
 */
router.get('/tests', diagnosticsController.getAllTests);

/**
 * @route   GET /api/diagnostics/tests/by-category
 * @desc    Get tests grouped by category
 * @access  Protected
 */
router.get('/tests/by-category', diagnosticsController.getTestsByCategory);

/**
 * @route   GET /api/diagnostics/tests/:testId
 * @desc    Get diagnostic test by ID
 * @access  Protected
 */
router.get('/tests/:testId', diagnosticsController.getTest);

/**
 * @route   POST /api/diagnostics/tests
 * @desc    Create new diagnostic test
 * @access  Protected (Admin)
 */
router.post('/tests', diagnosticsController.createTest);

/**
 * @route   PUT /api/diagnostics/tests/:testId
 * @desc    Update diagnostic test
 * @access  Protected (Admin)
 */
router.put('/tests/:testId', diagnosticsController.updateTest);

/**
 * @route   DELETE /api/diagnostics/tests/:testId
 * @desc    Deactivate diagnostic test (soft delete)
 * @access  Protected (Admin)
 */
router.delete('/tests/:testId', diagnosticsController.deactivateTest);

/**
 * @route   GET /api/diagnostics/tests/:testId/entry-form
 * @desc    Get entry form configuration for a test (from template)
 * @access  Protected
 */
router.get('/tests/:testId/entry-form', diagnosticsController.getTestEntryForm);

/**
 * @route   GET /api/diagnostics/report-print-config
 * @desc    Get report print configuration for a test
 * @query   testCode, testCategory
 * @access  Protected
 */
router.get('/report-print-config', diagnosticsController.getReportPrintConfig);

// ==================== DIAGNOSTIC ORDERS ====================

/**
 * @route   GET /api/diagnostics/orders
 * @desc    Get all diagnostic orders with filters
 * @query   status, orderType, patientId, doctorId, dateFrom, dateTo, collectionDate, page, limit
 * @access  Protected
 */
router.get('/orders', diagnosticsController.getAllOrders);

/**
 * @route   GET /api/diagnostics/orders/:orderId
 * @desc    Get diagnostic order by orderId
 * @access  Protected
 */
router.get('/orders/:orderId', diagnosticsController.getOrder);

/**
 * @route   POST /api/diagnostics/orders/doctor-ordered
 * @desc    Create doctor-ordered diagnostic order
 * @body    { patientId, testIds[], referringDoctorId, clinicalIndication, urgency, ... }
 * @access  Protected (Doctor, Admin)
 */
router.post('/orders/doctor-ordered', diagnosticsController.createDoctorOrder);

/**
 * @route   POST /api/diagnostics/orders/self-initiated
 * @desc    Create self-initiated diagnostic order (from external prescription)
 * @body    { patientId, testIds[], externalPrescriptionId, collectionMode, slotId, ... }
 * @access  Protected (Receptionist, Admin)
 */
router.post('/orders/self-initiated', diagnosticsController.createSelfInitiatedOrder);

/**
 * @route   POST /api/diagnostics/orders/:orderId/cancel
 * @desc    Cancel diagnostic order
 * @body    { reason }
 * @access  Protected
 */
router.post('/orders/:orderId/cancel', diagnosticsController.cancelOrder);

/**
 * @route   GET /api/diagnostics/patients/:patientId/orders
 * @desc    Get patient's diagnostic orders
 * @access  Protected
 */
router.get('/patients/:patientId/orders', diagnosticsController.getPatientOrders);

// ==================== SAMPLE COLLECTION ====================

/**
 * @route   GET /api/diagnostics/collection/pending
 * @desc    Get pending collections for a date
 * @query   date (optional, defaults to today)
 * @access  Protected (Lab Staff)
 */
router.get('/collection/pending', diagnosticsController.getPendingCollections);

/**
 * @route   POST /api/diagnostics/collection/collect
 * @desc    Mark sample as collected
 * @body    { orderId or orderItemId, sampleQuality }
 * @access  Protected (Lab Staff)
 */
router.post('/collection/collect', diagnosticsController.collectSample);

/**
 * @route   POST /api/diagnostics/collection/:orderItemId/reject
 * @desc    Reject sample (requires recollection)
 * @body    { reason }
 * @access  Protected (Lab Staff)
 */
router.post('/collection/:orderItemId/reject', diagnosticsController.rejectSample);

// ==================== RESULTS MANAGEMENT ====================

/**
 * @route   POST /api/diagnostics/results/enter
 * @desc    Enter test result
 * @body    { orderItemId, resultValue, resultNumeric, resultUnit, reportText, ... }
 * @access  Protected (Lab Technician)
 */
router.post('/results/enter', diagnosticsController.enterResult);

/**
 * @route   POST /api/diagnostics/results/qc-check
 * @desc    QC check result
 * @body    { resultId, qcStatus, qcNotes }
 * @access  Protected (Senior Lab Technician)
 */
router.post('/results/qc-check', diagnosticsController.qcCheckResult);

/**
 * @route   POST /api/diagnostics/results/pathologist-review
 * @desc    Pathologist review
 * @body    { resultId, reviewerNotes, interpretation, impressions, recommendations }
 * @access  Protected (Pathologist, Radiologist)
 */
router.post('/results/pathologist-review', diagnosticsController.pathologistReview);

/**
 * @route   POST /api/diagnostics/results/:resultId/release
 * @desc    Release result to patient
 * @access  Protected (Pathologist, Admin)
 */
router.post('/results/:resultId/release', diagnosticsController.releaseResult);

/**
 * @route   GET /api/diagnostics/results/pending-qc
 * @desc    Get results pending QC check
 * @access  Protected (Lab Staff)
 */
router.get('/results/pending-qc', diagnosticsController.getPendingQCResults);

/**
 * @route   GET /api/diagnostics/results/pending-review
 * @desc    Get results pending pathologist review
 * @access  Protected (Pathologist)
 */
router.get('/results/pending-review', diagnosticsController.getPendingReviewResults);

/**
 * @route   GET /api/diagnostics/patients/:patientId/results
 * @desc    Get patient's diagnostic results
 * @access  Protected
 */
router.get('/patients/:patientId/results', diagnosticsController.getPatientResults);

// ==================== EXTERNAL PRESCRIPTIONS ====================

/**
 * @route   POST /api/diagnostics/prescription/upload
 * @desc    Upload external prescription
 * @body    { patientId, prescriptionImage, manualEntryTests[], referringDoctorName, ... }
 * @access  Protected
 */
router.post('/prescription/upload', diagnosticsController.uploadExternalPrescription);

/**
 * @route   POST /api/diagnostics/prescription/:prescriptionId/map-tests
 * @desc    Map prescription tests to hospital catalog
 * @body    { mappings: [{ extractedName, mappedTestId, mappedTestCode }] }
 * @access  Protected
 */
router.post('/prescription/:prescriptionId/map-tests', diagnosticsController.mapPrescriptionTests);

// ==================== LAB SLOTS ====================

/**
 * @route   POST /api/diagnostics/slots/generate
 * @desc    Generate lab slots for a date
 * @body    { date, startHour, endHour, slotDuration, collectionType, maxBookings, technicianId }
 * @access  Protected (Admin)
 */
router.post('/slots/generate', diagnosticsController.generateSlots);

/**
 * @route   GET /api/diagnostics/slots/available
 * @desc    Get available slots for a date
 * @query   date, collectionType
 * @access  Protected
 */
router.get('/slots/available', diagnosticsController.getAvailableSlots);

/**
 * @route   POST /api/diagnostics/slots/book
 * @desc    Book a slot for an order
 * @body    { orderId, slotId }
 * @access  Protected
 */
router.post('/slots/book', diagnosticsController.bookSlot);

// ==================== REPORTS ====================

/**
 * @route   GET /api/diagnostics/reports/daily-summary
 * @desc    Get daily summary report
 * @query   date (optional, defaults to today)
 * @access  Protected (Admin, Lab Manager)
 */
router.get('/reports/daily-summary', diagnosticsController.getDailySummary);

/**
 * @route   GET /api/diagnostics/reports/tat-analysis
 * @desc    Get TAT (turnaround time) analysis
 * @query   dateFrom, dateTo (required)
 * @access  Protected (Admin, Lab Manager)
 */
router.get('/reports/tat-analysis', diagnosticsController.getTATAnalysis);

// ==================== BILLING INTEGRATION ====================

/**
 * @route   POST /api/diagnostics/billing/:orderId/add-to-bill
 * @desc    Add diagnostic order charges to patient bill
 * @access  Protected (Billing, Admin)
 */
router.post('/billing/:orderId/add-to-bill', diagnosticsController.addToBill);

/**
 * @route   GET /api/diagnostics/billing/:billId/charges
 * @desc    Get diagnostic charges breakdown for a bill
 * @access  Protected
 */
router.get('/billing/:billId/charges', diagnosticsController.getBillCharges);

/**
 * @route   POST /api/diagnostics/billing/:orderId/apply-insurance
 * @desc    Apply insurance coverage to diagnostic order
 * @body    { coveragePercentage, preAuthNumber, preAuthStatus, maxCoverage }
 * @access  Protected (Billing, Admin)
 */
router.post('/billing/:orderId/apply-insurance', diagnosticsController.applyInsurance);

/**
 * @route   POST /api/diagnostics/billing/:orderId/apply-discount
 * @desc    Apply discount to diagnostic order
 * @body    { discountType: 'PERCENTAGE' | 'FIXED', discountValue, reason }
 * @access  Protected (Admin)
 */
router.post('/billing/:orderId/apply-discount', diagnosticsController.applyDiscount);

/**
 * @route   POST /api/diagnostics/insurance/verify-coverage
 * @desc    Verify insurance coverage for specific tests
 * @body    { testIds[], insurancePlan: { coveragePercentage, coveredCategories[], preAuthThreshold } }
 * @access  Protected
 */
router.post('/insurance/verify-coverage', diagnosticsController.verifyInsuranceCoverage);

export { router as diagnosticsRoutes };
export default router;
