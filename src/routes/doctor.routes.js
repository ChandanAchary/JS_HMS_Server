/**
 * Doctor Routes
 * Route definitions for doctor module
 */

import express from 'express';
import * as doctorController from '../controllers/doctor.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import upload, { uploadToCloudinary } from '../middlewares/upload.middleware.js';

const router = express.Router();

/**
 * ===============================
 * PUBLIC / AUTH ROUTES
 * ===============================
 */

// Login doctor - single-tenant, no hospitalId needed
// POST /api/doctors/login
router.post('/login', doctorController.login);

/**
 * ===============================
 * PROTECTED ROUTES (SELF)
 * ===============================
 */

// Get own profile
router.get('/profile', protect, doctorController.getProfile);

// Update own profile
router.put(
  '/profile',
  protect,
  upload.single('profilePic'),
  uploadToCloudinary,
  doctorController.updateProfile
);

// Soft delete own account
router.delete('/profile', protect, doctorController.deleteAccount);

// Logout
router.post('/logout', protect, doctorController.logout);

/**
 * ===============================
 * ADMIN ROUTES
 * ===============================
 */

// List all doctors
router.get('/', protect, authorize('ADMIN'), doctorController.listDoctors);

// List doctors with pagination
router.get('/paginated', protect, authorize('ADMIN'), doctorController.listDoctorsPaginated);

// Get doctor by ID
router.get('/:id', protect, authorize('ADMIN'), doctorController.getDoctorById);

// Update doctor salary
router.put('/:id/salary', protect, authorize('ADMIN'), doctorController.updateSalary);

// Update delegated permissions
router.put('/:id/delegated-permissions', protect, authorize('ADMIN'), doctorController.updateDelegatedPermissions);

// Delete doctor
router.delete('/:id', protect, authorize('ADMIN'), doctorController.deleteDoctor);

export { router as doctorRoutes };
export default router;
