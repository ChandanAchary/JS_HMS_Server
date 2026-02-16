/**
 * OPD Consultation Routes
 * 
 * API endpoints for OPD consultation operations:
 * - Consultation notes (diagnosis, treatment plan)
 * - Prescriptions
 * - Test orders
 * - Patient OPD history
 * 
 * All routes are protected by RBAC middleware
 */

import express from 'express';
import {
  addConsultationNote,
  getConsultationNote,
  updateConsultationNote,
  createPrescription,
  getPrescriptionsByVisit,
  getPrescriptionById,
  updatePrescriptionStatus,
  createTestOrder,
  getTestOrdersByVisit,
  updateTestOrderStatus,
  getPatientOpdHistory,
  getCompleteVisitDetails
} from '../controllers/opd-consultation.controller.js';
import {
  opdRbacMiddleware,
  canConsult,
  canAddConsultation,
  canManagePrescription,
  canOrderTests,
  canViewHistory
} from '../middlewares/opd.rbac.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ==================== CONSULTATION NOTES ====================

/**
 * @route   POST /api/opd/consultation/:visitId/note
 * @desc    Add consultation note for a visit
 * @access  Doctors only
 */
router.post('/consultation/:visitId/note', protect, opdRbacMiddleware, canConsult, addConsultationNote);

/**
 * @route   GET /api/opd/consultation/:visitId/note
 * @desc    Get consultation note for a visit
 * @access  OPD Staff
 */
router.get('/consultation/:visitId/note', protect, opdRbacMiddleware, getConsultationNote);

/**
 * @route   PUT /api/opd/consultation/note/:noteId
 * @desc    Update consultation note
 * @access  Doctors only
 */
router.put('/consultation/note/:noteId', protect, opdRbacMiddleware, canConsult, updateConsultationNote);

// ==================== PRESCRIPTIONS ====================

/**
 * @route   POST /api/opd/prescription/:visitId
 * @desc    Create prescription for a visit
 * @access  Doctors only
 */
router.post('/prescription/:visitId', protect, opdRbacMiddleware, canConsult, createPrescription);

/**
 * @route   GET /api/opd/prescription/visit/:visitId
 * @desc    Get all prescriptions for a visit
 * @access  OPD Staff
 */
router.get('/prescription/visit/:visitId', protect, opdRbacMiddleware, getPrescriptionsByVisit);

/**
 * @route   GET /api/opd/prescription/:prescriptionId
 * @desc    Get prescription by ID
 * @access  OPD Staff
 */
router.get('/prescription/:prescriptionId', protect, opdRbacMiddleware, getPrescriptionById);

/**
 * @route   PATCH /api/opd/prescription/:prescriptionId/status
 * @desc    Update prescription status (dispense, cancel)
 * @access  OPD Staff (Doctor, Pharmacist)
 */
router.patch('/prescription/:prescriptionId/status', protect, opdRbacMiddleware, updatePrescriptionStatus);

// ==================== TEST ORDERS ====================

/**
 * @route   POST /api/opd/test-order/:visitId
 * @desc    Create test order for a visit
 * @access  Doctors only
 */
router.post('/test-order/:visitId', protect, opdRbacMiddleware, canConsult, createTestOrder);

/**
 * @route   GET /api/opd/test-order/visit/:visitId
 * @desc    Get all test orders for a visit
 * @access  OPD Staff
 */
router.get('/test-order/visit/:visitId', protect, opdRbacMiddleware, getTestOrdersByVisit);

/**
 * @route   PATCH /api/opd/test-order/:orderId/status
 * @desc    Update test order status
 * @access  OPD Staff, Lab Staff
 */
router.patch('/test-order/:orderId/status', protect, opdRbacMiddleware, updateTestOrderStatus);

// ==================== PATIENT HISTORY ====================

/**
 * @route   GET /api/opd/patient/:patientId/history
 * @desc    Get patient's complete OPD history
 * @access  OPD Staff
 * @query   limit: number (default: 20)
 * @query   offset: number (default: 0)
 */
router.get('/patient/:patientId/history', protect, opdRbacMiddleware, getPatientOpdHistory);

/**
 * @route   GET /api/opd/visit/:visitId/complete
 * @desc    Get complete visit details (all OPD data)
 * @access  OPD Staff
 */
router.get('/visit/:visitId/complete', protect, opdRbacMiddleware, getCompleteVisitDetails);

export default router;



















