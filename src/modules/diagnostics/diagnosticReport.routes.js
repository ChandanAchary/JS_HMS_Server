/**
 * 🧬 UNIVERSAL DIAGNOSTIC REPORT ROUTES
 * =======================================
 * 
 * RESTful API routes for diagnostic report management
 */

import express from 'express';
import diagnosticReportController from './diagnosticReport.controller.js';
// import { authenticate, authorize } from '../../middleware/auth.middleware.js';
// import { validateRequest } from '../../middleware/validation.middleware.js';
// import { diagnosticReportValidation } from './diagnosticReport.validation.js';

const router = express.Router();

// ============================================
// TEMPLATE MANAGEMENT
// ============================================

/**
 * @route   GET /api/diagnostic-templates
 * @desc    Get all available report templates
 * @access  Private (LAB_TECH, DOCTOR, PATHOLOGIST)
 * @query   ?category=PATHOLOGY&department=LAB&search=CBC
 */
router.get(
  '/diagnostic-templates',
  // authenticate,
  diagnosticReportController.getTemplates
);

/**
 * @route   GET /api/diagnostic-templates/:identifier
 * @desc    Get template details by ID or code
 * @access  Private
 * @param   identifier - Template ID or template code
 */
router.get(
  '/diagnostic-templates/:identifier',
  // authenticate,
  diagnosticReportController.getTemplateDetails
);

// ============================================
// REPORT CREATION & DATA ENTRY
// ============================================

/**
 * @route   POST /api/diagnostic-reports
 * @desc    Create a new diagnostic report
 * @access  Private (LAB_TECH, DOCTOR)
 * @body    { patientId, templateId, diagnosticOrderId, orderItemId }
 */
router.post(
  '/diagnostic-reports',
  // authenticate,
  // authorize(['LAB_TECH', 'DOCTOR', 'PATHOLOGIST']),
  // validateRequest(diagnosticReportValidation.create),
  diagnosticReportController.createReport
);

/**
 * @route   PUT /api/diagnostic-reports/:reportId/results
 * @desc    Update report results/data
 * @access  Private (LAB_TECH, PATHOLOGIST, RADIOLOGIST)
 * @body    { results, specimens, repeatableSectionsData }
 */
router.put(
  '/diagnostic-reports/:reportId/results',
  // authenticate,
  // authorize(['LAB_TECH', 'PATHOLOGIST', 'RADIOLOGIST']),
  // validateRequest(diagnosticReportValidation.updateResults),
  diagnosticReportController.updateResults
);

// ============================================
// WORKFLOW MANAGEMENT
// ============================================

/**
 * @route   POST /api/diagnostic-reports/:reportId/qc-check
 * @desc    Perform QC check on report
 * @access  Private (QC_SUPERVISOR, PATHOLOGIST)
 * @body    { qcStatus: 'PASSED' | 'FAILED', qcNotes }
 */
router.post(
  '/diagnostic-reports/:reportId/qc-check',
  // authenticate,
  // authorize(['QC_SUPERVISOR', 'PATHOLOGIST']),
  diagnosticReportController.performQCCheck
);

/**
 * @route   POST /api/diagnostic-reports/:reportId/review
 * @desc    Pathologist/Radiologist review
 * @access  Private (PATHOLOGIST, RADIOLOGIST, CARDIOLOGIST)
 * @body    { reviewerNotes, manualInterpretation, impressions, recommendations }
 */
router.post(
  '/diagnostic-reports/:reportId/review',
  // authenticate,
  // authorize(['PATHOLOGIST', 'RADIOLOGIST', 'CARDIOLOGIST', 'DOCTOR']),
  diagnosticReportController.performReview
);

/**
 * @route   POST /api/diagnostic-reports/:reportId/approve
 * @desc    Approve and digitally sign report
 * @access  Private (PATHOLOGIST, RADIOLOGIST, SENIOR_DOCTOR)
 * @body    { digitalSignature }
 */
router.post(
  '/diagnostic-reports/:reportId/approve',
  // authenticate,
  // authorize(['PATHOLOGIST', 'RADIOLOGIST', 'DOCTOR']),
  diagnosticReportController.approveReport
);

/**
 * @route   POST /api/diagnostic-reports/:reportId/release
 * @desc    Release report to patient
 * @access  Private (PATHOLOGIST, LAB_MANAGER, DISPATCH)
 * @body    { releaseMode: 'MANUAL' | 'AUTO' }
 */
router.post(
  '/diagnostic-reports/:reportId/release',
  // authenticate,
  // authorize(['PATHOLOGIST', 'LAB_MANAGER', 'DISPATCH']),
  diagnosticReportController.releaseReport
);

/**
 * @route   POST /api/diagnostic-reports/:reportId/amend
 * @desc    Amend report (post sign-off changes)
 * @access  Private (PATHOLOGIST, SENIOR_DOCTOR)
 * @body    { reason, previousValues, newValues, approvedBy }
 */
router.post(
  '/diagnostic-reports/:reportId/amend',
  // authenticate,
  // authorize(['PATHOLOGIST', 'DOCTOR']),
  diagnosticReportController.amendReport
);

// ============================================
// REPORT VIEWING & RETRIEVAL
// ============================================

/**
 * @route   GET /api/diagnostic-reports/:reportId
 * @desc    Get report details
 * @access  Private (DOCTOR, LAB_TECH, PATIENT)
 * @query   ?trackPrint=true&trackView=true
 */
router.get(
  '/diagnostic-reports/:reportId',
  // authenticate,
  diagnosticReportController.getReport
);

/**
 * @route   GET /api/diagnostic-reports
 * @desc    Search/List reports
 * @access  Private
 * @query   ?patientId=xxx&status=RELEASED&category=PATHOLOGY&dateFrom=2026-01-01&dateTo=2026-01-31&limit=50&skip=0
 */
router.get(
  '/diagnostic-reports',
  // authenticate,
  diagnosticReportController.searchReports
);

/**
 * @route   GET /api/diagnostic-reports/patient/:patientId
 * @desc    Get all reports for a patient
 * @access  Private (DOCTOR, PATIENT - own reports only)
 */
router.get(
  '/diagnostic-reports/patient/:patientId',
  // authenticate,
  diagnosticReportController.getPatientReports
);

/**
 * @route   GET /api/diagnostic-reports/:reportId/pdf
 * @desc    Generate and download PDF report
 * @access  Private
 */
router.get(
  '/diagnostic-reports/:reportId/pdf',
  // authenticate,
  diagnosticReportController.generatePDF
);

// ============================================
// STATISTICS & DASHBOARD
// ============================================

/**
 * @route   GET /api/diagnostic-reports/stats
 * @desc    Get report statistics
 * @access  Private (ADMIN, LAB_MANAGER)
 * @query   ?dateFrom=2026-01-01&dateTo=2026-01-31
 */
router.get(
  '/diagnostic-reports/stats',
  // authenticate,
  // authorize(['ADMIN', 'LAB_MANAGER']),
  diagnosticReportController.getStatistics
);

export default router;
