/**
 * Department Routes
 * API routes for department operations
 */

import { Router } from 'express';
import * as departmentController from '../controllers/department.controller.js';
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
      message: `Access denied. Your role '${req.user.role}' is not authorized for diagnostics. Allowed roles: ${DIAGNOSTIC_ROLES.join(', ')}`
    });
  }

  next();
};

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/departments
 * @desc    Get all hospital departments for listing
 * @access  Public
 */
router.get('/', departmentController.getAllDepartments);

/**
 * @route   GET /api/departments/:code
 * @desc    Get department details by code
 * @access  Public
 */
router.get('/:code', departmentController.getDepartmentDetails);

// ==================== DIAGNOSTIC DEPARTMENT LOGIN ====================

/**
 * @route   POST /api/departments/diagnostics/login
 * @desc    Login specifically for diagnostic department employees
 * @body    { emailOrPhone: string, password: string }
 * @access  Public (requires valid diagnostic role)
 * 
 * This endpoint validates that the employee:
 * 1. Has valid credentials
 * 2. Belongs to a diagnostic role (XRAY, MRI, CT_SCAN, PATHOLOGY, LAB_TECHNICIAN, etc.)
 * 3. Returns token with diagnostic-specific permissions
 */
router.post('/diagnostics/login', departmentController.diagnosticLogin);

// ==================== DIAGNOSTIC DASHBOARD (Protected) ====================

/**
 * @route   GET /api/departments/diagnostics/categories
 * @desc    Get diagnostic test categories for dashboard
 *          Filtered based on logged-in user's role permissions
 * @access  Protected (Diagnostic roles only)
 */
router.get(
  '/diagnostics/categories',
  protect,
  requireDiagnosticRole,
  departmentController.getDiagnosticCategories
);

/**
 * @route   GET /api/departments/diagnostics/worklist
 * @desc    Get pending work items for diagnostic dashboard
 * @query   status, category, dateFrom, dateTo, page, limit
 * @access  Protected (Diagnostic roles only)
 */
router.get(
  '/diagnostics/worklist',
  protect,
  requireDiagnosticRole,
  departmentController.getDiagnosticWorklist
);

/**
 * @route   GET /api/departments/diagnostics/dashboard-stats
 * @desc    Get dashboard statistics for diagnostic department
 * @access  Protected (Diagnostic roles only)
 */
router.get(
  '/diagnostics/dashboard-stats',
  protect,
  requireDiagnosticRole,
  departmentController.getDiagnosticDashboardStats
);

export { router as departmentRoutes };
export default router;
