/**
 * Vital Signs Routes
 * Endpoints for recording and retrieving vital signs during OPD triage
 */

import express from 'express';
import vitalsController from './vitals.controller.js';
import { protect } from '../../core/middleware/auth.middleware.js';
import { opdRbacMiddleware, canRecordVitals } from './opd.rbac.middleware.js';

const router = express.Router();

/**
 * POST /api/opd/:visitId/vitals
 * Record vital signs for a patient visit
 * Body: { height, weight, bloodPressureSystolic, bloodPressureDiastolic, pulseRate, temperature, respiratoryRate, oxygenSaturation, recordedBy, recordedByName }
 */
router.post(
  '/:visitId/vitals',
  protect,
  opdRbacMiddleware,
  canRecordVitals,
  vitalsController.recordVitals
);

/**
 * GET /api/opd/:visitId/vitals
 * Get vital signs for a specific visit
 */
router.get(
  '/:visitId/vitals',
  protect,
  opdRbacMiddleware,
  vitalsController.getVitalsByVisit
);

/**
 * GET /api/opd/:visitId/vitals/status
 * Check if vitals have been recorded for a visit
 */
router.get(
  '/:visitId/vitals/status',
  protect,
  opdRbacMiddleware,
  vitalsController.checkVitalsStatus
);

/**
 * GET /api/opd/:visitId/vitals/comparison
 * Get vital signs with comparison to previous records
 */
router.get(
  '/:visitId/vitals/comparison',
  protect,
  opdRbacMiddleware,
  vitalsController.getVitalsWithComparison
);

/**
 * PUT /api/opd/:visitId/vitals
 * Update vital signs for a visit
 * Body: { height, weight, bloodPressureSystolic, bloodPressureDiastolic, pulseRate, temperature, respiratoryRate, oxygenSaturation, recordedBy }
 */
router.put(
  '/:visitId/vitals',
  protect,
  opdRbacMiddleware,
  canRecordVitals,
  vitalsController.updateVitals
);

/**
 * GET /api/patient/:patientId/vitals/history
 * Get vital signs history for a patient
 * Query: ?limit=10 (default)
 */
router.get(
  '/history/:patientId',
  protect,
  opdRbacMiddleware,
  vitalsController.getVitalsHistory
);

export default router;
