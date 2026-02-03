/**
 * Diagnostic Report Routes
 * 
 * API endpoints for template and report management
 * Base path: /api/v1/diagnostics
 */

import express from 'express';
import {
  // Template Management
  getAllTemplates,
  getTemplateById,
  getTemplateByCode,
  getTemplatesByCategory,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  
  // Report Management
  createReport,
  getReportById,
  getRenderedReport,
  updateReportResults,
  getPatientReports,
  validateReportData,
  
  // Workflow
  submitForEntry,
  submitForQC,
  approveQC,
  rejectQC,
  approveReport,
  rejectReport,
  markDelivered,
  amendReport,
  
  // Critical Values
  checkCriticalValues,
  acknowledgeCriticalValue,
  
  // Worklist & Dashboard
  getWorklist,
  getPendingReports,
  getReportStatistics,
  
  // Audit & Locking
  getReportAuditTrail,
  lockReport,
  unlockReport
} from './diagnosticReport.controller.js';

// Import middleware (assuming these exist in your project)
// Adjust paths as needed for your project structure
const router = express.Router();

// Middleware placeholder - replace with actual authentication middleware
const authenticateToken = (req, res, next) => {
  // This should be replaced with your actual auth middleware
  // For now, we'll pass through
  if (!req.user) {
    req.user = { id: 'system', hospitalId: 'default', role: 'ADMIN' };
  }
  next();
};

// Role-based access middleware
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    next();
  };
};

// ============================================================================
// TEMPLATE ROUTES
// ============================================================================

/**
 * @route GET /api/v1/diagnostics/templates
 * @desc Get all available templates
 * @access Private (All authenticated users)
 */
router.get('/templates', authenticateToken, getAllTemplates);

/**
 * @route GET /api/v1/diagnostics/templates/category/:category
 * @desc Get templates by category
 * @access Private
 */
router.get('/templates/category/:category', authenticateToken, getTemplatesByCategory);

/**
 * @route GET /api/v1/diagnostics/templates/code/:templateCode
 * @desc Get template by code
 * @access Private
 */
router.get('/templates/code/:templateCode', authenticateToken, getTemplateByCode);

/**
 * @route GET /api/v1/diagnostics/templates/:templateId
 * @desc Get template by ID
 * @access Private
 */
router.get('/templates/:templateId', authenticateToken, getTemplateById);

/**
 * @route POST /api/v1/diagnostics/templates
 * @desc Create a new template
 * @access Private (Admin, Lab Manager)
 */
router.post('/templates', 
  authenticateToken, 
  requireRole('ADMIN', 'LAB_MANAGER', 'PATHOLOGIST'),
  createTemplate
);

/**
 * @route PUT /api/v1/diagnostics/templates/:templateId
 * @desc Update a template
 * @access Private (Admin, Lab Manager)
 */
router.put('/templates/:templateId', 
  authenticateToken, 
  requireRole('ADMIN', 'LAB_MANAGER', 'PATHOLOGIST'),
  updateTemplate
);

/**
 * @route DELETE /api/v1/diagnostics/templates/:templateId
 * @desc Delete (archive) a template
 * @access Private (Admin)
 */
router.delete('/templates/:templateId', 
  authenticateToken, 
  requireRole('ADMIN'),
  deleteTemplate
);

// ============================================================================
// REPORT ROUTES
// ============================================================================

/**
 * @route POST /api/v1/diagnostics/reports
 * @desc Create a new diagnostic report
 * @access Private (Technician, Lab Staff)
 */
router.post('/reports', 
  authenticateToken, 
  requireRole('ADMIN', 'TECHNICIAN', 'LAB_STAFF', 'PATHOLOGIST', 'RADIOLOGIST'),
  createReport
);

/**
 * @route GET /api/v1/diagnostics/reports/:reportId
 * @desc Get report by ID
 * @access Private
 */
router.get('/reports/:reportId', authenticateToken, getReportById);

/**
 * @route GET /api/v1/diagnostics/reports/:reportId/rendered
 * @desc Get fully rendered report (for viewing/printing)
 * @access Private
 */
router.get('/reports/:reportId/rendered', authenticateToken, getRenderedReport);

/**
 * @route PUT /api/v1/diagnostics/reports/:reportId/results
 * @desc Update report results
 * @access Private (Technician)
 */
router.put('/reports/:reportId/results', 
  authenticateToken, 
  requireRole('ADMIN', 'TECHNICIAN', 'LAB_STAFF'),
  updateReportResults
);

/**
 * @route GET /api/v1/diagnostics/reports/patient/:patientId
 * @desc Get all reports for a patient
 * @access Private
 */
router.get('/reports/patient/:patientId', authenticateToken, getPatientReports);

/**
 * @route POST /api/v1/diagnostics/templates/:templateId/validate
 * @desc Validate report data against template
 * @access Private
 */
router.post('/templates/:templateId/validate', authenticateToken, validateReportData);

// ============================================================================
// WORKFLOW ROUTES
// ============================================================================

/**
 * @route POST /api/v1/diagnostics/reports/:reportId/submit-entry
 * @desc Submit report for entry
 * @access Private (Technician)
 */
router.post('/reports/:reportId/submit-entry', 
  authenticateToken, 
  requireRole('ADMIN', 'TECHNICIAN', 'LAB_STAFF'),
  submitForEntry
);

