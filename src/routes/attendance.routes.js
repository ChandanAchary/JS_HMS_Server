/**
 * Attendance Routes
 * Route definitions for attendance module
 */

import express from 'express';
import * as attendanceController from '../controllers/attendance.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import upload, { uploadToCloudinary } from '../middlewares/upload.middleware.js';

const router = express.Router();

/**
 * ===============================
 * USER ROUTES (SELF)
 * ===============================
 */

// Check-in (with optional selfie)
router.post(
  '/check-in',
  protect,
  upload.single('selfie'),
  uploadToCloudinary,
  attendanceController.checkIn
);

// Check-out (with optional selfie)
router.post(
  '/check-out',
  protect,
  upload.single('selfie'),
  uploadToCloudinary,
  attendanceController.checkOut
);

// Get today's attendance status
router.get('/today', protect, attendanceController.getTodayAttendance);

// Get attendance history
router.get('/my-history', protect, attendanceController.getMyAttendanceHistory);

/**
 * ===============================
 * ADMIN ROUTES
 * ===============================
 */

// Get dashboard summary (all users)
router.get('/admin/summary', protect, authorize('ADMIN'), attendanceController.getAdminDashboardSummary);

// Get user attendance details
router.get('/admin/:userId', protect, authorize('ADMIN'), attendanceController.getUserAttendanceDetails);

export { router as attendanceRoutes };
export default router;
