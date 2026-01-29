/**
 * Attendance Routes
 * Route definitions for attendance module
 */

import express from 'express';
import * as attendanceController from './attendance.controller.js';
import { protect } from '../../core/middleware/auth.middleware.js';
import { authorize } from '../../core/middleware/rbac.middleware.js';
import upload, { uploadToCloudinary } from '../../core/middleware/upload.middleware.js';

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

export default router;