/**
 * @route POST /api/v1/diagnostics/reports/:reportId/submit-qc
 * @desc Submit report for QC review
 * @access Private (Technician)
 */
router.post('/reports/:reportId/submit-qc', 
  authenticateToken, 
  requireRole('ADMIN', 'TECHNICIAN', 'LAB_STAFF'),
  submitForQC
);

/**
 * @route POST /api/v1/diagnostics/reports/:reportId/approve-qc
 * @desc QC approval
 * @access Private (QC Officer)
 */
router.post('/reports/:reportId/approve-qc', 
  authenticateToken, 
  requireRole('ADMIN', 'QC_OFFICER', 'LAB_MANAGER'),
  approveQC
);

/**
 * @route POST /api/v1/diagnostics/reports/:reportId/reject-qc
 * @desc QC rejection
 * @access Private (QC Officer)
 */
router.post('/reports/:reportId/reject-qc', 
  authenticateToken, 
  requireRole('ADMIN', 'QC_OFFICER', 'LAB_MANAGER'),
  rejectQC
);

/**
 * @route POST /api/v1/diagnostics/reports/:reportId/approve
 * @desc Final approval by Pathologist/Radiologist
 * @access Private (Pathologist, Radiologist)
 */
router.post('/reports/:reportId/approve', 
  authenticateToken, 
  requireRole('ADMIN', 'PATHOLOGIST', 'RADIOLOGIST', 'DOCTOR'),
  approveReport
);

/**
 * @route POST /api/v1/diagnostics/reports/:reportId/reject
 * @desc Reject report
 * @access Private (Pathologist, Radiologist)
 */
router.post('/reports/:reportId/reject', 
  authenticateToken, 
  requireRole('ADMIN', 'PATHOLOGIST', 'RADIOLOGIST'),
  rejectReport
);

/**
 * @route POST /api/v1/diagnostics/reports/:reportId/deliver
 * @desc Mark report as delivered
 * @access Private (Front desk, Lab staff)
 */
router.post('/reports/:reportId/deliver', 
  authenticateToken, 
  requireRole('ADMIN', 'FRONT_DESK', 'LAB_STAFF', 'TECHNICIAN'),
  markDelivered
);

/**
 * @route POST /api/v1/diagnostics/reports/:reportId/amend
 * @desc Amend an approved report
 * @access Private (Pathologist, Radiologist)
 */
router.post('/reports/:reportId/amend', 
  authenticateToken, 
  requireRole('ADMIN', 'PATHOLOGIST', 'RADIOLOGIST'),
  amendReport
);

// ============================================================================
// CRITICAL VALUE ROUTES
// ============================================================================

/**
 * @route POST /api/v1/diagnostics/templates/:templateId/check-critical
 * @desc Check for critical values in report data
 * @access Private
 */
router.post('/templates/:templateId/check-critical', authenticateToken, checkCriticalValues);

/**
 * @route POST /api/v1/diagnostics/reports/:reportId/acknowledge-critical
 * @desc Acknowledge critical value notification
 * @access Private (Doctor, Pathologist)
 */
router.post('/reports/:reportId/acknowledge-critical', 
  authenticateToken, 
  requireRole('ADMIN', 'DOCTOR', 'PATHOLOGIST', 'RADIOLOGIST'),
  acknowledgeCriticalValue
);

// ============================================================================
// WORKLIST & DASHBOARD ROUTES
// ============================================================================

/**
 * @route GET /api/v1/diagnostics/worklist
 * @desc Get worklist for current user based on role
 * @access Private
 */
router.get('/worklist', authenticateToken, getWorklist);

/**
 * @route GET /api/v1/diagnostics/pending
 * @desc Get pending reports by status
 * @access Private
 */
router.get('/pending', authenticateToken, getPendingReports);

/**
 * @route GET /api/v1/diagnostics/statistics
 * @desc Get report statistics for dashboard
 * @access Private (Admin, Lab Manager)
 */
router.get('/statistics', 
  authenticateToken, 
  requireRole('ADMIN', 'LAB_MANAGER', 'PATHOLOGIST'),
  getReportStatistics
);

// ============================================================================
// AUDIT & LOCKING ROUTES
// ============================================================================

/**
 * @route GET /api/v1/diagnostics/reports/:reportId/audit
 * @desc Get audit trail for a report
 * @access Private (Admin, Lab Manager)
 */
router.get('/reports/:reportId/audit', 
  authenticateToken, 
  requireRole('ADMIN', 'LAB_MANAGER', 'PATHOLOGIST'),
  getReportAuditTrail
);

/**
 * @route POST /api/v1/diagnostics/reports/:reportId/lock
 * @desc Lock a report
 * @access Private (Pathologist, Admin)
 */
router.post('/reports/:reportId/lock', 
  authenticateToken, 
  requireRole('ADMIN', 'PATHOLOGIST', 'RADIOLOGIST'),
  lockReport
);

/**
 * @route POST /api/v1/diagnostics/reports/:reportId/unlock
 * @desc Unlock a report (requires senior authority)
 * @access Private (Admin)
 */
router.post('/reports/:reportId/unlock', 
  authenticateToken, 
  requireRole('ADMIN'),
  unlockReport
);

export default router;
