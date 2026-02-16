/**
 * Diagnostic Workboard Routes
 * API routes for result entry and workflow operations
 */

import { Router } from 'express';
import * as workboardController from '../controllers/workboard.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { isDiagnosticRole, DIAGNOSTIC_ROLES } from '../rbac/rolePermissions.js';

const router = Router();

// ==================== DIAGNOSTIC ROLE MIDDLEWARE ====================

/**
 * Middleware to verify user has diagnostic role
 */
const requireDiagnosticRole = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!isDiagnosticRole(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Role '${req.user.role}' is not authorized for diagnostics workboard. Allowed roles: ${DIAGNOSTIC_ROLES.join(', ')}`
    });
  }

  next();
};

// All routes require authentication and diagnostic role
router.use(protect);
router.use(requireDiagnosticRole);

// ==================== WORKLIST ROUTES ====================

/**
 * @route   GET /api/diagnostics/workboard/worklist/:category
 * @desc    Get worklist items for a specific category or all allowed
 * @params  category - Test category (BLOOD_TEST, IMAGING, etc.) or 'all'
 * @query   status, urgency, dateFrom, dateTo, page, limit
 * @access  Protected (Diagnostic roles only)
 */
router.get('/worklist/:category', workboardController.getWorklistByCategory);

/**
 * @route   GET /api/diagnostics/workboard/entry-form/:resultId
 * @desc    Get detailed entry form for a specific result
 *          Includes template, patient info, test info, and workflow options
 * @access  Protected (Diagnostic roles only)
 */
router.get('/entry-form/:resultId', workboardController.getResultEntryForm);

// ==================== RESULT ENTRY ROUTES ====================

/**
 * @route   PUT /api/diagnostics/workboard/results/:resultId
 * @desc    Save result entry (draft or partial)
 * @body    {
 *            resultValue, resultNumeric, resultUnit,
 *            reportText, impressions, recommendations,
 *            componentResults, technicianNotes
 *          }
 * @access  Protected (Diagnostic roles only)
 */
router.put('/results/:resultId', workboardController.saveResultEntry);

/**
 * @route   POST /api/diagnostics/workboard/results/:resultId/submit
 * @desc    Submit result for QC review
 * @body    { notes?: string }
 * @access  Protected (Diagnostic roles only)
 */
router.post('/results/:resultId/submit', workboardController.submitResultForReview);

// ==================== QC WORKFLOW ROUTES ====================

/**
 * @route   POST /api/diagnostics/workboard/results/:resultId/qc-approve
 * @desc    Approve result quality check
 * @body    { notes?: string }
 * @access  Protected (LAB_TECHNICIAN, PATHOLOGY)
 */
router.post('/results/:resultId/qc-approve', workboardController.approveQC);

/**
 * @route   POST /api/diagnostics/workboard/results/:resultId/qc-reject
 * @desc    Reject QC and return to technician
 * @body    { reason: string (required) }
 * @access  Protected (LAB_TECHNICIAN, PATHOLOGY)
 */
router.post('/results/:resultId/qc-reject', workboardController.rejectQC);

// ==================== REVIEW & RELEASE ROUTES ====================

/**
 * @route   POST /api/diagnostics/workboard/results/:resultId/review-approve
 * @desc    Specialist review and approval
 * @body    { notes, impressions, recommendations, interpretation }
 * @access  Protected (PATHOLOGY, senior diagnostic roles)
 */
router.post('/results/:resultId/review-approve', workboardController.reviewAndApprove);

/**
 * @route   POST /api/diagnostics/workboard/results/:resultId/release
 * @desc    Release approved result to patient
 * @access  Protected (All diagnostic roles)
 */
router.post('/results/:resultId/release', workboardController.releaseResult);

/**
 * @route   POST /api/diagnostics/workboard/results/:resultId/amend
 * @desc    Amend a released result
 * @body    { reason: string (required), resultValue, reportText, impressions, etc. }
 * @access  Protected (PATHOLOGY only)
 */
router.post('/results/:resultId/amend', workboardController.amendResult);

export { router as workboardRoutes };
export default router;



















