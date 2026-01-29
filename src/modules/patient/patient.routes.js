/**
 * Patient Routes
 * Route definitions for patient module
 */

import express from 'express';
import * as patientController from './patient.controller.js';
import { protect } from '../../core/middleware/auth.middleware.js';

const router = express.Router();

/**
 * ===============================
 * PROTECTED ROUTES
 * ===============================
 * All routes require authentication
 * Role checks are done in controller
 */

// Get all patients with billing history
router.get('/', protect, patientController.getAllPatients);

// Search patients
router.get('/search', protect, patientController.searchPatients);

// Get patients with pagination
router.get('/paginated', protect, patientController.getPatientsPaginated);

// Get patient by patientId
router.get('/:patientId', protect, patientController.getPatient);

export default router;
