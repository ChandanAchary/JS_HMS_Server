/**
 * Visit Routes
 * Endpoints for patient visit management
 */

import express from 'express';
import * as visitController from './visit.controller.js';
import { protect } from '../../core/middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route POST /api/v1/visits/patient-entry
 * @desc Register patient with visit type selection
 * @access Protected (Receptionist, Admin, Employee with PATIENT_ENTRY permission)
 */
router.post('/patient-entry', protect, visitController.registerPatientEntry);

/**
 * @route GET /api/v1/visits
 * @desc Get all visits with filters
 * @access Protected
 */
router.get('/', protect, visitController.getVisits);

/**
 * @route GET /api/v1/visits/:visitId
 * @desc Get visit by ID
 * @access Protected
 */
router.get('/:visitId', protect, visitController.getVisitById);

/**
 * @route PATCH /api/v1/visits/:visitId/status
 * @desc Update visit status
 * @access Protected
 */
router.patch('/:visitId/status', protect, visitController.updateVisitStatus);

/**
 * Service Queue Endpoints (for dashboards)
 */

/**
 * @route GET /api/v1/visits/queue/opd
 * @desc Get OPD consultation queue
 * @access Protected (Doctors, Nurses, Admin)
 */
router.get('/queue/opd', protect, visitController.getOPDQueue);

/**
 * @route GET /api/v1/visits/queue/ipd
 * @desc Get IPD admission queue
 * @access Protected (Doctors, Nurses, Admin)
 */
router.get('/queue/ipd', protect, visitController.getIPDQueue);

/**
 * @route GET /api/v1/visits/queue/diagnostics
 * @desc Get diagnostics queue
 * @access Protected (Lab Technicians, Radiologists, Admin)
 */
router.get('/queue/diagnostics', protect, visitController.getDiagnosticsQueue);

/**
 * @route GET /api/v1/visits/queue/services
 * @desc Get other services queue
 * @access Protected (Service staff, Admin)
 */
router.get('/queue/services', protect, visitController.getOtherServicesQueue);

export const visitRouter = router;
