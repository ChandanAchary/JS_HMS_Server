/**
 * OPD Dashboard Routes
 * 
 * API endpoints for OPD login, queue management, and patient operations
 * All routes are protected by RBAC middleware
 */

import express from 'express';
import {
  getDashboard,
  getNextPatient,
  callNextPatient,
  startServing,
  completeService,
  skipPatient,
  getPatientDetails,
  getStatistics
} from './opd-dashboard.controller.js';
import {
  opdRbacMiddleware,
  canManageQueue
} from './opd.rbac.middleware.js';
import { protect } from '../../core/middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/opd/dashboard
 * @desc    OPD Login/Dashboard - Get patient queue with all details
 * @access  OPD Staff Only (RBAC)
 * @query   status: WAITING|CALLED|SERVING|COMPLETED|ALL (default: WAITING)
 * @query   limit: number (default: 50)
 * @query   offset: number (default: 0)
 */
router.get('/opdDashboard', protect, opdRbacMiddleware, getDashboard);

/**
 * @route   GET /api/opd/statistics
 * @desc    Get OPD queue statistics (counts by status)
 * @access  OPD Staff Only (RBAC)
 */
router.get('/statistics', protect, opdRbacMiddleware, getStatistics);

/**
 * @route   GET /api/opd/next-patient
 * @desc    Get next patient in queue
 * @access  OPD Staff Only (RBAC)
 */
router.get('/next-patient', protect, opdRbacMiddleware, getNextPatient);

/**
 * @route   GET /api/opd/patient/:visitId
 * @desc    Get complete patient details for OPD operations
 * @access  OPD Staff Only (RBAC)
 */
router.get('/patient/:visitId', protect, opdRbacMiddleware, getPatientDetails);

/**
 * @route   POST /api/opd/call-patient/:queueId
 * @desc    Call next patient (WAITING -> CALLED)
 * @access  Queue Managers Only (COORDINATOR, MANAGER, RECEPTIONIST, ADMIN)
 */
router.post('/call-patient/:queueId', protect, opdRbacMiddleware, canManageQueue, callNextPatient);

/**
 * @route   POST /api/opd/start-serving/:queueId
 * @desc    Start serving patient (CALLED -> SERVING)
 * @access  OPD Staff (DOCTOR, NURSE, etc)
 */
router.post('/start-serving/:queueId', protect, opdRbacMiddleware, startServing);

/**
 * @route   POST /api/opd/complete-service/:queueId
 * @desc    Complete service (SERVING -> COMPLETED)
 * @access  OPD Staff
 */
router.post('/complete-service/:queueId', protect, opdRbacMiddleware, completeService);

/**
 * @route   POST /api/opd/skip-patient/:queueId
 * @desc    Skip patient (no-show, auto-cancel after 3 skips)
 * @access  Queue Managers Only
 */
router.post('/skip-patient/:queueId', protect, opdRbacMiddleware, canManageQueue, skipPatient);

export default router;
