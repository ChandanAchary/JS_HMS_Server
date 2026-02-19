/**
 * PublicRegistration Routes
 * Public-facing registration endpoints (no auth required)
 * 
 * Single-tenant: All requests automatically use the single hospital
 */

import { Router } from 'express';
import upload, { uploadToCloudinary } from '../middlewares/upload.middleware.js';
import {
  getRegistrationForm,
  submitApplication,
  checkApplicationStatus
} from '../controllers/publicRegistration.controller.js';

const router = Router();

// Root endpoint - returns publicRegistration module info
router.get('/', (req, res) => {
  res.json({ module: 'publicRegistration', status: 'active', endpoints: ['GET /join/registration-form/:role', 'POST /join/apply/:role', 'GET /join/application-status'] });
});

/**
 * Registration Form Routes
 */

// GET /api/public/join/registration-form/:role - Get form template for role
router.get('/join/registration-form/:role', getRegistrationForm);

/**
 * Application Submission Routes
 */

// POST /api/public/join/apply/:role - Submit application for role
// Supports multipart/form-data for file upload
router.post(
  '/join/apply/:role',
  upload.single('profilePhoto'),
  uploadToCloudinary,
  submitApplication
);

/**
 * Application Status Routes
 */

// GET /api/public/join/application-status - Check application status
// Query params: email or phone
router.get('/join/application-status', checkApplicationStatus);

export { router as routes };
export default router;



















