/**
 * Department Controller
 * HTTP handlers for department operations
 */

import { DepartmentService } from '../services/department.service.js';
import { ApiResponse } from '../shared/ApiResponse.js';

/**
 * Get Department Service instance
 */
const getService = (req) => new DepartmentService(req.prisma);

// ==================== PUBLIC ENDPOINTS ====================

/**
 * Get all hospital departments
 * @route GET /api/departments
 * @access Public
 */
export async function getAllDepartments(req, res, next) {
  try {
    const service = getService(req);
    const result = await service.getAllDepartments();
    
    res.json(ApiResponse.success(result, 'Departments retrieved successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * Get department details by code
 * @route GET /api/departments/:code
 * @access Public
 */
export async function getDepartmentDetails(req, res, next) {
  try {
    const service = getService(req);
    const { code } = req.params;
    
    const department = await service.getDepartmentDetails(code.toUpperCase());
    
    res.json(ApiResponse.success(department, 'Department details retrieved'));
  } catch (error) {
    next(error);
  }
}

// ==================== DIAGNOSTIC DEPARTMENT LOGIN ====================

/**
 * Login to Diagnostics Department
 * @route POST /api/departments/diagnostics/login
 * @body { emailOrPhone, password }
 * @access Public (requires hospital context)
 */
export async function diagnosticLogin(req, res, next) {
  try {
    const service = getService(req);
    const { hospitalId } = req;
    
    if (!hospitalId) {
      return res.status(400).json(ApiResponse.error('Hospital context required'));
    }

    const result = await service.verifyDiagnosticLogin(req.body, hospitalId);
    
    res.json(ApiResponse.success(result, 'Diagnostic login successful'));
  } catch (error) {
    next(error);
  }
}

// ==================== DIAGNOSTIC DASHBOARD (Protected) ====================

/**
 * Get diagnostic test categories for dashboard
 * Returns categories filtered by employee role
 * @route GET /api/departments/diagnostics/categories
 * @access Protected (Diagnostic roles only)
 */
export async function getDiagnosticCategories(req, res, next) {
  try {
    const service = getService(req);
    const { role } = req.user;
    
    const result = await service.getDiagnosticCategories(role);
    
    res.json(ApiResponse.success(result, 'Diagnostic categories retrieved'));
  } catch (error) {
    next(error);
  }
}

/**
 * Get diagnostic worklist/queue
 * @route GET /api/departments/diagnostics/worklist
 * @query status, category, dateFrom, dateTo, page, limit
 * @access Protected (Diagnostic roles only)
 */
export async function getDiagnosticWorklist(req, res, next) {
  try {
    const service = getService(req);
    const { hospitalId, role } = req.user;
    
    const result = await service.getDiagnosticWorklist(hospitalId, role, req.query);
    
    res.json(ApiResponse.success(result, 'Worklist retrieved'));
  } catch (error) {
    next(error);
  }
}

/**
 * Get diagnostic dashboard statistics
 * @route GET /api/departments/diagnostics/dashboard-stats
 * @access Protected (Diagnostic roles only)
 */
export async function getDiagnosticDashboardStats(req, res, next) {
  try {
    const service = getService(req);
    const { hospitalId, role } = req.user;
    
    const result = await service.getDiagnosticDashboardStats(hospitalId, role);
    
    res.json(ApiResponse.success(result, 'Dashboard statistics retrieved'));
  } catch (error) {
    next(error);
  }
}

export default {
  getAllDepartments,
  getDepartmentDetails,
  diagnosticLogin,
  getDiagnosticCategories,
  getDiagnosticWorklist,
  getDiagnosticDashboardStats
};



















