/**
 * Employee Routes
 * Route definitions for employee module
 */

import express from 'express';
import * as employeeController from '../controllers/employee.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import upload, { uploadToCloudinary } from '../middlewares/upload.middleware.js';

const router = express.Router();

/**
 * ===============================
 * PUBLIC / AUTH ROUTES
 * ===============================
 */

// Login employee - REQUIRES hospitalId in path
// POST /api/v1/employees/login/:hospitalId
router.post('/login/:hospitalId', employeeController.login);

/**
 * ===============================
 * PROTECTED ROUTES (SELF)
 * ===============================
 */

// Get own profile
router.get('/profile', protect, employeeController.getProfile);

// Update own profile
router.put(
  '/profile',
  protect,
  upload.single('profilePic'),
  uploadToCloudinary,
  employeeController.updateProfile
);

// Soft delete own account
router.delete('/profile', protect, employeeController.deleteAccount);

// Logout
router.post('/logout', protect, employeeController.logout);

/**
 * ===============================
 * ADMIN ROUTES
 * ===============================
 */

// List all employees
router.get('/', protect, authorize('ADMIN'), employeeController.listEmployees);

// List employees with pagination
router.get('/paginated', protect, authorize('ADMIN'), employeeController.listEmployeesPaginated);

// Get employee by ID
router.get('/:id', protect, authorize('ADMIN'), employeeController.getEmployeeById);

// Update employee salary
router.put('/:id/salary', protect, authorize('ADMIN'), employeeController.updateSalary);

// Update delegated permissions
router.put('/:id/delegated-permissions', protect, authorize('ADMIN'), employeeController.updateDelegatedPermissions);

// Delete employee
router.delete('/:id', protect, authorize('ADMIN'), employeeController.deleteEmployee);

export { router as employeeRoutes };
export default router;
